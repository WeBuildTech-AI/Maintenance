import { X } from "lucide-react";
// ProcedureForm ko Library feature se import karein
// Path ko apne project structure ke hisaab se adjust karein
import { ProcedureForm } from "../../Library/GenerateProcedure/components/ProcedureForm"; 

interface LinkedProcedurePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  procedure: any; // Poora procedure object
}

// --- (NEW) DUMMY DATA ADD KIYA GAYA ---
const MOCK_PROCEDURE_DATA = {
  id: "mock-id-123",
  title: "MOCK Procedure Preview (Dummy Data)",
  fields: [
    {
      id: "mock-h1",
      fieldName: "Demo Inspection Steps",
      fieldType: "heading",
      blockType: "heading",
      required: false,
      order: 1,
    },
    {
      id: "mock-f1",
      fieldName: "Enter Asset Serial Number",
      fieldType: "text_field",
      blockType: "field",
      required: true,
      order: 2,
    },
  ],
  sections: [
    {
      id: "mock-s1",
      sectionName: "Demo Section: Readings",
      order: 1,
      fields: [
        {
          id: "mock-sf1",
          fieldName: "Is the reading nominal?",
          fieldType: "yes_no_NA",
          blockType: "field",
          required: false,
          order: 1,
        },
        {
          id: "mock-sf2",
          fieldName: "Upload supporting photo",
          fieldType: "picture_file",
          blockType: "field",
          required: false,
          order: 2,
        },
      ],
    },
  ],
};
// --- (END OF DUMMY DATA) ---

export function LinkedProcedurePreviewModal({
  isOpen,
  onClose,
  procedure,
}: LinkedProcedurePreviewModalProps) {
  // Agar procedure prop na ho, toh mock data ka istemaal karein (safai ke liye)
  const finalProcedure = procedure || MOCK_PROCEDURE_DATA;
  
  if (!isOpen || !finalProcedure) return null;

  // ProcedureForm.tsx 'fields' aur 'sections' expect karta hai.
  // Hum API response ko map karenge
  const rootFields = finalProcedure.rootFields || finalProcedure.fields || [];
  const sections = finalProcedure.sections || [];

  return (
    <div
    className="z-50"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
       
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
            backgroundColor: "#2563eb", // Blue header
            color: "white",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            {finalProcedure.title || "Procedure Preview"}
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

        {/* Body (scrollable) */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            background: "#f9fafb", 
          }}
        >
          {/* Reusable ProcedureForm component ka istemaal */}
          <ProcedureForm
            rootFields={rootFields}
            sections={sections}
            resetKey={finalProcedure.id}
          />
        </div>
      </div>
    </div>
  );
}