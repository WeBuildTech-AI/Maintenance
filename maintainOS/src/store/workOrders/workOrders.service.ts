import axios from "axios";
import type {
  AddWorkOrderCommentData,
  AssignWorkOrderData,
  CreateWorkOrderData,
  UpdateWorkOrderData,
  WorkOrderResponse,
} from "./workOrders.types";

const API_URL = import.meta.env.VITE_API_URL;
import api from "../auth/auth.service"; 

export const workOrderService = {
  // ✅ Fetch all (old route)
  fetchWorkOrders: async (): Promise<WorkOrderResponse[]> => {
    const res = await api.get("/work-orders");
    return res.data;
  },

  // ✅ Fetch single (old route)
  fetchWorkOrderById: async (id: string): Promise<WorkOrderResponse> => {
    const res = await axios.get(`${API_URL}/work-orders/${id}`);
    return res.data;
  },

  // ✅ Create (old route)
  createWorkOrder: async (
    data: CreateWorkOrderData
  ): Promise<WorkOrderResponse> => {
    const res = await axios.post(`${API_URL}/work-orders`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // ✅ Update (new route — only PATCH uses /api/v1)
  updateWorkOrder: async (
    id: string,
    data: UpdateWorkOrderData
  ): Promise<WorkOrderResponse> => {
    const res = await axios.request({
      method: "PATCH",
      url: `${API_URL}/work-orders/${id}`,
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
    await axios.delete(`${API_URL}/work-orders/${id}`);
  },

  // ✅ Assign (old route)
  assignWorkOrder: async (
    id: string,
    data: AssignWorkOrderData
  ): Promise<WorkOrderResponse> => {
    const res = await axios.post(`${API_URL}/work-orders/${id}/assign`, data);
    return res.data;
  },

  // ✅ Comment (old route)
  addComment: async (
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
};
