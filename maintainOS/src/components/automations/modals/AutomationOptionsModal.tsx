import { useEffect, useRef } from "react";

export function AutomationOptionsModal({
  open,
  onClose,
  onCopy,
  onDelete,
  buttonRef,
}: {
  open: boolean;
  onClose: () => void;
  onCopy: () => void;
  onDelete: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef?.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose, buttonRef]);

  if (!open) return null;

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: "100%",
        right: 0,
        marginTop: "4px",
        background: "#fff",
        borderRadius: "8px",
        width: "240px",
        padding: "8px 0",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        zIndex: 50,
      }}
    >
      {/* Copy to New Automation */}
      <button
        onClick={() => {
          onCopy();
          onClose();
        }}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: 400,
          color: "#111827",
          cursor: "pointer",
          textAlign: "left",
          transition: "background-color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#F9FAFB";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        Copy to New Automation
      </button>

      {/* Divider */}
      <div
        style={{
          height: "1px",
          backgroundColor: "#E5E7EB",
          margin: "0",
        }}
      />

      {/* Delete */}
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: 400,
          color: "#EF4444",
          cursor: "pointer",
          textAlign: "left",
          transition: "background-color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#FEF2F2";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        Delete
      </button>
    </div>
  );
}
