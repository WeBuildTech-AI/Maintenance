import { createAsyncThunk } from "@reduxjs/toolkit";
import { workOrderService } from "./workOrders.service";
import type {
  AddWorkOrderCommentData,
  AssignWorkOrderData,
  CreateWorkOrderData,
  UpdateWorkOrderData,
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
  "workOrders/createWorkOrder",
  async (workOrderData: CreateWorkOrderData, { rejectWithValue }) => {
    try {
      return await workOrderService.createWorkOrder(workOrderData);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create work order"
      );
    }
  }
);

// ✅ PATCH call using FormData
export const updateWorkOrder = createAsyncThunk(
  "workOrders/updateWorkOrder",
  async (
    { id, data }: { id: string; data: UpdateWorkOrderData },
    { rejectWithValue }
  ) => {
    try {
      return await workOrderService.updateWorkOrder(id, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update work order"
      );
    }
  }
);

export const deleteWorkOrder = createAsyncThunk(
  "workOrders/deleteWorkOrder",
  async (id: string, { rejectWithValue }) => {
    try {
      await workOrderService.deleteWorkOrder(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete work order"
      );
    }
  }
);

export const assignWorkOrder = createAsyncThunk(
  "workOrders/assignWorkOrder",
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
      return await workOrderService.addComment(id, data);
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
