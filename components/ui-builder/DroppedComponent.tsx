"use client";

import { useState } from "react";
import { UIComponent } from "./UIBuilderCanvas";
import { X, Settings, Play } from "lucide-react";

interface DroppedComponentProps {
  component: UIComponent;
  onUpdate: (id: string, props: Record<string, any>) => void;
  onDelete: (id: string) => void;
  onExecute: (componentId: string, workflowId: string) => void;
  selectedWorkflowId: string;
  isExecuting: boolean;
}

export default function DroppedComponent({
  component,
  onUpdate,
  onDelete,
  onExecute,
  selectedWorkflowId,
  isExecuting,
}: DroppedComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localProps, setLocalProps] = useState(component.props);

  const handleSave = () => {
    onUpdate(component.id, localProps);
    setIsEditing(false);
  };

  const handlePropChange = (key: string, value: any) => {
    const newProps = { ...localProps, [key]: value };
    setLocalProps(newProps);
    onUpdate(component.id, newProps);
  };

  const renderComponent = () => {
    switch (component.type) {
      case "button":
        return (
          <button
            className={`
              px-16 py-8 rounded-8 font-medium transition-all active:scale-[0.98]
              ${component.props.variant === "primary" ? "bg-heat-100 hover:bg-heat-200 text-white" : "bg-background-elevated hover:bg-background-base border border-border-faint"}
            `}
            onClick={() => onExecute(component.id, selectedWorkflowId)}
            disabled={isExecuting}
          >
            {isExecuting ? (
              <span className="flex items-center gap-8">
                <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Executing...
              </span>
            ) : (
              component.props.label
            )}
          </button>
        );

      case "input":
        return (
          <div className="w-full">
            {component.props.label && (
              <label className="block text-sm font-medium mb-4">
                {component.props.label}
              </label>
            )}
            <input
              type="text"
              placeholder={component.props.placeholder}
              value={component.props.value || ""}
              onChange={(e) => handlePropChange("value", e.target.value)}
              className="w-full px-12 py-8 bg-background-base border border-border-faint rounded-8 focus:outline-none focus:border-heat-100"
            />
          </div>
        );

      case "textarea":
        return (
          <div className="w-full">
            {component.props.label && (
              <label className="block text-sm font-medium mb-4">
                {component.props.label}
              </label>
            )}
            <textarea
              placeholder={component.props.placeholder}
              value={component.props.value || ""}
              onChange={(e) => handlePropChange("value", e.target.value)}
              rows={component.props.rows || 4}
              className="w-full px-12 py-8 bg-background-base border border-border-faint rounded-8 focus:outline-none focus:border-heat-100"
            />
          </div>
        );

      case "card":
        return (
          <div className="bg-background-elevated border border-border-faint rounded-12 p-16">
            <h3 className="font-semibold text-lg mb-8">{component.props.title}</h3>
            <p className="text-text-secondary">{component.props.content}</p>
          </div>
        );

      case "heading":
        const HeadingTag = component.props.level || "h2";
        return (
          <HeadingTag
            className={`font-bold ${
              HeadingTag === "h1" ? "text-3xl" : HeadingTag === "h2" ? "text-2xl" : "text-xl"
            }`}
          >
            {component.props.text}
          </HeadingTag>
        );

      case "text":
        return <p className="text-text-primary">{component.props.text}</p>;

      case "image":
        return (
          <img
            src={component.props.src}
            alt={component.props.alt}
            className="max-w-full h-auto rounded-8"
          />
        );

      default:
        return <div>Unknown component type: {component.type}</div>;
    }
  };

  const renderEditor = () => {
    switch (component.type) {
      case "button":
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium mb-4">Label</label>
              <input
                type="text"
                value={localProps.label}
                onChange={(e) => setLocalProps({ ...localProps, label: e.target.value })}
                className="w-full px-12 py-8 bg-background-base border border-border-faint rounded-8"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-4">Variant</label>
              <select
                value={localProps.variant}
                onChange={(e) => setLocalProps({ ...localProps, variant: e.target.value })}
                className="w-full px-12 py-8 bg-background-base border border-border-faint rounded-8"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
              </select>
            </div>
          </div>
        );

      case "input":
      case "textarea":
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium mb-4">Label</label>
              <input
                type="text"
                value={localProps.label}
                onChange={(e) => setLocalProps({ ...localProps, label: e.target.value })}
                className="w-full px-12 py-8 bg-background-base border border-border-faint rounded-8"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-4">Placeholder</label>
              <input
                type="text"
                value={localProps.placeholder}
                onChange={(e) => setLocalProps({ ...localProps, placeholder: e.target.value })}
                className="w-full px-12 py-8 bg-background-base border border-border-faint rounded-8"
              />
            </div>
          </div>
        );

      case "card":
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium mb-4">Title</label>
              <input
                type="text"
                value={localProps.title}
                onChange={(e) => setLocalProps({ ...localProps, title: e.target.value })}
                className="w-full px-12 py-8 bg-background-base border border-border-faint rounded-8"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-4">Content</label>
              <textarea
                value={localProps.content}
                onChange={(e) => setLocalProps({ ...localProps, content: e.target.value })}
                className="w-full px-12 py-8 bg-background-base border border-border-faint rounded-8"
                rows={3}
              />
            </div>
          </div>
        );

      case "heading":
      case "text":
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium mb-4">Text</label>
              <input
                type="text"
                value={localProps.text}
                onChange={(e) => setLocalProps({ ...localProps, text: e.target.value })}
                className="w-full px-12 py-8 bg-background-base border border-border-faint rounded-8"
              />
            </div>
            {component.type === "heading" && (
              <div>
                <label className="block text-sm font-medium mb-4">Level</label>
                <select
                  value={localProps.level}
                  onChange={(e) => setLocalProps({ ...localProps, level: e.target.value })}
                  className="w-full px-12 py-8 bg-background-base border border-border-faint rounded-8"
                >
                  <option value="h1">H1</option>
                  <option value="h2">H2</option>
                  <option value="h3">H3</option>
                </select>
              </div>
            )}
          </div>
        );

      case "image":
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium mb-4">Image URL</label>
              <input
                type="text"
                value={localProps.src}
                onChange={(e) => setLocalProps({ ...localProps, src: e.target.value })}
                className="w-full px-12 py-8 bg-background-base border border-border-faint rounded-8"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-4">Alt Text</label>
              <input
                type="text"
                value={localProps.alt}
                onChange={(e) => setLocalProps({ ...localProps, alt: e.target.value })}
                className="w-full px-12 py-8 bg-background-base border border-border-faint rounded-8"
              />
            </div>
          </div>
        );

      default:
        return <div>No editor available</div>;
    }
  };

  return (
    <div className="bg-background-elevated border border-border-faint rounded-12 p-16 relative group">
      {/* Controls */}
      <div className="absolute top-8 right-8 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-4 bg-background-base hover:bg-background-elevated border border-border-faint rounded-6 transition-all"
          title="Edit"
        >
          <Settings className="w-16 h-16" />
        </button>
        <button
          onClick={() => onDelete(component.id)}
          className="p-4 bg-background-base hover:bg-red-500 hover:text-white border border-border-faint rounded-6 transition-all"
          title="Delete"
        >
          <X className="w-16 h-16" />
        </button>
      </div>

      {/* Component Type Badge */}
      <div className="text-xs text-text-secondary mb-8 uppercase tracking-wider">
        {component.type}
      </div>

      {/* Render Component or Editor */}
      {isEditing ? (
        <div className="space-y-12">
          {renderEditor()}
          <button
            onClick={handleSave}
            className="w-full px-12 py-8 bg-heat-100 hover:bg-heat-200 text-white rounded-8 font-medium"
          >
            Save Changes
          </button>
        </div>
      ) : (
        renderComponent()
      )}
    </div>
  );
}
