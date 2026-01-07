import { createAsyncThunk } from "@reduxjs/toolkit";

import { automationService } from "./automations.service";
import type {
  CreateAutomationData,
  UpdateAutomationData,
} from "./automations.types";

export const fetchAutomations = createAsyncThunk(
  "automations/fetchAutomations",
  async (_, { rejectWithValue }) => {
    try {
      const automations = await automationService.fetchAutomations();
      return automations;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch automations"
      );
    }
  }
);

export const fetchAutomationById = createAsyncThunk(
  "automations/fetchAutomationById",
  async (id: string, { rejectWithValue }) => {
    try {
      const automation = await automationService.fetchAutomationById(id);
      return automation;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch automation"
      );
    }
  }
);

export const createAutomation = createAsyncThunk(
  "automations/createAutomation",
  async (automationData: CreateAutomationData, { rejectWithValue }) => {
    try {
      const automation = await automationService.createAutomation(
        automationData
      );
      return automation;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create automation"
      );
    }
  }
);

export const updateAutomation = createAsyncThunk(
  "automations/updateAutomation",
  async (
    {
      id,
      automationData,
    }: {
      id: string;
      automationData: UpdateAutomationData;
    },
    { rejectWithValue }
  ) => {
    try {
      const automation = await automationService.updateAutomation(
        id,
        automationData
      );
      return automation;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update automation"
      );
    }
  }
);

export const deleteAutomation = createAsyncThunk(
  "automations/deleteAutomation",
  async (id: string, { rejectWithValue }) => {
    try {
      await automationService.deleteAutomation(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete automation"
      );
    }
  }
);

export const switchAutomation = createAsyncThunk(
  "automations/switchAutomation",
  async (id: string, { rejectWithValue }) => {
    try {
      await automationService.switchAutomation(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to switch automation"
      );
    }
  }
);
