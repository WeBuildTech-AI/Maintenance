import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
  ProcedureResponse,
  ProceduresState,
} from "./procedures.types";
import {
  createProcedure,
  deleteProcedure,
  fetchProcedureById,
  fetchProcedures,
  updateProcedure,
  duplicateProcedure, 
  batchDeleteProcedures, 
  // --- 👇 [CHANGE] NAYE THUNKS IMPORT KAREIN ---
  restoreProcedure,
  fetchDeletedProcedures,
} from "./procedures.thunks";

const initialState: ProceduresState = {
  procedures: [],
  selectedProcedure: null,
  loading: false,
  error: null,
};

const proceduresSlice = createSlice({
  name: "procedures",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedProcedure: (
      state,
      action: PayloadAction<ProcedureResponse | null>
    ) => {
      state.selectedProcedure = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProcedures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProcedures.fulfilled, (state, action) => {
        state.loading = false;
        state.procedures = action.payload;
      })
      .addCase(fetchProcedures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- 👇 [CHANGE] fetchDeletedProcedures ke cases add karein ---
      .addCase(fetchDeletedProcedures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeletedProcedures.fulfilled, (state, action) => {
        state.loading = false;
        // State ko deleted procedures se replace karein
        state.procedures = action.payload;
      })
      .addCase(fetchDeletedProcedures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // --- END fetchDeletedProcedures ---

      .addCase(fetchProcedureById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProcedureById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProcedure = action.payload;
      })
      .addCase(fetchProcedureById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createProcedure.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProcedure.fulfilled, (state, action) => {
        state.loading = false;
        state.procedures.push(action.payload);
      })
      .addCase(createProcedure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateProcedure.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProcedure.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.procedures.findIndex(
          (procedure) => procedure.id === action.payload.id
        );
        if (index !== -1) {
          state.procedures[index] = action.payload;
        }
        if (state.selectedProcedure?.id === action.payload.id) {
          state.selectedProcedure = action.payload;
        }
      })
      .addCase(updateProcedure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteProcedure.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProcedure.fulfilled, (state, action) => {
        state.loading = false;
        state.procedures = state.procedures.filter(
          (procedure) => procedure.id !== action.payload
        );
        if (state.selectedProcedure?.id === action.payload) {
          state.selectedProcedure = null;
        }
      })
      .addCase(deleteProcedure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(duplicateProcedure.pending, (state) => {
        state.loading = true; 
        state.error = null;
      })
      .addCase(duplicateProcedure.fulfilled, (state, action) => {
        state.loading = false;
        state.procedures.unshift(action.payload);
      })
      .addCase(duplicateProcedure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(batchDeleteProcedures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(batchDeleteProcedures.fulfilled, (state, action) => {
        state.loading = false;
        const deletedIds = new Set(action.payload); 
        
        state.procedures = state.procedures.filter(
          (procedure) => !deletedIds.has(procedure.id)
        );

        if (
          state.selectedProcedure &&
          deletedIds.has(state.selectedProcedure.id)
        ) {
          state.selectedProcedure = null;
        }
      })
      .addCase(batchDeleteProcedures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // --- 👇 [CHANGE] YEH NAYE CASES ADD KIYE GAYE HAIN ---
      .addCase(restoreProcedure.pending, (state) => {
        // Option: loading state dikha sakte hain
        // state.loading = true; 
        state.error = null;
      })
      .addCase(restoreProcedure.fulfilled, (state, action) => {
        // action.payload ab restored procedure ki ID hai
        // Ise current 'procedures' (jo deleted list hai) se hata dein
        state.procedures = state.procedures.filter(
          (procedure) => procedure.id !== action.payload
        );
        state.loading = false;
      })
      .addCase(restoreProcedure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
      // --- END RESTORE ---
  },
});

export const { clearError, setSelectedProcedure } = proceduresSlice.actions;
export default proceduresSlice.reducer;