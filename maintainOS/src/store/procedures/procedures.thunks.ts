import { createAsyncThunk } from "@reduxjs/toolkit";

import { procedureService } from "./procedures.service";
import type {
  CreateProcedureData,
  UpdateProcedureData,
  FetchProceduresParams, // ✅ Imported
  FilterData // ✅ Imported
} from "./procedures.types";
import { locationService } from "../locations/locations.service";
import { assetService } from "../assets/assets.service";
import { categoryService } from "../categories/categories.service";
import { teamService } from "../teams/teams.service";
import type { RootState } from "../index";

// ✅ Updated to accept params
export const fetchProcedures = createAsyncThunk(
  "procedures/fetchProcedures",
  async (params: FetchProceduresParams | undefined, { rejectWithValue }) => {
    try {
      const procedures = await procedureService.fetchProcedures(params);
      return procedures;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch procedures"
      );
    }
  }
);

export const fetchProcedureById = createAsyncThunk(
  "procedures/fetchProcedureById",
  async (id: string, { rejectWithValue }) => {
    try {
      const procedure = await procedureService.fetchProcedureById(id);
      return procedure;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch procedure"
      );
    }
  }
);

export const createProcedure = createAsyncThunk(
  "procedures/createProcedure",
  async (procedureData: CreateProcedureData, { rejectWithValue }) => {
    try {
      const procedure = await procedureService.createProcedure(procedureData);
      return procedure;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create procedure"
      );
    }
  }
);

export const updateProcedure = createAsyncThunk(
  "procedures/updateProcedure",
  async (
    {
      id,
      procedureData,
    }: {
      id: string;
      procedureData: UpdateProcedureData;
    },
    { rejectWithValue }
  ) => {
    try {
      const procedure = await procedureService.updateProcedure(
        id,
        procedureData
      );
      return procedure;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update procedure"
      );
    }
  }
);

export const deleteProcedure = createAsyncThunk(
  "procedures/deleteProcedure",
  async (id: string, { rejectWithValue }) => {
    try {
      await procedureService.deleteProcedure(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete procedure"
      );
    }
  }
);

export const duplicateProcedure = createAsyncThunk(
  "procedures/duplicateProcedure",
  async (id: string, { rejectWithValue }) => {
    try {
      const newProcedure = await procedureService.duplicateProcedure(id);
      return newProcedure;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to duplicate procedure"
      );
    }
  }
);

export const batchDeleteProcedures = createAsyncThunk(
  "procedures/batchDeleteProcedures",
  async (ids: string[], { rejectWithValue }) => {
    try {
      await procedureService.batchDeleteProcedures(ids);
      return ids;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete procedures"
      );
    }
  }
);

export const fetchDeletedProcedures = createAsyncThunk(
  "procedures/fetchDeletedProcedures",
  async (_, { rejectWithValue }) => {
    try {
      const procedures = await procedureService.fetchDeletedProcedures();
      return procedures;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch deleted procedures"
      );
    }
  }
);

export const restoreProcedure = createAsyncThunk(
  "procedures/restoreProcedure",
  async (id: string, { rejectWithValue }) => {
    try {
      await procedureService.restoreProcedure(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to restore procedure"
      );
    }
  }
);

// --- Filter Data ---

export const fetchFilterData = createAsyncThunk(
  "procedures/fetchFilterData",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;

    // ✅ Check if data already exists in Redux
    if (state.procedures.filterData) {
      console.log("🟡 Filter data already exists in Redux. Skipping API calls.");
      return state.procedures.filterData;
    }

    try {
      console.log("🔵 Fetching procedure filter data in parallel...");

      const [
        locationsRes,
        assetsRes,
        categoriesRes,
        teamsRes,
        usersRes,
        vendorsRes
      ] = await Promise.all([
        locationService.fetchLocationsName(),
        assetService.fetchAssetsName(),
        categoryService.fetchCategories(),
        teamService.fetchTeamsName(),
        // Fetch users/vendors too if likely needed in future, or just empty
        Promise.resolve([]), // userService if needed
        Promise.resolve([])  // vendorService if needed
      ]);

      // Helper to format data uniformly
      const format = (res: any, type: string) => {
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        return list.map((item: any) => ({
          id: item.id,
          name: item.name || item.fullName || item.procedureName || item.title || `Unnamed ${type}`,
          image: item.image || item.avatarUrl || null
        }));
      };

      const data: FilterData = {
        locations: format(locationsRes, "Location"),
        assets: format(assetsRes, "Asset"),
        categories: format(categoriesRes, "Category"),
        teams: format(teamsRes, "Team"),
        users: format(usersRes, "User"),
        vendors: format(vendorsRes, "Vendor"),
      };

      console.log("🟢 All procedure filter data fetched successfully");
      return data;

    } catch (error: any) {
      console.error("❌ Error fetching procedure filter data:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch filter data");
    }
  }
);