"use client";

import { useEffect, useState } from "react";
import { procedureService } from "../../../store/procedures/procedures.service";
import { ProcedureForm } from "../../Library/GenerateProcedure/components/ProcedureForm";

interface LinkedProcedurePreviewProps {
  selectedWorkOrder: any; // The full work order object
}

// Mock service call helper (or use direct service)
const fetchProcedureById = async (id: string) => {
  try {
    // Using the dedicated fetch method we added earlier
    const foundProc = await procedureService.fetchProcedureById(id);
    return foundProc || null;
  } catch (error) {
    console.error("Failed to fetch procedure", error);
    return null;
  }
};

export function LinkedProcedurePreview({
  selectedWorkOrder,
}: LinkedProcedurePreviewProps) {
  const [fullProcedure, setFullProcedure] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get the first linked procedure from the work order data
  // (Assuming currently we handle 1 procedure per WO for display)
  const procedureSummary = selectedWorkOrder?.procedures?.[0];

  useEffect(() => {
    // Reset when WO changes
    setFullProcedure(null);

    if (procedureSummary?.id) {
      const loadProcedure = async () => {
        setIsLoading(true);
        const procData = await fetchProcedureById(procedureSummary.id);
        setFullProcedure(procData);
        setIsLoading(false);
      };
      loadProcedure();
    }
  }, [procedureSummary?.id]);

  // If there's no procedure, don't render anything
  if (!procedureSummary) {
    return null;
  }

  // Show a loading state
  if (isLoading) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        Loading procedure...
      </div>
    );
  }

  // If we have data, render the reusable form
  if (fullProcedure) {
    // Normalize fields (handle API vs Builder structure differences if any)
    const rootFields = fullProcedure.rootFields || fullProcedure.fields || [];
    const rootHeadings = fullProcedure.headings || []; 
    const sections = fullProcedure.sections || [];

    return (
      <div className="border-t border-gray-200 mt-4">
        <div className="p-6">
          {/* ✅ FIX: Added 'uppercase' class here */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 uppercase">
            <span className="bg-yellow-300 text-blue-600 p-3 rounded-md text-xs font-bold">PROCEDURE</span>
            {fullProcedure.title}
          </h3>
          
          {/* Container for the form */}
          <div className="border border-gray-200 rounded-lg bg-gray-50/50 p-4 sm:p-6">     
            <ProcedureForm
              rootFields={rootFields}
              rootHeadings={rootHeadings}
              sections={sections}
              resetKey={fullProcedure.id}
              variant="runner"
            />
          </div>
        </div>
      </div>
    );
  }

  // Handle case where procedure was linked but not found in DB
  if (!isLoading && !fullProcedure) {
    return (
      <div className="p-6 text-center text-sm text-red-500 bg-red-50 m-4 rounded-md border border-red-100">
        Could not load linked procedure: <strong>{procedureSummary.title}</strong>. 
        It may have been deleted.
      </div>
    );
  }

  return null;
}