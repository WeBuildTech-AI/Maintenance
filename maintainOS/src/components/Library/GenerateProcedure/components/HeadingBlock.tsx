import { Trash2 } from "lucide-react";
import { useProcedureBuilder } from "../ProcedureBuilderContext";
import { FieldData } from "../types";

export function HeadingBlock({ field }: { field: FieldData }) {
  const {
    editingFieldId,
    setEditingFieldId,
    setEditingSectionId,
    setDropdownOpen,
    handleLabelChange,
    handleDeleteField,
    fieldBlockRefs,
  } = useProcedureBuilder();

  const isEditing = editingFieldId === field.id;

  return (
    <div
      key={field.id}
      ref={(el) => (fieldBlockRefs.current[field.id] = el)}
      className="mb-6"
      onClick={() => {
        setEditingFieldId(field.id);
        setEditingSectionId(null);
        setDropdownOpen(null);
      }}
    >
      {isEditing ? (
        <input
          type="text"
          placeholder="Heading Title"
          value={field.label || ""}
          onChange={(e) => handleLabelChange(field.id, e.target.value)}
          autoFocus
          className="w-full bg-transparent border-b border-gray-300 text-gray-700 text-lg font-medium placeholder-gray-400 outline-none py-1 focus:border-blue-400"
        />
      ) : (
        <h3 className="text-gray-800 text-lg font-semibold cursor-pointer py-1 border-b border-transparent">
          {field.label || "Heading Title"}
        </h3>
      )}
      {isEditing && (
        <div className="flex justify-end mt-2">
          <button
            onClick={() => handleDeleteField(field.id)}
            className="text-gray-400 hover:text-red-500"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}
    </div>
  );
}