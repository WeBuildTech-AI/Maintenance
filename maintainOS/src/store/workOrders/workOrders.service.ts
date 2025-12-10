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
  FetchWorkOrdersParams ,
  FieldResponse
} from "./workOrders.types";

export const workOrderService = {
  // ✅ FIX: Accept params argument and pass to API
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

  fetchWorkOrderById: async (id: string): Promise<WorkOrderResponse> => {
    const res = await api.get(`/work-orders/${id}`);
    return res.data;
  },

  createWorkOrder: async (data: CreateWorkOrderData): Promise<WorkOrderResponse> => {
    const res = await api.post(`/work-orders`, data);
    return res.data;
  },

  updateWorkOrder: async (id: string, authorId: string, data: UpdateWorkOrderData): Promise<WorkOrderResponse> => {
    const res = await api.request({ method: "PATCH", url: `/work-orders/${id}/${authorId}`, data });
    return res.data;
  },

  deleteWorkOrder: async (id: string): Promise<void> => {
    await api.delete(`/work-orders/${id}`);
  },

  batchDeleteWorkOrder: async (ids: string[]): Promise<void> => {
    await api.delete(`work-orders/batch-delete`, { data: { ids: ids } });
  },

  updateWorkOrderStatus: async (id: string, authorId: string, status: string): Promise<WorkOrderResponse> => {
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

  assignWorkOrder: async (id: string, data: AssignWorkOrderData): Promise<WorkOrderResponse> => {
    const res = await api.post(`/work-orders/${id}/assign`, data);
    return res.data;
  },

  addWorkOrderComment: async (id: string, data: AddCommentPayload): Promise<WorkOrderComment> => {
    const res = await api.post(`/work-orders/${id}/comment`, data);
    return res.data;
  },

  fetchWorkOrderComments: async (id: string): Promise<WorkOrderComment[]> => {
    const res = await api.get(`/work-orders/${id}/comments`);
    if (Array.isArray(res.data)) return res.data;
    if (res.data?.data && Array.isArray(res.data.data)) return res.data.data;
    return [];
  },

  fetchWorkOrderLogs: async (workOrderId: string): Promise<WorkOrderLog[]> => {
    const res = await api.get(`/work-orders/get/work-order-logs/${workOrderId}`);
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    return [];
  },

  addOtherCost: async (id: string, data: CreateOtherCostData) => {
    const res = await api.post(`/work-orders/${id}/other-costs`, data);
    return res.data;
  },

  deleteOtherCost: async (id: string, costId: string) => {
    const res = await api.delete(`/work-orders/${id}/other-costs/${costId}`);
    return res.data;
  },

  addTimeEntry: async (id: string, data: CreateTimeEntryData): Promise<WorkOrderTimeEntry> => {
    const res = await api.post(`/work-orders/${id}/time`, data);
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

 // ✅ UPDATED: Matches POST /api/v1/procedure-field-responses
  createFieldResponse: async (data: CreateFieldResponseData): Promise<FieldResponseResponse> => {
    // Assuming 'api' base URL handles /api/v1 prefix. If not, use `/api/v1/procedure-field-responses`
    const res = await api.post(`/procedure-field-responses`, data);
    return res.data;
  },


  fetchDeleteWorkOrder: async (): Promise<void> => {
    const res = await api.get(`work-orders/deleted/all`);
    return res.data;
  },

  restoreWorkOrderData: async (id: string): Promise<WorkOrderResponse> => {
    const res = await api.put(`/work-orders/restore/${id}`);
    return res.data;
  },

  getFieldResponses: async (submissionId: string): Promise<FieldResponse[]> => {
    // API: GET /api/v1/procedure-field-responses/submission/{submissionId}
    const res = await api.get(`/procedure-field-responses/submission/${submissionId}`);
    return res.data;
  },
};