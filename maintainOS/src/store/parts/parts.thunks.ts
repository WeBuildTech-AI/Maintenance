// src/store/parts/parts.thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { partService } from "./parts.service";
import type { CreatePartPayload, UpdatePartPayload, RestockThunkArgs } from "./parts.types";

export const fetchParts = createAsyncThunk(
  "parts/fetchParts",
  async (params: any, { rejectWithValue }) => {
    try {
      const parts = await partService.fetchParts(params);
      return parts;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch parts"
      );
    }
  }
);

export const fetchPartById = createAsyncThunk(
  "parts/fetchPartById",
  async (id: string, { rejectWithValue }) => {
    try {
      const part = await partService.fetchPartById(id);
      return part;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch part"
      );
    }
  }
);

export const createPart = createAsyncThunk(
  "parts/createPart",
  async (partData: CreatePartPayload, { rejectWithValue }) => {
    try {
      const part = await partService.createPart(partData);
      return part;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create part"
      );
    }
  }
);

export const updatePart = createAsyncThunk(
  "parts/updatePart",
  async (
    { id, partData }: { id: string; partData: UpdatePartPayload },
    { rejectWithValue }
  ) => {
    try {
      const part = await partService.updatePart(id, partData);
      return part;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update part"
      );
    }
  }
);

export const deletePart = createAsyncThunk(
  "parts/deletePart",
  async (id: string, { rejectWithValue }) => {
    try {
      await partService.deletePart(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete part"
      );
    }
  }
);

export const fetchPartsName = createAsyncThunk(
  "parts/fetchPartsName", 
  async (_, { rejectWithValue }) => {
    try {
      const parts = await partService.fetchPartsName();
      return parts;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch parts"
      );
    }
  }
);

export const restockPart = createAsyncThunk(
  "parts/restockPart",
  async (payload: RestockThunkArgs, { rejectWithValue }) => {
    try {
      const updated = await partService.restockPart(payload.partId, payload);
      return updated;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to restock part"
      );
    }
  }
);

export const getAllRestockLogs = createAsyncThunk(
  "parts/getAllRestockLogs",
  async ({ partId }: { partId: string }, { rejectWithValue }) => {
    try {
      const logs = await partService.getAllRestockLogs(partId);
      return logs;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch restock logs"
      );
    }
  }
);

export const getRestockLogById = createAsyncThunk(
  "parts/getRestockLogById",
  async ({ logId }: { logId: string }, { rejectWithValue }) => {
    try {
      const log = await partService.getRestockLogById(logId);
      return log;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch restock log"
      );
    }
  }
);

export const batchDeletePart = createAsyncThunk(
  "part/batchDeletePart",
  async (ids: string[], { rejectWithValue }) => {
    try {
      await partService.batchDeletePart(ids);
      return ids;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete Parts"
      );
    }
  }
);

export const fetchDeletePart = createAsyncThunk(
  "parts/fetchDeletePart",
  async (_, { rejectWithValue }) => {
    try {
      const assets = await partService.fetchDeletePart();
      return assets;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch Deleted Parts"
      );
    }
  }
);

export const restorePartData = createAsyncThunk(
  "part/restorePartData",
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      const asset = await partService.restorePartData(id);
      return asset;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to restore Part Data"
      );
    }
  }
);

// ✅ FETCH PART LOGS
export const fetchPartLogs = createAsyncThunk(
  "parts/fetchPartLogs",
  async (partId: string, { rejectWithValue }) => {
    try {
      const logs = await partService.fetchPartLogs(partId);
      return logs;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch part logs"
      );
    }
  }
);