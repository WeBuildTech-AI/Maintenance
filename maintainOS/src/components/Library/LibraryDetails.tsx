import {
  Building2,
  ClipboardList,
  MoreVertical,
  Pencil,
  User, // <-- Import User icon
} from "lucide-react";
import { Button } from "../ui/button";
import React, { useState, useEffect } from "react"; // <-- Import useState and useEffect
import { ProcedureForm } from "./GenerateProcedure/components/ProcedureForm";

// --- Helper function to format dates ---
function formatDisplayDate(dateString: string) {
  if (!dateString) return "N/A";
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(dateString));
  } catch (error) {
    return dateString;
  }
}

// --- New component for the "Details" tab content ---
const DetailsTabContent = ({ procedure }: { procedure: any }) => {
  // --- Format dates from the procedure object ---
  const createdDate = formatDisplayDate(procedure.createdAt);
  const updatedDate = formatDisplayDate(procedure.updatedAt);
  
  // --- Extract a short ID (e.g., last 7 chars of UUID) ---
  const shortId = procedure.id ? procedure.id.split('-').pop() || procedure.id : "N/A";

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        {/* Created By */}
        <div className="flex items-center gap-3 text-gray-700">
          <span className="text-gray-400">
            <User size={20} />
          </span>
          <span>
            Created By{" "}
            <span className="font-medium text-gray-900">sumit sahani</span> on{" "}
            {createdDate}
          </span>
        </div>
        
        {/* Last Updated */}
        <div className="flex items-center gap-3 text-gray-700">
          <span className="text-gray-400 w-5"></span> {/* Spacer */}
          <span>
            Last updated on {updatedDate}
          </span>
        </div>
      </div>
      
      {/* Procedure ID */}
      <div className="pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-1">Procedure ID</p>
        <p className="font-medium text-gray-900">#{shortId}</p>
      </div>
    </div>
  );
};


// --- Main LibraryDetails Component ---
export function LibraryDetails({
  selectedProcedure,
}: {
  selectedProcedure: any;
}) {
  // --- 1. Add state for active tab ---
  const [activeTab, setActiveTab] = useState<'fields' | 'details' | 'history'>('fields');

  // --- 2. Reset to 'fields' tab when procedure changes ---
  useEffect(() => {
    setActiveTab('fields');
  }, [selectedProcedure]);


  if (!selectedProcedure) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Select a template from the left panel</p>
      </div>
    );
  }

  // Prepare props for the ProcedureForm
  const rootFields = selectedProcedure.fields || [];
  const sections = selectedProcedure.sections || [];

  return (
    // Make container relative and full height
    <div className="flex flex-col h-full relative bg-transparent">
      {/* --- HEADER (Blue Theme) --- */}
      <div className="pt-6 border-b border-border relative px-6">
        <div className="flex items-center justify-between">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-blue-400">
              <ClipboardList size={20} />
            </div>
            <h2 className="text-lg font-medium">
              {selectedProcedure?.title || "Untitled Procedure"}
            </h2>
          </div>

          {/* Buttons (Blue Theme) */}
          <div className="flex items-center gap-2 relative">
            <button className="inline-flex items-center rounded border border-blue-500 text-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-50">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button className="inline-flex items-center rounded p-2 text-blue-600 hover:text-blue-700 relative">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* --- 3. TABS (State-aware) --- */}
        <div className="border-b pt-2 border-gray-200">
          <nav className="flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('fields')}
              className={`flex-1 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm text-center ${
                activeTab === 'fields'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Fields
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm text-center ${
                activeTab === 'details'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm text-center ${
                activeTab === 'history'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              History
            </button>
          </nav>
        </div>
      </div>

      {/* --- 4. CONDITIONAL CONTENT (Dynamic) --- */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ background: "#f9fafb" }}
      >
        {activeTab === 'fields' && (
          <div className="p-6">
            <ProcedureForm
              rootFields={rootFields}
              sections={sections}
              resetKey={selectedProcedure.id} // Pass procedure ID as key
            />
          </div>
        )}
        
        {activeTab === 'details' && (
          <DetailsTabContent procedure={selectedProcedure} />
        )}
        
        {activeTab === 'history' && (
          <div className="p-6 text-center text-gray-500">
            History tab content goes here.
          </div>
        )}

        {/* extra spacing at bottom */}
        <div style={{ height: 96 }} />
      </div>

      {/* --- FLOATING "Use in New Work Order" BUTTON --- */}
      {/* This button is outside the tab content and always visible */}
      <div
        style={{
          position: "absolute",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      >
        <Button
          variant="outline"
          className="text-yellow-600 border-2 border-yellow-400 hover:bg-yellow-50 px-8 py-3 rounded-full shadow-lg bg-white font-medium whitespace-nowrap"
        >
          <Building2 className="w-5 h-5 mr-2" />
          Use in New Work Order
        </Button>
      </div>
    </div>
  );
}