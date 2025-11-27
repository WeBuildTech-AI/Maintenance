"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux"; 
import { procedureService } from "../../../store/procedures/procedures.service";
// ✅ Import new thunk
import { submitFieldResponse } from "../../../store/workOrders/workOrders.thunks"; 
import { ProcedureForm } from "../../Library/GenerateProcedure/components/ProcedureForm";
import type { AppDispatch } from "../../../store"; 
import toast from "react-hot-toast";

interface LinkedProcedurePreviewProps {
  selectedWorkOrder: any; 
}

const fetchProcedureById = async (id: string) => {
  try {
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
  const dispatch = useDispatch<AppDispatch>(); 
  const [fullProcedure, setFullProcedure] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const procedureSummary = selectedWorkOrder?.procedures?.[0];
  const submissionId = selectedWorkOrder?.submissions?.[0]?.id;

  useEffect(() => {
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

  // ✅ Handler: Triggered when input loses focus (onBlur)
  const handleFieldSave = async (fieldId: string, value: any, notes?: string) => {
    console.log("➡️ Saving Field:", { fieldId, value, notes, submissionId });

    if (!submissionId) {
      console.warn("❌ No Submission ID found. Work Order might not be started.");
      toast.error("Cannot save: No active submission found.");
      return;
    }

    try {
      await dispatch(submitFieldResponse({
        submissionId,
        fieldId,
        value,
        notes
      })).unwrap();
      
      // Success (Silent or Toast)
    } catch (error: any) {
      console.error("❌ Failed to save field", error);
      toast.error(error?.message || "Failed to save response");
    }
  };

  if (!procedureSummary) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        Loading procedure...
      </div>
    );
  }

  if (fullProcedure) {
    const rootFields = fullProcedure.rootFields || fullProcedure.fields || [];
    const rootHeadings = fullProcedure.headings || []; 
    const sections = fullProcedure.sections || [];

    return (
      <div className="border-t border-gray-200 mt-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 uppercase">
            <span className="bg-yellow-300 text-blue-600 p-3 rounded-md text-xs font-bold">PROCEDURE</span>
            {fullProcedure.title}
          </h3>
          
          <div className="border border-gray-200 rounded-lg bg-gray-50/50 p-4 sm:p-6">     
            <ProcedureForm
              rootFields={rootFields}
              rootHeadings={rootHeadings}
              sections={sections}
              resetKey={fullProcedure.id}
              variant="runner"
              // ✅ Pass the save handler to ProcedureForm
              onFieldSave={handleFieldSave} 
            />
          </div>
        </div>
      </div>
    );
  }

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