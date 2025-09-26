import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { PartResponse, PartsState } from "./parts.types";
import {
  createPart,
  deletePart,
  fetchPartById,
  fetchParts,
  updatePart,
} from "./parts.thunks";

const initialState: PartsState = {
  parts: [],
  selectedPart: null,
  loading: false,
  error: null,
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
  },
  extraReducers: (builder) => {
    builder
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

      .addCase(deletePart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePart.fulfilled, (state, action) => {
        state.loading = false;
        state.parts = state.parts.filter((part) => part.id !== action.payload);
        if (state.selectedPart?.id === action.payload) {
          state.selectedPart = null;
        }
      })
      .addCase(deletePart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedPart } = partsSlice.actions;
export default partsSlice.reducer;
