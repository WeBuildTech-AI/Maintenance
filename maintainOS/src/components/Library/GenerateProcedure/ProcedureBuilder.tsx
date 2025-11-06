import { useState } from "react";
import { ChevronLeft, Eye } from "lucide-react";
import ProcedureBody from "./ProcedureBody";
import ProcedureSettings from "./ProcedureSettings"; // <-- 1. IMPORT SETTINGS
import { useLayout } from "../../MainLayout";
import { useProcedureBuilder } from "./ProcedureBuilderContext"; 
import { convertStateToJSON } from "./utils/conversion"; 

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
  // --- 2. ADD STATE FOR TAB ---
  const [activeTab, setActiveTab] = useState<'fields' | 'settings'>('fields');
  
  const { totalFieldCount, fields, settings } = useProcedureBuilder(); // <-- 3. GET SETTINGS

  const { sidebarWidth } = useLayout();

  const HEADER_HEIGHT = 70;
  const FOOTER_HEIGHT = 60;

  const handleContinue = () => {
    // --- 4. PASS SETTINGS TO CONVERTER ---
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
          {/* --- 5. MAKE TABS CLICKABLE AND DYNAMIC --- */}
          <span
            style={{
              color: activeTab === 'fields' ? "#2563eb" : "#374151",
              borderBottom: activeTab === 'fields' ? "2px solid #2563eb" : "2px solid transparent",
              paddingBottom: "2px",
              cursor: "pointer",
            }}
            onClick={() => setActiveTab('fields')}
          >
            Procedure Fields
          </span>
          <span 
            style={{
              color: activeTab === 'settings' ? "#2563eb" : "#374151",
              borderBottom: activeTab === 'settings' ? "2px solid #2563eb" : "2px solid transparent",
              paddingBottom: "2px",
              cursor: "pointer",
            }}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </span>
          {/* --- END TAB UPDATE --- */}

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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#2563eb",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <Eye size={18} />
            <span>Preview</span>
          </div>
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
        {/* --- 6. ADD CONDITIONAL RENDER --- */}
        {activeTab === 'fields' ? (
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
    </div>
  );
}