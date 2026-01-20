import { Share2, ChevronRight, MoreVertical, ChevronDown } from "lucide-react";
import { useProcedureBuilder } from "../ProcedureBuilderContext";
import {
  type FieldData,
  type ConditionData,
  logicConditionTypes,
} from "../types";
import { ProcedureBlock } from "./ProcedureBlock";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
// --- 👇 [FIX] 'useEffect' ko React se import karne ki zaroorat nahi hai ---

export function ConditionLogicEditor({ field }: { field: FieldData }) {
  const { logicEditorPanelRefs, setIsAddConditionModalOpen } = useProcedureBuilder();

  // --- 👇 [FIX] 'useEffect' logic yahaan se poori tarah HATA di gayi hai ---
  // (Yeh pichhle response mein galti se add ho gayi thi)

  return (
    <div
      ref={(el) => (logicEditorPanelRefs.current[field.id] = el)}
      className="mt-6"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Ab, jab `FieldEditor` mein icon click hoga, 
        `handleToggleLogicEditor` call hoga.
        Woh panel kholega AUR (agar zaroorat hai) ek condition add karega.
        Yeh component fir uss ek condition ke saath render hoga.
      */}
      {field.conditions?.map((condition) => (
        <ConditionBlock
          key={condition.id}
          condition={condition}
          parentFieldId={field.id}
        />
      ))}
      <button
        onClick={() => setIsAddConditionModalOpen({ fieldId: field.id })}
        className="text-blue-600 text-sm font-medium mt-2 flex items-center gap-1.5 hover:text-blue-800"
      >
        <Share2 size={14} />
        Add Another Condition
      </button>
    </div>
  );
}

// This is the internal component that renders one condition block
function ConditionBlock({
  condition,
  parentFieldId,
}: {
  condition: ConditionData;
  parentFieldId: number;
}) {
  const {
    findFieldRecursive,
    fields,
    handleToggleConditionCollapse,
    handleConditionChange,
    handleDeleteCondition,
    handleAddFieldInsideCondition,
    conditionOperatorDropdownOpen,
    setConditionOperatorDropdownOpen,
    conditionMenuOpen,
    setConditionMenuOpen,
    conditionOpButtonRefs,
    conditionOpPanelRefs,
    conditionMenuButtonRefs,
    conditionMenuPanelRefs,
    setActiveContainerId,
    activeField,
    overContainerId,
  } = useProcedureBuilder();

  const parentField = findFieldRecursive(fields, parentFieldId);
  if (!parentField) return null; // Safety check

  const isDragging = !!activeField;
  const isOverThisCondition = overContainerId === `condition-${condition.id}`;
  const canDropOnCondition = isDragging && activeField?.blockType !== "section";

  const operators = logicConditionTypes[parentField.selectedType] || [];

  const commonSelectClass =
    "border border-yellow-500 rounded-md px-2 py-1 text-sm bg-white focus:outline-none";
  const commonInputClass =
    "border-b border-gray-400 bg-transparent px-1 py-0.5 text-sm w-24 focus:outline-none focus:ring-0 focus:border-blue-500";

  const handleValueChange = (val: string) =>
    handleConditionChange(parentFieldId, condition.id, "conditionValue", val);
  const handleValue2Change = (val: string) =>
    handleConditionChange(
      parentFieldId,
      condition.id,
      "conditionValue2",
      val
    );

  const renderValueInput = () => {
    if (!condition.conditionOperator) return null;

    switch (parentField.selectedType) {
      case "Yes, No, N/A":
        return (
          <select
            value={condition.conditionValue || ""}
            onChange={(e) => handleValueChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className={commonSelectClass}
          >
            <option value="">Select...</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="N/A">N/A</option>
          </select>
        );

      case "Multiple Choice":
      case "Checklist":
        return (
          <select
            value={condition.conditionValue || ""}
            onChange={(e) => handleValueChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className={commonSelectClass}
          >
            <option value="">Select...</option>
            {parentField.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case "Inspection Check":
        return (
          <select
            value={condition.conditionValue || ""}
            onChange={(e) => handleValueChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className={commonSelectClass}
          >
            <option value="">Select...</option>
            <option value="Pass">Pass</option>
            <option value="Flag">Flag</option>
            <option value="Fail">Fail</option>
          </select>
        );

      case "Checkbox":
        return null;

      case "Number Field":
      case "Amount ($)":
      case "Meter Reading":
        return (
          <>
            <input
              type="number"
              value={condition.conditionValue || ""}
              placeholder="0"
              onChange={(e) => handleValueChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className={commonInputClass}
            />
            {condition.conditionOperator === "between" && (
              <>
                <span className="text-gray-600">and</span>
                <input
                  type="number"
                  value={condition.conditionValue2 || ""}
                  placeholder="0"
                  onChange={(e) => handleValue2Change(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className={commonInputClass}
                />
              </>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div
      key={condition.id}
      style={{
        position: "relative",
        zIndex:
          conditionOperatorDropdownOpen === condition.id ||
          conditionMenuOpen === condition.id
            ? 30
            : 10,
      }}
      className="pl-10 mb-6"
      onClick={(e) => {
        e.stopPropagation();
        setActiveContainerId(condition.id);
      }}
    >
      <div className="absolute left-3.5 top-2 h-full w-0.5 bg-blue-100 z-0"></div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleToggleConditionCollapse(parentFieldId, condition.id);
        }}
        className="absolute left-0 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 z-20"
      >
        {condition.isCollapsed ? (
          <ChevronRight size={18} />
        ) : (
          <Share2 size={16} />
        )}
      </button>

      <div className="flex items-center justify-between gap-2 mb-4 relative z-20">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <span className="text-gray-700 font-medium whitespace-nowrap">
            If answer is
          </span>

          <div className="relative z-30">
            <button
              ref={(el) => (conditionOpButtonRefs.current[condition.id] = el)}
              onClick={(e) => {
                e.stopPropagation();
                setConditionOperatorDropdownOpen(
                  conditionOperatorDropdownOpen === condition.id
                    ? null
                    : condition.id
                );
              }}
              className={`flex items-center justify-between border ${
                conditionOperatorDropdownOpen === condition.id
                  ? "border-blue-400"
                  : "border-gray-300"
              } rounded-md px-2 py-1 text-sm bg-white w-36`}
            >
              <span>{condition.conditionOperator || "Select..."}</span>
              <ChevronDown
                size={16}
                className={`text-gray-500 transition-transform ${
                  conditionOperatorDropdownOpen === condition.id
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>
            {conditionOperatorDropdownOpen === condition.id && (
              <div
                ref={(el) => (conditionOpPanelRefs.current[condition.id] = el)}
                style={{
                  position: "absolute",
                  left: 0,
                  top: "100%",
                  marginTop: "0.25rem",
                  width: "9rem",
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.375rem",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
                  zIndex: 9999,
                }}
              >
                {operators.map((op) => (
                  <div
                    key={op}
                    onClick={() =>
                      handleConditionChange(
                        parentFieldId,
                        condition.id,
                        "conditionOperator",
                        op
                      )
                    }
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  >
                    {op}
                  </div>
                ))}
              </div>
            )}
          </div>

          {renderValueInput()}
        </div>

        <div className="relative z-30">
          <button
            ref={(el) => (conditionMenuButtonRefs.current[condition.id] = el)}
            onClick={(e) => {
              e.stopPropagation();
              setConditionMenuOpen(
                conditionMenuOpen === condition.id ? null : condition.id
              );
            }}
            className="text-gray-400 hover:text-gray-700"
          >
            <MoreVertical size={18} />
          </button>
          {conditionMenuOpen === condition.id && (
            <div
              ref={(el) => (conditionMenuPanelRefs.current[condition.id] = el)}
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                marginTop: "0.25rem",
                width: "7rem",
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "0.375rem",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
                zIndex: 9999,
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCondition(parentFieldId, condition.id);
                }}
                className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {!condition.isCollapsed && (
        <>
          <SortableContext
            id={`condition-${condition.id}`}
            items={condition.fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div
              className={`space-y-4 relative z-10 transition-colors ${
                canDropOnCondition && isOverThisCondition
                  ? "bg-yellow-50 rounded-md"
                  : ""
              }`}
            >
              {condition.fields.map((subField, index) => (
                <ProcedureBlock
                  key={subField.id}
                  field={subField}
                  index={index}
                  isNested={true}
                  containerId={condition.id}
                />
              ))}
            </div>
          </SortableContext>

          <button
            onClick={() =>
              handleAddFieldInsideCondition(parentFieldId, condition.id)
            }
            className="text-blue-600 text-sm font-medium mt-4 relative z-10"
          >
            + Add Field
          </button>
        </>
      )}
    </div>
  );
}