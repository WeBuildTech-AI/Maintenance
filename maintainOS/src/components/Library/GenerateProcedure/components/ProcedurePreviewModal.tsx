import { X } from "lucide-react";
import { useProcedureBuilder } from "../ProcedureBuilderContext";
import { convertStateToJSON } from "../utils/conversion"; 
import { ProcedureForm } from "./ProcedureForm"; 

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProcedurePreviewModal({ isOpen, onClose }: PreviewModalProps) {
  const { fields, settings, name, description } = useProcedureBuilder();

  if (!isOpen) return null;

  // --- 1. Convert Builder state to API format ---
  const apiFormattedData = convertStateToJSON(
    fields,
    settings,
    name,
    description
  );
  
  // --- 💡 FIX: Get rootHeadings from the converted data ---
  const rootFields = apiFormattedData.rootFields || [];
  const rootHeadings = apiFormattedData.headings || []; // <-- GET ROOT HEADINGS
  const sections = apiFormattedData.sections || [];
  // --- END FIX ---

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
          maxWidth: "800px",
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
            backgroundColor: "#007AFF", // Blue theme
            color: "white",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            position: "relative",
            zIndex: 10,
          }}
        >
          <span style={{ fontSize: "1.1rem", fontWeight: 600, color: "white" }}>
            {name} {/* Use name from context */}
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

        {/* --- 2. RENDER THE REUSABLE COMPONENT --- */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            background: "#f9fafb", // Light gray background
          }}
        >
          {/* --- 💡 FIX: Pass rootHeadings prop --- */}
          {/* --- 💡 FIX: Pass rootHeadings prop and ENABLE RUNNER MODE for interactivity --- */}
          <ProcedureForm
            rootFields={rootFields}
            rootHeadings={rootHeadings}
            sections={sections}
            resetKey={JSON.stringify(fields)} // Force reset when structure changes
            variant="runner" // [FIX] Enables interactivity (inputs not disabled)
            showConditionLabel={true} // [FIX] Show condition labels in preview
            // onFieldSave is intentionally OMITTED to prevent API calls
          />
          {/* --- END FIX --- */}
        </div>
      </div>
    </div>
  );
}