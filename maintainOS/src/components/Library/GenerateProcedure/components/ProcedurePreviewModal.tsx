import React, { useState } from "react";
import {
  ChevronDown,
  X,
  Camera,
  Check,
  // Note: Share2 icon remove kar diya hai
} from "lucide-react";
import { useProcedureBuilder } from "../ProcedureBuilderContext";
import type { FieldData, ConditionData } from "../types";

// --- 1. Helper: checkCondition (Full logic) ---
// Yeh check karega ki logic match hua ya nahi
function checkCondition(
  condition: ConditionData,
  parentAnswer: any
): boolean {
  if (parentAnswer === undefined || parentAnswer === null || parentAnswer === "" || !condition.conditionOperator) {
    // Special case: "is not checked" is TRUE if answer is undefined/false
    if (condition.conditionOperator === "is not checked") return true;
    return false;
  }

  const op = condition.conditionOperator;
  const val = condition.conditionValue;
  const val2 = condition.conditionValue2;

  // Type-agnostic checks
  if (op === "is") return parentAnswer === val;
  if (op === "is not") return parentAnswer !== val;

  // Checkbox checks
  if (op === "is checked") return parentAnswer === true;
  if (op === "is not checked") return parentAnswer === false;

  // Array checks (Checklist)
  if (op === "contains") {
    return Array.isArray(parentAnswer) && parentAnswer.includes(val);
  }
  if (op === "does not contain") {
    return !Array.isArray(parentAnswer) || !parentAnswer.includes(val);
  }

  // Numeric checks (Number, Amount, Meter)
  const numAnswer = parseFloat(parentAnswer);
  const numVal = parseFloat(val || "");
  const numVal2 = parseFloat(val2 || "");

  if (isNaN(numAnswer)) return false; // Can't do numeric checks on non-numeric answer

  if (op === "higher than") return numAnswer > numVal;
  if (op === "lower than") return numAnswer < numVal;
  if (op === "equal to") return numAnswer === numVal;
  if (op === "not equal to") return numAnswer !== numVal;
  if (op === "between") {
    if (isNaN(numVal) || isNaN(numVal2)) return false;
    const min = Math.min(numVal, numVal2);
    const max = Math.max(numVal, numVal2);
    return numAnswer >= min && numAnswer <= max;
  }

  return false;
}

// --- Main Modal Component ---
interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProcedurePreviewModal({ isOpen, onClose }: PreviewModalProps) {
  const { fields, name } = useProcedureBuilder();
  const [answers, setAnswers] = useState<Record<number, any>>({});

  const updateAnswer = (fieldId: number, value: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  if (!isOpen) return null;

  // --- 💡 CORE FIX: Yeh function ab logic ko "FLATTEN" karega ---
  // Yeh root fields aur visible child fields ki ek single list banayega
  const renderAllItems = (items: FieldData[]): React.ReactNode[] => {
    const visibleItems: React.ReactNode[] = [];

    items.forEach(item => {
      // 1. Pehle item ko render karo (chahe woh field, section, ya heading ho)
      visibleItems.push(
        <RenderPreviewItem
          key={item.id}
          item={item}
          answers={answers}
          updateAnswer={updateAnswer}
        />
      );

      // 2. Agar woh field hai aur usme conditions hain, toh check karo
      if (item.blockType === "field" && item.conditions) {
        item.conditions.forEach(condition => {
          const isMet = checkCondition(condition, answers[item.id]);
          if (isMet) {
            // 3. Agar logic match ho gaya, toh uske child fields ko bhi render karo
            // Yeh recursion ka use karega taaki nested logic bhi chale
            visibleItems.push(...renderAllItems(condition.fields));
          }
        });
      }
    });

    return visibleItems;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header
          style={{
            backgroundColor: "#007AFF",
            color: "white",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            maintainOS
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
            }}
          >
            <X size={24} />
          </button>
        </header>

        {/* Scrollable Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            background: "#f9fafb", // Light gray background
          }}
        >
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: "20px",
            }}
          >
            {name}
          </h1>

          {/* Ab yeh "flattened" list ko render karega */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {renderAllItems(fields)}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components (Internal to this file) ---

interface RenderItemProps {
  item: FieldData;
  answers: Record<number, any>;
  updateAnswer: (fieldId: number, value: any) => void;
}

// Component to decide what to render
function RenderPreviewItem({ item, answers, updateAnswer }: RenderItemProps) {
  switch (item.blockType) {
    case "field":
      return (
        <PreviewField
          field={item}
          answers={answers}
          updateAnswer={updateAnswer}
        />
      );
    case "section":
      return (
        <PreviewSection
          section={item}
          answers={answers}
          updateAnswer={updateAnswer}
        />
      );
    case "heading":
      return (
        <h3
          style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "#111827",
            marginTop: "16px",
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "8px",
          }}
        >
          {item.label}
        </h3>
      );
    default:
      return null;
  }
}

// Renders a Section (with collapse)
function PreviewSection({ section, answers, updateAnswer }: RenderItemProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Section ke andar ke fields bhi "flatten" logic use karenge
  const renderSectionItems = (items: FieldData[]): React.ReactNode[] => {
    const visibleItems: React.ReactNode[] = [];
    items.forEach(item => {
      visibleItems.push(
        <RenderPreviewItem
          key={item.id}
          item={item}
          answers={answers}
          updateAnswer={updateAnswer}
        />
      );
      if (item.blockType === "field" && item.conditions) {
        item.conditions.forEach(condition => {
          const isMet = checkCondition(condition, answers[item.id]);
          if (isMet) {
            visibleItems.push(...renderSectionItems(condition.fields));
          }
        });
      }
    });
    return visibleItems;
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
      }}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "16px",
          borderBottom: isCollapsed ? "none" : "1px solid #e5e7eb",
          width: "100%",
          background: "none",
          cursor: "pointer",
          textAlign: "left",
          borderTop: "none",
          borderLeft: "none",
          borderRight: "none",
        }}
      >
        <ChevronDown
          size={20}
          style={{
            transition: "transform 0.2s",
            transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
          }}
        />
        <span style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111827" }}>
          {section.label}
        </span>
      </button>

      {!isCollapsed && (
        <div
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {renderSectionItems(section.fields || [])}
        </div>
      )}
    </div>
  );
}


// Renders a single interactive Field
function PreviewField({ field, answers, updateAnswer }: RenderItemProps) {
  const currentValue = answers[field.id];

  const renderFieldInput = () => {
    switch (field.selectedType) {
      case "Number Field":
        return (
          <input
            type="number"
            placeholder="Enter Number"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "0.9rem",
            }}
            value={currentValue || ""}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
          />
        );
      case "Text Field":
        return (
          <input
            type="text"
            placeholder="Enter Text" // <-- Real screenshot se match kiya
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "0.9rem",
            }}
            value={currentValue || ""}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
          />
        );

      case "Amount ($)":
        return (
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6b7280",
                fontSize: "0.9rem",
              }}
            >
              $
            </span>
            <input
              type="number"
              placeholder="Enter Amount" // <-- Real screenshot se match kiya
              style={{
                width: "100%",
                padding: "10px 12px 10px 28px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.9rem",
              }}
              value={currentValue || ""}
              onChange={(e) => updateAnswer(field.id, e.target.value)}
            />
          </div>
        );
      
      case "Date":
        return (
          <div style={{ position: "relative" }}>
            <input
              type="date"
              placeholder="mm/dd/yyyy"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.9rem",
                color: currentValue ? "#111827" : "#6b7280"
              }}
              value={currentValue || ""}
              onChange={(e) => updateAnswer(field.id, e.target.value)}
            />
          </div>
        );

      case "Meter Reading":
        return (
          <div style={{ position: "relative" }}>
            <input
              type="number"
              placeholder="Enter Reading"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.9rem",
              }}
              value={currentValue || ""}
              onChange={(e) => updateAnswer(field.id, e.target.value)}
            />
            {field.meterUnit && (
              <span
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6b7280",
                  pointerEvents: "none",
                  fontSize: "0.9rem",
                }}
              >
                {field.meterUnit}
              </span>
            )}
          </div>
        );

      case "Signature Block":
        return (
          <div
            style={{
              width: "100%",
              padding: "40px 12px",
              border: "1px dashed #d1d5db",
              borderRadius: "6px",
              background: "#f9fafb",
              textAlign: "center",
              color: "#6b7280",
              fontStyle: "italic",
              cursor: "pointer",
            }}
          >
            Tap to sign
          </div>
        );

      case "Checkbox":
        return (
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              background: "white",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={currentValue === true}
              onChange={(e) => updateAnswer(field.id, e.target.checked)}
            />
            {/* 💡 Checkbox ka label input ke andar hi rakha hai */}
            <span style={{ fontSize: "0.9rem" }}>{field.label}</span>
          </label>
        );
      case "Picture/File Field":
        return (
          <div
            style={{
              width: "100%",
              padding: "24px",
              border: "2px dashed #007AFF", // <-- Real screenshot se match kiya
              borderRadius: "6px",
              background: "#f0f7ff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              cursor: "pointer",
            }}
          >
            <Camera size={24} color="#007AFF" />
            <span
              style={{
                color: "#007AFF",
                fontWeight: 500,
                fontSize: "0.9rem",
              }}
            >
              Add Pictures/Files
            </span>
          </div>
        );
      case "Inspection Check":
        const options = ["Pass", "Flag", "Fail"];
        const colors = {
          Pass: { border: "#10b981", text: "#10b981", bg: "#f0fdf4" },
          Flag: { border: "#f59e0b", text: "#f59e0b", bg: "#fffbeb" },
          Fail: { border: "#ef4444", text: "#ef4444", bg: "#fef2f2" },
        };

        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "10px",
            }}
          >
            {options.map((opt) => {
              const isSelected = currentValue === opt;
              const style = colors[opt as keyof typeof colors];
              return (
                <button
                  key={opt}
                  onClick={() => updateAnswer(field.id, opt)}
                  style={{
                    padding: "10px",
                    border: `1px solid ${
                      isSelected ? style.border : "#d1d5db"
                    }`,
                    borderRadius: "6px",
                    background: isSelected ? style.bg : "white",
                    color: isSelected ? style.text : "#374151",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  {isSelected && <Check size={16} />}
                  {opt}
                </button>
              );
            })}
          </div>
        );

      case "Yes, No, N/A":
        const ynnOptions = ["Yes", "No", "N/A"];
        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "10px",
            }}
          >
            {ynnOptions.map((opt) => {
              const isSelected = currentValue === opt;
              return (
                <button
                  key={opt}
                  onClick={() => updateAnswer(field.id, opt)}
                  style={{
                    padding: "10px",
                    border: `1px solid ${
                      isSelected ? "#007AFF" : "#d1d5db"
                    }`,
                    borderRadius: "6px",
                    background: isSelected ? "#f0f7ff" : "white",
    
                    color: isSelected ? "#007AFF" : "#374151",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        );

      case "Multiple Choice":
        return (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            {field.options?.map((opt, index) => (
              <label
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.9rem",
                }}
              >
                <input
                  type="radio"
                  name={`field-${field.id}`}
                  checked={currentValue === opt}
                  onChange={() => updateAnswer(field.id, opt)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );

      case "Checklist":
        const currentList: string[] = currentValue || [];
        const handleChecklistChange = (opt: string, isChecked: boolean) => {
          const newList = isChecked
            ? [...currentList, opt]
            : currentList.filter((item) => item !== opt);
          updateAnswer(field.id, newList);
        };
        return (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            {field.options?.map((opt, index) => (
              <label
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.9rem",
                }}
              >
                <input
                  type="checkbox"
                  checked={currentList.includes(opt)}
                  onChange={(e) => handleChecklistChange(opt, e.target.checked)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <p style={{ fontStyle: "italic", color: "#6b7280" }}>
            Preview not available for '{field.selectedType}'
          </p>
        );
    }
  };

  return (
    <div
      style={{
        background: "#fff", // Sab fields ka white background hoga
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
      }}
    >
      {/* 💡 Checkbox ko chhodkar baaki sab fields ka header dikhega */}
      {field.selectedType !== "Checkbox" && (
        <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#111827",
            }}
          >
            {field.label}
            {field.isRequired && (
              <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
            )}
          </label>
          {field.description && (
            <p
              style={{
                fontSize: "0.8rem",
                color: "#6b7280",
                marginTop: "4px",
              }}
            >
              {field.description}
            </p>
          )}
        </div>
      )}

      {/* Input area */}
      <div
        style={{ padding: field.selectedType === "Checkbox" ? "0px" : "16px" }}
      >
        {renderFieldInput()}
      </div>

      {/* --- 💡 FIX: YEH BLOCK AB KHUD KUCH RENDER NAHI KARTA ---
        Logic ab 'renderAllItems' function mein handle ho raha hai.
        Isse conditional fields alag cards mein render honge.
      */}
    </div>
  );
}