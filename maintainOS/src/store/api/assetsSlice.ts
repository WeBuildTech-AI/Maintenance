import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

// src/services/assetService.ts
import axios from "axios";

export interface AssetResponse {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  status?: string;
  locationId?: string;
  criticality?: string;
  pictures?: string[];
  files?: string[];
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetData {
  organizationId: string;
  name: string;
  description?: string;
  status?: string;
  locationId?: string;
  criticality?: string;
  pictures?: string[];
  files?: string[];
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
}

export interface UpdateAssetData {
  name?: string;
  description?: string;
  status?: string;
  locationId?: string;
  criticality?: string;
  pictures?: string[];
  files?: string[];
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const assetService = {
  fetchAssets: async (): Promise<AssetResponse[]> => {
    const res = await axios.get(`${API_URL}/assets`);
    return res.data;
  },

  fetchAssetById: async (id: string): Promise<AssetResponse> => {
    const res = await axios.get(`${API_URL}/assets/${id}`);
    return res.data;
  },

  createAsset: async (data: CreateAssetData): Promise<AssetResponse> => {
    const res = await axios.post(`${API_URL}/assets`, data);
    return res.data;
  },

  updateAsset: async (
    id: string,
    data: UpdateAssetData
  ): Promise<AssetResponse> => {
    const res = await axios.patch(`${API_URL}/assets/${id}`, data);
    return res.data;
  },

  deleteAsset: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/assets/${id}`);
  },
};


export const fetchAssets = createAsyncThunk(
  "assets/fetchAssets",
  async (_, { rejectWithValue }) => {
    try {
      const assets = await assetService.fetchAssets();
      return assets;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch assets"
      );
    }
  }
);

export const fetchAssetById = createAsyncThunk(
  "assets/fetchAssetById",
  async (id: string, { rejectWithValue }) => {
    try {
      const asset = await assetService.fetchAssetById(id);
      return asset;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch asset"
      );
    }
  }
);

export const createAsset = createAsyncThunk(
  "assets/createAsset",
  async (assetData: CreateAssetData, { rejectWithValue }) => {
    try {
      const asset = await assetService.createAsset(assetData);
      return asset;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create asset"
      );
    }
  }
);

export const updateAsset = createAsyncThunk(
  "assets/updateAsset",
  async (
    {
      id,
      assetData,
    }: {
      id: string;
      assetData: UpdateAssetData;
    },
    { rejectWithValue }
  ) => {
    try {
      const asset = await assetService.updateAsset(id, assetData);
      return asset;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update asset"
      );
    }
  }
);

export const deleteAsset = createAsyncThunk(
  "assets/deleteAsset",
  async (id: string, { rejectWithValue }) => {
    try {
      await assetService.deleteAsset(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete asset"
      );
    }
  }
);

// Interface for the assets state
interface AssetsState {
  assets: AssetResponse[];
  selectedAsset: AssetResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: AssetsState = {
  assets: [],
  selectedAsset: null,
  loading: false,
  error: null,
};

// Assets slice
const assetsSlice = createSlice({
  name: "assets",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedAsset: (state, action: PayloadAction<AssetResponse | null>) => {
      state.selectedAsset = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch assets cases
    builder
      .addCase(fetchAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.loading = false;
        state.assets = action.payload;
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch asset by ID cases
    builder
      .addCase(fetchAssetById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssetById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAsset = action.payload;
      })
      .addCase(fetchAssetById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create asset cases
    builder
      .addCase(createAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAsset.fulfilled, (state, action) => {
        state.loading = false;
        state.assets.push(action.payload);
      })
      .addCase(createAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update asset cases
    builder
      .addCase(updateAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAsset.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.assets.findIndex(
          (asset) => asset.id === action.payload.id
        );
        if (index !== -1) {
          state.assets[index] = action.payload;
        }
        if (state.selectedAsset?.id === action.payload.id) {
          state.selectedAsset = action.payload;
        }
      })
      .addCase(updateAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete asset cases
    builder
      .addCase(deleteAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAsset.fulfilled, (state, action) => {
        state.loading = false;
        state.assets = state.assets.filter(
          (asset) => asset.id !== action.payload
        );
        if (state.selectedAsset?.id === action.payload) {
          state.selectedAsset = null;
        }
      })
      .addCase(deleteAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedAsset } = assetsSlice.actions;
export default assetsSlice.reducer;
