"use client";

import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux"; 
import { procedureService } from "../../../store/procedures/procedures.service";
import { 
  submitFieldResponse, 
  fetchFieldResponses 
} from "../../../store/workOrders/workOrders.thunks"; 
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
  
  // State to store fetched answers
  const [existingAnswers, setExistingAnswers] = useState<Record<string, any>>({});

  const procedureSummary = selectedWorkOrder?.procedures?.[0];
  const submissionId = selectedWorkOrder?.submissions?.[0]?.id; 

  // --- 1. Load Procedure Schema (Template) ---
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

  // --- 2. Load Saved Responses (GET API) ---
  const loadResponses = useCallback(async () => {
    if (!submissionId) return;

    try {
      const result = await dispatch(fetchFieldResponses(submissionId)).unwrap();
      
      // Normalize API Data to Form State
      const answersMap: Record<string, any> = {};

      if (Array.isArray(result)) {
        result.forEach((item: any) => {
          let val = null;
          
          if (item.jsonValue !== null && item.jsonValue !== undefined) {
            val = item.jsonValue;
          } else if (item.numericValue !== null && item.numericValue !== undefined) {
            val = item.numericValue;
          } else if (item.enumValue !== null && item.enumValue !== undefined) {
            val = item.enumValue;
          } else {
            val = item.textValue;
          }

          if (val !== null) {
            answersMap[item.fieldId] = val;
          }
        });
      }

      setExistingAnswers(answersMap);

    } catch (error) {
      console.error("Failed to load responses:", error);
    }
  }, [dispatch, submissionId]);

  // Initial Load of Responses
  useEffect(() => {
    if (submissionId) {
      loadResponses();
    }
  }, [submissionId, loadResponses]);


  // --- 3. Save Handler (POST API) ---
  const handleFieldSave = useCallback(async (fieldId: string, value: any, notes?: string) => {
    if (!submissionId) {
      console.warn("⚠️ Cannot save: No submission ID.");
      return; 
    }

    // Allow saving null/empty strings if needed, but skip undefined
    if (value === undefined) return;

    const payload = {
      submissionId,
      fieldId,
      value, 
      notes
    };

    try {
      await dispatch(submitFieldResponse(payload)).unwrap();
      // Optional: Toast for success could be added here, 
      // but might be too noisy for every blur event.
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
          <ProcedureForm
            rootFields={rootFields}
            rootHeadings={rootHeadings}
            sections={sections}
            resetKey={fullProcedure.id}
            variant="runner" 
            onFieldSave={handleFieldSave}
            initialAnswers={existingAnswers} 
            alwaysShowConditionalFields={false} // ✅ Restore logic (hide/show)
            showConditionLabel={true} // ✅ But show the blue banner when shown!
          />
        </div>
      </div>
    </div>
  );
}