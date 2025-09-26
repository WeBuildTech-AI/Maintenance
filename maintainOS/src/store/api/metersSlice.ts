import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

// src/services/meterService.ts
import axios from "axios";

export interface MeterResponse {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  meterType?: "manual" | "automated";
  unit?: string;
  assetId?: string;
  locationId?: string;
  readingFrequency?: Record<string, any>;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeterData {
  organizationId: string;
  name: string;
  description?: string;
  meterType?: "manual" | "automated";
  unit?: string;
  assetId?: string;
  locationId?: string;
  readingFrequency?: Record<string, any>;
  photos?: string[];
}

export interface UpdateMeterData {
  name?: string;
  description?: string;
  meterType?: "manual" | "automated";
  unit?: string;
  assetId?: string;
  locationId?: string;
  readingFrequency?: Record<string, any>;
  photos?: string[];
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const meterService = {
  fetchMeters: async (): Promise<MeterResponse[]> => {
    const res = await axios.get(`${API_URL}/meters`);
    return res.data;
  },

  fetchMeterById: async (id: string): Promise<MeterResponse> => {
    const res = await axios.get(`${API_URL}/meters/${id}`);
    return res.data;
  },

  createMeter: async (data: CreateMeterData): Promise<MeterResponse> => {
    const res = await axios.post(`${API_URL}/meters`, data);
    return res.data;
  },

  updateMeter: async (
    id: string,
    data: UpdateMeterData
  ): Promise<MeterResponse> => {
    const res = await axios.patch(`${API_URL}/meters/${id}`, data);
    return res.data;
  },

  deleteMeter: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/meters/${id}`);
  },
};


export const fetchMeters = createAsyncThunk(
  "meters/fetchMeters",
  async (_, { rejectWithValue }) => {
    try {
      const meters = await meterService.fetchMeters();
      return meters;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch meters"
      );
    }
  }
);

export const fetchMeterById = createAsyncThunk(
  "meters/fetchMeterById",
  async (id: string, { rejectWithValue }) => {
    try {
      const meter = await meterService.fetchMeterById(id);
      return meter;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch meter"
      );
    }
  }
);

export const createMeter = createAsyncThunk(
  "meters/createMeter",
  async (meterData: CreateMeterData, { rejectWithValue }) => {
    try {
      const meter = await meterService.createMeter(meterData);
      return meter;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create meter"
      );
    }
  }
);

export const updateMeter = createAsyncThunk(
  "meters/updateMeter",
  async (
    {
      id,
      meterData,
    }: {
      id: string;
      meterData: UpdateMeterData;
    },
    { rejectWithValue }
  ) => {
    try {
      const meter = await meterService.updateMeter(id, meterData);
      return meter;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update meter"
      );
    }
  }
);

export const deleteMeter = createAsyncThunk(
  "meters/deleteMeter",
  async (id: string, { rejectWithValue }) => {
    try {
      await meterService.deleteMeter(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete meter"
      );
    }
  }
);

// Interface for the meters state
interface MetersState {
  meters: MeterResponse[];
  selectedMeter: MeterResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: MetersState = {
  meters: [],
  selectedMeter: null,
  loading: false,
  error: null,
};

// Meters slice
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
    // Fetch meters cases
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
      });

    // Fetch meter by ID cases
    builder
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
      });

    // Create meter cases
    builder
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
      });

    // Update meter cases
    builder
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
      });

    // Delete meter cases
    builder
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
