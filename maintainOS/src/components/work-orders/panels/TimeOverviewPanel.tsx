"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import AddTimeModal from "../../work-orders/ToDoView/AddTimeModal";

export default function TimeOverviewPanel({ onCancel }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div
      className="flex flex-col bg-white border border-gray-200 rounded-md shadow-sm"
      style={{ height: "calc(100vh - 135px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-20">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-blue-600"
        >
          <ArrowLeft className="h-5 w-5" />
          Time Overview
        </button>

        <button
          onClick={() => setIsModalOpen(true)}
          className="border border-blue-500 text-blue-600 text-sm font-medium px-4 h-10 rounded-md hover:bg-blue-50 transition"
        >
          Add Time
        </button>
      </div>

      {/* Main Section */}
      <div className="flex-1 bg-white flex flex-col items-center justify-center py-10">
        <div className="flex items-center justify-center w-full max-w-3xl px-10" style={{ gap: "4rem" }}>
          <div className="flex flex-col items-center justify-center" style={{ width: 200, height: 180 }}>
            <h2 className="text-5xl font-semibold text-gray-900">0s</h2>
            <p className="text-gray-600 mt-2">Total Time</p>
          </div>

          <div style={{ width: 1, height: 120, backgroundColor: "#E5E7EB" }} />

          <div
            className="flex flex-col items-center justify-center hover:bg-blue-50 transition-all duration-300"
            style={{ width: 200, height: 180 }}
          >
            <h2 className="text-5xl font-semibold text-gray-900">0s</h2>
            <button
              className="mt-3 border border-blue-500 text-blue-600 text-sm font-medium px-5 h-9 rounded-md hover:bg-blue-100 transition"
              style={{ minWidth: 110 }}
            >
              My Time
            </button>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-gray-700 mb-4">Add time entries to this Work Order</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="border border-yellow-400 text-blue-600 font-medium text-base rounded-md hover:bg-blue-50 transition"
            style={{
              minWidth: "160px",
              height: "45px",
              padding: "0 20px",
            }}
          >
            Add Time
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && <AddTimeModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
