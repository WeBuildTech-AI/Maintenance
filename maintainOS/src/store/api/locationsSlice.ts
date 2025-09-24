import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  locationService,
  type LocationResponse,
  type CreateLocationData,
  type UpdateLocationData,
} from "../../services/locationService";

export const fetchLocations = createAsyncThunk(
  "locations/fetchLocations",
  async (_, { rejectWithValue }) => {
    try {
      const locations = await locationService.fetchLocations();
      return locations;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch locations"
      );
    }
  }
);

export const fetchLocationById = createAsyncThunk(
  "locations/fetchLocationById",
  async (id: string, { rejectWithValue }) => {
    try {
      const location = await locationService.fetchLocationById(id);
      return location;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch location"
      );
    }
  }
);

export const createLocation = createAsyncThunk(
  "locations/createLocation",
  async (locationData: CreateLocationData, { rejectWithValue }) => {
    try {
      const location = await locationService.createLocation(locationData);
      return location;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create location"
      );
    }
  }
);

export const updateLocation = createAsyncThunk(
  "locations/updateLocation",
  async (
    {
      id,
      locationData,
    }: {
      id: string;
      locationData: UpdateLocationData;
    },
    { rejectWithValue }
  ) => {
    try {
      const location = await locationService.updateLocation(id, locationData);
      return location;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update location"
      );
    }
  }
);

export const deleteLocation = createAsyncThunk(
  "locations/deleteLocation",
  async (id: string, { rejectWithValue }) => {
    try {
      await locationService.deleteLocation(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete location"
      );
    }
  }
);

// Interface for the locations state
interface LocationsState {
  locations: LocationResponse[];
  selectedLocation: LocationResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: LocationsState = {
  locations: [],
  selectedLocation: null,
  loading: false,
  error: null,
};

// Locations slice
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
    // Fetch locations cases
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
      });

    // Fetch location by ID cases
    builder
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
      });

    // Create location cases
    builder
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
      });

    // Update location cases
    builder
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
      });

    // Delete location cases
    builder
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
      });
  },
});

export const { clearError, setSelectedLocation } = locationsSlice.actions;
export default locationsSlice.reducer;
