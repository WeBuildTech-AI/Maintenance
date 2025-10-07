"use client";

import { useState } from "react";

type SubLocationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
};

export function SubLocationModal({
  isOpen,
  onClose,
  onCreate,
}: SubLocationModalProps) {
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim());
    setName("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Create Sub-Location
          </h3>
          <button
            className="text-gray-400 hover:text-gray-600 transition"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Input Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sub-Location Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Sub-Location Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3">
          <button
            className="text-gray-500 hover:text-gray-700 text-sm font-medium transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`text-white text-sm font-medium px-4 py-2 rounded-md transition ${
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
