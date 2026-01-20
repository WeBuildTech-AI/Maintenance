import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronDown, Plus, FileText, Type, Layout } from "lucide-react";
import { useProcedureBuilder } from "../ProcedureBuilderContext";
import { logicConditionTypes, type FieldData } from "../types";

interface AddConditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  fieldId: number | null;
}

export function AddConditionModal({
  isOpen,
  onClose,
  fieldId,
}: AddConditionModalProps) {
  const { 
    findFieldRecursive, 
    fields, 
    handleAddConditionWithData,
    fieldTypes // [NEW] Get field types
  } = useProcedureBuilder();

  const [operator, setOperator] = useState<string>("");
  const [value, setValue] = useState<any>("");
  const [value2, setValue2] = useState<any>(""); // For 'between'
  
  // --- [NEW] Local state for items to be added inside the condition ---
  const [addedItems, setAddedItems] = useState<FieldData[]>([]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setOperator("");
      setValue("");
      setValue2("");
      setAddedItems([]); // Clear added items
    }
  }, [isOpen, fieldId]);

  if (!isOpen || fieldId === null) return null;

  const field = findFieldRecursive(fields, fieldId);
  if (!field) return null;

  // Get operators based on field type
  const operators = logicConditionTypes[field.selectedType] || [];

  const handleSave = () => {
    if (!operator) {
      alert("Please select a condition.");
      return;
    }
    // Basic validation
    if (
      operator !== "is_checked" &&
      operator !== "is_not_checked" &&
      operator !== "is checked" &&
      operator !== "is not checked" &&
      (value === "" || value === null)
    ) {
        alert("Please enter a value.");
        return;
    }

    // Pass addedItems as initialFields
    handleAddConditionWithData(fieldId, { operator, value, value2, initialFields: addedItems });
    onClose();
  };

  // --- Local Handlers for adding items ---
  const handleAddLocalField = () => {
      const newItem: FieldData = {
          id: Date.now() + addedItems.length,
          selectedType: "Text Field",
          blockType: "field",
          label: "New Field",
          isRequired: false,
          hasDescription: false,
      };
      setAddedItems([...addedItems, newItem]);
  };

  const handleAddLocalHeading = () => {
      const newItem: FieldData = {
          id: Date.now() + addedItems.length,
          selectedType: "Heading",
          blockType: "heading",
          label: "New Heading",
      };
      setAddedItems([...addedItems, newItem]);
  };

  const handleAddLocalSection = () => {
      const newItem: FieldData = {
          id: Date.now() + addedItems.length,
          blockType: "section",
          label: `Section #${addedItems.filter(i => i.blockType === 'section').length + 1}`,
          description: "",
          fields: [], // Empty section initially
      };
      setAddedItems([...addedItems, newItem]);
  };

  const handleRemoveLocalItem = (index: number) => {
      const newItems = [...addedItems];
      newItems.splice(index, 1);
      setAddedItems(newItems);
  };
  
  // [NEW] Handle editing item properties
  const handleLocalItemChange = (index: number, key: keyof FieldData, val: any) => {
      const newItems = [...addedItems];
      newItems[index] = { ...newItems[index], [key]: val };
      setAddedItems(newItems);
  };

  const commonInputStyle = {
    width: "100%",
    borderBottom: "2px solid #e5e7eb", // gray-200
    background: "transparent",
    padding: "8px",
    fontSize: "0.875rem", // text-sm
    outline: "none",
    transition: "border-color 0.2s",
  };

  const renderValueInput = () => {
    if (!operator) return null;
    
    // No value needed for boolean checks
    if (
        operator === "is_checked" || 
        operator === "is_not_checked" ||
        operator === "is checked" || 
        operator === "is not checked"
    ) {
        return null;
    }

    switch (field.selectedType) {
      case "Yes, No, N/A":
        return (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={commonInputStyle}
          >
            <option value="">Select Option...</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="N/A">N/A</option>
          </select>
        );
      case "Multiple Choice":
      case "Checklist":
        return (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={commonInputStyle}
          >
            <option value="">Select Option...</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      case "Inspection Check":
        return (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={commonInputStyle}
          >
            <option value="">Select Status...</option>
            <option value="Pass">Pass</option>
            <option value="Flag">Flag</option>
            <option value="Fail">Fail</option>
          </select>
        );
      case "Number Field":
      case "Amount ($)":
      case "Meter Reading":
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input
                    type="number"
                    value={value}
                    placeholder="Enter value"
                    onChange={(e) => setValue(e.target.value)}
                    style={commonInputStyle}
                />
                {operator === 'between' && (
                    <input
                        type="number"
                        value={value2}
                        placeholder="Enter second value"
                        onChange={(e) => setValue2(e.target.value)}
                        style={commonInputStyle}
                    />
                )}
            </div>
        );
      default:
        return (
          <input
            type="text"
            value={value}
            placeholder="Enter value"
            onChange={(e) => setValue(e.target.value)}
            style={commonInputStyle}
          />
        );
    }
  };

  return createPortal(
    <div 
        style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            padding: "16px"
        }}
    >
      <div 
        style={{
            backgroundColor: "white",
            borderRadius: "0.5rem", // rounded-lg
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", // shadow-xl
            width: "100%",
            maxWidth: "42rem", // max-w-2xl
            animation: "fadeIn 0.2s ease-out",
            display: "flex",
            flexDirection: "column",
            maxHeight: "90vh" // Prevent modal from being too tall
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid #f3f4f6", // border-gray-100
            flexShrink: 0
        }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827" }}>Add Logic</h3>
          <button
            onClick={onClose}
            style={{ color: "#9ca3af", transition: "color 0.2s", cursor: "pointer", background: "none", border: "none" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: "32px", overflowY: "auto", flex: 1 }}>
            
            {/* Condition Logic Row */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
                <span style={{ color: "#374151", fontWeight: 500, whiteSpace: "nowrap", fontSize: "1rem" }}>
                    If answer is
                </span>

                {/* Operator Select */}
                <div style={{ position: "relative" }}>
                    <select
                        value={operator}
                        onChange={(e) => setOperator(e.target.value)}
                        style={{
                            appearance: "none",
                            backgroundColor: "white",
                            border: "1px solid #d1d5db", // gray-300
                            borderRadius: "0.375rem", // rounded-md
                            paddingTop: "8px",
                            paddingBottom: "8px",
                            paddingLeft: "12px",
                            paddingRight: "32px",
                            fontSize: "0.875rem", // text-sm
                            minWidth: "140px",
                            outline: "none"
                        }}
                    >
                        <option value="">Select Condition...</option>
                        {operators.map((op) => (
                            <option key={op} value={op}>
                                {op}
                            </option>
                        ))}
                    </select>
                    <div style={{
                        pointerEvents: "none",
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        right: 0,
                        display: "flex",
                        alignItems: "center",
                        paddingRight: "8px",
                        color: "#6b7280" // gray-500
                    }}>
                        <ChevronDown size={14} />
                    </div>
                </div>

                {/* Value Input */}
                {operator && (
                     <div style={{ flex: 1, minWidth: "150px" }}>
                        {renderValueInput()}
                     </div>
                )}
            </div>

            {/* --- Builder Section (Only show if operator is selected) --- */}
            {operator && (
                <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                        <h4 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>Then show:</h4>
                        
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={handleAddLocalField} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", fontSize: "0.75rem", fontWeight: 500, color: "#4b5563", backgroundColor: "#f3f4f6", borderRadius: "9999px", border: "none", cursor: "pointer", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor='#e5e7eb'} onMouseOut={(e) => e.currentTarget.style.backgroundColor='#f3f4f6'}>
                                <FileText size={14} /> Field
                            </button>
                            <button onClick={handleAddLocalSection} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", fontSize: "0.75rem", fontWeight: 500, color: "#4b5563", backgroundColor: "#f3f4f6", borderRadius: "9999px", border: "none", cursor: "pointer", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor='#e5e7eb'} onMouseOut={(e) => e.currentTarget.style.backgroundColor='#f3f4f6'}>
                                <Layout size={14} /> Section
                            </button>
                            <button onClick={handleAddLocalHeading} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", fontSize: "0.75rem", fontWeight: 500, color: "#4b5563", backgroundColor: "#f3f4f6", borderRadius: "9999px", border: "none", cursor: "pointer", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor='#e5e7eb'} onMouseOut={(e) => e.currentTarget.style.backgroundColor='#f3f4f6'}>
                                <Type size={14} /> Heading
                            </button>
                        </div>
                    </div>

                    {/* Added Items List (Editable) */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {addedItems.length === 0 ? (
                             <div style={{ padding: "16px", border: "1px dashed #d1d5db", borderRadius: "0.375rem", textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>
                                No fields added yet. Default field will be added if empty.
                             </div>
                        ) : (
                            addedItems.map((item, index) => (
                                <div key={index} style={{ 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: "12px",
                                    padding: "10px 14px", 
                                    backgroundColor: "white", 
                                    border: "1px solid #e5e7eb", 
                                    borderRadius: "0.375rem",
                                    boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)"
                                }}>
                                    {/* Icon */}
                                    <div style={{ flexShrink: 0, color: "#6b7280" }}>
                                      {item.blockType === 'field' && <FileText size={16} />}
                                      {item.blockType === 'heading' && <Type size={16} />}
                                      {item.blockType === 'section' && <Layout size={16} />}
                                    </div>

                                    {/* Editable Label */}
                                    <input 
                                        type="text"
                                        value={item.label}
                                        onChange={(e) => handleLocalItemChange(index, 'label', e.target.value)}
                                        placeholder="Enter label..."
                                        style={{
                                            border: "1px solid transparent",
                                            borderRadius: "0.25rem",
                                            padding: "4px 8px",
                                            fontSize: "0.875rem",
                                            fontWeight: 500,
                                            color: "#374151",
                                            width: "100%",
                                            flex: 1,
                                            backgroundColor: "transparent",
                                            transition: "all 0.2s"
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = "#93c5fd"} // blue-300
                                        onBlur={(e) => e.target.style.borderColor = "transparent"}
                                    />

                                    {/* Type Dropdown (Only for Fields) */}
                                    {item.blockType === 'field' && (
                                        <select
                                            value={item.selectedType}
                                            onChange={(e) => handleLocalItemChange(index, 'selectedType', e.target.value)}
                                            style={{
                                                fontSize: "0.75rem",
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                                border: "1px solid #e5e7eb",
                                                color: "#4b5563",
                                                backgroundColor: "#f9fafb",
                                                cursor: "pointer",
                                                outline: "none",
                                                flexShrink: 0,
                                                maxWidth: "120px"
                                            }}
                                        >
                                            {fieldTypes.map(ft => (
                                                <option key={ft.label} value={ft.label}>
                                                    {ft.label}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {/* Remove Button */}
                                    <button 
                                        onClick={() => handleRemoveLocalItem(index)}
                                        style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: "4px", flexShrink: 0 }}
                                        title="Remove"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>

         {/* Footer */}
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "12px",
            padding: "16px 24px",
            backgroundColor: "#f9fafb", // gray-50
            borderBottomLeftRadius: "0.5rem",
            borderBottomRightRadius: "0.5rem",
            borderTop: "1px solid #f3f4f6", // border-gray-100
             flexShrink: 0
        }}>
          <button
            onClick={onClose}
            style={{
                padding: "8px 16px",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#374151",
                backgroundColor: "transparent",
                borderRadius: "0.375rem",
                cursor: "pointer",
                border: "none"
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
                padding: "8px 16px",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "white",
                backgroundColor: "#2563eb", // blue-600
                borderRadius: "0.375rem",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                cursor: "pointer",
                border: "none",
                transition: "background-color 0.2s"
            }}
          >
            Add Condition
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
