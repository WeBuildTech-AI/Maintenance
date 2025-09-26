import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
  AutomationResponse,
  AutomationsState,
} from "./automations.types";
import {
  createAutomation,
  deleteAutomation,
  fetchAutomationById,
  fetchAutomations,
  updateAutomation,
} from "./automations.thunks";

const initialState: AutomationsState = {
  automations: [],
  selectedAutomation: null,
  loading: false,
  error: null,
};

const automationsSlice = createSlice({
  name: "automations",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedAutomation: (
      state,
      action: PayloadAction<AutomationResponse | null>
    ) => {
      state.selectedAutomation = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAutomations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAutomations.fulfilled, (state, action) => {
        state.loading = false;
        state.automations = action.payload;
      })
      .addCase(fetchAutomations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchAutomationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAutomationById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAutomation = action.payload;
      })
      .addCase(fetchAutomationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createAutomation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAutomation.fulfilled, (state, action) => {
        state.loading = false;
        state.automations.push(action.payload);
      })
      .addCase(createAutomation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateAutomation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAutomation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.automations.findIndex(
          (automation) => automation.id === action.payload.id
        );
        if (index !== -1) {
          state.automations[index] = action.payload;
        }
        if (state.selectedAutomation?.id === action.payload.id) {
          state.selectedAutomation = action.payload;
        }
      })
      .addCase(updateAutomation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteAutomation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAutomation.fulfilled, (state, action) => {
        state.loading = false;
        state.automations = state.automations.filter(
          (automation) => automation.id !== action.payload
        );
        if (state.selectedAutomation?.id === action.payload) {
          state.selectedAutomation = null;
        }
      })
      .addCase(deleteAutomation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedAutomation } = automationsSlice.actions;
export default automationsSlice.reducer;
