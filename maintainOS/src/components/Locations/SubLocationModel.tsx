"use client";

import { useState } from "react";

type SubLocationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
};

export function SubLocationModal({ isOpen, onClose, onCreate }: SubLocationModalProps) {
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim());
    setName(""); // reset input
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">New Sub-Location</h3>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sub-Location Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Sub-Location Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-3">
          <button
            className="text-blue-600 hover:underline text-sm"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`text-white text-sm px-4 py-2 rounded ${
              name.trim()
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            onClick={handleCreate}
            disabled={!name.trim()}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
