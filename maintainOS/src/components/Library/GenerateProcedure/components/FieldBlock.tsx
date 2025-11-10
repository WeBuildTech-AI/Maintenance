import { useProcedureBuilder } from "../ProcedureBuilderContext";
import type { FieldData } from "../types";
import { ConditionLogicEditor } from "./ConditionLogicEditor";
import { FieldEditor } from "./FieldEditor"; // <-- Naya import
import { FieldViewer } from "./FieldViewer"; // <-- Naya import

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
    setDropdownOpen,
    logicEditorOpen,
    setLogicEditorOpen,
    logicEnabledFieldTypes,
  } = useProcedureBuilder();

  const isEditing = editingFieldId === field.id;

  const handleOnClick = () => {
    if (!isEditing) {
      setEditingFieldId(field.id);
      setEditingSectionId(null);
      setDropdownOpen(null);
      // Jab hum edit karne ke liye click karte hain,
      // toh logic editor bhi open kar dein agar field logic-enabled hai
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
  // View mode mein, hum FieldViewer aur (agar conditions hain toh)
  // ConditionLogicEditor alag se dikhate hain.
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
            className="mt-[-1.5rem] mb-6 relative z-20" // Negative margin to attach it
            onClick={handleOnClick} // Ispe click karne se bhi edit mode khul jayega
          >
            {/* Note: Drag handle ke liye 28px padding add kar raha hoon */}
            <div className="pl-[28px]"> 
              <ConditionLogicEditor field={field} />
            </div>
          </div>
        )}
    </>
  );
}