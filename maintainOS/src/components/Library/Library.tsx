import { useState } from "react";
import { LibraryHeaderComponent } from "./LibraryHeader";
import type { ViewMode } from "../purchase-orders/po.types";
import GenerateProcedure from "./GenerateProcedure/GenerateProcedure";

export function Library() {
  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col bg-white w-full min-h-screen">
      {/* ✅ Proper JSX usage */}
      {!showForm && (
        <LibraryHeaderComponent
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setIsCreatingForm={setShowForm}
          setShowSettings={setShowSettings}
        />
      )}

      {/* ✅ Conditional content */}
      {showForm ? (
        <div className="flex-1 bg-white p-6">
          <GenerateProcedure onBack={() => setShowForm(false)} />
        </div>
      ) : (
        <div className="flex-1 border border-gray-300 flex items-center justify-center m-2 bg-white">
          <div className="w-full h-full flex flex-col items-center justify-center text-center px-6 py-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="120"
              height="120"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-8"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="16"
                rx="2"
                ry="2"
                strokeDasharray="4 4"
                fill="#EFF6FF"
              ></rect>
              <path d="M9 10l2 2 4-4" stroke="#2563EB" strokeWidth="2"></path>
              <line
                x1="8"
                y1="16"
                x2="16"
                y2="16"
                stroke="#93C5FD"
                strokeWidth="2"
              ></line>
            </svg>

            <h2 className="text-3xl font-semibold mb-3 text-gray-900">
              Start adding Procedures to{" "}
              <span className="text-blue-600">webuildtech</span> on{" "}
              <span className="text-blue-600">MaintainX</span>
            </h2>

            <p className="text-gray-600 text-lg mt-1 max-w-2xl">
              Press{" "}
              <span className="text-blue-600 font-medium">
                + New Procedure Template
              </span>{" "}
              button above to add your first Procedure and share it with your
              organization!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
