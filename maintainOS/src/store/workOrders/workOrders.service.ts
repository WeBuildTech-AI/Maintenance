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
      // ✅ Allow empty arrays to pass through (for clearing relations)
      cleaned[key] = value;
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
  fetchWorkOrders: async (params?: FetchWorkOrdersParams): Promise<{ data: WorkOrderResponse[]; meta: any }> => {
    const res = await api.get("/work-orders", {
      params,
      paramsSerializer: { indexes: null }
    });
    if (res.data && Array.isArray(res.data.items)) {
      return { data: res.data.items, meta: res.data.meta };
    }
    if (Array.isArray(res.data)) {
      return {
        data: res.data,
        meta: {
          totalItems: res.data.length,
          itemCount: res.data.length,
          itemsPerPage: res.data.length,
          totalPages: 1,
          currentPage: 1
        }
      };
    }
    return { data: [], meta: { totalItems: 0, itemCount: 0, itemsPerPage: 0, totalPages: 0, currentPage: 1 } };
  },

  fetchWorkOrderById: async (id: string): Promise<WorkOrderResponse> => {
    if (!id || id === "undefined" || id === "null") {
      return null as any;
    }
    try {
      const res = await api.get(`/work-orders/${id}`);
      return res.data;
    } catch (error) {
      return null as any;
    }
  },

  createWorkOrder: async (data: CreateWorkOrderData): Promise<WorkOrderResponse> => {
    const cleanedData = cleanPayload(data);
    const res = await api.post(`/work-orders`, cleanedData);
    return res.data;
  },

  updateWorkOrder: async (id: string, authorId: string, data: UpdateWorkOrderData): Promise<WorkOrderResponse> => {
    const cleanedData = cleanPayload(data);
    const res = await api.patch(`/work-orders/${id}/${authorId}`, cleanedData);
    return res.data;
  },

  updateWorkOrderStatus: async (id: string, status: string, authorId: string): Promise<WorkOrderResponse> => {
    const res = await api.patch(`/work-orders/${id}/status/${authorId}`, { status });
    return res.data;
  },

  assignWorkOrder: async (id: string, data: AssignWorkOrderData): Promise<WorkOrderResponse> => {
    const res = await api.post(`/work-orders/${id}/assign`, data);
    return res.data;
  },

  addWorkOrderComment: async (id: string, payload: AddCommentPayload): Promise<WorkOrderComment> => {
    const res = await api.post(`/work-orders/${id}/comment`, payload);
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
      const res = await api.get(`/work-orders/get/work-order-logs/${id}`);
      return res.data;
    } catch (e) { return []; }
  },

  markWorkOrderCompleted: async (id: string, userId: string): Promise<WorkOrderResponse> => {
    const res = await api.patch(`/work-orders/${id}/complete`, { userId });
    return res.data;
  },

  patchWorkOrderComplete: async (id: string): Promise<WorkOrderResponse> => {
    const res = await api.patch(`/work-orders/patch/${id}/complete`);
    return res.data;
  },

  markWorkOrderInProgress: async (id: string): Promise<WorkOrderResponse> => {
    const res = await api.patch(`/work-orders/${id}/status`, { status: "in_progress" });
    return res.data;
  },

  addOtherCost: async (id: string, data: CreateOtherCostData) => {
    // ✅ FIX: Robust payload construction that allows 0 and empty strings
    const item = {
      userId: data.userId,
      // Check for existence specifically, allowing 0
      amount: (data.amount !== "" && data.amount !== undefined && data.amount !== null)
        ? Number(data.amount)
        : 0,
      // Use nullish coalescing to allow empty strings
      description: data.description ?? "",
      category: data.category || "other"
    };

    // API expects items array
    const payload = { items: [item] };
    const res = await api.post(`/work-orders/${id}/other-costs`, payload);
    return res.data;
  },

  updateOtherCost: async (workOrderId: string, costId: string, data: CreateOtherCostData) => {
    // ✅ FIX: Apply same robust logic to updates
    const payload = {
      userId: data.userId,
      amount: (data.amount !== "" && data.amount !== undefined && data.amount !== null)
        ? Number(data.amount)
        : 0,
      description: data.description ?? "",
      category: data.category || "other"
    };
    const res = await api.patch(`/work-orders/${workOrderId}/other-costs/${costId}`, payload);
    return res.data;
  },

  deleteOtherCost: async (id: string, costId: string) => {
    const res = await api.delete(`/work-orders/${id}/other-costs/${costId}`);
    return res.data;
  },

  addTimeEntry: async (id: string, data: CreateTimeEntryData) => {
    let finalHours = Number(data.hours) || 0;
    let finalMinutes = Number(data.minutes) || 0;

    if (finalHours === 0 && finalMinutes === 0 && (data as any).totalMinutes > 0) {
      const total = Number((data as any).totalMinutes);
      finalHours = Math.floor(total / 60);
      finalMinutes = total % 60;
    }

    const item = {
      userId: data.userId,
      entryType: data.entryType ? data.entryType.toLowerCase() : "work",
      hours: finalHours,
      minutes: finalMinutes,
      hourlyRate: Number(data.rate ?? data.hourlyRate) || 0
    };

    const payload = { items: [item] };
    const res = await api.post(`/work-orders/${id}/time`, payload);
    return res.data;
  },

  updateTimeEntry: async (workOrderId: string, entryId: string, data: CreateTimeEntryData) => {
    const payload = {
      userId: data.userId,
      hours: Number(data.hours) || 0,
      minutes: Number(data.minutes) || 0,
      entryType: data.entryType ? data.entryType.toLowerCase() : "work",
      hourlyRate: Number(data.rate ?? data.hourlyRate) || 0
    };
    const res = await api.patch(`/work-orders/${workOrderId}/time/${entryId}`, payload);
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

  updatePartUsage: async (workOrderId: string, usageId: string, data: CreatePartUsageData) => {
    const payload = {
      partId: data.partId,
      locationId: data.locationId,
      quantity: Number(data.quantity) || 0
    };
    const res = await api.patch(`/work-orders/${workOrderId}/parts/${usageId}`, payload);
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
    const res = await api.get(`/procedure-field-responses/submission/${submissionId}`);
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
    await api.delete(`/work-orders/batch-delete`, { data: { ids: [id] } });
  },

  fetchUserById: async (id: string): Promise<any> => {
    if (!id || id === "undefined" || id === "null") return {};
    try {
      const res = await api.get(`/users/${id}`);
      return res.data;
    } catch (error) {
      return {};
    }
  },
};