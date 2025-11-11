import { createAsyncThunk } from "@reduxjs/toolkit";

import { procedureService } from "./procedures.service";
import type {
  CreateProcedureData,
  UpdateProcedureData,
} from "./procedures.types";

export const fetchProcedures = createAsyncThunk(
  "procedures/fetchProcedures",
  async (_, { rejectWithValue }) => {
    try {
      const procedures = await procedureService.fetchProcedures();
      return procedures;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch procedures"
      );
    }
  }
);

export const fetchProcedureById = createAsyncThunk(
  "procedures/fetchProcedureById",
  async (id: string, { rejectWithValue }) => {
    try {
      const procedure = await procedureService.fetchProcedureById(id);
      return procedure;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch procedure"
      );
    }
  }
);

export const createProcedure = createAsyncThunk(
  "procedures/createProcedure",
  async (procedureData: CreateProcedureData, { rejectWithValue }) => {
    try {
      const procedure = await procedureService.createProcedure(procedureData);
      return procedure;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create procedure"
      );
    }
  }
);

export const updateProcedure = createAsyncThunk(
  "procedures/updateProcedure",
  async (
    {
      id,
      procedureData,
    }: {
      id: string;
      procedureData: UpdateProcedureData;
    },
    { rejectWithValue }
  ) => {
    try {
      const procedure = await procedureService.updateProcedure(
        id,
        procedureData
      );
      return procedure;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update procedure"
      );
    }
  }
);

export const deleteProcedure = createAsyncThunk(
  "procedures/deleteProcedure",
  async (id: string, { rejectWithValue }) => {
    try {
      await procedureService.deleteProcedure(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete procedure"
      );
    }
  }
);