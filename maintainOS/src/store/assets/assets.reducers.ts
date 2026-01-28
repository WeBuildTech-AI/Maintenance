import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AssetResponse, AssetsState } from "./assets.types";
import {
  createAsset,
  deleteAsset,
  fetchAssetById,
  fetchAssets,
  updateAsset,
  fetchFilterData,
} from "./assets.thunks";

const initialState: AssetsState = {
  assets: [],
  selectedAsset: null,
  loading: false,
  error: null,
};

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
      })

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
      })

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
      })

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
      })

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
      })

      .addCase(fetchFilterData.fulfilled, (state, action) => {
        state.filterData = action.payload;
      });
  },
});

export const { clearError, setSelectedAsset } = assetsSlice.actions;
export default assetsSlice.reducer;
