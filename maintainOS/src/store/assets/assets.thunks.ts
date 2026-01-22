import { createAsyncThunk } from "@reduxjs/toolkit";

import type {
  CreateAssetData,
  CreateAssetType,
  UpdateAssetData,
  UpdateAssetStatus,
  FetchAssetsParams,
  FilterData,
} from "./assets.types";
import { assetService } from "./assets.service";
import { locationService } from "../locations/locations.service";
import { partService } from "../parts/parts.service";
import { vendorService } from "../vendors/vendors.service";
import { categoryService } from "../categories/categories.service";
import { teamService } from "../teams/teams.service";
import { procedureService } from "../procedures/procedures.service";
import type { RootState } from "../index";

export const fetchAssets = createAsyncThunk(
  "assets/fetchAssets",
  async (params: FetchAssetsParams | undefined, { rejectWithValue }) => {
    try {
      const assets = await assetService.fetchAssets(params);
      return assets;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch assets"
      );
    }
  }
);
export const fetchAssetsName = createAsyncThunk(
  "assets/fetchAssetsName",
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
      // ✅ Fixed: Execute the function
      const assetsType = await assetService.fetchAssetType();
      return assetsType;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch assets"
      );
    }
  }
);

export const createAssetType = createAsyncThunk(
  "assets/createAssetType",
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
      // ✅ Fixed: Execute the function
      const assetsType = await assetService.fetchAssetManufacturer();
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

export const updateAssetStatus = createAsyncThunk(
  "assets/updateAssetStatus",
  async (
    {
      id,
      assetDataStatus,
    }: {
      id: string;
      assetDataStatus: UpdateAssetStatus;
    },
    { rejectWithValue }
  ) => {
    try {
      const asset = await assetService.updateAssetStatus(id, assetDataStatus);
      return asset;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update asset Status"
      );
    }
  }
);

// ✅ FIXED: Now accepts ID and calls service correctly
export const fetchAssetStatusLog = createAsyncThunk(
  "assets/statusLog",
  async (id: string, { rejectWithValue }) => {
    try {
      const assetsLog = await assetService.fetchAssetStatusLog(id);
      return assetsLog;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch asset logs"
      );
    }
  }
);

export const deleteAssetStatus = createAsyncThunk(
  "assets/deleteAssetStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      await assetService.deleteAssetStatus(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete asset status"
      );
    }
  }
);

export const batchDeleteAsset = createAsyncThunk(
  "assets/batchDeleteAsset",
  async (ids: string[], { rejectWithValue }) => {
    try {
      await assetService.batchDeleteAsset(ids);
      return ids;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete Asset"
      );
    }
  }
);

export const fetchDeleteAsset = createAsyncThunk(
  "assets/fetchDeleteAsset",
  async (_, { rejectWithValue }) => {
    try {
      const assets = await assetService.fetchDeleteAsset();
      return assets;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch Delete assets "
      );
    }
  }
);

export const restoreAssetData = createAsyncThunk(
  "assets/restoreAssetData",
  async (
    {
      id,
    }: {
      id: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const asset = await assetService.restoreAssetData(id);
      return asset;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to restore asset Data"
      );
    }
  }
);

export const updateAssetLogDuration = createAsyncThunk(
  "assets/updateAssetLogDuration",
  async (id: string, { rejectWithValue }) => {
    try {
      await assetService.updateAssetLogDuration(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update asset log duration"
      );
    }
  }
);

// --- Filter Data ---

export const fetchFilterData = createAsyncThunk(
  "assets/fetchFilterData",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    console.log("🟡 DEBUG: Fetching Asset Filter Data");
    console.log("Current State:", state.assets);

    // ✅ Check if data already exists in Redux
    if (state.assets?.filterData) {
      console.log("🟡 Asset filter data already exists in Redux. Skipping API calls.");
      return state.assets.filterData;
    }

    try {
      console.log("🔵 Fetching all asset filter data in parallel...");

      const [
        locationsRes,
        partsRes,
        vendorsRes,
        categoriesRes,
        teamsRes,
        assetTypesRes,
        manufacturersRes,
        proceduresRes
      ] = await Promise.all([
        locationService.fetchLocationsName(),
        partService.fetchPartsName(),
        vendorService.fetchVendorName(),
        categoryService.fetchCategories(),
        teamService.fetchTeamsName(),
        assetService.fetchAssetType(),
        assetService.fetchAssetManufacturer(),
        procedureService.fetchProcedures()
      ]);

      // Helper to format data uniformly
      const format = (res: any, type: string) => {
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        return list.map((item: any) => ({
          id: item.id,
          name: item.name || item.fullName || item.title || `Unnamed ${type}`,
          image: item.image || item.avatarUrl || null
        }));
      };

      const data: FilterData = {
        locations: format(locationsRes, "Location"),
        parts: format(partsRes, "Part"),
        vendors: format(vendorsRes, "Vendor"),
        categories: format(categoriesRes, "Category"),
        teams: format(teamsRes, "Team"),
        assetTypes: format(assetTypesRes, "Asset Type"),
        manufacturers: format(manufacturersRes, "Manufacturer"),
        procedures: format(proceduresRes, "Procedure")
      };

      console.log("🟢 All asset filter data fetched successfully");
      return data;

    } catch (error: any) {
      console.error("❌ Error fetching asset filter data:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch filter data");
    }
  }
);
