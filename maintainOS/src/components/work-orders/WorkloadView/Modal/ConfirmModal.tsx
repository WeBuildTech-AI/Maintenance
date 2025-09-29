import { X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        zIndex: 10000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "6px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          width: "400px",
          height: "220px",
          padding: "20px 16px",
          position: "relative",
          fontFamily: "Roboto, sans-serif",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X size={18} />
        </button>

        {/* Message */}
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-700 text-center leading-relaxed">
            This change will affect the current week and all weeks thereafter.{" "}
            No changes will be applied to previous weeks.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className="w-full py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-blue-600 rounded text-sm font-medium hover:bg-blue-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
