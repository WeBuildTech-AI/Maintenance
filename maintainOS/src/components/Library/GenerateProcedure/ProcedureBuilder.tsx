import { useState } from "react";
import { ChevronLeft, Eye } from "lucide-react";
import ProcedureBody from "./ProcedureBody";
import ProcedureSettings from "./ProcedureSettings";
import { useLayout } from "../../MainLayout";
import { useProcedureBuilder } from "./ProcedureBuilderContext";
import { convertStateToJSON } from "./utils/conversion";
import { ProcedurePreviewModal } from "./components/ProcedurePreviewModal"; // <-- 1. MODAL KO IMPORT KAREIN

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
  const [showPreview, setShowPreview] = useState(false); // <-- 2. MODAL STATE ADD KAREIN

  const { totalFieldCount, fields, settings } = useProcedureBuilder();

  const { sidebarWidth } = useLayout();

  const HEADER_HEIGHT = 70;
  const FOOTER_HEIGHT = 60;

  const handleContinue = () => {
    const finalJSON = convertStateToJSON(fields, settings, name, description);

    console.log("--- FINAL 'CONTINUE' CLICK JSON ---");
    console.log(JSON.stringify(finalJSON, null, 2));
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
          {/* --- 3. PREVIEW BUTTON CLICK HANDLER ADD KAREIN --- */}
          <button
            onClick={() => setShowPreview(true)} // <-- YEH BUTTON MODAL KHOLEGA
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
          <button
            onClick={handleContinue}
            style={{
              backgroundColor: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Continue
          </button>
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

      {/* --- 4. MODAL KO RENDER KAREIN --- */}
      <ProcedurePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}