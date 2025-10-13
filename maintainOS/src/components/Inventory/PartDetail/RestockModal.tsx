import  { useState, useEffect, useRef } from "react";
import { X, MapPin, Camera } from "lucide-react";
import { createPortal } from "react-dom";

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { quantity: number; location: string; note: string }) => void;
}

export default function RestockModal({ isOpen, onClose, onConfirm }: RestockModalProps) {
  const [quantity, setQuantity] = useState(0);
  const [location, setLocation] = useState("General");
  const [note, setNote] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
  }, [isOpen, onClose]);

  // Close modal on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const increment = () => setQuantity((p) => p + 1);
  const decrement = () => setQuantity((p) => Math.max(0, p - 1));

  const handleConfirm = () => {
    onConfirm({ quantity, location, note });
    setQuantity(0);
    setNote("");
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        ref={modalRef}
        style={{
          width: "600px",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          overflow: "hidden",
          animation: "fadeIn 0.3s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827" }}>Restock Items</h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#6b7280",
              cursor: "pointer",
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Quantity */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
            }}
          >
            <button
              onClick={decrement}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "2px solid #fca5a5",
                color: "#ef4444",
                background: "white",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(0, parseInt(e.target.value) || 0))
              }
              style={{
                width: "80px",
                height: "36px",
                textAlign: "center",
                fontSize: "16px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
              }}
            />
            <button
              onClick={increment}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "2px solid #6ee7b7",
                color: "#10b981",
                background: "white",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              +
            </button>
          </div>

          {/* Location */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 500,
                color: "#111827",
                marginBottom: "6px",
              }}
            >
              Location
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              <MapPin size={18} color="#2563eb" />
              <span style={{ flex: 1, color: "#111827" }}>{location}</span>
              <svg
                style={{ width: "16px", height: "16px", color: "#2563eb" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Note */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 500,
                color: "#111827",
                marginBottom: "6px",
              }}
            >
              You can leave a note explaining the change
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                resize: "none",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Upload box */}
          <div
            style={{
              border: "2px dashed #93c5fd",
              borderRadius: "6px",
              background: "#eff6ff",
              textAlign: "center",
              padding: "20px",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#3b82f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Camera size={20} color="white" />
              </div>
              <span style={{ color: "#2563eb", fontWeight: 500, fontSize: "14px" }}>
                Add Pictures/Files
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "12px",
            padding: "12px 24px",
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "#f9fafb",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#2563eb",
              fontWeight: 500,
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={quantity === 0}
            style={{
              background: quantity === 0 ? "#d1d5db" : "#2563eb",
              color: quantity === 0 ? "#6b7280" : "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              fontWeight: 500,
              fontSize: "15px",
              cursor: quantity === 0 ? "not-allowed" : "pointer",
            }}
          >
            Confirm Restock
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
