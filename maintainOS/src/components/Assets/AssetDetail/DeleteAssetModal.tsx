import { X } from "lucide-react";
import React from "react";

interface DeleteModalProps {
  modalRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteAssetModal({
  modalRef,
  onClose,
  onConfirm,
}: DeleteModalProps) {
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
          <h2 className="text-lg font-semibold text-gray-800">Delete Asset</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete this Asset? This action cannot be
          undone.
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
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
