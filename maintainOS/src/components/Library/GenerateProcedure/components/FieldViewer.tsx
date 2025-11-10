import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FieldData } from "../types";
import { FieldContentRenderer } from "./FieldContentRenderer";

interface FieldViewerProps {
  field: FieldData;
  parentSectionId?: number;
  isNested?: boolean;
  onClick: () => void;
}

export function FieldViewer({
  field,
  parentSectionId,
  isNested,
  onClick,
}: FieldViewerProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-2 items-start group"
      onClick={onClick}
    >
      {/* --- Drag Handle --- */}
      <div
        {...attributes}
        {...listeners}
        className="text-gray-400 cursor-grab active:cursor-grabbing pt-4 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical size={20} />
      </div>

      {/* --- Collapsed Field Body --- */}
      <div
        className="flex-1 mb-6 border border-gray-200 bg-gray-50 hover:bg-white rounded-lg p-4 relative cursor-pointer"
      >
        <p className="font-medium text-gray-800 mb-2">
          {field.label || "Field Name"}
        </p>

        <FieldContentRenderer
          field={field}
          isEditing={false}
          parentSectionId={parentSectionId}
        />
      </div>
    </div>
  );
}