import { ChevronDown, Pencil, MoreVertical } from "lucide-react";
import { useProcedureBuilder } from "../ProcedureBuilderContext";
import { FieldData } from "../types";
import { ProcedureBlock } from "./ProcedureBlock";
import { FieldContentRenderer } from "./FieldContentRenderer";

export function SectionBlock({ field }: { field: FieldData }) {
  const {
    editingSectionId,
    setEditingSectionId,
    editingFieldId,
    setEditingFieldId,
    sectionMenuOpen,
    setSectionMenuOpen,
    collapsed,
    toggleCollapse,
    handleFieldPropChange,
    handleDeleteField,
    handleAddFieldInsideSection,
    sectionBlockRefs,
    sectionMenuButtonRefs,
    sectionMenuPopoverRefs,
    setIsReorderModalOpen, // <-- ADDED
  } = useProcedureBuilder();

  const isSectionEditing = editingSectionId === field.id;
  const isCollapsed = !!collapsed[field.id];

  return (
    <div
      key={field.id}
      ref={(el) => (sectionBlockRefs.current[field.id] = el)}
      className="relative mb-8"
    >
      <div className="ml-0">
        <div
          className={`flex justify-between items-center ${
            isCollapsed ? "" : "mb-4"
          }`}
        >
          <div className="flex items-center gap-2 group">
            {isSectionEditing ? (
              <input
                type="text"
                value={field.label}
                onChange={(e) =>
                  handleFieldPropChange(field.id, "label", e.target.value)
                }
                className="text-lg font-semibold text-gray-800 outline-none border-b-2 border-blue-500 bg-transparent"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") setEditingSectionId(null);
                }}
              />
            ) : (
              <>
                <button
                  onClick={() => toggleCollapse(field.id)}
                  className={`flex items-center gap-2 text-lg font-semibold ${
                    isCollapsed ? "text-gray-500" : "text-gray-800"
                  }`}
                >
                  <span>{field.label}</span>
                  <ChevronDown
                    size={16}
                    className={`${
                      isCollapsed ? "-rotate-90" : "rotate-0"
                    } transition-transform`}
                  />
                </button>

                {!isCollapsed && (
                  <Pencil
                    size={16}
                    className="text-gray-400 group-hover:text-blue-500 transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                    onClick={() => {
                      setEditingSectionId(field.id);
                      setEditingFieldId(null);
                    }}
                  />
                )}
              </>
            )}
          </div>

          <div style={{ position: "relative" }}>
            <button
              ref={(el) => (sectionMenuButtonRefs.current[field.id] = el)}
              onClick={() =>
                setSectionMenuOpen(
                  sectionMenuOpen === field.id ? null : field.id
                )
              }
              className="text-gray-500 hover:text-gray-700"
            >
              <MoreVertical size={20} />
            </button>
            {sectionMenuOpen === field.id && (
              <div
                ref={(el) => (sectionMenuPopoverRefs.current[field.id] = el)}
                style={{
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  marginTop: "0.25rem",
                  width: "12rem",
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.375rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
                  zIndex: 50,
                }}
              >
                {/* --- MODIFIED --- */}
                <button 
                  onClick={() => {
                    setIsReorderModalOpen(true);
                    setSectionMenuOpen(null);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Reorder
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Duplicate
                </button>
                <button
                  onClick={() => handleDeleteField(field.id)}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {!isCollapsed ? (
          <>
            {isSectionEditing && (
              <div className="mb-4">
                <textarea
                  placeholder="Add a description"
                  value={field.description || ""}
                  onChange={(e) =>
                    handleFieldPropChange(
                      field.id,
                      "description",
                      e.target.value
                    )
                  }
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 placeholder-gray-400 resize-none h-20 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            )}

            {field.fields?.map((subField, subIndex) => {
              if (isSectionEditing) {
                return (
                  <div
                    key={subField.id}
                    className="border border-gray-200 bg-gray-50 rounded-lg p-4 mb-6 relative"
                  >
                    <p className="font-medium text-gray-800 mb-2">
                      {subField.label || "Field Name"}
                    </p>
                    <FieldContentRenderer
                      field={subField}
                      isEditing={false}
                      parentSectionId={field.id}
                    />
                  </div>
                );
              } else {
                return (
                  <div key={subField.id} className="ml-0">
                    <ProcedureBlock
                      field={subField}
                      index={subIndex}
                      parentSectionId={field.id}
                      isNested={true}
                    />
                  </div>
                );
              }
            })}

            <button
              onClick={() => handleAddFieldInsideSection(field.id)}
              className="text-blue-600 text-sm font-medium"
            >
              + Add Field
            </button>
          </>
        ) : (
          <div className="mt-1 text-gray-500 text-sm">
            {field.fields?.length || 0} field
            {field.fields?.length !== 1 ? "s" : ""} collapsed
          </div>
        )}
      </div>
    </div>
  );
}