import { createAsyncThunk } from "@reduxjs/toolkit";

import type {
  AssetResponse,
  CreateAssetData,
  CreateAssetType,
  UpdateAssetData,
} from "./assets.types";
import { assetService } from "./assets.service";

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
export const fetchAssetsName = createAsyncThunk(
  "assets/fetchAssets",
  async (_, { rejectWithValue }) => {
    try {
      const assets = await assetService.fetchAssetsName();
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

export const fetchAssetsType = createAsyncThunk(
  "assets/get.asset-type",
  async (_, { rejectWithValue }) => {
    try {
      const assetsType = await assetService.fetchAssetType;
      return assetsType;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch assets"
      );
    }
  }
);

export const createAssetType = createAsyncThunk(
  "assets/createAsset",
  async (assetDataType: CreateAssetType, { rejectWithValue }) => {
    try {
      const asset = await assetService.createAssetType(assetDataType);
      return asset;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create asset"
      );
    }
  }
);

export const fetchAssetsManufacturing = createAsyncThunk(
  "assets/get/manufacturer",
  async (_, { rejectWithValue }) => {
    try {
      const assetsType = await assetService.fetchAssetManufacturer;
      return assetsType;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch assets"
      );
    }
  }
);

export const createAssetManufacturing = createAsyncThunk(
  "assets/createManufacture",
  async (assetDataType: CreateAssetType, { rejectWithValue }) => {
    try {
      const asset = await assetService.createAssetManufacture(assetDataType);
      return asset;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create asset"
      );
    }
  }
);
