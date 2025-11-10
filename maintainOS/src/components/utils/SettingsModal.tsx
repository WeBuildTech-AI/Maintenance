import React, { useState } from "react";
import { X } from "lucide-react";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (settings: {
    resultsPerPage: number;
    showDeleted: boolean;
    sortColumn: string;
  }) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [resultsPerPage, setResultsPerPage] = useState(25);
  const [showDeleted, setShowDeleted] = useState(false);
  const [sortColumn, setSortColumn] = useState("Last updated");

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        height: "100vh",
        width: "320px", // smaller width
        zIndex: 1000,
        backgroundColor: "#fff",
        boxShadow: "-4px 0 15px rgba(0,0,0,0.1)",
        borderLeft: "1px solid #e5e7eb",
        overflowY: "auto",
        transition: "transform 0.3s ease-out",
        transform: "translateX(0%)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#f9fafb",
        }}
      >
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "#111827",
          }}
        >
          Settings
        </h2>
        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: "6px",
            borderRadius: "6px",
          }}
        >
          <X style={{ width: "20px", height: "20px", color: "#6b7280" }} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "22px 20px" }}>
        {/* Results per page */}
        <div style={{ marginBottom: "24px" }}>
          <p
            style={{
              fontWeight: 600,
              marginBottom: "10px",
              color: "#374151",
            }}
          >
            Results per page
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {[25, 50, 100, 200].map((num) => (
              <button
                key={num}
                onClick={() => setResultsPerPage(num)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border:
                    resultsPerPage === num
                      ? "1px solid #2563eb"
                      : "1px solid #d1d5db",
                  background:
                    resultsPerPage === num ? "#2563eb" : "#ffffff",
                  color: resultsPerPage === num ? "#fff" : "#374151",
                  fontWeight: 500,
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            paddingTop: "20px",
            marginBottom: "24px",
          }}
        >
          <p
            style={{
              fontWeight: 600,
              marginBottom: "12px",
              color: "#374151",
            }}
          >
            Options
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ color: "#374151", fontSize: "14px" }}>
              Show only deleted procedures
            </span>
            <Switch
              checked={showDeleted}
              onCheckedChange={(v) => setShowDeleted(v)}
            />
          </div>
        </div>

        {/* Column options */}
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            paddingTop: "20px",
            marginBottom: "24px",
          }}
        >
          <p
            style={{
              fontWeight: 600,
              marginBottom: "12px",
              color: "#374151",
            }}
          >
            Column options
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              style={{
                background: "#f3f4f6",
                color: "#6b7280",
                padding: "8px 12px",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            >
              Title
            </div>
            <select
              value={sortColumn}
              onChange={(e) => setSortColumn(e.target.value)}
              style={{
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                padding: "8px 12px",
                color: "#111827",
                fontSize: "14px",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="Last updated">Last updated</option>
              <option value="Created At">Created At</option>
              <option value="Category">Category</option>
            </select>
          </div>
        </div>

        {/* Apply button */}
        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "18px" }}>
          <Button
            className="w-full"
            style={{
              width: "100%",
              backgroundColor: "#2563eb",
              color: "#fff",
              fontWeight: 600,
              padding: "10px 0",
              borderRadius: "8px",
              fontSize: "15px",
              boxShadow: "0 3px 8px rgba(37,99,235,0.25)",
            }}
            onClick={() =>
              onApply({ resultsPerPage, showDeleted, sortColumn })
            }
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
