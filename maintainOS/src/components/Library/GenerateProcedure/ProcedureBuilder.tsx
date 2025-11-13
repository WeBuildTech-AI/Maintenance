import { useState } from "react";
import { ChevronLeft, Eye, Loader2 } from "lucide-react";
import ProcedureBody from "./ProcedureBody";
import ProcedureSettings from "./ProcedureSettings";
import { useLayout } from "../../MainLayout"; // Note: This path is inferred
import { useProcedureBuilder } from "./ProcedureBuilderContext";
import { convertStateToJSON } from "./utils/conversion";
import { ProcedurePreviewModal } from "./components/ProcedurePreviewModal";

// --- 💡 1. REDUX IMPORTS ---
import { useDispatch } from "react-redux";
// import { useSelector } from "react-redux"; 
import { type RootState, type AppDispatch } from "../../../store"; // Note: This path is inferred
import { createProcedure } from "../../../store/procedures/procedures.thunks"; // Note: This path is inferred


interface BuilderProps {
  name: string;
  description: string;
  onBack: () => void;
}

export default function ProcedureBuilder({
  name,
  description,
  onBack,
}: BuilderProps) {
  const [scoring, setScoring] = useState(false);
  const [activeTab, setActiveTab] = useState<"fields" | "settings">("fields");
  const [showPreview, setShowPreview] = useState(false);

  // --- 💡 2. REDUX HOOKS ---
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  
  const { totalFieldCount, fields, settings } = useProcedureBuilder();

  const { sidebarWidth } = useLayout();

  const HEADER_HEIGHT = 70;
  const FOOTER_HEIGHT = 60;

  // --- 💡 3. 'SAVE TEMPLATE' LOGIC (UPDATED) ---
  const handleSaveTemplate = async () => {
    
    setIsSaving(true);
    
    // 1. Get the JSON data *with* IDs (for the preview)
    const previewJSON = convertStateToJSON(fields, settings, name, description);
    
    // 2. --- FIX: Update helper function to remove 'sectionId' ---
    const removeId = (obj: any) => {
      // This strips 'id' and any other non-API props
      const { 
        id, 
        condition,
        parentId,
        sectionId, // <-- (FIX) ADDED sectionId TO BE REMOVED
        // --- Add any other frontend-only props here ---
        ...rest 
      } = obj;
      
      // Re-map children recursively if they exist
      if (rest.children) {
        rest.children = rest.children.map(removeId);
      }
      // Re-map section fields recursively
      if (rest.fields) {
        rest.fields = rest.fields.map(removeId);
      }
      
      return rest;
    };
    
    // 3. --- FIX: Apply 'removeId' to the new 'headings' arrays ---
    const apiPayload = {
      ...previewJSON,
      headings: previewJSON.headings.map(removeId), // <-- (FIX) CLEAN ROOT HEADINGS
      rootFields: previewJSON.rootFields.map(removeId), 
      sections: previewJSON.sections.map((section: any) => ({
        ...removeId(section), 
        headings: section.headings.map(removeId), // <-- (FIX) CLEAN SECTION HEADINGS
        fields: section.fields.map(removeId) 
      }))
    };
    // --- END FIX ---


    console.log("--- FINAL PAYLOAD TO API (IDs Removed) ---");
    console.log(JSON.stringify(apiPayload, null, 2));

    try {
      // 4. Dispatch the payload WITHOUT IDs
      await dispatch(createProcedure(apiPayload)).unwrap();
      
      // Success
      setIsSaving(false);
      onBack(); // Wapas Library screen par bhej diya
      
    } catch (error: any) {
      // Error
      setIsSaving(false);
      console.error("Failed to save template:", error);
      alert(`Error: ${error.message || "Failed to save template"}`);
    }
  };

  return (
    <div className="flex flex-col bg-gray-50" style={{ height: "100vh" }}>
      {/* 🔹 Fixed Header */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: `${sidebarWidth}px`,
          right: 0,
          zIndex: 50,
          height: `${HEADER_HEIGHT}px`,
          backgroundColor: "#fff",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 32px",
          transition: "left 0.3s ease-in-out",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <span style={{ fontWeight: 500, color: "#111827" }}>{name}</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "40px",
            fontWeight: 500,
            color: "#374151",
          }}
        >
          {/* ... (Tabs aur Scoring ka code same rahega) ... */}
          <span
            style={{
              color: activeTab === "fields" ? "#2563eb" : "#374151",
              borderBottom:
                activeTab === "fields"
                  ? "2px solid #2563eb"
                  : "2px solid transparent",
              paddingBottom: "2px",
              cursor: "pointer",
            }}
            onClick={() => setActiveTab("fields")}
          >
            Procedure Fields
          </span>
          <span
            style={{
              color: activeTab === "settings" ? "#2563eb" : "#374151",
              borderBottom:
                activeTab === "settings"
                  ? "2px solid #2563eb"
                  : "2px solid transparent",
              paddingBottom: "2px",
              cursor: "pointer",
            }}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ cursor: "pointer" }}>Scoring</span>
            <label
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                width: "36px",
                height: "20px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={scoring}
                onChange={() => setScoring(!scoring)}
                style={{ display: "none" }}
              />
              <div
                style={{
                  backgroundColor: scoring ? "#2563eb" : "#374151",
                  borderRadius: "9999px",
                  width: "36px",
                  height: "20px",
                  transition: "background-color 0.2s",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "2px",
                  left: scoring ? "18px" : "2px",
                  backgroundColor: "#fff",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  transition: "all 0.2s ease-in-out",
                }}
              ></div>
            </label>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div
            style={{
              height: "20px",
              width: "1px",
              backgroundColor: "#d1d5db",
            }}
          ></div>
          {/* --- PREVIEW BUTTON --- */}
          <button
            onClick={() => setShowPreview(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#2563eb",
              fontWeight: 500,
              cursor: "pointer",
              background: "none",
              border: "none",
            }}
          >
            <Eye size={18} />
            <span>Preview</span>
          </button>

          {/* --- 💡 4. DYNAMIC BUTTON LOGIC (No change here) --- */}
          {activeTab === "fields" ? (
            <button
              onClick={() => setActiveTab("settings")} 
              style={{
                backgroundColor: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                fontWeight: 600,
                cursor: "pointer",
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSaveTemplate} // API call karega
              disabled={isSaving}
              style={{
                backgroundColor: isSaving ? "#d1d5db" : "#2563eb", // Disable color
                color: isSaving ? "#6b7280" : "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                fontWeight: 600,
                cursor: isSaving ? "not-allowed" : "pointer",
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isSaving && (
                <Loader2 size={16} className="animate-spin" />
              )}
              {isSaving ? "Saving..." : "Save Template"}
            </button>
          )}
        </div>
      </header>

      {/* 🔹 Scrollable Middle Section */}
      <main
        style={{
          flex: 1,
          marginTop: `${HEADER_HEIGHT}px`,
          marginBottom: `${FOOTER_HEIGHT}px`,
          overflowY: "auto",
          height: `calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT}px)`,
          padding: "32px 0",
        }}
      >
        {activeTab === "fields" ? (
          <ProcedureBody name={name} description={description} />
        ) : (
          <ProcedureSettings />
        )}
      </main>

      {/* 🔹 Fixed Footer */}
      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: `${sidebarWidth}px`,
          right: 0,
          backgroundColor: "#fff",
          borderTop: "1px solid #e5e7eb",
          padding: "12px 32px",
          display: "flex",
          alignItems: "center",
          fontSize: "14px",
          color: "#2563eb",
          fontWeight: 500,
          height: `${FOOTER_HEIGHT}px`,
          zIndex: 50,
          transition: "left 0.3s ease-in-out",
        }}
      >
        ℹ Fields count: {totalFieldCount} / 350
      </footer>

      <ProcedurePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}