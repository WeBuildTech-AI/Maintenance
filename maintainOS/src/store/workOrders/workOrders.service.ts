import axios from "axios";
import type {
  AddWorkOrderCommentData,
  AssignWorkOrderData,
  CreateWorkOrderData,
  UpdateWorkOrderData,
  WorkOrderResponse,
  CreateOtherCostData,
  CreateTimeEntryData, // ✅ added
  WorkOrderTimeEntry, // ✅ added
} from "./workOrders.types";

const API_URL = import.meta.env.VITE_API_URL;
import api from "../auth/auth.service";

export const workOrderService = {
  // ✅ Fetch all (old route)
  fetchWorkOrders: async (): Promise<WorkOrderResponse[]> => {
    const res = await api.get("/work-orders");
    return res.data;
  },

  // ✅ Fetch by id (old route)
  fetchWorkOrderById: async (id: string): Promise<WorkOrderResponse> => {
    const res = await api.get(`/work-orders/${id}`);
    return res.data;
  },

  // ✅ Create (old route)
  createWorkOrder: async (
    data: CreateWorkOrderData
  ): Promise<WorkOrderResponse> => {
    const res = await api.post(`/work-orders`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // ✅ Update (NEW route using authorId)
  updateWorkOrder: async (
    id: string,
    authorId: string,
    data: UpdateWorkOrderData
  ): Promise<WorkOrderResponse> => {
    const res = await api.request({
      method: "PATCH",
      url: `/work-orders/${id}`,
      data,
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    });
    return res.data;
  },

  // ✅ Delete (old route)
  deleteWorkOrder: async (id: string): Promise<void> => {
    await api.delete(`/work-orders/${id}`);
  },

  // ✅ Assign (old route)
  assignWorkOrder: async (
    id: string,
    data: AssignWorkOrderData
  ): Promise<WorkOrderResponse> => {
    const res = await api.post(`/work-orders/${id}/assign`, data);
    return res.data;
  },

  // ✅ Add comment (old route)
  addWorkOrderComment: async (
    id: string,
    data: AddWorkOrderCommentData
  ): Promise<WorkOrderResponse> => {
    const res = await api.post(`/work-orders/${id}/comments`, data);
    return res.data;
  },

  // ✅ Mark complete (old route)
  markCompleted: async (id: string): Promise<WorkOrderResponse> => {
    const res = await api.post(`/work-orders/${id}/complete`);
    return res.data;
  },

  // ✅ Mark in progress (old route)
  markInProgress: async (id: string): Promise<WorkOrderResponse> => {
    const res = await api.post(`/work-orders/${id}/in-progress`);
    return res.data;
  },

  // ✅ Other Costs — Add
  addOtherCost: async (id: string, data: CreateOtherCostData) => {
    const res = await api.post(`/work-orders/${id}/other-costs`, data);
    return res.data;
  },

  // ✅ Other Costs — Delete
  deleteOtherCost: async (id: string, costId: string) => {
    const res = await api.delete(`/work-orders/${id}/other-costs/${costId}`);
    return res.data;
  },

  // ✅ TIME TRACKING — Add entry
  addTimeEntry: async (
    id: string,
    data: CreateTimeEntryData
  ): Promise<WorkOrderTimeEntry> => {
    const res = await api.post(`/work-orders/${id}/time`, data);
    return res.data;
  },

  // ✅ TIME TRACKING — Delete entry
  deleteTimeEntry: async (
    id: string,
    entryId: string
  ): Promise<{ success: boolean }> => {
    const res = await api.delete(`/work-orders/${id}/time/${entryId}`);
    return res.data;
  },
};
