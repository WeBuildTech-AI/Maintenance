import { createAsyncThunk } from "@reduxjs/toolkit";
import { vendorService } from "./vendors.service";
import type { Contact, FetchVendorsParams } from "./vendors.types";

// ✅ Updated to accept params
export const fetchVendors = createAsyncThunk(
  "vendors/fetchVendors",
  async (params: FetchVendorsParams | undefined, { rejectWithValue }) => {
    try {
      return await vendorService.fetchVendors(params);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch vendors"
      );
    }
  }
);

export const fetchVendorName = createAsyncThunk(
  "vendors/fetchVendorName",
  async (_, { rejectWithValue }) => {
    try {
      return await vendorService.fetchVendorName();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch vendor names"
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
  async (vendorData: FormData, { rejectWithValue }) => {
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
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
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

export const updateVendorContact = createAsyncThunk(
  "vendors/updateVendorContact",
  async (
    {
      vendorId,
      contactId,
      data,
    }: { vendorId: string; contactId: string; data: Contact },
    { rejectWithValue }
  ) => {
    try {
      return await vendorService.updateVendorContact(vendorId, contactId, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update contact"
      );
    }
  }
);

export const batchDeleteVendor = createAsyncThunk(
  "vendor/batchDeleteVendor",
  async (ids: string[], { rejectWithValue }) => {
    try {
      await vendorService.batchDeleteVendor(ids);
      return ids;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete Vendor"
      );
    }
  }
);

export const fetchVendorContact = createAsyncThunk(
  "vendors/fetchVendorContact",
  async (id: string, { rejectWithValue }) => {
    try {
      return await vendorService.fetchVendorContact(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch vendor contact"
      );
    }
  }
);

export const updateVendorContactData = createAsyncThunk(
  "vendors/updateVendorContact",
  async (
    { vendorId, contactId }: { vendorId: string; contactId: string[] },
    { rejectWithValue }
  ) => {
    try {
      return await vendorService.fetchVendorContactData(vendorId, contactId);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update contact Data"
      );
    }
  }
);

export const fetchDeleteVendor = createAsyncThunk(
  "vendor/fetchDeleteVendor",
  async (_, { rejectWithValue }) => {
    try {
      const assets = await vendorService.fetchDeleteVendor();
      return assets;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch Delete Vendor "
      );
    }
  }
);

export const restoreVendorData = createAsyncThunk(
  "vendor/restoreVendorData",
  async (
    {
      id,
    }: {
      id: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const asset = await vendorService.restoreVendorData(id);
      return asset;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to restore Vendor Data"
      );
    }
  }
);