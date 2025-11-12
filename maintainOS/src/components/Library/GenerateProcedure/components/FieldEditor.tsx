import {
  Search,
  ChevronDown,
  Link2,
  FileText,
  Trash2,
  MoreVertical,
  Share2,
} from "lucide-react";
import { useProcedureBuilder } from "../ProcedureBuilderContext";
import type { FieldData } from "../types";
import { FieldContentRenderer } from "./FieldContentRenderer";
import { ConditionLogicEditor } from "./ConditionLogicEditor";
import { Tooltip } from "../../../ui/tooltip";

interface FieldEditorProps {
  field: FieldData;
  parentSectionId?: number;
  isNested?: boolean;
}

export function FieldEditor({
  field,
  parentSectionId,
  isNested,
}: FieldEditorProps) {
  const {
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
    fieldMenuOpen,
    setFieldMenuOpen,
    fieldMenuButtonRefs,
    fieldMenuPanelRefs,
    handleToggleRequired,
    handleToggleDescription,
    handleDuplicateField,
    handleFieldPropChange,
  } = useProcedureBuilder();

  const isRequired = field.isRequired || false;
  const setIsRequired = (isChecked: boolean) => {
    handleToggleRequired(field.id, isChecked);
  };

  return (
    // --- Drag Handle (Hidden, for spacing) ---
    <div className="flex gap-2 items-start">
      <div className="w-[20px]"></div>

      {/* --- Expanded Field Body --- */}
      <div className="flex-1 mb-6 ml-[-28px]">
        <div
          ref={(el) => (fieldBlockRefs.current[field.id] = el)}
          className="flex-1 border border-blue-400 bg-white rounded-lg p-4 relative cursor-pointer"
        >
          <div className="flex-1">
            {/* --- Top Inputs (Label + Type) --- */}
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
                          fieldTypes.find((f) => f.label === field.selectedType)
                            ?.icon
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

            {/* --- Description Textarea (if enabled) --- */}
            {field.hasDescription && (
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

            {/* --- Field Content (Switch statement) --- */}
            <div onClick={(e) => e.stopPropagation()}>
              <FieldContentRenderer
                field={field}
                isEditing={true}
                parentSectionId={parentSectionId}
              />
            </div>

            {/* --- Footer (Icons + Required) --- */}
            <div
              className="flex justify-between items-center mt-4 text-gray-500"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-4">
                {logicEnabledFieldTypes.includes(field.selectedType) && (
                  <Tooltip text="Share">
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
                  </Tooltip>
                )}
                <Tooltip text="Copy Link">
                  <button className="hover:text-blue-600">
                    <Link2 size={18} />
                  </button>
                </Tooltip>
                <Tooltip text="File">
                  <button className="hover:text-blue-600">
                    <FileText size={18} />
                  </button>
                </Tooltip>
                <Tooltip text="Delete">
                  <button
                    onClick={() => handleDeleteField(field.id)}
                    className="hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </Tooltip>
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

                <div style={{ position: "relative" }}>
                  <button
                    ref={(el) => (fieldMenuButtonRefs.current[field.id] = el)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFieldMenuOpen(
                        fieldMenuOpen === field.id ? null : field.id
                      );
                    }}
                    className="hover:text-gray-700"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {fieldMenuOpen === field.id && (
                    <div
                      ref={(el) => (fieldMenuPanelRefs.current[field.id] = el)}
                      style={{
                        position: "absolute",
                        right: 0,
                        bottom: "100%",
                        marginBottom: "0.25rem",
                        width: "12rem",
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.375rem",
                        boxShadow:
                          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
                        zIndex: 50,
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
              </div>
            </div>
          </div>
        </div>

        {/* --- Logic Editor --- */}
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
