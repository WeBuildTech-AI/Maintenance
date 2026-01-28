import { createAsyncThunk } from "@reduxjs/toolkit";
import { workOrderService } from "./workOrders.service";
import type {
  AssignWorkOrderData,
  CreateWorkOrderData,
  UpdateWorkOrderData,
  CreateOtherCostData,
  AddCommentPayload,
  CreateFieldResponseData,
  CreatePartUsageData,
  FetchWorkOrdersParams,
  CreateTimeEntryData,
  FilterData
} from "./workOrders.types";

import { locationService } from "../locations/locations.service";
import { partService } from "../parts/parts.service";
import { assetService } from "../assets/assets.service";
import { vendorService } from "../vendors/vendors.service";
import { procedureService } from "../procedures/procedures.service";
import { userService } from "../users/users.service";
import { categoryService } from "../categories/categories.service";
import { teamService } from "../teams/teams.service";
import { meterService } from "../meters/meters.service";
import type { RootState } from "../index";

// --- Work Orders ---

export const fetchWorkOrders = createAsyncThunk(
  "workOrders/fetchWorkOrders",
  async (params: FetchWorkOrdersParams | undefined, { rejectWithValue }) => {
    try {
      return await workOrderService.fetchWorkOrders(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch work orders");
    }
  }
);

export const fetchWorkOrderById = createAsyncThunk(
  "workOrders/fetchWorkOrderById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await workOrderService.fetchWorkOrderById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch work order");
    }
  }
);

export const createWorkOrder = createAsyncThunk(
  "workOrders/create",
  async (data: CreateWorkOrderData, { rejectWithValue }) => {
    try {
      return await workOrderService.createWorkOrder(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create work order");
    }
  }
);

export const updateWorkOrder = createAsyncThunk(
  "workOrders/update",
  async ({ id, authorId, data }: { id: string; authorId: string; data: UpdateWorkOrderData }, { rejectWithValue }) => {
    try {
      return await workOrderService.updateWorkOrder(id, authorId, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update work order");
    }
  }
);

export const deleteWorkOrder = createAsyncThunk(
  "workOrders/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      return await workOrderService.deleteWorkOrder(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete work order");
    }
  }
);

export const batchDeleteWorkOrder = createAsyncThunk(
  "workOrder/batchDeleteWorkOrder",
  async (ids: string[], { rejectWithValue }) => {
    try {
      await workOrderService.batchDeleteWorkOrder(ids);
      return ids;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete work orders");
    }
  }
);

// --- Status ---

export const updateWorkOrderStatus = createAsyncThunk(
  "workOrders/updateStatus",
  async ({ id, authorId, status }: { id: string; authorId: string; status: string }, { rejectWithValue }) => {
    try {
      return await workOrderService.updateWorkOrderStatus(id, status, authorId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update status");
    }
  }
);

export const markWorkOrderCompleted = createAsyncThunk(
  "workOrders/markCompleted",
  async (id: string, { rejectWithValue }) => {
    try {
      return await workOrderService.patchWorkOrderComplete(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed");
    }
  }
);

export const patchWorkOrderComplete = createAsyncThunk(
  "workOrders/patchComplete",
  async (id: string, { rejectWithValue }) => {
    try {
      return await workOrderService.patchWorkOrderComplete(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to complete work order");
    }
  }
);

export const markWorkOrderInProgress = createAsyncThunk(
  "workOrders/markInProgress",
  async (id: string, { rejectWithValue }) => {
    try {
      return await workOrderService.markWorkOrderInProgress(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark in progress");
    }
  }
);

export const assignWorkOrder = createAsyncThunk(
  "workOrders/assign",
  async ({ id, data }: { id: string; data: AssignWorkOrderData }, { rejectWithValue }) => {
    try {
      return await workOrderService.assignWorkOrder(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to assign work order");
    }
  }
);

// --- Comments & Logs ---

export const addWorkOrderComment = createAsyncThunk(
  "workOrders/addComment",
  async ({ id, message }: { id: string; message: string }, { rejectWithValue }) => {
    try {
      const payload: AddCommentPayload = { message };
      return await workOrderService.addWorkOrderComment(id, payload);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add comment");
    }
  }
);

export const fetchWorkOrderComments = createAsyncThunk(
  "workOrders/fetchComments",
  async (id: string, { rejectWithValue }) => {
    try {
      return await workOrderService.fetchWorkOrderComments(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch comments");
    }
  }
);

export const fetchWorkOrderLogs = createAsyncThunk(
  "workOrders/fetchLogs",
  async (workOrderId: string, { rejectWithValue }) => {
    try {
      return await workOrderService.fetchWorkOrderLogs(workOrderId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch logs");
    }
  }
);

// --- Costs & Time ---

export const addOtherCost = createAsyncThunk(
  "workOrders/addOtherCost",
  async ({ id, data }: { id: string; data: CreateOtherCostData }, { rejectWithValue }) => {
    try {
      return await workOrderService.addOtherCost(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add other cost");
    }
  }
);

// ✅ ADDED: Update Other Cost Thunk
export const updateOtherCost = createAsyncThunk(
  "workOrders/updateOtherCost",
  async ({ workOrderId, costId, data }: { workOrderId: string; costId: string; data: CreateOtherCostData }, { rejectWithValue }) => {
    try {
      return await workOrderService.updateOtherCost(workOrderId, costId, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update other cost");
    }
  }
);

export const deleteOtherCost = createAsyncThunk(
  "workOrders/deleteOtherCost",
  async ({ id, costId }: { id: string; costId: string }, { rejectWithValue }) => {
    try {
      await workOrderService.deleteOtherCost(id, costId);
      return { id, costId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete other cost");
    }
  }
);

export const addTimeEntry = createAsyncThunk(
  "workOrders/addTimeEntry",
  async ({ id, data }: { id: string; data: CreateTimeEntryData }, { rejectWithValue }) => {
    try {
      const res = await workOrderService.addTimeEntry(id, data);
      return res;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add time entry");
    }
  }
);

export const updateTimeEntry = createAsyncThunk(
  "workOrders/updateTimeEntry",
  async ({ workOrderId, timeEntryId, data }: { workOrderId: string; timeEntryId: string; data: CreateTimeEntryData }, { rejectWithValue }) => {
    try {
      const res = await workOrderService.updateTimeEntry(workOrderId, timeEntryId, data);
      return res;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update time entry");
    }
  }
);

export const deleteTimeEntry = createAsyncThunk(
  "workOrders/deleteTimeEntry",
  async ({ id, entryId }: { id: string; entryId: string }, { rejectWithValue }) => {
    try {
      await workOrderService.deleteTimeEntry(id, entryId);
      return { id, entryId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete time entry");
    }
  }
);

// --- Parts ---

export const addPartUsage = createAsyncThunk(
  "workOrders/addPartUsage",
  async ({ id, data }: { id: string; data: CreatePartUsageData }, { rejectWithValue }) => {
    try {
      const res = await workOrderService.addPartUsage(id, data);
      return res;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add parts");
    }
  }
);

// ✅ ADDED: Update Part Usage Thunk
export const updatePartUsage = createAsyncThunk(
  "workOrders/updatePartUsage",
  async ({ workOrderId, usageId, data }: { workOrderId: string; usageId: string; data: CreatePartUsageData }, { rejectWithValue }) => {
    try {
      const res = await workOrderService.updatePartUsage(workOrderId, usageId, data);
      return res;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update part");
    }
  }
);

export const deletePartUsage = createAsyncThunk(
  "workOrders/deletePartUsage",
  async ({ id, usageId }: { id: string; usageId: string }, { rejectWithValue }) => {
    try {
      await workOrderService.deletePartUsage(id, usageId);
      return { id, usageId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete part");
    }
  }
);

// --- Procedure Field Responses ---

export const submitFieldResponse = createAsyncThunk(
  "workOrders/submitFieldResponse",
  async (data: CreateFieldResponseData, { rejectWithValue }) => {
    try {
      return await workOrderService.createFieldResponse(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to save field response");
    }
  }
);


export const fetchFieldResponses = createAsyncThunk(
  "workOrders/fetchFieldResponses",
  async (submissionId: string, { rejectWithValue }) => {
    try {
      const responses = await workOrderService.getFieldResponses(submissionId);
      return responses;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch field responses"
      );
    }
  }
);

export const fetchDeleteAsset = createAsyncThunk(
  "workOrders/fetchDeleteWorkOrder",
  async (_, { rejectWithValue }) => {
    try {
      const workOrder = await workOrderService.fetchDeleteWorkOrder();
      return workOrder;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch Delete Work Order "
      );
    }
  }
);

export const restoreWorkOrderData = createAsyncThunk(
  "workOrders/restoreWorkOrdersData",
  async (
    {
      id,
    }: {
      id: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const asset = await workOrderService.restoreWorkOrderData(id);
      return asset;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to restore work order Data"
      );
    }
  }
);

// --- Filter Data ---

export const fetchFilterData = createAsyncThunk(
  "workOrders/fetchFilterData",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;

    // ✅ Check if data already exists in Redux
    if (state.workOrders.filterData) {
      console.log("🟡 Filter data already exists in Redux. Skipping API calls.");
      return state.workOrders.filterData;
    }

    try {
      console.log("🔵 Fetching all filter data in parallel...");

      const [
        locationsRes,
        partsRes,
        assetsRes,
        vendorsRes,
        categoriesRes,
        usersRes,
        proceduresRes,
        teamsRes,
        metersRes
      ] = await Promise.all([
        locationService.fetchLocationsName(),
        partService.fetchPartsName(),
        assetService.fetchAssetsName(),
        vendorService.fetchVendorName(),
        categoryService.fetchCategories(),
        userService.fetchUserSummary(),
        procedureService.fetchProcedures(),
        teamService.fetchTeamsName(),
        meterService.fetchMeters({ limit: 1000, page: 1 })
      ]);

      // Helper to format data uniformly
      const format = (res: any, type: string) => {
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        return list.map((item: any) => ({
          id: item.id,
          name: item.name || item.fullName || item.procedureName || item.title || `Unnamed ${type}`,
          image: item.image || item.avatarUrl || null
        }));
      };

      const data: FilterData = {
        locations: format(locationsRes, "Location"),
        parts: format(partsRes, "Part"),
        assets: format(assetsRes, "Asset"),
        vendors: format(vendorsRes, "Vendor"),
        categories: format(categoriesRes, "Category"),
        users: format(usersRes, "User"),
        procedures: format(proceduresRes, "Procedure"),
        teams: format(teamsRes, "Team"),
        meters: format(metersRes, "Meter")
      };

      console.log("🟢 All filter data fetched successfully");
      return data;

    } catch (error: any) {
      console.error("❌ Error fetching filter data:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch filter data");
    }
  }
);