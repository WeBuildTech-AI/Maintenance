import { useState, useEffect, useRef } from "react";
import { X, MapPin } from "lucide-react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { type AppDispatch } from "../../../store";
import { restockPart } from "../../../store/parts/parts.thunks";
import { BlobUpload, type BUD } from "../../utils/BlobUpload";
import toast from "react-hot-toast";

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    quantity: number;
    location: string;
    note: string;
  }) => void;
  part?: any;
}

export default function RestockModal({
  isOpen,
  onClose,
  onConfirm,
  part,
}: RestockModalProps) {
  const [quantity, setQuantity] = useState(0);
  const [location, setLocation] = useState("General");
  const [note, setNote] = useState("");
  const [cost, setCost] = useState<number | "">(part?.unitCost || "");
  const [restockImages, setRestockImages] = useState<BUD[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ Added loading state
  const modalRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();

  const handleBlobChange = (data: { formId: string; buds: BUD[] }) => {
    if (data.formId === "restock_images") {
      setRestockImages(data.buds);
    }
  };

  useEffect(() => {
    if (part) {
      if (part.locations?.length) {
        setLocation(
          part.locations[0].name || part.locations[0].locationName || "General"
        );
      }
    }
  }, [part]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node))
        onClose();
    };
    document.addEventListener("mousedown", handleClickOutside, true);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside, true);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const increment = () => setQuantity((p) => p + 1);
  const decrement = () => setQuantity((p) => Math.max(0, p - 1));

  const handleConfirm = async () => {
    if (!part?.id) {
      toast.error("No part selected");
      return;
    }

    const selectedLoc = part.locations?.find(
      (loc: any) => loc.name === location || loc.locationName === location
    );
    const locationId = selectedLoc?.id || selectedLoc?.locationId;

    if (!locationId) {
      toast.error("Location ID not found");
      return;
    }

    try {
      setIsSubmitting(true); // Disable button while submitting

      // 1️⃣ CALL API FIRST
      await dispatch(
        restockPart({
          partId: part.id,
          locationId,
          addedUnits: quantity,
          notes: note,
          restockImages: restockImages,
          unitCost: cost === "" ? 0 : Number(cost),
        })
      ).unwrap();

      toast.success(`✅ Successfully restocked ${quantity} units of ${part.name}`);

      // 2️⃣ CALL ONCONFIRM ONLY AFTER SUCCESS (Triggers Parent Refresh)
      onConfirm({ quantity, location, note });

      // 3️⃣ RESET & CLOSE
      setQuantity(0);
      setNote("");
      setRestockImages([]);
      onClose();

    } catch (error: any) {
      console.error("Restock failed:", error);
      toast.error(error?.message || "Failed to restock part");
    } finally {
      setIsSubmitting(false);
    }
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
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827" }}>
            Restock {part?.name ? `– ${part.name}` : "Items"}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: "transparent",
              border: "none",
              color: "#6b7280",
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
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
              disabled={isSubmitting}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "2px solid #fca5a5",
                color: "#ef4444",
                background: "white",
                fontSize: "20px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.5 : 1,
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "2px solid #6ee7b7",
                color: "#10b981",
                background: "white",
                fontSize: "20px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.5 : 1,
              }}
            >
              +
            </button>
          </div>

          {/* Current Price */}
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
              Current Price
            </label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0.00"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "#fff",
              }}
            />
          </div>

          {/* Location Dropdown */}
          <div style={{ position: "relative" }}>
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
              onClick={() => !isSubmitting && setIsDropdownOpen((p) => !p)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                position: "relative",
                backgroundColor: "#fff",
                opacity: isSubmitting ? 0.7 : 1,
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

            {isDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  marginTop: "4px",
                  zIndex: 10000,
                  maxHeight: "150px",
                  overflowY: "auto",
                }}
              >
                {(part?.locations?.length
                  ? part.locations
                  : [{ name: "General" }]
                ).map((loc: any, i: number) => {
                  const locName = loc.name || loc.locationName || "General";
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        setLocation(locName);
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontSize: "14px",
                        backgroundColor:
                          location === locName ? "#eff6ff" : "white",
                        color: location === locName ? "#2563eb" : "#111827",
                      }}
                    >
                      {locName}
                    </div>
                  );
                })}
              </div>
            )}
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
              disabled={isSubmitting}
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

          {/* Restock Images Upload */}
          <div style={{ padding: "8px" }}>
            <BlobUpload
              formId="restock_images"
              type="images"
              initialBuds={restockImages}
              onChange={handleBlobChange}
            />
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
            disabled={isSubmitting}
            style={{
              background: "transparent",
              border: "none",
              color: "#2563eb",
              fontWeight: 500,
              fontSize: "15px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={quantity === 0 || isSubmitting}
            style={{
              background: quantity === 0 || isSubmitting ? "#d1d5db" : "#2563eb",
              color: quantity === 0 || isSubmitting ? "#6b7280" : "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              fontWeight: 500,
              fontSize: "15px",
              cursor: quantity === 0 || isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "Processing..." : "Confirm Restock"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}