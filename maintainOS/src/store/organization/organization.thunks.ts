import { createAsyncThunk } from "@reduxjs/toolkit";

import { organizationService } from "./organization.service";
import type {
  CreateOrganizationData,
  UpdateOrganizationData,
} from "./organization.types";

export const fetchOrganizations = createAsyncThunk(
  "organizations/fetchOrganizations",
  async (_, { rejectWithValue }) => {
    try {
      const organizations = await organizationService.fetchOrganizations();
      return organizations;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch organizations"
      );
    }
  }
);

export const fetchOrganizationById = createAsyncThunk(
  "organizations/fetchOrganizationById",
  async (id: string, { rejectWithValue }) => {
    try {
      const organization = await organizationService.fetchOrganizationById(id);
      return organization;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch organization"
      );
    }
  }
);

export const createOrganization = createAsyncThunk(
  "organizations/createOrganization",
  async (organizationData: CreateOrganizationData, { rejectWithValue }) => {
    try {
      const organization = await organizationService.createOrganization(
        organizationData
      );
      return organization;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create organization"
      );
    }
  }
);

export const updateOrganization = createAsyncThunk(
  "organizations/updateOrganization",
  async (
    {
      id,
      organizationData,
    }: {
      id: string;
      organizationData: UpdateOrganizationData;
    },
    { rejectWithValue }
  ) => {
    try {
      const organization = await organizationService.updateOrganization(
        id,
        organizationData
      );
      return organization;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update organization"
      );
    }
  }
);

export const deleteOrganization = createAsyncThunk(
  "organizations/deleteOrganization",
  async (id: string, { rejectWithValue }) => {
    try {
      await organizationService.deleteOrganization(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete organization"
      );
    }
  }
);
