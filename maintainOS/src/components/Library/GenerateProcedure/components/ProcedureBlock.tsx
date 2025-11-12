import { type FieldData } from "../types";
import { HeadingBlock } from "./HeadingBlock";
// import { SectionBlock } from "./SectionBlock"; // <-- Combined
import { FieldBlock } from "./FieldBlock";

// --- SectionBlock ka code ---
import { ChevronDown, Pencil, MoreVertical, Layout } from "lucide-react";
import { useProcedureBuilder } from "../ProcedureBuilderContext";
// import { FieldContentRenderer } from "./FieldContentRenderer"; // <-- Removed
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

function SectionBlock({
  field,
  isNested,
  // --- 🐞 YEH HAI FIX: Prop ko yahaan bhi accept karein ---
  containerId,
  // --- END FIX ---
}: {
  field: FieldData;
  isNested?: boolean;
  containerId?: number | "root";
}) {
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
    sectionBlockRefs,
    sectionMenuButtonRefs,
    sectionMenuPopoverRefs,
    setIsReorderModalOpen,
    setActiveContainerId,
    activeField,
    overContainerId,
    handleAddField,
  } = useProcedureBuilder();

  const isSectionEditing = editingSectionId === field.id;
  const isCollapsed = !!collapsed[field.id];

  const isDragging = !!activeField;
  const isOverThisSection = overContainerId === `section-${field.id}`;
  const canDropOnSection = isDragging && activeField?.blockType !== "section";

  return (
    <div
      key={field.id}
      ref={(el) => (sectionBlockRefs.current[field.id] = el)}
      className="relative mb-8"
      onClick={(e) => {
        e.stopPropagation();
        setActiveContainerId(field.id);
      }}
    >
      {/* --- Vertical Line (background) --- */}
      <div
        className="absolute left-[11px] top-6 w-0.5 h-[calc(100%-16px)] bg-gray-200 z-0"
        aria-hidden="true"
      ></div>
      {/* Diamond at the end of the line */}
      {!isCollapsed && (
        <div
          className="absolute left-[6px] bottom-[-8px] w-3 h-3 bg-white border border-gray-200 rotate-45 z-10"
          aria-hidden="true"
        ></div>
      )}

      {/* Content Container (Header + Body) */}
      <div className="relative z-10">
        {/* --- Section Header --- */}
        <div
          className={`flex justify-between items-center ${
            isCollapsed ? "" : "mb-4"
          }`}
        >
          <div className="flex items-center gap-3 group">
            {/* Icon with blue circle bg */}
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 rounded-full text-blue-500 z-10">
              <Layout size={14} />
            </span>

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
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSectionId(field.id);
                      setEditingFieldId(null);
                    }}
                  />
                )}
              </>
            )}
          </div>

          {/* --- Section Menu (3 dots) --- */}
          <div style={{ position: "relative" }}>
            <button
              ref={(el) => (sectionMenuButtonRefs.current[field.id] = el)}
              onClick={(e) => {
                e.stopPropagation();
                setSectionMenuOpen(
                  sectionMenuOpen === field.id ? null : field.id
                );
              }}
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
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
                  zIndex: 50,
                }}
              >
                {/* Menu items... */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsReorderModalOpen(true);
                    setSectionMenuOpen(null);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Reorder
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Duplicate
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteField(field.id);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- Section Body (Indented) --- */}
        <div className="pl-9 relative z-10">
          {!isCollapsed ? (
            <>
              <SortableContext
                id={`section-${field.id}`}
                items={field.fields?.map((f) => f.id) || []}
                strategy={verticalListSortingStrategy}
              >
                <div
                  className={`relative transition-colors ${
                    canDropOnSection && isOverThisSection
                      ? "bg-yellow-50 rounded-md"
                      : ""
                  }`}
                >
                  {field.fields && field.fields.length > 0 ? (
                    // --- Case 1: Fields maujood hain ---
                    <div className="space-y-4">
                      {field.fields.map((subField, subIndex) => (
                        <ProcedureBlock
                          key={subField.id}
                          field={subField}
                          index={subIndex}
                          parentSectionId={field.id}
                          isNested={true}
                          // --- 🐞 YEH HAI FIX: Batayein ki in fields ka container yeh section hai ---
                          containerId={field.id}
                          // --- END FIX ---
                        />
                      ))}
                    </div>
                  ) : (
                    // --- Case 2: Section khaali hai ---
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveContainerId(field.id);
                          handleAddField();
                        }}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Add Field
                      </button>
                      <span className="text-gray-400">|</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(
                            "Logic for 'Add Procedure' not yet implemented."
                          );
                        }}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Add Procedure
                      </button>
                    </div>
                  )}
                </div>
              </SortableContext>
            </>
          ) : (
            <div className="mt-1 text-gray-500 text-sm">
              {field.fields?.length || 0} field
              {field.fields?.length !== 1 ? "s" : ""} collapsed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// --- END OF SectionBlock CODE ---

interface ProcedureBlockProps {
  field: FieldData;
  index: number;
  parentSectionId?: number;
  isNested?: boolean;
  // --- 🐞 YEH HAI FIX: Naya prop add karein ---
  containerId?: number | "root";
  // --- END FIX ---
}

export function ProcedureBlock({
  field,
  parentSectionId,
  isNested,
  // --- 🐞 YEH HAI FIX: Prop ko accept karein ---
  containerId,
  // --- END FIX ---
}: ProcedureBlockProps) {
  // --- Pass isNested to all blocks ---
  if (field.blockType === "heading") {
    return (
      <HeadingBlock
        field={field}
        isNested={isNested}
        // --- 🐞 YEH HAI FIX: Prop ko pass karein ---
        containerId={containerId}
        // --- END FIX ---
      />
    );
  }

  if (field.blockType === "section") {
    return (
      <SectionBlock
        field={field}
        isNested={isNested}
        // --- 🐞 YEH HAI FIX: Prop ko pass karein ---
        containerId={containerId}
        // --- END FIX ---
      />
    );
  }

  return (
    <FieldBlock
      field={field}
      parentSectionId={parentSectionId}
      isNested={isNested}
      // --- 🐞 YEH HAI FIX: Prop ko pass karein ---
      containerId={containerId}
      // --- END FIX ---
    />
  );
}