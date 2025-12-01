import { createAsyncThunk } from "@reduxjs/toolkit";
import { locationService } from "./locations.service";
import { FetchLocationsParams } from "./locations.types"; // ✅ Imported

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