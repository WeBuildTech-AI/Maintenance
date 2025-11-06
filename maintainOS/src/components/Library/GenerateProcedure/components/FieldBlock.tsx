import {
  GripVertical,
  Search,
  ChevronDown,
  Link2,
  FileText,
  Trash2,
  MoreVertical,
  Share2,
} from "lucide-react";
import { useProcedureBuilder } from "../ProcedureBuilderContext";
import { FieldData } from "../types";
import { FieldContentRenderer } from "./FieldContentRenderer";
import { ConditionLogicEditor } from "./ConditionLogicEditor";
import { ConditionLogicDisplay } from "./ConditionLogicDisplay";
import { useState } from "react";

export function FieldBlock({
  field,
  parentSectionId,
  isNested,
}: {
  field: FieldData;
  parentSectionId?: number;
  isNested?: boolean;
}) {
  const {
    editingFieldId,
    setEditingFieldId,
    setEditingSectionId,
    dropdownOpen,
    setDropdownOpen,
    logicEditorOpen,
    setLogicEditorOpen,
    fieldBlockRefs,
    dropdownRefs,
    buttonRefs,
    dropdownWidths,
    fieldTypes,
    handleLabelChange,
    handleTypeChange,
    handleDeleteField,
    logicEditorButtonRefs,
    logicEnabledFieldTypes,
    // --- ADDED ---
    fieldMenuOpen,
    setFieldMenuOpen,
    fieldMenuButtonRefs,
    fieldMenuPanelRefs,
    handleToggleRequired,
    handleToggleDescription,
    handleDuplicateField,
    handleFieldPropChange,
  } = useProcedureBuilder();

  const isEditing = editingFieldId === field.id;
  const isRequired = field.isRequired || false;
  const setIsRequired = (isChecked: boolean) => {
    handleToggleRequired(field.id, isChecked);
  };

  return (
    <div
      className="flex gap-2 items-start"
      ref={(el) => (fieldBlockRefs.current[field.id] = el)}
    >
      {!isEditing && !isNested && (
        <div className="text-gray-400 cursor-grab pt-6">
          <GripVertical size={20} />
        </div>
      )}

      <div className="flex-1 mb-6">
        <div
          key={field.id}
          className={`flex-1 border ${
            isEditing
              ? "border-blue-400 bg-white"
              : "border-gray-200 bg-gray-50 hover:bg-white"
          } rounded-lg p-4 relative cursor-pointer ${
            isNested && !isEditing ? "flex gap-2 items-start" : ""
          }`}
          onClick={() => {
            !isEditing && setEditingFieldId(field.id);
            setEditingSectionId(null);
            setDropdownOpen(null);
          }}
        >
          {isNested && !isEditing && (
            <div className="text-gray-400 cursor-grab pt-2">
              <MoreVertical size={20} />
            </div>
          )}

          <div className="flex-1">
            {isEditing ? (
              <div className="flex gap-3 mb-2 relative">
                <input
                  type="text"
                  placeholder="Field Name"
                  value={field.label || ""}
                  onChange={(e) => handleLabelChange(field.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 w-[260px]"
                />
                <div
                  className="relative"
                  ref={(el) => (dropdownRefs.current[field.id] = el)}
                >
                  <div
                    ref={(el) => (buttonRefs.current[field.id] = el)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen(
                        dropdownOpen === field.id ? null : field.id
                      );
                    }}
                    className={`flex items-center border ${
                      dropdownOpen === field.id
                        ? "border-blue-400 ring-1 ring-blue-200"
                        : "border-gray-200"
                    } rounded-md px-3 py-2 justify-between cursor-pointer bg-white hover:border-blue-400 transition w-[260px]`}
                  >
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Search size={16} className="text-gray-400" />
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                          {
                            fieldTypes.find(
                              (f) => f.label === field.selectedType
                            )?.icon
                          }
                        </div>
                        <span>{field.selectedType}</span>
                      </div>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-gray-500 transition-transform ${
                        dropdownOpen === field.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {dropdownOpen === field.id && (
                    <div
                      className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-md z-50"
                      style={{
                        width: `${dropdownWidths[field.id] || 260}px`,
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {fieldTypes.map((type) => (
                        <div
                          key={type.label}
                          onClick={() => handleTypeChange(field.id, type.label)}
                          className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${
                            field.selectedType === type.label
                              ? "bg-blue-50 text-blue-700"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              field.selectedType === type.label
                                ? "bg-blue-100"
                                : "bg-gray-100"
                            }`}
                          >
                            {type.icon}
                          </div>
                          <span>{type.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="font-medium text-gray-800 mb-2">
                {field.label || "Field Name"}
              </p>
            )}

            {isEditing && field.hasDescription && (
              <textarea
                placeholder="Add a description"
                value={field.description || ""}
                onChange={(e) =>
                  handleFieldPropChange(field.id, "description", e.target.value)
                }
                onClick={(e) => e.stopPropagation()}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 placeholder-gray-400 resize-none h-20 focus:outline-none focus:ring-1 focus:ring-blue-400 mb-3"
              />
            )}

            <div onClick={(e) => isEditing && e.stopPropagation()}>
              <FieldContentRenderer
                field={field}
                isEditing={isEditing}
                parentSectionId={parentSectionId}
              />
            </div>

            {isEditing && (
              <div
                className="flex justify-between items-center mt-4 text-gray-500"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex gap-4">
                  {logicEnabledFieldTypes.includes(field.selectedType) && (
                    <button
                      ref={(el) =>
                        (logicEditorButtonRefs.current[field.id] = el)
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        setLogicEditorOpen(
                          logicEditorOpen === field.id ? null : field.id
                        );
                      }}
                      className={`hover:text-blue-600 ${
                        logicEditorOpen === field.id ? "text-blue-600" : ""
                      }`}
                    >
                      <Share2 size={18} />
                    </button>
                  )}
                  <button className="hover:text-blue-600">
                    <Link2 size={18} />
                  </button>
                  <button className="hover:text-blue-600">
                    <FileText size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteField(field.id)}
                    className="hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Required</span>
                  <label
                    style={{
                      position: "relative",
                      display: "inline-flex",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isRequired}
                      onChange={(e) => setIsRequired(e.target.checked)}
                      style={{
                        position: "absolute",
                        width: "1px",
                        height: "1px",
                        margin: "-1px",
                        padding: "0",
                        overflow: "hidden",
                        clip: "rect(0, 0, 0, 0)",
                        whiteSpace: "nowrap",
                        borderWidth: "0",
                      }}
                    />
                    <div
                      style={{
                        width: "2.25rem", // w-9
                        height: "1.25rem", // h-5
                        backgroundColor: isRequired ? "#2563eb" : "#d1d5db",
                        borderRadius: "9999px",
                        transition: "background-color 0.2s ease-in-out",
                      }}
                    ></div>
                    <div
                      style={{
                        position: "absolute",
                        left: "2px",
                        top: "2px",
                        backgroundColor: "#ffffff",
                        width: "1rem", // w-4
                        height: "1rem", // h-4
                        borderRadius: "50%",
                        transition: "transform 0.2s ease-in-out",
                        transform: isRequired
                          ? "translateX(1rem)"
                          : "translateX(0)",
                      }}
                    ></div>
                  </label>
                  
                  {/* --- MODIFIED: 3-dot menu --- */}
                  <div style={{ position: "relative" }}> {/* MODIFIED: Added position: relative */}
                    <button
                      ref={(el) => (fieldMenuButtonRefs.current[field.id] = el)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFieldMenuOpen(fieldMenuOpen === field.id ? null : field.id);
                      }}
                      className="hover:text-gray-700"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {fieldMenuOpen === field.id && (
                       <div
                        ref={(el) => (fieldMenuPanelRefs.current[field.id] = el)}
                        // --- THIS IS THE FIX ---
                        style={{
                          position: "absolute",
                          right: 0, // Align to the right of the icon
                          bottom: "100%", // Position above the icon
                          marginBottom: "0.25rem", // 4px margin
                          width: "12rem", // w-48
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb", // border-gray-200
                          borderRadius: "0.375rem", // rounded-md
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)", // shadow-lg
                          zIndex: 50, // z-50
                        }}
                      >
                        <button
                          onClick={() => handleToggleDescription(field.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {field.hasDescription
                            ? "Remove Description"
                            : "Add Description"}
                        </button>
                        <button
                           onClick={() => handleDuplicateField(field.id)}
                           className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Duplicate
                        </button>
                      </div>
                    )}
                  </div>
                  {/* --- END OF MODIFICATION --- */}

                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- LOGIC DISPLAY (Show when logic is NOT open) --- */}
        {logicEditorOpen !== field.id &&
          field.conditions &&
          field.conditions.length > 0 && (
            <div className="mt-6">
              {field.conditions.map((condition) => (
                <ConditionLogicDisplay
                  key={condition.id}
                  condition={condition}
                  parentFieldId={field.id}
                />
              ))}
            </div>
          )}

        {/* --- LOGIC EDITOR (Show when logic IS open) --- */}
        {logicEditorOpen === field.id &&
          logicEnabledFieldTypes.includes(field.selectedType) && (
            <div
              className="mt-6 relative z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <ConditionLogicEditor field={field} />
            </div>
          )}
      </div>
    </div>
  );
}