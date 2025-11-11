"use client";

import { useEffect, useState } from "react";
import { procedureService } from "../../../store/procedures/procedures.service";
import { ProcedureForm } from "../../Library/GenerateProcedure/components/ProcedureForm";

interface LinkedProcedurePreviewProps {
  selectedWorkOrder: any; // The full work order object
}

// Mock service call. In a real app, this would be a direct fetch by ID.
// We use the pattern from NewWorkOrderForm.tsx to find the procedure.
const fetchProcedureById = async (id: string) => {
  try {
    const allProcs = await procedureService.fetchProcedures();
    const foundProc = allProcs.find((p: any) => p.id === id);
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
  }, [procedureSummary?.id]); // Re-run only when the procedure ID changes

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
    return (
      <div className="border-t">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">
            Linked Procedure: {fullProcedure.title}
          </h3>
          <div className="border rounded-lg bg-white p-4">
            <ProcedureForm
              rootFields={fullProcedure.rootFields || fullProcedure.fields || []}
              sections={fullProcedure.sections || []}
              resetKey={fullProcedure.id}
            />
          </div>
        </div>
      </div>
    );
  }

  // Handle case where procedure was linked but not found
  if (!isLoading && !fullProcedure) {
    return (
      <div className="p-6 text-center text-sm text-red-500">
        Could not load linked procedure: {procedureSummary.title}
      </div>
    );
  }

  return null;
}