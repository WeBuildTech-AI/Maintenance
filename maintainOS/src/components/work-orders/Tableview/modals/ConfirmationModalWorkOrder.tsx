import React from "react";
import { X } from "lucide-react";

interface ConfirmationModalWorkOrderProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
}

export function ConfirmationModalWorkOrder({
  isOpen,
  onClose,
  onConfirm,
  message,
}: ConfirmationModalWorkOrderProps) {
  if (!isOpen) return null;

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
    padding: "28px",
    width: "100%",
    maxWidth: "450px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    position: "relative",
  };

  const closeButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
  };

  const messageStyle: React.CSSProperties = {
    fontSize: "1rem",
    color: "#374151",
    textAlign: "center",
    marginBottom: "24px",
    lineHeight: 1.5,
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  };

  const confirmButtonStyle: React.CSSProperties = {
    background: "#ef4444", // red-500 for destructive action
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "10px 12px",
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
  };

  const cancelButtonStyle: React.CSSProperties = {
    background: "none",
    color: "#6b7280",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
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

        <p style={messageStyle}>{message}</p>

        <div style={buttonContainerStyle}>
          <button style={confirmButtonStyle} onClick={onConfirm}>
            Yes, Delete
          </button>
          <button style={cancelButtonStyle} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
