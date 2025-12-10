"use client";

import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux"; 
import { procedureService } from "../../../store/procedures/procedures.service";
import { submitFieldResponse } from "../../../store/workOrders/workOrders.thunks"; 
import { ProcedureForm } from "../../Library/GenerateProcedure/components/ProcedureForm";
import type { AppDispatch } from "../../../store"; 
import toast from "react-hot-toast";

interface LinkedProcedurePreviewProps {
  selectedWorkOrder: any; 
}

export function LinkedProcedurePreview({ selectedWorkOrder }: LinkedProcedurePreviewProps) {
  const dispatch = useDispatch<AppDispatch>(); 
  const [fullProcedure, setFullProcedure] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const procedureSummary = selectedWorkOrder?.procedures?.[0];
  
  // ✅ 1. Get Submission ID (Critical for API)
  // Assuming the backend creates a submission when the WO is created/assigned.
  const submissionId = selectedWorkOrder?.submissions?.[0]?.id; 

  useEffect(() => {
    if (procedureSummary?.id) {
      const loadProcedure = async () => {
        setIsLoading(true);
        try {
          const procData = await procedureService.fetchProcedureById(procedureSummary.id);
          setFullProcedure(procData);
        } catch (error) {
          console.error("Failed to fetch procedure", error);
        } finally {
          setIsLoading(false);
        }
      };
      loadProcedure();
    }
  }, [procedureSummary?.id]);

  // ✅ 2. Optimized Save Handler (Passed to ProcedureForm)
  const handleFieldSave = useCallback(async (fieldId: string, value: any, notes?: string) => {
    // Validation
    if (!submissionId) {
      console.warn("⚠️ Cannot save response: No active submission ID found for this Work Order.");
      return; 
    }

    if (value === undefined || value === null || value === "") return;

    // API Payload
    const payload = {
      submissionId,
      fieldId,
      value, // Can be string, number, boolean, or object (for complex fields)
      notes
    };

    console.log("🚀 Auto-saving field:", payload);

    try {
      // Silent save (background sync)
      await dispatch(submitFieldResponse(payload)).unwrap();
      // Optional: Add a small "Saved" indicator in UI state if needed
    } catch (error: any) {
      console.error("❌ Save failed:", error);
      toast.error("Failed to save progress");
    }
  }, [dispatch, submissionId]);

  if (!procedureSummary || isLoading || !fullProcedure) return null;

  const rootFields = fullProcedure.rootFields || fullProcedure.fields || [];
  const rootHeadings = fullProcedure.headings || []; 
  const sections = fullProcedure.sections || [];

  return (
    <div className="border-t border-gray-200 mt-4">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 uppercase">
          <span className="bg-yellow-300 text-blue-600 p-1 px-2 rounded-md text-xs font-bold">PROCEDURE</span>
          {fullProcedure.title}
        </h3>
        
        <div className="border border-gray-200 rounded-lg bg-gray-50/50 p-4 sm:p-6">     
          {/* ✅ Pass variant="runner" and the save handler */}
          <ProcedureForm
            rootFields={rootFields}
            rootHeadings={rootHeadings}
            sections={sections}
            resetKey={fullProcedure.id}
            variant="runner" 
            onFieldSave={handleFieldSave} 
          />
        </div>
      </div>
    </div>
  );
}