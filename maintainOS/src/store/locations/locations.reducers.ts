import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
  LocationResponse,
  LocationsState,
} from "./locations.types";
import {
  createLocation,
  deleteLocation,
  fetchLocationById,
  fetchLocations,
  updateLocation,
  fetchFilterData, // ✅ Added
} from "./locations.thunks";

const initialState: LocationsState = {
  locations: [],
  selectedLocation: null,
  loading: false,
  error: null,
  filterData: undefined, // ✅ Added
};

const locationsSlice = createSlice({
  name: "locations",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedLocation: (
      state,
      action: PayloadAction<LocationResponse | null>
    ) => {
      state.selectedLocation = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchLocationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocationById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedLocation = action.payload;
      })
      .addCase(fetchLocationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.locations.push(action.payload);
      })
      .addCase(createLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.locations.findIndex(
          (location) => location.id === action.payload.id
        );
        if (index !== -1) {
          state.locations[index] = action.payload;
        }
        if (state.selectedLocation?.id === action.payload.id) {
          state.selectedLocation = action.payload;
        }
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = state.locations.filter(
          (location) => location.id !== action.payload
        );
        if (state.selectedLocation?.id === action.payload) {
          state.selectedLocation = null;
        }
      })
      .addCase(deleteLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFilterData.pending, () => {
        // state.loading = true;
      })
      .addCase(fetchFilterData.fulfilled, (state, action) => {
        state.filterData = action.payload;
        // state.loading = false;
      })
      .addCase(fetchFilterData.rejected, (_state, action) => {
        // state.loading = false
        console.error("Filter Data Fetch Error:", action.payload);
      });
  },
});

export const { clearError, setSelectedLocation } = locationsSlice.actions;
export default locationsSlice.reducer;
