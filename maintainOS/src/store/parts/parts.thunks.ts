import { createAsyncThunk } from "@reduxjs/toolkit";
import { partService } from "./parts.service";
import type { RestockThunkArgs } from "./parts.types";

export const fetchParts = createAsyncThunk(
  "parts/fetchParts",
  async (_, { rejectWithValue }) => {
    try {
      const parts = await partService.fetchParts();
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
  async (partData: FormData, { rejectWithValue }) => {
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
    { id, partData }: { id: string; partData: FormData },
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
  "parts/fetchParts",
  async (_, { rejectWithValue }) => {
    try {
      const parts = await partService.fetchPartsName;
      return parts;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch parts"
      );
    }
  }
);

// ✅ RESTOCK PART THUNK
// export const restockPart = createAsyncThunk(
//   "parts/restockPart",
//   async (
//     {
//       partId,
//       locationId,
//       addedUnits,
//     }: { partId: string; locationId: string; addedUnits: number },
//     { rejectWithValue }
//   ) => {
//     try {
//       const updated = await partService.restockPart(partId, locationId, addedUnits);
//       return updated;
//     } catch (error: any) {
//       return rejectWithValue(
//         error.response?.data?.message || "Failed to restock part"
//       );
//     }
//   }
// );

export const restockPart = createAsyncThunk(
  "parts/restockPart",
  async (
    payload: RestockThunkArgs, 
    { rejectWithValue }
  ) => {
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
  async (
    { partId }: { partId: string },
    { rejectWithValue }
  ) => {
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
  async (
    { logId }: { logId: string },
    { rejectWithValue }
  ) => {
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
        error.response?.data?.message || "Failed to delete Part"
      );
    }
  }
);