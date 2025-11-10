import React, { useState, useCallback, memo, useEffect } from "react";
import { Camera, Check, Trash2 } from "lucide-react";
import { ChevronDown } from "lucide-react";
import type { ConditionData } from "../types"; // Make sure this path is correct

// --- Helper: checkCondition (Full logic) ---
function checkCondition(
  condition: ConditionData,
  parentAnswer: any
): boolean {
  // --- 💡 1. NORMALIZE operator for easier checks ---
  const op = condition.conditionOperator || condition.type;

  if (
    parentAnswer === undefined ||
    parentAnswer === null ||
    parentAnswer === ""
  ) {
    // --- 💡 2. FIX: Handle "is not checked" for both UI and API formats ---
    if (op === "is not checked" || op === "is_not_checked") {
      return true;
    }
    return false;
  }

  // --- 💡 3. Operator is already defined, proceed with original logic ---
  const val = condition.conditionValue || condition.value;
  const val2 = condition.conditionValue2;
  const values = condition.values; // API format for 'one_of'

  if (op === "is") return parentAnswer === val;
  if (op === "one_of") return values?.includes(parentAnswer); // API

  if (op === "is not") return parentAnswer !== val;
  if (op === "not_one_of") return !values?.includes(parentAnswer); // API

  if (op === "is checked" || op === "is_checked") return parentAnswer === true;
  if (op === "is not checked" || op === "is_not_checked")
    return parentAnswer === false;

  if (op === "contains") {
    return Array.isArray(parentAnswer) && parentAnswer.includes(val);
  }
  if (op === "does not contain") {
    return !Array.isArray(parentAnswer) || !parentAnswer.includes(val);
  }

  const numAnswer = parseFloat(parentAnswer);
  const numVal = parseFloat(val || "");
  const numVal2 = parseFloat(val2 || "");
  if (isNaN(numAnswer)) return false;

  if (op === "higher than" || op === "higher_than") return numAnswer > numVal;
  if (op === "lower than" || op === "lower_than") return numAnswer < numVal;
  if (op === "equal to" || op === "equal_to") return numAnswer === numVal;
  if (op === "not equal to" || op === "not_equal_to") return numAnswer !== numVal;

  if (op === "between") {
    if (isNaN(numVal) || isNaN(numVal2)) return false;
    const min = Math.min(numVal, numVal2);
    const max = Math.max(numVal, numVal2);
    return numAnswer >= min && numAnswer <= max;
  }
  return false;
}

// --- Helper Components (Internal to this file) ---
interface RenderItemProps {
  item: any; // Use 'any' to accept both Builder and API types
  answers: Record<string, any>;
  updateAnswer: (fieldId: string, value: any) => void;
  renderAllItems: (
    items: any[],
    allFieldsInScope: any[]
  ) => React.ReactNode[];
  allFieldsInScope: any[]; // For checking children
}

// Renders a single interactive Field
const PreviewField = memo(function PreviewField({
  item: field,
  answers,
  updateAnswer,
}: Omit<RenderItemProps, "renderAllItems" | "allFieldsInScope">) {
  // --- Normalize Builder vs API props ---
  const fieldId = field.id.toString(); // Use string ID for answers map
  const currentValue = answers[fieldId];
  const fieldLabel = field.fieldName || field.label;
  const fieldType = field.fieldType || field.selectedType;
  const fieldDesc = field.fieldDescription || field.description;
  const fieldOptions = field.config?.options || field.options;
  const fieldUnit = field.config?.meterUnit || field.meterUnit;
  const isRequired = field.required || field.isRequired;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        updateAnswer(fieldId, loadEvent.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderFieldInput = () => {
    // --- 💡 FIX: This switch now handles BOTH UI names and API names ---
    switch (fieldType) {
      case "number_field":
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
              background: "#fff",
            }}
            value={currentValue || ""}
            onChange={(e) => updateAnswer(fieldId, e.target.value)}
          />
        );
      case "text_field":
      case "Text Field":
        return (
          <input
            type="text"
            placeholder="Enter Text"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "0.9rem",
              background: "#fff",
            }}
            value={currentValue || ""}
            onChange={(e) => updateAnswer(fieldId, e.target.value)}
          />
        );

      case "amount": // <-- API name
      case "Amount ($)": // <-- UI name
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
              placeholder="Enter Amount"
              style={{
                width: "100%",
                padding: "10px 12px 10px 28px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.9rem",
                background: "#fff",
              }}
              value={currentValue || ""}
              onChange={(e) => updateAnswer(fieldId, e.target.value)}
            />
          </div>
        );

      case "Date": // <-- API name AND UI name
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
                color: currentValue ? "#111827" : "#6b7280",
                background: "#fff",
              }}
              value={currentValue || ""}
              onChange={(e) => updateAnswer(fieldId, e.target.value)}
            />
          </div>
        );

      case "meter_reading":
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
                background: "#fff",
              }}
              value={currentValue || ""}
              onChange={(e) => updateAnswer(fieldId, e.target.value)}
            />
            {fieldUnit && (
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
                {fieldUnit}
              </span>
            )}
          </div>
        );

      case "signature_block":
      case "Signature Block":
        return (
          <div
            style={{
              width: "100%",
              padding: "40px 12px",
              border: "1px dashed #d1d5db",
              borderRadius: "6px",
              background: "#fff",
              textAlign: "center",
              color: "#6b7280",
              fontStyle: "italic",
              cursor: "pointer",
            }}
          >
            Tap to sign
          </div>
        );

      case "checkbox": // <-- API name
      case "Checkbox": // <-- UI name
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
              onChange={(e) => updateAnswer(fieldId, e.target.checked)}
            />
            <span style={{ fontSize: "0.9rem" }}>{fieldLabel}</span>
          </label>
        );

      case "picture_file":
      case "Picture/File Field":
        if (currentValue) {
          return (
            <div style={{ position: "relative" }}>
              <img
                src={currentValue}
                alt="Upload Preview"
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                }}
              />
              <button
                onClick={() => updateAnswer(fieldId, null)}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  background: "rgba(0,0,0,0.5)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        }
        return (
          <label
            style={{
              width: "100%",
              padding: "24px",
              border: "2px dashed #007AFF", // Blue theme
              background: "#f0f7ff", // Light blue
              borderRadius: "6px",
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
                color: "#007AFF", // Blue theme
                fontWeight: 500,
                fontSize: "0.9rem",
              }}
            >
              Add Pictures/Files
            </span>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
          </label>
        );

      case "inspection_check":
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
              const isSelected = currentValue === opt.toLowerCase(); // API uses 'fail'
              const style = colors[opt as keyof typeof colors];
              return (
                <button
                  key={opt}
                  onClick={() => updateAnswer(fieldId, opt.toLowerCase())}
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

      case "yes_no_NA":
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
              const isSelected = currentValue === opt.toLowerCase(); // API uses 'no'
              return (
                <button
                  key={opt}
                  onClick={() => updateAnswer(fieldId, opt.toLowerCase())}
                  style={{
                    padding: "10px",
                    border: `1px solid ${
                      isSelected ? "#007AFF" : "#d1d5db" // Blue theme
                    }`,
                    borderRadius: "6px",
                    background: isSelected ? "#f0f7ff" : "white", // Blue theme
                    color: isSelected ? "#007AFF" : "#374151", // Blue theme
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

      case "mulitple_choice": // <-- API name (with typo)
      case "Multiple Choice": // <-- UI name
        return (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            {fieldOptions?.map((opt: string, index: number) => (
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
                  name={`field-${fieldId}`}
                  checked={currentValue === opt}
                  onChange={() => updateAnswer(fieldId, opt)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );

      case "checklist":
      case "Checklist":
        const currentList: string[] = currentValue || [];
        const handleChecklistChange = (opt: string, isChecked: boolean) => {
          const newList = isChecked
            ? [...currentList, opt]
            : currentList.filter((item) => item !== opt);
          updateAnswer(fieldId, newList);
        };
        return (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            {fieldOptions?.map((opt: string, index: number) => (
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
                  onChange={(e) =>
                    handleChecklistChange(opt, e.target.checked)
                  }
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <p style={{ fontStyle: "italic", color: "#6b7280" }}>
            Preview not available for '{fieldType}'
          </p>
        );
    }
  };

  return (
    <div
      style={{
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "16px",
      }}
    >
      {fieldType === "Checkbox" || fieldType === "checkbox" ? (
        <div style={{ padding: "0px" }}>{renderFieldInput()}</div>
      ) : (
        <>
          <label
            style={{
              display: "block",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            {fieldLabel}
            {isRequired && (
              <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
            )}
          </label>
          {fieldDesc && (
            <p
              style={{
                fontSize: "0.8rem",
                color: "#6b7280",
                marginTop: "-4px",
                marginBottom: "8px",
              }}
            >
              {fieldDesc}
            </p>
          )}
          <div>{renderFieldInput()}</div>
        </>
      )}
    </div>
  );
});

// Renders a Section (with collapse)
const PreviewSection = memo(function PreviewSection({
  item: section,
  ...props
}: RenderItemProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const fieldCount = section.fields?.length || 0;
  const sectionLabel = section.sectionName || section.label;

  return (
    <div
      style={{
        paddingBottom: "16px",
      }}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          width: "100%",
          background: "none",
          cursor: "pointer",
          textAlign: "left",
          border: "none",
          padding: "0",
          marginBottom: "16px",
        }}
      >
        <ChevronDown
          size={20}
          style={{
            transition: "transform 0.2s",
            transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
          }}
        />
        <span
          style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111827" }}
        >
          {sectionLabel}
        </span>
      </button>

      {isCollapsed ? (
        <div
          style={{
            paddingLeft: "28px",
            color: "#6b7280",
            fontSize: "0.9rem",
          }}
        >
          {fieldCount} field{fieldCount !== 1 ? "s" : ""} collapsed
        </div>
      ) : (
        <div
          style={{
            paddingLeft: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {props.renderAllItems(
            section.fields || [],
            props.allFieldsInScope
          )}
        </div>
      )}
    </div>
  );
});

// Component to decide what to render
const RenderPreviewItem = memo(function RenderPreviewItem(
  props: RenderItemProps
) {
  const { item } = props;

  // Normalize blockType
  let blockType = item.blockType;
  if (!blockType) {
    if (item.sectionName) blockType = "section";
    else if (item.fieldType === "heading") blockType = "heading";
    else blockType = "field";
  }

  switch (blockType) {
    case "field":
      return <PreviewField {...props} />;
    case "section":
      return <PreviewSection {...props} />;
    case "heading":
      return (
        <h3
          style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "#111827",
            marginTop: "16px",
            paddingBottom: "8px",
          }}
        >
          {item.label || item.fieldName}
        </h3>
      );
    default:
      return null;
  }
});

// --- Main Reusable Component ---
interface ProcedureFormProps {
  rootFields: any[];
  sections: any[];
  // A unique key (like procedure.id) to reset state when the procedure changes
  resetKey: string;
}

export function ProcedureForm({
  rootFields,
  sections,
  resetKey,
}: ProcedureFormProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // --- Reset answers when procedure changes ---
  useEffect(() => {
    setAnswers({});
  }, [resetKey]);

  const updateAnswer = useCallback((fieldId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  // --- This function renders a list of fields (from root or section) ---
  const renderAllItems = useCallback(
    (
      items: any[], // The list of fields to render (e.g., section.fields)
      allFieldsInScope: any[] // All fields in this scope (e.g., section.fields)
    ): React.ReactNode[] => {
      const visibleItems: React.ReactNode[] = [];
      const parentFields = items.filter((f) => !f.parentId); // Top-level fields
      const childFields = items.filter((f) => f.parentId); // Conditional fields

      parentFields.forEach((item) => {
        // Render the parent field
        visibleItems.push(
          <RenderPreviewItem
            key={item.id}
            item={item}
            answers={answers}
            updateAnswer={updateAnswer}
            renderAllItems={renderAllItems}
            allFieldsInScope={allFieldsInScope}
          />
        );

        // Check for children and if their conditions are met
        const children = childFields.filter((c) => c.parentId === item.id);
        children.forEach((child) => {
          // --- Use API condition format ---
          const isMet = checkCondition(
            child.condition,
            answers[item.id.toString()]
          );
          if (isMet) {
            visibleItems.push(
              <RenderPreviewItem
                key={child.id}
                item={child}
                answers={answers}
                updateAnswer={updateAnswer}
                renderAllItems={renderAllItems}
                allFieldsInScope={allFieldsInScope}
              />
            );
          }
        });
      });

      return visibleItems;
    },
    [answers, updateAnswer]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Render Root Fields */}
      {renderAllItems(rootFields, rootFields)}

      {/* Render Sections */}
      {sections.map((section: any) => (
        <RenderPreviewItem
          key={section.id}
          item={{ ...section, blockType: "section" }} // Pass section as an item
          answers={answers}
          updateAnswer={updateAnswer}
          renderAllItems={renderAllItems}
          allFieldsInScope={section.fields || []} // Pass section's fields
        />
      ))}
    </div>
  );
}