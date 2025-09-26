import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { VendorResponse, VendorsState } from "./vendors.types";
import {
  createVendor,
  deleteVendor,
  fetchVendorById,
  fetchVendors,
  updateVendor,
} from "./vendors.thunks";

const initialState: VendorsState = {
  vendors: [],
  selectedVendor: null,
  loading: false,
  error: null,
};

const vendorsSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {
    clearSelectedVendor: (state) => {
      state.selectedVendor = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchVendors.fulfilled,
        (state, action: PayloadAction<VendorResponse[]>) => {
          state.loading = false;
          state.vendors = action.payload;
        }
      )
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchVendorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchVendorById.fulfilled,
        (state, action: PayloadAction<VendorResponse>) => {
          state.loading = false;
          state.selectedVendor = action.payload;
        }
      )
      .addCase(fetchVendorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createVendor.fulfilled,
        (state, action: PayloadAction<VendorResponse>) => {
          state.loading = false;
          state.vendors.push(action.payload);
        }
      )
      .addCase(createVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateVendor.fulfilled,
        (state, action: PayloadAction<VendorResponse>) => {
          state.loading = false;
          const index = state.vendors.findIndex(
            (vendor) => vendor.id === action.payload.id
          );
          if (index !== -1) {
            state.vendors[index] = action.payload;
          }
          if (state.selectedVendor?.id === action.payload.id) {
            state.selectedVendor = action.payload;
          }
        }
      )
      .addCase(updateVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteVendor.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.vendors = state.vendors.filter(
            (vendor) => vendor.id !== action.payload
          );
          if (state.selectedVendor?.id === action.payload) {
            state.selectedVendor = null;
          }
        }
      )
      .addCase(deleteVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedVendor, clearError } = vendorsSlice.actions;
export default vendorsSlice.reducer;
