import { createAsyncThunk } from "@reduxjs/toolkit";
import { locationService } from "./locations.service";
import type { FetchLocationsParams } from "./locations.types"; // ✅ Imported

// ✅ Updated to accept params
export const fetchLocations = createAsyncThunk(
  "locations/fetchLocations",
  async (
    params: FetchLocationsParams | undefined,
    { rejectWithValue }
  ) => {
    try {
      const locations = await locationService.fetchLocations(params);
      return locations;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch locations"
      );
    }
  }
);

export const fetchLocationsName = createAsyncThunk(
  "locations/fetchLocationsName",
  async (_, { rejectWithValue }) => {
    try {
      const locations = await locationService.fetchLocationsName();
      return locations;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch locations"
      );
    }
  }
);
export const fetchParentLocations = createAsyncThunk(
  "locations/fetchParentLocations",
  async (_, { rejectWithValue }) => {
    try {
      const locations = await locationService.fetchParentLocations();
      return locations;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch Parent locations"
      );
    }
  }
);

export const fetchLocationById = createAsyncThunk(
  "locations/fetchLocationById",
  async (id: string, { rejectWithValue }) => {
    try {
      const location = await locationService.fetchLocationById(id);
      return location;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch location"
      );
    }
  }
);

export const createLocation = createAsyncThunk(
  "locations/createLocation",
  async (locationData: FormData, { rejectWithValue }) => {
    try {
      const location = await locationService.createLocation(locationData);
      return location;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create location"
      );
    }
  }
);

export const updateLocation = createAsyncThunk(
  "locations/updateLocation",
  async (
    {
      id,
      locationData,
    }: {
      id: string;
      locationData: FormData;
    },
    { rejectWithValue }
  ) => {
    try {
      const location = await locationService.updateLocation(id, locationData);
      return location;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update location"
      );
    }
  }
);

export const deleteLocation = createAsyncThunk(
  "locations/deleteLocation",
  async (id: string, { rejectWithValue }) => {
    try {
      await locationService.deleteLocation(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete location"
      );
    }
  }
);

export const batchDeleteLocation = createAsyncThunk(
  "locations/batchDeleteLocations",
  async (ids: string[], { rejectWithValue }) => {
    try {
      await locationService.batchDeleteLocation(ids);
      return ids;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete Location"
      );
    }
  }
);

export const fetchDeleteLocation = createAsyncThunk(
  "location/fetchDeleteLocation",
  async (_, { rejectWithValue }) => {
    try {
      const assets = await locationService.fetchDeleteLocation();
      return assets;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch Delete assets "
      );
    }
  }
);

// ✅ Imported vendor/team services
import { vendorService } from "../vendors/vendors.service";
import { teamService } from "../teams/teams.service";
import { assetService } from "../assets/assets.service";
import { partService } from "../parts/parts.service";
import { procedureService } from "../procedures/procedures.service";
import { userService } from "../users/users.service";
import type { RootState } from "../index";
import type { FilterData } from "./locations.types";

export const restoreLocationData = createAsyncThunk(
  "location/restoreLocationData",
  async (
    {
      id,
    }: {
      id: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const asset = await locationService.restoreLocationData(id);
      return asset;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to restore Location Data"
      );
    }
  }
);

// ✅ Add fetchFilterData Thunk
export const fetchFilterData = createAsyncThunk(
  "locations/fetchFilterData",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;

    if (state.locations.filterData) {
      console.log("🟡 Filter data already exists in Redux (Locations). Skipping API calls.");
      return state.locations.filterData;
    }

    try {
      console.log("🔵 Fetching Location Form filter data...");
      const [teamsRes, vendorsRes, parentsRes, usersRes, assetsRes, partsRes, proceduresRes] = await Promise.all([
        teamService.fetchTeamsName(),
        vendorService.fetchVendorName(),
        locationService.fetchParentLocations(),
        userService.fetchUserSummary(),
        assetService.fetchAssetsName(),
        partService.fetchPartsName(),
        procedureService.fetchProcedures(),
      ]);

      const format = (res: any) => {
        const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        return list.map((item: any) => ({
          id: item.id,
          name: item.name || item.fullName || item.title || item.procedureName || `Unnamed`,
        }));
      };

      const data: FilterData = {
        teams: format(teamsRes),
        vendors: format(vendorsRes),
        parents: format(parentsRes),
        users: format(usersRes),
        assets: format(assetsRes),
        parts: format(partsRes),
        procedures: format(proceduresRes),
      };

      return data;
    } catch (error: any) {
      console.error("❌ Error fetching location filter data:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch filter data");
    }
  }
);