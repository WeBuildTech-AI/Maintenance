import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
  MeterResponse,
  MetersState,
} from "./meters.types";
import {
  createMeter,
  deleteMeter,
  fetchMeterById,
  fetchMeters,
  updateMeter,
} from "./meters.thunks";

const initialState: MetersState = {
  meters: [],
  selectedMeter: null,
  loading: false,
  error: null,
};

const metersSlice = createSlice({
  name: "meters",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedMeter: (state, action: PayloadAction<MeterResponse | null>) => {
      state.selectedMeter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMeters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeters.fulfilled, (state, action) => {
        state.loading = false;
        state.meters = action.payload;
      })
      .addCase(fetchMeters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchMeterById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeterById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMeter = action.payload;
      })
      .addCase(fetchMeterById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createMeter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMeter.fulfilled, (state, action) => {
        state.loading = false;
        state.meters.push(action.payload);
      })
      .addCase(createMeter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateMeter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMeter.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.meters.findIndex(
          (meter) => meter.id === action.payload.id
        );
        if (index !== -1) {
          state.meters[index] = action.payload;
        }
        if (state.selectedMeter?.id === action.payload.id) {
          state.selectedMeter = action.payload;
        }
      })
      .addCase(updateMeter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteMeter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMeter.fulfilled, (state, action) => {
        state.loading = false;
        state.meters = state.meters.filter(
          (meter) => meter.id !== action.payload
        );
        if (state.selectedMeter?.id === action.payload) {
          state.selectedMeter = null;
        }
      })
      .addCase(deleteMeter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedMeter } = metersSlice.actions;
export default metersSlice.reducer;
