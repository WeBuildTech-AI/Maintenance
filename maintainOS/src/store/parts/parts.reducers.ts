// src/store/parts/parts.reducers.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { 
  PartResponse, 
  PartsState, 
  PartRestockLog, 
  PartActivityLog 
} from "./parts.types";
import {
  createPart,
  deletePart,
  fetchPartById,
  fetchParts,
  updatePart,
  restockPart,
  getAllRestockLogs,
  getRestockLogById,
  fetchPartLogs, // ✅ Import
} from "./parts.thunks";

const initialState: PartsState = {
  parts: [],
  selectedPart: null,
  loading: false,
  error: null,
  restockLogs: [],
  selectedRestockLog: null,
  logs: [], // ✅ Init logs array
};

const partsSlice = createSlice({
  name: "parts",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedPart: (state, action: PayloadAction<PartResponse | null>) => {
      state.selectedPart = action.payload;
    },
    clearRestockLogs: (state) => {
      state.restockLogs = [];
    },
    clearSelectedRestockLog: (state) => {
      state.selectedRestockLog = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 📦 FETCH PARTS
      .addCase(fetchParts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParts.fulfilled, (state, action) => {
        state.loading = false;
        state.parts = action.payload;
      })
      .addCase(fetchParts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 🔍 FETCH BY ID
      .addCase(fetchPartById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPartById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPart = action.payload;
      })
      .addCase(fetchPartById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ➕ CREATE
      .addCase(createPart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPart.fulfilled, (state, action) => {
        state.loading = false;
        state.parts.push(action.payload);
      })
      .addCase(createPart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✏️ UPDATE
      .addCase(updatePart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePart.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.parts.findIndex(
          (part) => part.id === action.payload.id
        );
        if (index !== -1) {
          state.parts[index] = action.payload;
        }
        if (state.selectedPart?.id === action.payload.id) {
          state.selectedPart = action.payload;
        }
      })
      .addCase(updatePart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ❌ DELETE
      .addCase(deletePart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePart.fulfilled, (state, action) => {
        state.loading = false;
        state.parts = state.parts.filter((p) => p.id !== action.payload);
        if (state.selectedPart?.id === action.payload) {
          state.selectedPart = null;
        }
      })
      .addCase(deletePart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // RESTOCK
      .addCase(restockPart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restockPart.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.parts.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.parts[index] = action.payload;
        }
        if (state.selectedPart?.id === action.payload.id) {
          state.selectedPart = action.payload;
        }
      })
      .addCase(restockPart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // RESTOCK LOGS
      .addCase(getAllRestockLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getAllRestockLogs.fulfilled,
        (state, action: PayloadAction<PartRestockLog[]>) => {
          state.loading = false;
          state.restockLogs = action.payload;
        }
      )
      .addCase(getAllRestockLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getRestockLogById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getRestockLogById.fulfilled,
        (state, action: PayloadAction<PartRestockLog>) => {
          state.loading = false;
          state.selectedRestockLog = action.payload;
        }
      )
      .addCase(getRestockLogById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ FETCH PART ACTIVITY LOGS
      .addCase(fetchPartLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPartLogs.fulfilled,
        (state, action: PayloadAction<PartActivityLog[]>) => {
          state.loading = false;
          state.logs = action.payload || []; // Ensure not undefined
        }
      )
      .addCase(fetchPartLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setSelectedPart,
  clearRestockLogs,
  clearSelectedRestockLog,
} = partsSlice.actions;
export default partsSlice.reducer;