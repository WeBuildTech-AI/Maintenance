// src/store/workOrders/workOrders.service.ts
import api from "../auth/auth.service";
import type {
  AssignWorkOrderData,
  CreateWorkOrderData,
  UpdateWorkOrderData,
  WorkOrderResponse,
  CreateOtherCostData,
  CreateTimeEntryData,
  WorkOrderTimeEntry,
  WorkOrderComment,
  WorkOrderLog,
  AddCommentPayload,
} from "./workOrders.types";

export const workOrderService = {
  // --- Work Orders ---

  fetchWorkOrders: async (): Promise<WorkOrderResponse[]> => {
    const res = await api.get("/work-orders");
    return res.data;
  },

  fetchWorkOrderById: async (id: string): Promise<WorkOrderResponse> => {
    const res = await api.get(`/work-orders/${id}`);
    return res.data;
  },

  createWorkOrder: async (
    data: CreateWorkOrderData
  ): Promise<WorkOrderResponse> => {
    // Using multipart/form-data if your API expects it for file uploads, 
    // otherwise application/json is fine. Adjust as per backend.
    const res = await api.post(`/work-orders`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  updateWorkOrder: async (
    id: string,
    authorId: string,
    data: UpdateWorkOrderData
  ): Promise<WorkOrderResponse> => {
    // Note: Using PATCH as requested in previous turns
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

  deleteWorkOrder: async (id: string): Promise<void> => {
    await api.delete(`/work-orders/${id}`);
  },

  batchDeleteWorkOrder: async (ids: string[]): Promise<void> => {
    await api.delete(`work-orders/batch-delete`, {
      data: { ids: ids },
    });
  },

  // --- Status Updates ---

  patchWorkOrderComplete: async (id: string): Promise<WorkOrderResponse> => {
    const res = await api.patch(`/work-orders/patch/${id}/complete`);
    return res.data;
  },

  markWorkOrderInProgress: async (id: string): Promise<WorkOrderResponse> => {
    const res = await api.post(`/work-orders/${id}/in-progress`);
    return res.data;
  },

  assignWorkOrder: async (
    id: string,
    data: AssignWorkOrderData
  ): Promise<WorkOrderResponse> => {
    const res = await api.post(`/work-orders/${id}/assign`, data);
    return res.data;
  },

  // --- COMMENTS (Updated) ---

  // POST /api/v1/work-orders/{id}/comment
  addWorkOrderComment: async (
    id: string,
    data: AddCommentPayload
  ): Promise<WorkOrderComment> => {
    // Note: Endpoint uses singular 'comment' as per requirement
    const res = await api.post(`/work-orders/${id}/comment`, data);
    return res.data;
  },

  // GET /api/v1/work-orders/{id}/comments
  fetchWorkOrderComments: async (id: string): Promise<WorkOrderComment[]> => {
    const res = await api.get(`/work-orders/${id}/comments`);
    return res.data;
  },

  // --- LOGS (Updated with Debugging & Safe Check) ---

  // GET /api/v1/work-orders/get/work-order-logs
  fetchWorkOrderLogs: async (): Promise<WorkOrderLog[]> => {
    try {
      const res = await api.get(`/work-orders/get/work-order-logs`);
      
      // 🔍 Debugging Logs to check API response structure in Console
      console.log("🔍 [DEBUG] Raw Logs API Response:", res);
      
      // Handle if API returns array directly or nested in 'data'
      if (Array.isArray(res.data)) {
        return res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      
      return [];
    } catch (error) {
      console.error("❌ [DEBUG] Failed to fetch logs:", error);
      throw error;
    }
  },

  // --- Costs & Time ---

  addOtherCost: async (id: string, data: CreateOtherCostData) => {
    const res = await api.post(`/work-orders/${id}/other-costs`, data);
    return res.data;
  },

  deleteOtherCost: async (id: string, costId: string) => {
    const res = await api.delete(`/work-orders/${id}/other-costs/${costId}`);
    return res.data;
  },

  addTimeEntry: async (
    id: string,
    data: CreateTimeEntryData
  ): Promise<WorkOrderTimeEntry> => {
    const res = await api.post(`/work-orders/${id}/time`, data);
    return res.data;
  },

  deleteTimeEntry: async (
    id: string,
    entryId: string
  ): Promise<{ success: boolean }> => {
    const res = await api.delete(`/work-orders/${id}/time/${entryId}`);
    return res.data;
  },
};