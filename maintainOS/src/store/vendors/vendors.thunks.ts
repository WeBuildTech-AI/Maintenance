import { createAsyncThunk } from "@reduxjs/toolkit";
import { vendorService } from "./vendors.service";
import type { Contact, FetchVendorsParams } from "./vendors.types";

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
  async (data: FormData, { rejectWithValue }) => {
    try {
      return await vendorService.createVendor(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create vendor"
      );
    }
  }
);

// ✅ Update Vendor Thunk
export const updateVendor = createAsyncThunk(
  "vendors/updateVendor",
  async ({ id, data }: { id: string; data: FormData }, { rejectWithValue }) => {
    try {
      return await vendorService.updateVendor(id, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update vendor"
      );
    }
  }
);

export const createVendorContact = createAsyncThunk(
  "vendors/createVendorContact",
  async (
    { vendorId, contactData }: { vendorId: string; contactData: Contact },
    { rejectWithValue }
  ) => {
    try {
      return await vendorService.createVendorContact(vendorId, contactData);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create contact"
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
      contactData,
    }: { vendorId: string; contactId: string; contactData: Contact },
    { rejectWithValue }
  ) => {
    try {
      return await vendorService.updateVendorContact(
        vendorId,
        contactId,
        contactData
      );
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update contact"
      );
    }
  }
);

export const deleteVendor = createAsyncThunk(
  "vendors/deleteVendor",
  async (ids: string[], { rejectWithValue }) => {
    try {
      await vendorService.batchDeleteVendor(ids);
      return ids[0]; // Returning first ID for single delete logic compatibility if needed
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete vendor"
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
  "vendors/updateVendorContactData",
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
      return await vendorService.fetchDeleteVendor();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch Delete Vendor "
      );
    }
  }
);

export const restoreVendorData = createAsyncThunk(
  "vendor/restoreVendorData",
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      await vendorService.restoreVendorData(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to restore vendor"
      );
    }
  }
);