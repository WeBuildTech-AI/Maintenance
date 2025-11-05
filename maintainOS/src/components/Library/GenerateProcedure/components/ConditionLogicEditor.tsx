import { Share2, ChevronRight, MoreVertical, ChevronDown } from "lucide-react";
import { useProcedureBuilder } from "../ProcedureBuilderContext";
import { FieldData, ConditionData, logicConditionTypes } from "../types";
import { ProcedureBlock } from "./ProcedureBlock";

export function ConditionLogicEditor({ field }: { field: FieldData }) {
  const {
    logicEditorPanelRefs,
    handleAddCondition,
  } = useProcedureBuilder();

  return (
    <div
      ref={(el) => (logicEditorPanelRefs.current[field.id] = el)}
      className="mt-6"
      onClick={(e) => e.stopPropagation()}
    >
      {field.conditions?.map((condition) => (
        <ConditionBlock
          key={condition.id}
          condition={condition}
          parentFieldId={field.id}
        />
      ))}
      <button
        onClick={() => handleAddCondition(field.id)}
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
  } = useProcedureBuilder();

  const parentField = findFieldRecursive(fields, parentFieldId);
  if (!parentField) return null; // Safety check

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
      // --- MODIFIED: Added inline style for z-index ---
      style={{
        position: "relative",
        zIndex:
          conditionOperatorDropdownOpen === condition.id ||
          conditionMenuOpen === condition.id
            ? 30
            : 10, // Set z-index higher when dropdowns are open
      }}
      className="pl-10 mb-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute left-3.5 top-2 h-full w-0.5 bg-blue-100 z-0"></div>
      <button
        onClick={() =>
          handleToggleConditionCollapse(parentFieldId, condition.id)
        }
        className="absolute left-0 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 z-20"
      >
        {condition.isCollapsed ? (
          <ChevronRight size={18} />
        ) : (
          <Share2 size={16} />
        )}
      </button>

      {/* --- MODIFIED: This is the parent row --- */}
      <div className="flex items-center justify-between gap-2 mb-4 relative z-20">
        
        {/* --- MODIFIED: This wrapper holds all left-side items --- */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="text-gray-700 font-medium whitespace-nowrap">
            If answer is
          </span>

          <div className="relative">
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
                // --- MODIFIED: Inline CSS for z-index ---
                style={{
                  position: "absolute",
                  left: 0,
                  top: "100%",
                  marginTop: "0.25rem",
                  width: "9rem", // w-36
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.375rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
                  zIndex: 9999, // High z-index
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

        {/* --- MODIFIED: This is the 3-dot menu --- */}
        <div className="relative">
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
              // --- MODIFIED: Inline CSS for z-index and position ---
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                marginTop: "0.25rem",
                width: "7rem", // w-28
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "0.375rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
                zIndex: 9999, // High z-index
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
          <div className="space-y-4 relative z-10">
            {condition.fields.map((subField, index) => (
              <ProcedureBlock
                key={subField.id}
                field={subField}
                index={index}
                isNested={true}
              />
            ))}
          </div>

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