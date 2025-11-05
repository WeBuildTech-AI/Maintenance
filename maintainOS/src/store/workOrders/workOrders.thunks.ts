import { createAsyncThunk } from "@reduxjs/toolkit";
import { workOrderService } from "./workOrders.service";
import type {
  AddWorkOrderCommentData,
  AssignWorkOrderData,
  CreateWorkOrderData,
  UpdateWorkOrderData,
  CreateOtherCostData,
  CreateTimeEntryData, // ✅ added
} from "./workOrders.types";

export const fetchWorkOrders = createAsyncThunk(
  "workOrders/fetchWorkOrders",
  async (_, { rejectWithValue }) => {
    try {
      return await workOrderService.fetchWorkOrders();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch work orders"
      );
    }
  }
);

export const fetchWorkOrderById = createAsyncThunk(
  "workOrders/fetchWorkOrderById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await workOrderService.fetchWorkOrderById(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch work order"
      );
    }
  }
);

export const createWorkOrder = createAsyncThunk(
  "workOrders/create",
  async (data: CreateWorkOrderData, { rejectWithValue }) => {
    try {
      return await workOrderService.createWorkOrder(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create work order"
      );
    }
  }
);

// ✅ UPDATED: includes authorId parameter in URL
export const updateWorkOrder = createAsyncThunk(
  "workOrders/update",
  async (
    {
      id,
      authorId,
      data,
    }: { id: string; authorId: string; data: UpdateWorkOrderData },
    { rejectWithValue }
  ) => {
    try {
      return await workOrderService.updateWorkOrder(id, authorId, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update work order"
      );
    }
  }
);

export const deleteWorkOrder = createAsyncThunk(
  "workOrders/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      return await workOrderService.deleteWorkOrder(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete work order"
      );
    }
  }
);

export const assignWorkOrder = createAsyncThunk(
  "workOrders/assign",
  async (
    { id, data }: { id: string; data: AssignWorkOrderData },
    { rejectWithValue }
  ) => {
    try {
      return await workOrderService.assignWorkOrder(id, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to assign work order"
      );
    }
  }
);

export const addWorkOrderComment = createAsyncThunk(
  "workOrders/addComment",
  async (
    { id, data }: { id: string; data: AddWorkOrderCommentData },
    { rejectWithValue }
  ) => {
    try {
      return await workOrderService.addWorkOrderComment(id, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add comment"
      );
    }
  }
);

export const markWorkOrderCompleted = createAsyncThunk(
  "workOrders/markCompleted",
  async (id: string, { rejectWithValue }) => {
    try {
      return await workOrderService.markCompleted(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to mark work order as completed"
      );
    }
  }
);

export const markWorkOrderInProgress = createAsyncThunk(
  "workOrders/markInProgress",
  async (id: string, { rejectWithValue }) => {
    try {
      return await workOrderService.markInProgress(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to mark work order as in progress"
      );
    }
  }
);

export const addOtherCost = createAsyncThunk(
  "workOrders/addOtherCost",
  async (
    { id, data }: { id: string; data: CreateOtherCostData },
    { rejectWithValue }
  ) => {
    try {
      return await workOrderService.addOtherCost(id, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add other cost"
      );
    }
  }
);

export const deleteOtherCost = createAsyncThunk(
  "workOrders/deleteOtherCost",
  async (
    { id, costId }: { id: string; costId: string },
    { rejectWithValue }
  ) => {
    try {
      await workOrderService.deleteOtherCost(id, costId);
      return { id, costId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete other cost"
      );
    }
  }
);

// ✅ ADD TIME ENTRY
export const addTimeEntry = createAsyncThunk(
  "workOrders/addTimeEntry",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const payload = {
        items: [
          {
            userId: data.userId,
            totalMinutes: data.totalMinutes,
            entryType: data.entryType?.toLowerCase() || "work", // ✅ FIXED HERE
            rate: Number(data.rate || 0),
          },
        ],
      };
      const res = await workOrdersService.addTimeEntry(id, payload);
      return res;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ DELETE TIME ENTRY
export const deleteTimeEntry = createAsyncThunk(
  "workOrders/deleteTimeEntry",
  async (
    { id, entryId }: { id: string; entryId: string },
    { rejectWithValue }
  ) => {
    try {
      await workOrderService.deleteTimeEntry(id, entryId);
      return { id, entryId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete time entry"
      );
    }
  }
);
