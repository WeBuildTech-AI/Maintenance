import { createAsyncThunk } from "@reduxjs/toolkit";

import { locationService } from "./locations.service";
import type {
  CreateLocationData,
  UpdateLocationData,
} from "./locations.types";

export const fetchLocations = createAsyncThunk(
  "locations/fetchLocations",
  async (_, { rejectWithValue }) => {
    try {
      const locations = await locationService.fetchLocations(10,1,0);
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
  async (locationData: CreateLocationData, { rejectWithValue }) => {
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
      locationData: UpdateLocationData;
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
