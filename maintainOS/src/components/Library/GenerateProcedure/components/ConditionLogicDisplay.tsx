import { Share2, ChevronRight, MoreVertical } from "lucide-react";
import { useProcedureBuilder } from "../ProcedureBuilderContext";
import { ConditionData } from "../types";
import { ProcedureBlock } from "./ProcedureBlock";
import { useState } from "react"; // <-- ADDED

interface ConditionLogicDisplayProps {
  condition: ConditionData;
  parentFieldId: number;
}

export function ConditionLogicDisplay({
  condition,
  parentFieldId,
}: ConditionLogicDisplayProps) {
  const {
    handleToggleConditionCollapse,
    handleDeleteCondition, // <-- ADDED
    conditionMenuOpen, // <-- ADDED
    setConditionMenuOpen, // <-- ADDED
    conditionMenuButtonRefs, // <-- ADDED
    conditionMenuPanelRefs, // <-- ADDED
  } = useProcedureBuilder();

  // Helper text for display
  const getConditionText = () => {
    if (condition.isCollapsed) {
      return <span className="font-medium text-gray-700">...</span>;
    }
    const op = condition.conditionOperator || "...";
    let val = condition.conditionValue || "...";
    if (condition.conditionOperator === "between") {
      val = `${condition.conditionValue || "..."} and ${
        condition.conditionValue2 || "..."
      }`;
    }
    // For "is checked", no value is needed
    if (["is checked", "is not checked"].includes(op)) {
      return <strong className="text-gray-900">{op}</strong>;
    }
    return (
      <>
        <strong className="text-gray-900">{op}</strong>
        <span className="font-medium text-gray-900 bg-gray-100 rounded-md px-2 py-1 text-sm">
          {val}
        </span>
      </>
    );
  };

  return (
    <div key={condition.id} className="relative pl-10 mb-6">
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

      {/* --- MODIFIED: Added justify-between and the 3-dot icon --- */}
      <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="text-gray-700 font-medium">If answer is</span>
          {getConditionText()}
        </div>

        {/* --- ADDED: 3-dot menu for display mode --- */}
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
              className="absolute right-0 top-full mt-1 w-28 bg-white border border-gray-200 rounded-md shadow-lg z-40"
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
        <div className="space-y-4 z-10 relative">
          {condition.fields.map((subField, index) => (
            <ProcedureBlock
              key={subField.id}
              field={subField}
              index={index}
              isNested={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}