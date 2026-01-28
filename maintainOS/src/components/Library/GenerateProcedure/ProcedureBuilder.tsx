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
import { DiscardChangesModal } from "./components/DiscardChangesModal";

interface BuilderProps {
  name: string;
  description: string;
  onBack: (proc?: any) => void;
  editingProcedureId: string | null;
  initialState?: {
    fields: FieldData[];
    settings: ProcedureSettingsState;
    name: string;
    description: string;
  };
  onCreate?: (proc: any) => void;
  onUpdate?: (proc: any) => void;
}

export default function ProcedureBuilder({
  name,
  description,
  onBack,
  editingProcedureId,
  initialState,
  onCreate,
  onUpdate,
}: BuilderProps) {
  const [activeTab, setActiveTab] = useState<"fields" | "settings">("fields");
  const [showPreview, setShowPreview] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false); // ✅ Added Modal State
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
      let result;

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

        result = await dispatch(updateProcedure({ id: editingProcedureId, procedureData: finalPayload })).unwrap();
        if (onUpdate) onUpdate(result);

      } else {
        // --- CREATE MODE: Send Full Payload ---
        console.log("--- CREATE PAYLOAD TO API ---");
        console.log(JSON.stringify(currentPayload, null, 2));

        result = await dispatch(createProcedure(currentPayload)).unwrap();
        if (onCreate) onCreate(result);
      }

      // Success
      setIsSaving(false);

      // ✅ Pass the result to onBack so we can carry it via navigation state if needed
      if (editingProcedureId) {
        // For update, we might not strictly need to pass it if onUpdate handled it,
        // but consistent behavior is good.
        onBack(result);
      } else {
        onBack(result);
      }

    } catch (error: any) {
      // Error
      setIsSaving(false);
      console.error("Failed to save template:", error);
      alert(`Error: ${error.message || "Failed to save template"}`);
    }
  };

  // --- CHECK FOR CHANGES --
  const checkHasChanges = () => {
    // 1. Prepare Current State Payload
    const currentPayload = preparePayload(fields, settings, procedureName, procedureDescription);

    // 2. Prepare Reference Payload (Initial or Default)
    let initialPayload;
    if (initialState) {
      // Update Mode: Compare against passed initial state
      initialPayload = preparePayload(initialState.fields, initialState.settings, initialState.name, initialState.description);
    } else {
      // Create Mode: Compare against default values
      // We know 'fields' starts with 1 default field if not edited.
      // But to be robust, we essentially check if anything significant changed.
      // However, 'create' mode always starts with 'builderData' which has name/desc. 
      // If user only has that and default field, is it 'dirty'? 
      // Let's assume strict comparison against what we started with.
      // BUT, ProcedureBuilder is initialized with 'initialState' prop in Create Mode too?
      // Let's check GenerateProcedure.tsx...
      // In Create Mode, it passes name/desc but NO initialState prop (implicitly).
      // So fields is [createDefaultField()], settings is default.

      // Construct what the "default" start state is:
      const defaultField = {
        id: 0, // ID is Date.now() so it changes. We need to handle that.
        // This is tricky for fresh creation. 
        // Simplest proxy: Has the user added more fields or changed the name/desc?
        // Actually, name/desc comes from the modal, so they are "initial" for the builders context.

        // Let's rely on: if totalFieldCount > 1 OR name changed OR desc changed logic?
        // Or just compare against the values at mount? 
        // Since we don't have mount-snapshot for Create Mode easily without a ref, 
        // let's try to reconstruct 'default'.
        // But IDs change.

        // Better approach for Create Mode:
        // Just assume it's always dirty if they clicked "Create" unless we want to be super nice.
        // But user said "discard unsaved changes".
        // Let's try to compare 'data' without IDs using preparePayload but allow ID diffs?
        // preparePayload removes IDs? No, it keeps them. 'removeId' is only called for API payload which removes 'id' for *new* items? No, it keeps IDs usually.

        // Let's just use a simpler heuristic for now:
        // If in Edit Mode -> Strict Compare.
        // If in Create Mode -> If fields.length > 1 OR name/desc changed from props.
        // But wait, name/desc props ARE the start state.
      };

      // For now, let's use strict compare for Edit Mode (most important for "discard changes" usually)
      // And for Create Mode, if they added any fields or changed text?

      // Actually, let's just use the same logic if we can.
      // For Create Mode, we don't have initialState prop.
      // So we can't easily fallback.
      return true; // Always confirm on Create Mode to be safe? Or maybe too annoying?
      // User said "discard wla modal lagao". Safe to always show it?
      // If I just opened it and click back immediately, showing modal is annoying.

      // Let's refine:
      if (!initialState) {
        // Create Mode
        // ProcedureName/Desc start as `name`/`description` props.
        const nameChanged = procedureName !== name;
        const descChanged = procedureDescription !== description;
        // Fields start as 1 default field.
        const fieldsChanged = fields.length > 1 || fields[0].label !== "New Field";
        // (This is a rough check, but better than nothing)

        return nameChanged || descChanged || fieldsChanged;
      }
    }

    // Edit Mode Comparison 
    // (And if we entered this block, initialPayload is set)
    const diffKeys = Object.keys(currentPayload).some(key => {
      return JSON.stringify(currentPayload[key]) !== JSON.stringify(initialPayload[key]);
    });
    return diffKeys;
  };

  const handleBackClick = () => {
    if (checkHasChanges()) {
      setIsDiscardConfirmOpen(true);
    } else {
      // ✅ No params passed on strict back without changes, 
      // but if we were in editing mode, we might want to return 'undefined' so library knows no update.
      onBack();
    }
  };

  const handleDiscardConfirm = () => {
    setIsDiscardConfirmOpen(false);
    onBack(); // Just go back without saving
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
            onClick={handleBackClick} // ✅ Use new handler
            title="Back to Library" // ✅ Added Tooltip
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

      {/* ✅ Discard Changes Modal */}
      <DiscardChangesModal
        isOpen={isDiscardConfirmOpen}
        onKeepEditing={() => setIsDiscardConfirmOpen(false)}
        onDiscard={handleDiscardConfirm}
      />
    </div>
  );
}