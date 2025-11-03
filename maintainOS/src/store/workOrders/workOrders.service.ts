import axios from "axios";
import type {
  AddWorkOrderCommentData,
  AssignWorkOrderData,
  CreateWorkOrderData,
  UpdateWorkOrderData,
  WorkOrderResponse,
  CreateOtherCostData,
} from "./workOrders.types";

const API_URL = import.meta.env.VITE_API_URL;

export const workOrderService = {
  // ✅ Fetch all (old route)
  fetchWorkOrders: async (): Promise<WorkOrderResponse[]> => {
    const res = await axios.get(`${API_URL}/work-orders`);
    return res.data;
  },

  // ✅ Fetch by id (old route)
  fetchWorkOrderById: async (id: string): Promise<WorkOrderResponse> => {
    const res = await axios.get(`${API_URL}/work-orders/${id}`);
    return res.data;
  },

  // ✅ Create (old route)
  createWorkOrder: async (
    data: CreateWorkOrderData
  ): Promise<WorkOrderResponse> => {
    const res = await axios.post(`${API_URL}/work-orders`, data);
    return res.data;
  },

  // ✅ Update (NEW route using authorId)
  updateWorkOrder: async (
    id: string,
    authorId: string,
    data: UpdateWorkOrderData
  ): Promise<WorkOrderResponse> => {
    const res = await axios.patch(`${API_URL}/work-orders/${id}/${authorId}`, data);
    return res.data;
  },

  // ✅ Delete (old route)
  deleteWorkOrder: async (id: string): Promise<{ success: boolean }> => {
    const res = await axios.delete(`${API_URL}/work-orders/${id}`);
    return res.data;
  },

  // ✅ Assign (old route)
  assignWorkOrder: async (
    id: string,
    data: AssignWorkOrderData
  ): Promise<WorkOrderResponse> => {
    const res = await axios.post(`${API_URL}/work-orders/${id}/assign`, data);
    return res.data;
  },

  // ✅ Add comment (old route)
  addWorkOrderComment: async (
    id: string,
    data: AddWorkOrderCommentData
  ): Promise<WorkOrderResponse> => {
    const res = await axios.post(`${API_URL}/work-orders/${id}/comments`, data);
    return res.data;
  },

  // ✅ Mark complete (old route)
  markCompleted: async (id: string): Promise<WorkOrderResponse> => {
    const res = await axios.post(`${API_URL}/work-orders/${id}/complete`);
    return res.data;
  },

  // ✅ Mark in progress (old route)
  markInProgress: async (id: string): Promise<WorkOrderResponse> => {
    const res = await axios.post(`${API_URL}/work-orders/${id}/in-progress`);
    return res.data;
  },

  // ✅ Other Costs — Add
  addOtherCost: async (id: string, data: CreateOtherCostData) => {
    const res = await axios.post(`${API_URL}/work-orders/${id}/other-costs`, data);
    return res.data;
  },

  // ✅ Other Costs — Delete
  deleteOtherCost: async (id: string, costId: string) => {
    const res = await axios.delete(`${API_URL}/work-orders/${id}/other-costs/${costId}`);
    return res.data;
  },
};
