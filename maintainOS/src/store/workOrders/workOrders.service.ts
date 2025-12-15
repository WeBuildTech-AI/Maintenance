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

export const workOrderService = {
  // ✅ GET: Fetch all work orders with optional filters
  fetchWorkOrders: async (params?: FetchWorkOrdersParams): Promise<WorkOrderResponse[]> => {
    const res = await api.get("/work-orders", { 
      params, 
      // Ensure commas are not encoded (id1,id2 remains id1,id2)
      paramsSerializer: { indexes: null } 
    });
    
    if (res.data && Array.isArray(res.data.items)) return res.data.items;
    if (Array.isArray(res.data)) return res.data;
    return [];
  },

  // ✅ GET: Fetch single work order by ID
  fetchWorkOrderById: async (id: string): Promise<WorkOrderResponse> => {
    const res = await api.get(`/work-orders/${id}`);
    return res.data;
  },

  // ✅ POST: Create Work Order
  createWorkOrder: async (data: CreateWorkOrderData): Promise<WorkOrderResponse> => {
    const res = await api.post(`work-orders`, data);
    return res.data;
  },

  // ✅ PATCH: Update Work Order
  updateWorkOrder: async (id: string, data: any): Promise<WorkOrderResponse> => {
    const res = await api.patch(`/work-orders/${id}`, data);
    return res.data;
  },

  // ✅ PATCH: Update Status specific endpoint
  updateWorkOrderStatus: async (id: string, status: string, authorId: string): Promise<WorkOrderResponse> => {
    const res = await api.patch(`/work-orders/${id}/status`, { status, authorId });
    return res.data;
  },

  // ✅ POST: Assign users
  assignWorkOrder: async (id: string, data: AssignWorkOrderData): Promise<WorkOrderResponse> => {
    const res = await api.post(`/work-orders/${id}/assign`, data);
    return res.data;
  },

  // ✅ POST: Add Comment
  addWorkOrderComment: async (id: string, payload: AddCommentPayload): Promise<WorkOrderComment> => {
    const res = await api.post(`/work-orders/${id}/comments`, payload);
    return res.data;
  },

  // ✅ GET: Fetch Comments
  fetchWorkOrderComments: async (id: string): Promise<WorkOrderComment[]> => {
    const res = await api.get(`/work-orders/${id}/comments`);
    return res.data;
  },

  // ✅ GET: Fetch Logs
  fetchWorkOrderLogs: async (id: string): Promise<WorkOrderLog[]> => {
    const res = await api.get(`/work-orders/${id}/logs`);
    return res.data;
  },

  // ✅ PATCH: Mark Complete
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

  // --- Costs ---
  addOtherCost: async (id: string, data: CreateOtherCostData) => {
    const res = await api.post(`/work-orders/${id}/costs`, data);
    return res.data;
  },

  deleteOtherCost: async (id: string, costId: string) => {
    const res = await api.delete(`/work-orders/${id}/costs/${costId}`);
    return res.data;
  },

  // --- Time Entries ---
  
  // ✅ FIXED: Removed 'description' and 'date' as per backend error.
  // ✅ FIXED: Converted 'entryType' to lowercase to match enum values.
  addTimeEntry: async (id: string, data: CreateTimeEntryData) => {
    const payload = {
      items: [
        {
          userId: data.userId,
          entryType: data.entryType ? data.entryType.toLowerCase() : "work", // Ensure lowercase (work, inspection, other)
          hours: Number(data.hours) || 0,
          minutes: Number(data.minutes) || 0,
          hourlyRate: Number(data.rate) || 0 // Map 'rate' to 'hourlyRate'
        }
      ]
    };
    const res = await api.post(`/work-orders/${id}/time`, payload);
    return res.data;
  },

  deleteTimeEntry: async (id: string, entryId: string): Promise<{ success: boolean }> => {
    const res = await api.delete(`/work-orders/${id}/time/${entryId}`);
    return res.data;
  },

  // --- Parts ---
  addPartUsage: async (id: string, data: CreatePartUsageData) => {
    const res = await api.post(`/work-orders/${id}/parts`, data);
    return res.data; 
  },

  deletePartUsage: async (id: string, usageId: string) => {
    await api.delete(`/work-orders/${id}/parts/${usageId}`);
    return { id, usageId };
  },

  // --- Procedure Field Responses ---
  createFieldResponse: async (data: CreateFieldResponseData): Promise<FieldResponseResponse> => {
    const res = await api.post(`/procedure-field-responses`, data);
    return res.data;
  },

  getFieldResponses: async (submissionId: string) => {
    const res = await api.get(`/procedure-field-responses?submissionId=${submissionId}`);
    return res.data; 
  },

  // --- Deleted / Trash ---
  fetchDeleteWorkOrder: async (): Promise<void> => {
    const res = await api.get(`work-orders/deleted/all`);
    return res.data;
  },

  restoreWorkOrderData: async (id: string): Promise<WorkOrderResponse> => {
    const res = await api.put(`/work-orders/${id}/restore`);
    return res.data;
  },

  batchDeleteWorkOrder: async (ids: string[]): Promise<void> => {
    await api.delete(`/work-orders/batch-delete`, {
      data: { ids },
    });
  },

  deleteWorkOrder: async (id: string): Promise<void> => {
    await api.delete(`/work-orders/${id}`);
  },
};