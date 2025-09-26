import { createAsyncThunk } from "@reduxjs/toolkit";

import { vendorService } from "./vendors.service";
import type { CreateVendorData, UpdateVendorData } from "./vendors.types";

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
