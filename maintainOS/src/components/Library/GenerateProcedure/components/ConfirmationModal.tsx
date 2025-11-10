import React from "react";
import { X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string; // Prop abhi bhi accept hoga, lekin render nahi hoga
  message: string;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title, // Prop receive kiya
  message,
}: ConfirmationModalProps) {
  if (!isOpen) {
    return null;
  }

  // Styles
  const backdropStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const modalStyle: React.CSSProperties = {
    background: "white",
    borderRadius: "8px",
    // --- 💡 1. Padding ko update kiya ---
    padding: "28px",
    width: "100%",
    maxWidth: "450px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    position: "relative",
  };

  const closeButtonStyle: React.CSSProperties = {
    position: "absolute",
    // --- 💡 2. 'X' ko thoda corner ke paas kiya ---
    top: "12px",
    right: "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
  };

  // Title style (ab use nahi ho raha)
  const titleStyle: React.CSSProperties = {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#111827",
    textAlign: "center",
    marginBottom: "24px",
  };

  const messageStyle: React.CSSProperties = {
    fontSize: "1rem",
    color: "#374151",
    textAlign: "center",
    // --- 💡 3. Button se pehle margin kam kiya ---
    marginBottom: "24px",
    lineHeight: 1.5,
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    // --- 💡 4. Dono buttons ke beech ka gap kam kiya ---
    gap: "8px",
  };

  const confirmButtonStyle: React.CSSProperties = {
    background: "#3b82f6", // blue-600
    color: "white",
    border: "none",
    borderRadius: "6px",
    // --- 💡 5. Button ki vertical padding kam ki ---
    padding: "10px 12px",
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
  };

  const cancelButtonStyle: React.CSSProperties = {
    background: "none",
    color: "#3b82f6", // blue-600
    border: "none",
    borderRadius: "6px",
    // --- 💡 6. Cancel button ki padding bhi adjust ki ---
    padding: "8px 12px",
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
  };

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <button style={closeButtonStyle} onClick={onClose}>
          <X size={24} />
        </button>

        {/* --- 💡 7. Title ko render HAMESHA ke liye hata diya --- */}
        {/* <h2 style={titleStyle}>{title}</h2> */}

        <p style={messageStyle}>{message}</p>

        <div style={buttonContainerStyle}>
          <button style={confirmButtonStyle} onClick={onConfirm}>
            Confirm
          </button>
          <button style={cancelButtonStyle} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}