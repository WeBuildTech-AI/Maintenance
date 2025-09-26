import axios from "axios";

import type {
  AddWorkOrderCommentData,
  AssignWorkOrderData,
  CreateWorkOrderData,
  UpdateWorkOrderData,
  WorkOrderResponse,
} from "./workOrders.types";

const API_URL = import.meta.env.VITE_API_URL;

export const workOrderService = {
  fetchWorkOrders: async (): Promise<WorkOrderResponse[]> => {
    const res = await axios.get(`${API_URL}/work-orders`);
    return res.data;
  },

  fetchWorkOrderById: async (id: string): Promise<WorkOrderResponse> => {
    const res = await axios.get(`${API_URL}/work-orders/${id}`);
    return res.data;
  },

  createWorkOrder: async (
    data: CreateWorkOrderData
  ): Promise<WorkOrderResponse> => {
    const res = await axios.post(`${API_URL}/work-orders`, data);
    return res.data;
  },

  updateWorkOrder: async (
    id: string,
    data: UpdateWorkOrderData
  ): Promise<WorkOrderResponse> => {
    const res = await axios.patch(`${API_URL}/work-orders/${id}`, data);
    return res.data;
  },

  deleteWorkOrder: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/work-orders/${id}`);
  },

  assignWorkOrder: async (
    id: string,
    data: AssignWorkOrderData
  ): Promise<WorkOrderResponse> => {
    const res = await axios.post(`${API_URL}/work-orders/${id}/assign`, data);
    return res.data;
  },

  addComment: async (
    id: string,
    data: AddWorkOrderCommentData
  ): Promise<WorkOrderResponse> => {
    const res = await axios.post(`${API_URL}/work-orders/${id}/comments`, data);
    return res.data;
  },

  markCompleted: async (id: string): Promise<WorkOrderResponse> => {
    const res = await axios.post(`${API_URL}/work-orders/${id}/complete`);
    return res.data;
  },

  markInProgress: async (id: string): Promise<WorkOrderResponse> => {
    const res = await axios.post(`${API_URL}/work-orders/${id}/in-progress`);
    return res.data;
  },
};
