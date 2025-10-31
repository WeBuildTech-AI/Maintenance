import { X, Trash2 } from "lucide-react";
import  { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface DeleteWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteWorkOrderModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteWorkOrderModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // ✅ Prevent scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // ✅ Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, isOpen]);

  // ✅ Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, isOpen]);

  if (!isOpen) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            Delete Work Order
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
          Are you sure you want to delete this work order? This action cannot be undone.
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
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-400 rounded-md hover:bg-red-50 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
