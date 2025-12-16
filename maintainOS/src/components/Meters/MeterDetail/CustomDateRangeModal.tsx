import { X } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../../ui/button";

interface CustomDateRangeModalProps {
  onClose: () => void;
  onApply: (start: Date, end: Date) => void;
}

export function CustomDateRangeModal({
  onClose,
  onApply,
}: CustomDateRangeModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const handleApply = () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setError("Start date cannot be after end date.");
      return;
    }

    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    onApply(start, end);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Updated: Used inline style for width and removed w-full */}
      <div
        className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
        style={{ width: "320px", maxWidth: "100%" }} // ✅ Inline CSS applied
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Select Date Range
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 cursor-pointer hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setError("");
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setError("");
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}