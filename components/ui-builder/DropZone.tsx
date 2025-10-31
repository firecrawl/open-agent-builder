"use client";

import { useDroppable } from "@dnd-kit/core";
import { UIComponent } from "./UIBuilderCanvas";
import DroppedComponent from "./DroppedComponent";

interface DropZoneProps {
  components: UIComponent[];
  onComponentUpdate: (id: string, props: Record<string, any>) => void;
  onComponentDelete: (id: string) => void;
  onExecuteWorkflow: (componentId: string, workflowId: string) => void;
  selectedWorkflowId: string;
  isExecuting: boolean;
  activeComponentId: string | null;
}

export default function DropZone({
  components,
  onComponentUpdate,
  onComponentDelete,
  onExecuteWorkflow,
  selectedWorkflowId,
  isExecuting,
  activeComponentId,
}: DropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "dropzone",
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[600px] border-2 border-dashed rounded-12 p-24 relative
        transition-all duration-200
        ${isOver ? "border-heat-100 bg-heat-100/5" : "border-border-faint bg-background-base"}
      `}
    >
      {components.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center text-text-secondary">
          <div className="text-center">
            <p className="text-lg mb-8">Drop components here to build your UI</p>
            <p className="text-sm">Components will trigger the selected workflow</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {components.map((component) => (
            <DroppedComponent
              key={component.id}
              component={component}
              onUpdate={onComponentUpdate}
              onDelete={onComponentDelete}
              onExecute={onExecuteWorkflow}
              selectedWorkflowId={selectedWorkflowId}
              isExecuting={isExecuting && activeComponentId === component.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
