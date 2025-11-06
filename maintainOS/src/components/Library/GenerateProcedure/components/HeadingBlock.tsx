import { Trash2, GripVertical, Copy } from "lucide-react"; 
import { useProcedureBuilder } from "../ProcedureBuilderContext";
import { FieldData } from "../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function HeadingBlock({
  field,
  isNested, 
}: {
  field: FieldData;
  isNested?: boolean;
}) {
  const {
    editingFieldId,
    setEditingFieldId,
    setEditingSectionId,
    setDropdownOpen,
    handleLabelChange,
    handleDeleteField,
    handleDuplicateField, 
    fieldBlockRefs,
  } = useProcedureBuilder();

  const isEditing = editingFieldId === field.id;

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
      key={field.id}
      className="flex gap-2 items-center mb-6 group"
    >
      {/* --- Drag Handle --- */}
      {!isEditing && (
        <div
          {...attributes}
          {...listeners}
          className="text-gray-400 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical size={20} />
        </div>
      )}
      
      
      <div
        ref={(el) => (fieldBlockRefs.current[field.id] = el)}
        className={`flex-1 ${isEditing ? 'ml-[-28px]' : ''}`}
        onClick={() => { 
          if (!isEditing) {
            setEditingFieldId(field.id);
            setEditingSectionId(null);
            setDropdownOpen(null);
          }
        }}
      >
        {isEditing ? (
          // --- EDITING STATE ---
          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              placeholder="Heading Title"
              value={field.label || ""}
              onChange={(e) => handleLabelChange(field.id, e.target.value)}
              autoFocus
              className="flex-1 bg-white border border-blue-400 text-gray-700 text-lg font-medium placeholder-gray-400 outline-none py-2 px-2 rounded-md"
              onClick={(e) => e.stopPropagation()} 
            />
            <div className="flex items-center gap-3 text-gray-500">
               <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicateField(field.id);
                }}
                className="hover:text-blue-600"
              >
                <Copy size={18} />
              </button>
              <button
                onClick={(e) => {
                   e.stopPropagation();
                   handleDeleteField(field.id);
                }}
                className="hover:text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ) : (
          // --- VIEW STATE ---
          <div className="flex items-center justify-between">
            <h3 
              className="text-gray-800 text-lg font-semibold cursor-pointer py-2 border-b border-transparent"
            >
              {field.label || "Heading Title"}
            </h3>
            <div className="flex items-center gap-3 text-gray-500">
              <button
                onClick={(e) => {
                  e.stopPropagation(); 
                  handleDuplicateField(field.id);
                }}
                className="hover:text-blue-600"
              >
                <Copy size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation(); 
                  handleDeleteField(field.id);
                }}
                className="hover:text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}