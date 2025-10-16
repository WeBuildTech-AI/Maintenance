import { X, Trash2 } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface DeletePartModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeletePartModal({ onClose, onConfirm }: DeletePartModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Lock scroll while modal is open (nice-to-have)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ✅ Robust outside-click close
  // Use a capturing window-level pointerdown so no React handlers above can swallow it.
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      const el = modalRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("pointerdown", handler, true); // capture phase
    return () => window.removeEventListener("pointerdown", handler, true);
  }, [onClose]);

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      // prevent any accidental parent onClick
      onClick={(e) => e.stopPropagation()}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-200"
        // ensure inside clicks never trigger outside-close logic
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-yellow-500" />
            Delete Part
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete this part? This action cannot be undone.
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-yellow-600 border border-yellow-400 rounded-md hover:bg-yellow-50 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  // Render above everything to avoid parent interference
  return createPortal(modal, document.body);
}