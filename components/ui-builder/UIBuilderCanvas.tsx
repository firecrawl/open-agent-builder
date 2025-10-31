"use client";

import { useState, useCallback } from "react";
import { DndContext, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor, DragOverlay } from "@dnd-kit/core";
import ComponentPalette from "./ComponentPalette";
import DropZone from "./DropZone";
import WorkflowSelector from "./WorkflowSelector";
import ResponseDisplay from "./ResponseDisplay";
import { ResizablePane, ResizableRightPane } from "./ResizablePane";

export interface UIComponent {
  id: string;
  type: string;
  props: Record<string, any>;
  position: { x: number; y: number };
}

export interface WorkflowResponse {
  event: string;
  data: any;
  timestamp: string;
}

export default function UIBuilderCanvas() {
  const [components, setComponents] = useState<UIComponent[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [workflowResponses, setWorkflowResponses] = useState<WorkflowResponse[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeComponentId, setActiveComponentId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && over.id === "dropzone") {
      const componentType = active.id as string;

      // Create new component
      const newComponent: UIComponent = {
        id: `${componentType}-${Date.now()}`,
        type: componentType,
        props: getDefaultPropsForType(componentType),
        position: { x: Math.random() * 300, y: Math.random() * 200 },
      };

      setComponents((prev) => [...prev, newComponent]);
    }

    setActiveId(null);
  };

  const getDefaultPropsForType = (type: string): Record<string, any> => {
    switch (type) {
      case "button":
        return { label: "Click Me", variant: "primary" };
      case "input":
        return { placeholder: "Enter text...", label: "Input Field" };
      case "textarea":
        return { placeholder: "Enter text...", label: "Text Area", rows: 4 };
      case "card":
        return { title: "Card Title", content: "Card content goes here" };
      case "heading":
        return { text: "Heading", level: "h2" };
      case "text":
        return { text: "Text content" };
      case "image":
        return { src: "https://via.placeholder.com/300x200", alt: "Placeholder" };
      default:
        return {};
    }
  };

  const handleComponentUpdate = (id: string, props: Record<string, any>) => {
    setComponents((prev) =>
      prev.map((comp) => (comp.id === id ? { ...comp, props } : comp))
    );
  };

  const handleComponentDelete = (id: string) => {
    setComponents((prev) => prev.filter((comp) => comp.id !== id));
  };

  const handleExecuteWorkflow = async (componentId: string, workflowId: string) => {
    if (!workflowId) {
      alert("Please select a workflow first");
      return;
    }

    setIsExecuting(true);
    setActiveComponentId(componentId);
    setWorkflowResponses([]);

    try {
      const component = components.find((c) => c.id === componentId);
      if (!component) return;

      // Collect input values from UI components
      const inputs: Record<string, any> = {};
      components.forEach((comp) => {
        if (comp.type === "input" || comp.type === "textarea") {
          const key = comp.props.label?.replace(/\s+/g, "_").toLowerCase() || comp.id;
          inputs[key] = comp.props.value || comp.props.placeholder || "";
        }
      });

      // Call the streaming API
      const response = await fetch(`/api/workflows/${workflowId}/execute-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputs),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.trim().startsWith("event:")) {
            const eventMatch = line.match(/event:\s*(\w+)/);
            const dataMatch = line.match(/data:\s*(.+)/);

            if (eventMatch && dataMatch) {
              const event = eventMatch[1];
              const data = JSON.parse(dataMatch[1]);

              const response: WorkflowResponse = {
                event,
                data,
                timestamp: data.timestamp || new Date().toISOString(),
              };

              setWorkflowResponses((prev) => [...prev, response]);
            }
          }
        }
      }
    } catch (error) {
      console.error("Workflow execution error:", error);
      setWorkflowResponses((prev) => [
        ...prev,
        {
          event: "error",
          data: { error: error instanceof Error ? error.message : "Unknown error" },
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsExecuting(false);
      setActiveComponentId(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh-160px)] bg-gray-50">
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/* Left Sidebar - Component Palette (Resizable) */}
        <ResizablePane
          defaultWidth={288}
          minWidth={200}
          maxWidth={400}
          className="border-r-2 border-gray-200 bg-white shadow-lg"
        >
          <div className="p-4 border-b-2 border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-lg font-bold text-gray-800">UI Components</h3>
            <p className="text-xs text-gray-600 mt-1">
              Drag components onto the canvas
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <ComponentPalette />
          </div>
        </ResizablePane>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Top Bar - Workflow Selector */}
          <div className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4 flex-shrink-0">
            <WorkflowSelector
              selectedWorkflowId={selectedWorkflowId}
              onSelectWorkflow={setSelectedWorkflowId}
            />
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-auto p-6 min-h-0 bg-gray-50">
            <DropZone
              components={components}
              onComponentUpdate={handleComponentUpdate}
              onComponentDelete={handleComponentDelete}
              onExecuteWorkflow={handleExecuteWorkflow}
              selectedWorkflowId={selectedWorkflowId}
              isExecuting={isExecuting}
              activeComponentId={activeComponentId}
            />
          </div>
        </div>

        {/* Right Sidebar - Response Display (Resizable) */}
        <ResizableRightPane
          defaultWidth={384}
          minWidth={300}
          maxWidth={600}
          className="border-l-2 border-gray-200 bg-white shadow-lg"
        >
          <ResponseDisplay responses={workflowResponses} isExecuting={isExecuting} />
        </ResizableRightPane>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <div className="bg-white border-2 border-blue-400 rounded-lg p-3 shadow-xl">
              <span className="text-sm font-medium text-gray-700">{activeId}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
