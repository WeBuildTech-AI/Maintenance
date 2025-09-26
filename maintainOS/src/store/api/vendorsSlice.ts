import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

// src/services/vendorService.ts
import axios from "axios";

export interface VendorResponse {
  id: string;
  organizationId: string;
  name: string;
  pictureUrl?: string;
  color?: string;
  description?: string;
  contacts?: Record<string, any>;
  files?: string[];
  locations?: string[];
  assetIds?: string[];
  partIds?: string[];
  vendorType?: "manufacturer" | "distributor";
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorData {
  organizationId: string;
  name: string;
  pictureUrl?: string;
  color?: string;
  description?: string;
  contacts?: Record<string, any>;
  files?: string[];
  locations?: string[];
  assetIds?: string[];
  partIds?: string[];
  vendorType?: "manufacturer" | "distributor";
}

export interface UpdateVendorData {
  name?: string;
  pictureUrl?: string;
  color?: string;
  description?: string;
  contacts?: Record<string, any>;
  files?: string[];
  locations?: string[];
  assetIds?: string[];
  partIds?: string[];
  vendorType?: "manufacturer" | "distributor";
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const vendorService = {
  fetchVendors: async (): Promise<VendorResponse[]> => {
    const res = await axios.get(`${API_URL}/vendors`);
    return res.data;
  },

  fetchVendorById: async (id: string): Promise<VendorResponse> => {
    const res = await axios.get(`${API_URL}/vendors/${id}`);
    return res.data;
  },

  createVendor: async (data: CreateVendorData): Promise<VendorResponse> => {
    const res = await axios.post(`${API_URL}/vendors`, data);
    return res.data;
  },

  updateVendor: async (
    id: string,
    data: UpdateVendorData
  ): Promise<VendorResponse> => {
    const res = await axios.patch(`${API_URL}/vendors/${id}`, data);
    return res.data;
  },

  deleteVendor: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/vendors/${id}`);
  },
};


interface VendorsState {
  vendors: VendorResponse[];
  selectedVendor: VendorResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: VendorsState = {
  vendors: [],
  selectedVendor: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchVendors = createAsyncThunk(
  "vendors/fetchVendors",
  async (_, { rejectWithValue }) => {
    try {
      return await vendorService.fetchVendors();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch vendors"
      );
    }
  }
);

export const fetchVendorById = createAsyncThunk(
  "vendors/fetchVendorById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await vendorService.fetchVendorById(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch vendor"
      );
    }
  }
);

export const createVendor = createAsyncThunk(
  "vendors/createVendor",
  async (vendorData: CreateVendorData, { rejectWithValue }) => {
    try {
      return await vendorService.createVendor(vendorData);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create vendor"
      );
    }
  }
);

export const updateVendor = createAsyncThunk(
  "vendors/updateVendor",
  async (
    { id, data }: { id: string; data: UpdateVendorData },
    { rejectWithValue }
  ) => {
    try {
      return await vendorService.updateVendor(id, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update vendor"
      );
    }
  }
);

export const deleteVendor = createAsyncThunk(
  "vendors/deleteVendor",
  async (id: string, { rejectWithValue }) => {
    try {
      await vendorService.deleteVendor(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete vendor"
      );
    }
  }
);

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
      // Fetch all vendors
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

      // Fetch vendor by ID
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

      // Create vendor
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

      // Update vendor
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

      // Delete vendor
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
