import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

// src/services/partService.ts
import axios from "axios";

export interface PartResponse {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  unitCost?: number;
  qrCode?: string;
  photos?: string[];
  partsType?: string[];
  location?: Record<string, any>;
  assetIds?: string[];
  teamsInCharge?: string[];
  vendorIds?: string[];
  files?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartData {
  organizationId: string;
  name: string;
  description?: string;
  unitCost?: number;
  qrCode?: string;
  photos?: string[];
  partsType?: string[];
  location?: Record<string, any>;
  assetIds?: string[];
  teamsInCharge?: string[];
  vendorIds?: string[];
  files?: string[];
}

export interface UpdatePartData {
  name?: string;
  description?: string;
  unitCost?: number;
  qrCode?: string;
  photos?: string[];
  partsType?: string[];
  location?: Record<string, any>;
  assetIds?: string[];
  teamsInCharge?: string[];
  vendorIds?: string[];
  files?: string[];
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const partService = {
  fetchParts: async (): Promise<PartResponse[]> => {
    const res = await axios.get(`${API_URL}/parts`);
    return res.data;
  },

  fetchPartById: async (id: string): Promise<PartResponse> => {
    const res = await axios.get(`${API_URL}/parts/${id}`);
    return res.data;
  },

  createPart: async (data: CreatePartData): Promise<PartResponse> => {
    const res = await axios.post(`${API_URL}/parts`, data);
    return res.data;
  },

  updatePart: async (
    id: string,
    data: UpdatePartData
  ): Promise<PartResponse> => {
    const res = await axios.patch(`${API_URL}/parts/${id}`, data);
    return res.data;
  },

  deletePart: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/parts/${id}`);
  },
};


export const fetchParts = createAsyncThunk(
  "parts/fetchParts",
  async (_, { rejectWithValue }) => {
    try {
      const parts = await partService.fetchParts();
      return parts;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch parts"
      );
    }
  }
);

export const fetchPartById = createAsyncThunk(
  "parts/fetchPartById",
  async (id: string, { rejectWithValue }) => {
    try {
      const part = await partService.fetchPartById(id);
      return part;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch part"
      );
    }
  }
);

export const createPart = createAsyncThunk(
  "parts/createPart",
  async (partData: CreatePartData, { rejectWithValue }) => {
    try {
      const part = await partService.createPart(partData);
      return part;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create part"
      );
    }
  }
);

export const updatePart = createAsyncThunk(
  "parts/updatePart",
  async (
    {
      id,
      partData,
    }: {
      id: string;
      partData: UpdatePartData;
    },
    { rejectWithValue }
  ) => {
    try {
      const part = await partService.updatePart(id, partData);
      return part;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update part"
      );
    }
  }
);

export const deletePart = createAsyncThunk(
  "parts/deletePart",
  async (id: string, { rejectWithValue }) => {
    try {
      await partService.deletePart(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete part"
      );
    }
  }
);

// Interface for the parts state
interface PartsState {
  parts: PartResponse[];
  selectedPart: PartResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: PartsState = {
  parts: [],
  selectedPart: null,
  loading: false,
  error: null,
};

// Parts slice
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
    // Fetch parts cases
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
      });

    // Fetch part by ID cases
    builder
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
      });

    // Create part cases
    builder
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
      });

    // Update part cases
    builder
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
      });

    // Delete part cases
    builder
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
