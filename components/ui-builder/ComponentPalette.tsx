"use client";

import { useDraggable } from "@dnd-kit/core";

const AVAILABLE_COMPONENTS = [
  { id: "button", label: "Button", icon: "🔘" },
  { id: "input", label: "Input", icon: "📝" },
  { id: "textarea", label: "Text Area", icon: "📄" },
  { id: "card", label: "Card", icon: "🃏" },
  { id: "heading", label: "Heading", icon: "📌" },
  { id: "text", label: "Text", icon: "📖" },
  { id: "image", label: "Image", icon: "🖼️" },
  { id: "select", label: "Select", icon: "📋" },
  { id: "checkbox", label: "Checkbox", icon: "☑️" },
  { id: "radio", label: "Radio", icon: "⭕" },
  { id: "divider", label: "Divider", icon: "➖" },
  { id: "container", label: "Container", icon: "📦" },
  { id: "list", label: "List", icon: "📃" },
  { id: "link", label: "Link", icon: "🔗" },
  { id: "badge", label: "Badge", icon: "🏷️" },
];

function DraggableComponent({ id, label, icon }: { id: string; label: string; icon: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600
        rounded-lg p-3 mb-2 shadow-sm
        cursor-grab active:cursor-grabbing
        hover:border-blue-400 hover:shadow-md transition-all
        ${isDragging ? "opacity-50" : "opacity-100"}
      `}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
      </div>
    </div>
  );
}

export default function ComponentPalette() {
  return (
    <div className="space-y-8">
      {AVAILABLE_COMPONENTS.map((component) => (
        <DraggableComponent
          key={component.id}
          id={component.id}
          label={component.label}
          icon={component.icon}
        />
      ))}
    </div>
  );
}
