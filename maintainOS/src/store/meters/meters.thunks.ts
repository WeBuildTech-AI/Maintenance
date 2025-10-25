import { createAsyncThunk } from "@reduxjs/toolkit";

import { meterService } from "./meters.service";
import type {
  CreateMeterData,
  UpdateMeterData,
} from "./meters.types";

export const fetchMeters = createAsyncThunk(
  "meters/fetchMeters",
  async (_, { rejectWithValue }) => {
    try {
      const meters = await meterService.fetchMeters();
      return meters;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch meters"
      );
    }
  }
);

export const fetchMeterById = createAsyncThunk(
  "meters/fetchMeterById",
  async (id: string, { rejectWithValue }) => {
    try {
      const meter = await meterService.fetchMeterById(id);
      return meter;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch meter"
      );
    }
  }
);

export const createMeter = createAsyncThunk(
  "meters/createMeter",
  async (meterData: CreateMeterData, { rejectWithValue }) => {
    try {
      const meter = await meterService.createMeter(meterData);
      return meter;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create meter"
      );
    }
  }
);

export const fetchMeasurementUnit = createAsyncThunk(
  "measurement",
  async (_, { rejectWithValue }) => {
    try {
      const meter = await meterService.fetchMesurementUnit();
      return meter;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch meter"
      );
    }
  }
);

export const updateMeter = createAsyncThunk(
  "meters/updateMeter",
  async (
    {
      id,
      meterData,
    }: {
      id: string;
      meterData: UpdateMeterData;
    },
    { rejectWithValue }
  ) => {
    try {
      const meter = await meterService.updateMeter(id, meterData);
      return meter;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update meter"
      );
    }
  }
);

export const deleteMeter = createAsyncThunk(
  "meters/deleteMeter",
  async (id: string, { rejectWithValue }) => {
    try {
      await meterService.deleteMeter(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete meter"
      );
    }
  }
);



