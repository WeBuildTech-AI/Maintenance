import React from "react";
import { X } from "lucide-react";

interface ExportToPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export function ExportToPdfModal({ isOpen, onClose, title, message }: ExportToPdfModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-all"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
