import React from "react";
import { X } from "lucide-react";

interface ProcedureDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode; 
}

export function ProcedureDetailModal({
  isOpen,
  onClose,
  title,
  children,
}: ProcedureDetailModalProps) {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      {/* Modal Content */}
      <div
        style={{
          width: "90%",
          maxWidth: "1024px", // Max width set kar sakte hain
          height: "85vh", // Height set kar di
          display: "flex",
          flexDirection: "column",
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Aapki image jaisa) */}
        <header
          style={{
            backgroundColor: "#2563eb", 
            color: "white",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "1rem", fontWeight: 600 }}>
            {title}
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

        {/* Body (jahan LibraryDetails render hoga) */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            background: "#f9fafb",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}