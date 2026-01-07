import {
  Search,
  ChevronDown,
  FileText,
  MoreVertical,
  Share2,
  Link2,
  Trash2,
  X,
  Trash,
  File,
} from "lucide-react";
import { useRef } from "react";
import { useProcedureBuilder } from "../ProcedureBuilderContext";
import type { FieldData } from "../types";
import { FieldContentRenderer } from "./FieldContentRenderer";
import { ConditionLogicEditor } from "./ConditionLogicEditor";

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
    setIsLinkModalOpen,
    handleToggleLogicEditor, 
  } = useProcedureBuilder();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isRequired = field.isRequired || false;
  const setIsRequired = (isChecked: boolean) => {
    handleToggleRequired(field.id, isChecked);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const url = loadEvent.target?.result as string;
      if (url) {
        const newAttachment = {
          id: Date.now().toString(),
          name: file.name,
          url: url,
          type: file.type,
        };
        const newAttachments = [...(field.attachments || []), newAttachment];
        handleFieldPropChange(field.id, "attachments", newAttachments);
      }
    };
    reader.readAsDataURL(file);

    if (e.target) e.target.value = "";
  };

  const deleteAttachment = (idToDelete: string) => {
    const newAttachments = field.attachments?.filter(
      (a) => a.id !== idToDelete
    );
    handleFieldPropChange(field.id, "attachments", newAttachments);
  };

  const deleteLink = (idToDelete: string) => {
    const newLinks = field.links?.filter((l) => l.id !== idToDelete);
    handleFieldPropChange(field.id, "links", newLinks);
  };

  return (
    // --- Drag Handle (Hidden, for spacing) ---
    <div className="flex gap-2 items-start">
      <div className="w-[20px]"></div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
      />

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

            {/* --- Links Display --- */}
            {field.links && field.links.length > 0 && (
              <div className="mb-3 space-y-2">
                {field.links.map((link) => (
                  <div
                    key={link.id}
                    className="p-2 bg-blue-50 rounded border border-blue-200 flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2 text-blue-600 min-w-0">
                      <Link2 size={16} className="flex-shrink-0" />
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium hover:underline truncate"
                        title={link.text || link.url}
                      >
                        {link.text || link.url}
                      </a>
                    </div>
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="text-gray-400 hover:text-red-500 ml-auto flex-shrink-0"
                      title="Remove Link"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* --- Attachments Display --- */}
            {field.attachments && field.attachments.length > 0 && (
              <div className="mb-3 space-y-3">
                {field.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {attachment.type.startsWith("image/") ? (
                      // --- IMAGE PREVIEW (Opens in new tab) ---
                      <div className="relative w-fit">
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="object-cover rounded-md border border-gray-300"
                            style={{ width: "9.5rem", height: "9.5rem" }}
                          />
                        </a>
                        <button
                          onClick={() => deleteAttachment(attachment.id)}
                          title="Remove Image"
                          style={{
                            position: "absolute",
                            top: "-0.5rem",
                            right: "-0.5rem",
                            background: "rgba(0, 0, 0, 0.75)",
                            color: "white",
                            borderRadius: "9999px",
                            padding: "0.125rem",
                            zIndex: 10,
                            cursor: "pointer",
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      // --- FILE PREVIEW (Triggers download) ---
                      <div className="relative flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md w-full sm:w-2/3">
                        <a
                          href={attachment.url}
                          download={attachment.name}
                          className="flex items-center gap-3 min-w-0"
                        >
                          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white text-gray-500 rounded-lg border border-gray-200">
                            <span className="text-xs font-bold">
                              {attachment.name
                                .split(".")
                                .pop()
                                ?.toUpperCase() || "FILE"}
                            </span>
                          </div>
                          <span
                            className="text-sm text-gray-800 truncate"
                            title={attachment.name}
                          >
                            {attachment.name}
                          </span>
                        </a>
                        <button
                          onClick={() => deleteAttachment(attachment.id)}
                          className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
                          title="Remove File"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
              {/* Left Side */}
              <div className="flex items-center gap-4">
                {field.selectedType === "Date" && (
                  <label className="flex items-center gap-2 cursor-pointer">
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
                        checked={!!field.includeTime}
                        onChange={(e) =>
                          handleFieldPropChange(
                            field.id,
                            "includeTime",
                            e.target.checked
                          )
                        }
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
                          width: "2.25rem",
                          height: "1.25rem",
                          backgroundColor: field.includeTime
                            ? "#2563eb"
                            : "#d1d5db",
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
                          width: "1rem",
                          height: "1rem",
                          borderRadius: "50%",
                          transition: "transform 0.2s ease-in-out",
                          transform: field.includeTime
                            ? "translateX(1rem)"
                            : "translateX(0)",
                        }}
                      ></div>
                    </label>
                    <span className="text-sm text-gray-700">
                      Include Time Field
                    </span>
                  </label>
                )}

                {/* --- Logic Button --- */}
                {logicEnabledFieldTypes.includes(field.selectedType) && (
                  <button
                    ref={(el) =>
                      (logicEditorButtonRefs.current[field.id] = el)
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleLogicEditor(field.id);
                    }}
                    title="Add/Edit Conditions" // ✅ Added Tooltip
                    className={`hover:text-blue-600 ${
                      logicEditorOpen === field.id ? "text-blue-600" : ""
                    }`}
                  >
                    <Share2 size={18} />
                  </button>
                )}
                
                <button
                  onClick={() => setIsLinkModalOpen({ fieldId: field.id })}
                  className="hover:text-blue-600"
                  title="Add Link" // ✅ Added Tooltip
                >
                  <Link2 size={18} />
                </button>

                <button
                  className="hover:text-blue-600"
                  title="Add Pictures/Files" // ✅ Added Tooltip
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <FileText size={18} />
                </button>

                <button
                  onClick={() => handleDeleteField(field.id)}
                  className="hover:text-red-500"
                  title="Delete Field" // ✅ Added Tooltip
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Right Side */}
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
                    title="More Options" // ✅ Added Tooltip
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

        {/* --- Logic Editor (No change) --- */}
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