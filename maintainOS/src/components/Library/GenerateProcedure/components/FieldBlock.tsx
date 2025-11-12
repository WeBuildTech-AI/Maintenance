import { useProcedureBuilder } from "../ProcedureBuilderContext";
import type { FieldData } from "../types";
import { ConditionLogicEditor } from "./ConditionLogicEditor";
import { FieldEditor } from "./FieldEditor";
import { FieldViewer } from "./FieldViewer";

export function FieldBlock({
  field,
  parentSectionId,
  isNested,
  // --- 🐞 YEH HAI FIX: Naya prop accept karein ---
  containerId,
}: {
  field: FieldData;
  parentSectionId?: number;
  isNested?: boolean;
  containerId?: number | "root";
  // --- END FIX ---
}) {
  const {
    editingFieldId,
    setEditingFieldId,
    setEditingSectionId,
    setDropdownOpen,
    logicEditorOpen,
    setLogicEditorOpen,
    logicEnabledFieldTypes,
    // --- 🐞 YEH HAI FIX: Naya function import karein ---
    setActiveContainerId,
    // --- END FIX ---
  } = useProcedureBuilder();

  const isEditing = editingFieldId === field.id;

  const handleOnClick = () => {
    if (!isEditing) {
      // --- 🐞 YEH HAI AAPKA MAIN FIX ---
      // Jab field expand ho, toh uske container ko active set karo
      if (containerId) {
        setActiveContainerId(containerId);
      }
      // --- END FIX ---
      
      setEditingFieldId(field.id);
      setEditingSectionId(null);
      setDropdownOpen(null);
      if (logicEnabledFieldTypes.includes(field.selectedType)) {
        setLogicEditorOpen(field.id);
      }
    }
  };

  if (isEditing) {
    return (
      <FieldEditor
        field={field}
        parentSectionId={parentSectionId}
        isNested={isNested}
      />
    );
  }

  // --- View Mode ---
  return (
    <>
      <FieldViewer
        field={field}
        parentSectionId={parentSectionId}
        isNested={isNested}
        onClick={handleOnClick}
      />

      {/* --- View Mode Logic Display --- */}
      {!isEditing &&
        field.conditions &&
        field.conditions.length > 0 &&
        logicEnabledFieldTypes.includes(field.selectedType) && (
          <div
            className="mt-[-1.5rem] mb-6 relative z-20"
            onClick={handleOnClick}
          >
            <div className="pl-[28px]">
              <ConditionLogicEditor field={field} />
            </div>
          </div>
        )}
    </>
  );
}