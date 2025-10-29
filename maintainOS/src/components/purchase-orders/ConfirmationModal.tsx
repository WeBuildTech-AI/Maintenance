import { X } from "lucide-react";
import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean; // Modal dikhana hai ya nahi
  onClose: () => void;
  onConfirm: () => void;
  title: string; // Dynamic title
  message: string; // Dynamic message
  confirmButtonText: string; // Dynamic button text
  confirmButtonVariant?: "danger" | "success" | "warning"; // Button ka color
  isLoading?: boolean; // API call ke time loading state
  selectedPO: () => void;
  handleConfirm: () => void;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText,
  confirmButtonVariant = "warning",
  isLoading = false,
  selectedPO,
  handleConfirm,
}: ConfirmationModalProps) {
  // Agar modal open nahi hai, toh kuch bhi render mat karo
  if (!isOpen) {
    return null;
  }

  // Button ke color ke liye classes
  let confirmClasses =
    "px-4 py-2 text-sm font-medium text-white rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  if (confirmButtonVariant === "danger") {
    confirmClasses += " bg-red-500 hover:bg-red-700";
  } else if (confirmButtonVariant === "success") {
    confirmClasses += " bg-green-600 hover:bg-green-700";
  } else {
    // Default (warning)
    confirmClasses += " bg-orange-600 hover:bg-orange-700";
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed h-48 inset-0 bg-black/50 flex w-full items-center justify-center p-4 z-50"
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {title} {/* Dynamic Title */}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          {message} {/* Dynamic Message */}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={() => handleConfirm(selectedPO.id)}
            disabled={isLoading}
            className={confirmClasses} // Dynamic classes
          >
            {isLoading ? "Loading..." : confirmButtonText} {/* Dynamic Text */}
          </button>
        </div>
      </div>
    </div>
  );
}
