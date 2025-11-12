import { X } from "lucide-react";
import React from "react";

interface ContinueModalProps {
  modalRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ContinueModal({
  modalRef,
  onClose,
  onConfirm,
}: ContinueModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/50 flex w-full items-center justify-center p-4 z-50"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Complete Purchase Order
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Do you want to complete this Purchase Order?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-all"
          >
            Complete
          </button>
        </div>
      </div>
    </div>
  );
}
