import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  vendorService,
  type VendorResponse,
  type CreateVendorData,
  type UpdateVendorData,
} from "../services/vendorService";

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
