import React, { useState, useEffect, forwardRef } from "react";
import { X } from "lucide-react";

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string, text: string) => void;
}

export const AddLinkModal = forwardRef<HTMLDivElement, AddLinkModalProps>(
  ({ isOpen, onClose, onSave }, ref) => {
    const [url, setUrl] = useState("");
    const [text, setText] = useState("");

    useEffect(() => {
      if (isOpen) {
        setUrl("");
        setText("");
      }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
      if (url.trim()) {
        onSave(url, text);
        onClose();
      }
    };

    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
        onClick={onClose}
      >
        {/* --- 🐞 BUG FIX: The 'ref' is moved from the backdrop to this content div --- */}
        <div
          ref={ref}
          style={{
            background: "#fff",
            borderRadius: "8px",
            padding: "24px",
            width: "500px",
            maxWidth: "90vw",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* --- END BUG FIX --- */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h2
              style={{ fontSize: "1.25rem", fontWeight: 600, color: "#111827" }}
            >
              Add Link
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6b7280",
              }}
            >
              <X size={24} />
            </button>
          </div>

          <label
            style={{ fontWeight: 500, display: "block", marginBottom: "6px" }}
          >
            Link <span style={{ color: "#ef4444" }}>(required)</span>
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste your link, eg: https://www.getmaintainx.com/"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #93c5fd", // blue-300
              borderRadius: "6px",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              fontWeight: 500,
              marginTop: "1rem",
              display: "block",
              marginBottom: "6px",
            }}
          >
            Text (optional)
          </label>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What describes the link (optional)"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #d1d5db", // gray-300
              borderRadius: "6px",
              boxSizing: "border-box",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "1.5rem",
              gap: "1rem",
            }}
          >
            <button
              onClick={onClose}
              style={{
                background: "#fff",
                border: "1px solid #d1d5db",
                color: "#374151",
                fontWeight: 500,
                borderRadius: "6px",
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              disabled={!url.trim()}
              onClick={handleSave}
              style={{
                backgroundColor: url.trim() ? "#2563eb" : "#e5e7eb",
                color: url.trim() ? "#fff" : "#9ca3af",
                fontWeight: 500,
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                cursor: url.trim() ? "pointer" : "not-allowed",
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }
);