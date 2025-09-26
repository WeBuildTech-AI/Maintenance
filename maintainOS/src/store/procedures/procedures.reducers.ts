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
      });
  },
});

export const { clearError, setSelectedProcedure } = proceduresSlice.actions;
export default proceduresSlice.reducer;
