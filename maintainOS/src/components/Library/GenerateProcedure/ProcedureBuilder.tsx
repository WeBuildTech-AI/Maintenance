import { useState } from "react";
import { ChevronLeft, Eye, Loader2 } from "lucide-react";
import ProcedureBody from "./ProcedureBody";
import ProcedureSettings from "./ProcedureSettings";
import { useLayout } from "../../MainLayout";
import { useProcedureBuilder } from "./ProcedureBuilderContext";
import { convertStateToJSON } from "./utils/conversion";
import { ProcedurePreviewModal } from "./components/ProcedurePreviewModal";
import { useDispatch } from "react-redux";
import { type RootState, type AppDispatch } from "../../../store";
import { createProcedure, updateProcedure } from "../../../store/procedures/procedures.thunks";
import type { FieldData, ProcedureSettingsState } from "./types";

interface BuilderProps {
  name: string;
  description: string;
  onBack: () => void;
  editingProcedureId: string | null;
  initialState?: {
    fields: FieldData[];
    settings: ProcedureSettingsState;
    name: string;
    description: string;
  };
}

export default function ProcedureBuilder({
  name,
  description,
  onBack,
  editingProcedureId,
  initialState,
}: BuilderProps) {
  const [activeTab, setActiveTab] = useState<"fields" | "settings">("fields");
  const [showPreview, setShowPreview] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const { totalFieldCount, fields, settings, procedureName, procedureDescription } = useProcedureBuilder();

  const { sidebarWidth } = useLayout();

  const HEADER_HEIGHT = 70;
  const FOOTER_HEIGHT = 60;

  // --- Helper to remove IDs from payload (for clean JSON) ---
  // --- Helper to remove IDs from payload (for clean JSON) ---
  const removeId = (obj: any) => {
    const {
      id,
      // condition, // FIXED: Do NOT remove condition!
      parentId,
      sectionId,
      ...rest
    } = obj;

    // Recursive cleanup
    if (rest.children) {
      rest.children = rest.children.map(removeId);
    }
    if (rest.fields) {
      rest.fields = rest.fields.map(removeId);
    }
    return rest;
  };

  // --- Helper to prepare final API payload ---
  const preparePayload = (fieldsData: any[], settingsData: any, pName: string, pDesc: string) => {
    const rawJSON = convertStateToJSON(fieldsData, settingsData, pName, pDesc);
    return {
      ...rawJSON,
      headings: rawJSON.headings.map(removeId),
      rootFields: rawJSON.rootFields.map(removeId),
      sections: rawJSON.sections.map((section: any) => ({
        ...removeId(section),
        headings: section.headings.map(removeId),
        fields: section.fields.map(removeId)
      }))
    };
  };

  // --- SAVE TEMPLATE LOGIC (With Partial Update) ---
  const handleSaveOrUpdateTemplate = async () => {

    setIsSaving(true);

    // 1. Generate Current Payload
    const currentPayload = preparePayload(fields, settings, procedureName, procedureDescription);

    try {
      if (editingProcedureId) {
        // --- UPDATE MODE: Calculate Diff ---
        let finalPayload = currentPayload;

        if (initialState) {
          // Generate Initial Payload from original state to compare against
          const initialPayload = preparePayload(initialState.fields, initialState.settings, initialState.name, initialState.description);

          const diff: any = {};

          // Compare Keys
          Object.keys(currentPayload).forEach(key => {
            // Deep comparison using JSON.stringify for simplicity on objects/arrays
            if (JSON.stringify(currentPayload[key]) !== JSON.stringify(initialPayload[key])) {
              diff[key] = currentPayload[key];
            }
          });

          // Structural Integrity Check:
          const structureKeys = ['rootFields', 'headings', 'sections'];
          const structureChanged = structureKeys.some(k => diff[k]);

          if (structureChanged) {
            structureKeys.forEach(k => diff[k] = currentPayload[k]);
          }

          finalPayload = diff;
        }

        console.log("--- PARTIAL PAYLOAD TO API ---");
        console.log(JSON.stringify(finalPayload, null, 2));

        if (Object.keys(finalPayload).length === 0) {
          alert("No changes detected.");
          setIsSaving(false);
          return;
        }

        await dispatch(updateProcedure({ id: editingProcedureId, procedureData: finalPayload })).unwrap();

      } else {
        // --- CREATE MODE: Send Full Payload ---
        console.log("--- CREATE PAYLOAD TO API ---");
        console.log(JSON.stringify(currentPayload, null, 2));

        await dispatch(createProcedure(currentPayload)).unwrap();
      }

      // Success
      setIsSaving(false);
      onBack();

    } catch (error: any) {
      // Error
      setIsSaving(false);
      console.error("Failed to save template:", error);
      alert(`Error: ${error.message || "Failed to save template"}`);
    }
  };

  return (
    <div className="flex flex-col bg-white" style={{ height: "100vh" }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* CANCEL BUTTON */}
          <button
            onClick={onBack}
            title="Cancel"
            style={{
              background: "#fff",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              padding: "6px 12px",
              cursor: "pointer",
              color: "#374151",
              fontSize: "0.9rem",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
            }}
          >
            Cancel
          </button>

          {/* BACK BUTTON */}
          <button
            onClick={onBack}
            title="Back to previous page"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontWeight: 500,
            }}
          >
            <ChevronLeft size={20} />
            Back
          </button>

          <div style={{ height: "24px", width: "1px", background: "#e5e7eb", margin: "0 4px" }} />

          <span style={{ fontWeight: 600, color: "#111827", fontSize: "1.1rem" }}>{procedureName}</span>
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

          {/* --- ACTION BUTTON --- */}
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
              onClick={handleSaveOrUpdateTemplate}
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
              {isSaving ? "Saving..." : (editingProcedureId ? "Update Template" : "Save Template")}
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
          <ProcedureBody name={procedureName} description={procedureDescription} />
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