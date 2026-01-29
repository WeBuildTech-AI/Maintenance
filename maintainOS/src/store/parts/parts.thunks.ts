import { createAsyncThunk } from "@reduxjs/toolkit";
import { partService } from "./parts.service";
import type { CreatePartPayload, UpdatePartPayload, RestockThunkArgs, FilterData } from "./parts.types";
import { locationService } from "../locations/locations.service";
import { assetService } from "../assets/assets.service";
import { vendorService } from "../vendors/vendors.service";
import { teamService } from "../teams/teams.service";
import type { RootState } from "../index";

export const fetchParts = createAsyncThunk(
  "parts/fetchParts",
  async (params: any, { rejectWithValue }) => {
    try {
      const parts = await partService.fetchParts(params);
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
  async (partData: CreatePartPayload, { rejectWithValue }) => {
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
    { id, partData }: { id: string; partData: UpdatePartPayload },
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

export const fetchPartsName = createAsyncThunk(
  "parts/fetchPartsName",
  async (_, { rejectWithValue }) => {
    try {
      const parts = await partService.fetchPartsName();
      return parts;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch parts"
      );
    }
  }
);

export const restockPart = createAsyncThunk(
  "parts/restockPart",
  async (payload: RestockThunkArgs, { rejectWithValue }) => {
    try {
      const updated = await partService.restockPart(payload.partId, payload);
      return updated;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to restock part"
      );
    }
  }
);

export const getAllRestockLogs = createAsyncThunk(
  "parts/getAllRestockLogs",
  async ({ partId }: { partId: string }, { rejectWithValue }) => {
    try {
      const logs = await partService.getAllRestockLogs(partId);
      return logs;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch restock logs"
      );
    }
  }
);

export const getRestockLogById = createAsyncThunk(
  "parts/getRestockLogById",
  async ({ logId }: { logId: string }, { rejectWithValue }) => {
    try {
      const log = await partService.getRestockLogById(logId);
      return log;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch restock log"
      );
    }
  }
);

export const batchDeletePart = createAsyncThunk(
  "part/batchDeletePart",
  async (ids: string[], { rejectWithValue }) => {
    try {
      await partService.batchDeletePart(ids);
      return ids;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete Parts"
      );
    }
  }
);

export const fetchDeletePart = createAsyncThunk(
  "parts/fetchDeletePart",
  async (_, { rejectWithValue }) => {
    try {
      const assets = await partService.fetchDeletePart();
      return assets;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch Deleted Parts"
      );
    }
  }
);

export const restorePartData = createAsyncThunk(
  "part/restorePartData",
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      const asset = await partService.restorePartData(id);
      return asset;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to restore Part Data"
      );
    }
  }
);

// ✅ FETCH PART LOGS
export const fetchPartLogs = createAsyncThunk(
  "parts/fetchPartLogs",
  async (partId: string, { rejectWithValue }) => {
    try {
      const logs = await partService.fetchPartLogs(partId);
      return logs;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch part logs"
      );
    }
  }
);

// --- Filter Data ---

export const fetchFilterData = createAsyncThunk(
  "parts/fetchFilterData",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;

    // ✅ Check if data already exists in Redux
    if (state.parts?.filterData) {
      console.log("🟡 Parts filter data already exists in Redux. Skipping API calls.");
      return state.parts.filterData;
    }

    try {
      console.log("🔵 Fetching all parts filter data in parallel...");

      const [
        locationsRes,
        assetsRes,
        vendorsRes,
        teamsRes
      ] = await Promise.all([
        locationService.fetchLocationsName(),
        assetService.fetchAssetsName(),
        vendorService.fetchVendorName(),
        teamService.fetchTeamsName()
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
        assets: format(assetsRes, "Asset"),
        vendors: format(vendorsRes, "Vendor"),
        teams: format(teamsRes, "Team")
      };

      console.log("🟢 All parts filter data fetched successfully");
      return data;

    } catch (error: any) {
      console.error("❌ Error fetching parts filter data:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch filter data");
    }
  }
);