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
  CreatePartUsageData,
  FetchWorkOrdersParams,
  FieldResponse
} from "./workOrders.types";

// ✅ SMART PAYLOAD CLEANER
const cleanPayload = (data: any) => {
  if (!data || typeof data !== 'object') return data;
  const cleaned: any = {};
  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (Array.isArray(value)) {
      if (value.length > 0) cleaned[key] = value; 
      return; 
    }
    if (value && typeof value === 'object' && !(value instanceof Date)) {
      const cleanedNested = cleanPayload(value);
      if (Object.keys(cleanedNested).length > 0) cleaned[key] = cleanedNested;
      return;
    }
    if (value !== "" && value !== null && value !== undefined) {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

export const workOrderService = {
  fetchWorkOrders: async (params?: FetchWorkOrdersParams): Promise<WorkOrderResponse[]> => {
    const res = await api.get("/work-orders", { 
      params, 
      paramsSerializer: { indexes: null } 
    });
    if (res.data && Array.isArray(res.data.items)) return res.data.items;
    if (Array.isArray(res.data)) return res.data;
    return [];
  },

  // ✅ FIXED: Suppress Error Toaster for GET request
  fetchWorkOrderById: async (id: string): Promise<WorkOrderResponse> => {
    // 1. Guard Clause
    if (!id || id === "undefined" || id === "null") {
      return null as any;
    }
    try {
      // 2. Try Fetching
      const res = await api.get(`/work-orders/${id}`);
      return res.data;
    } catch (error) {
      // 3. Catch Error & Return Null (Prevents Red Toast)
      // console.warn(`Silently failed to fetch Work Order ${id}`, error);
      return null as any;
    }
  },

  createWorkOrder: async (data: CreateWorkOrderData): Promise<WorkOrderResponse> => {
    const cleanedData = cleanPayload(data);
    const res = await api.post(`work-orders`, cleanedData);
    return res.data;
  },

  // ✅ CORRECT URL: /work-orders/{id}/{authorId}
  updateWorkOrder: async (id: string, authorId: string, data: UpdateWorkOrderData): Promise<WorkOrderResponse> => {
    const cleanedData = cleanPayload(data);
    const res = await api.patch(`/work-orders/${id}/${authorId}`, cleanedData);
    return res.data;
  },

  updateWorkOrderStatus: async (id: string, status: string, authorId: string): Promise<WorkOrderResponse> => {
    const res = await api.patch(`/work-orders/${id}/status`, { status, authorId });
    return res.data;
  },

  assignWorkOrder: async (id: string, data: AssignWorkOrderData): Promise<WorkOrderResponse> => {
    const res = await api.post(`/work-orders/${id}/assign`, data);
    return res.data;
  },

  addWorkOrderComment: async (id: string, payload: AddCommentPayload): Promise<WorkOrderComment> => {
    const res = await api.post(`/work-orders/${id}/comments`, payload);
    return res.data;
  },

  fetchWorkOrderComments: async (id: string): Promise<WorkOrderComment[]> => {
    if (!id) return [];
    try {
      const res = await api.get(`/work-orders/${id}/comments`);
      return res.data;
    } catch (e) { return []; }
  },

  fetchWorkOrderLogs: async (id: string): Promise<WorkOrderLog[]> => {
    if (!id) return [];
    try {
      const res = await api.get(`/work-orders/${id}/logs`);
      return res.data;
    } catch (e) { return []; }
  },

  markWorkOrderCompleted: async (id: string, userId: string): Promise<WorkOrderResponse> => {
    const res = await api.patch(`/work-orders/${id}/complete`, { userId });
    return res.data;
  },

  patchWorkOrderComplete: async (id: string): Promise<WorkOrderResponse> => {
    const res = await api.patch(`/work-orders/${id}/status`, { status: "done" });
    return res.data;
  },

  markWorkOrderInProgress: async (id: string): Promise<WorkOrderResponse> => {
    const res = await api.patch(`/work-orders/${id}/status`, { status: "in_progress" });
    return res.data;
  },

  addOtherCost: async (id: string, data: CreateOtherCostData) => {
    const res = await api.post(`/work-orders/${id}/costs`, data);
    return res.data;
  },

  deleteOtherCost: async (id: string, costId: string) => {
    const res = await api.delete(`/work-orders/${id}/costs/${costId}`);
    return res.data;
  },

  addTimeEntry: async (id: string, data: CreateTimeEntryData) => {
    const payload = {
      items: [{
        userId: data.userId,
        entryType: data.entryType ? data.entryType.toLowerCase() : "work",
        hours: Number(data.hours) || 0,
        minutes: Number(data.minutes) || 0,
        hourlyRate: Number(data.rate) || 0 
      }]
    };
    const res = await api.post(`/work-orders/${id}/time`, payload);
    return res.data;
  },

  deleteTimeEntry: async (id: string, entryId: string): Promise<{ success: boolean }> => {
    const res = await api.delete(`/work-orders/${id}/time/${entryId}`);
    return res.data;
  },

  addPartUsage: async (id: string, data: CreatePartUsageData) => {
    const res = await api.post(`/work-orders/${id}/parts`, data);
    return res.data; 
  },

  deletePartUsage: async (id: string, usageId: string) => {
    await api.delete(`/work-orders/${id}/parts/${usageId}`);
    return { id, usageId };
  },

  createFieldResponse: async (data: CreateFieldResponseData): Promise<FieldResponseResponse> => {
    const res = await api.post(`/procedure-field-responses`, data);
    return res.data;
  },

  getFieldResponses: async (submissionId: string) => {
    const res = await api.get(`/procedure-field-responses?submissionId=${submissionId}`);
    return res.data; 
  },

  fetchDeleteWorkOrder: async (): Promise<void> => {
    const res = await api.get(`work-orders/deleted/all`);
    return res.data;
  },

  restoreWorkOrderData: async (id: string): Promise<WorkOrderResponse> => {
    const res = await api.put(`/work-orders/${id}/restore`);
    return res.data;
  },

  batchDeleteWorkOrder: async (ids: string[]): Promise<void> => {
    await api.delete(`/work-orders/batch-delete`, { data: { ids } });
  },

  deleteWorkOrder: async (id: string): Promise<void> => {
    await api.delete(`/work-orders/${id}`);
  },

  // ✅ FIXED: Suppress Error Toaster for User Fetch
  fetchUserById: async (id: string): Promise<any> => {
    if (!id || id === "undefined" || id === "null") return {};
    try {
      const res = await api.get(`/users/${id}`);
      return res.data;
    } catch (error) {
      return {}; // Return empty object instead of throwing error
    }
  },
};