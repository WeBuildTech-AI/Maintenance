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
  CreateFieldResponseData,
  FieldResponseResponse,
  CreatePartUsageData // ✅ Imported
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
    const res = await api.post(`/work-orders`, data);
    return res.data;
  },

  updateWorkOrder: async (
    id: string,
    authorId: string,
    data: UpdateWorkOrderData
  ): Promise<WorkOrderResponse> => {
    const res = await api.request({
      method: "PATCH",
      url: `/work-orders/${id}/${authorId}`, 
      data,
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

  updateWorkOrderStatus: async (
    id: string, 
    authorId: string, 
    status: string
  ): Promise<WorkOrderResponse> => {
    const res = await api.patch(`/work-orders/${id}/status/${authorId}`, { status });
    return res.data;
  },

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

  // --- COMMENTS ---

  addWorkOrderComment: async (
    id: string,
    data: AddCommentPayload
  ): Promise<WorkOrderComment> => {
    const res = await api.post(`/work-orders/${id}/comment`, data);
    return res.data;
  },

  fetchWorkOrderComments: async (id: string): Promise<WorkOrderComment[]> => {
    const res = await api.get(`/work-orders/${id}/comments`);
    return res.data;
  },

  // --- LOGS ---

  fetchWorkOrderLogs: async (workOrderId: string): Promise<WorkOrderLog[]> => {
    const res = await api.get(`/work-orders/get/work-order-logs/${workOrderId}`);
    if (Array.isArray(res.data)) {
        return res.data;
    } else if (res.data && Array.isArray(res.data.data)) {
        return res.data.data;
    }
    return [];
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

  // --- ✅ PARTS USAGE (New) ---

  addPartUsage: async (id: string, data: CreatePartUsageData) => {
    const res = await api.post(`/work-orders/${id}/parts`, data);
    return res.data; 
  },

  deletePartUsage: async (id: string, usageId: string) => {
    await api.delete(`/work-orders/${id}/parts/${usageId}`);
    return { id, usageId };
  },

  // --- Procedure Field Responses ---
  
  createFieldResponse: async (
    data: CreateFieldResponseData
  ): Promise<FieldResponseResponse> => {
    const res = await api.post(`/procedure-field-responses`, data);
    return res.data;
  },
};