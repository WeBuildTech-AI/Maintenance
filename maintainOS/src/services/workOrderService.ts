import api from "./api";
import type { WorkOrder, WorkOrderPriority } from "@prisma/client";

// Re-export Prisma types for convenience
export type { WorkOrder, WorkOrderPriority } from "@prisma/client";

// For API responses
export type WorkOrderResponse = WorkOrder;

// For creating new work orders
export interface CreateWorkOrderData {
  title: string;
  description?: string;
  organizationId: string;
  assetId?: string;
  assignedToUserId?: string;
  requestedByUserId?: string;
  priority?: WorkOrderPriority;
  scheduledDate?: string;
  estimatedHours?: number;
  instructions?: string;
}

// For updating existing work orders
export interface UpdateWorkOrderData {
  title?: string;
  description?: string;
  assetId?: string;
  assignedToUserId?: string;
  requestedByUserId?: string;
  priority?: WorkOrderPriority;
  scheduledDate?: string;
  completedDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  instructions?: string;
}

// For assigning work orders
export interface AssignWorkOrderData {
  assignedToUserId: string;
}

// For adding comments to work orders
export interface AddWorkOrderCommentData {
  comment: string;
  userId: string;
}

export const workOrderService = {
  // Fetch all work orders
  fetchWorkOrders: async (): Promise<WorkOrderResponse[]> => {
    const response = await api.get("/work-orders");
    return response.data;
  },

  // Fetch work order by ID
  fetchWorkOrderById: async (id: string): Promise<WorkOrderResponse> => {
    const response = await api.get(`/work-orders/${id}`);
    return response.data;
  },

  // Create a new work order
  createWorkOrder: async (
    workOrderData: CreateWorkOrderData
  ): Promise<WorkOrderResponse> => {
    const response = await api.post("/work-orders", workOrderData);
    return response.data;
  },

  // Update work order
  updateWorkOrder: async (
    id: string,
    workOrderData: UpdateWorkOrderData
  ): Promise<WorkOrderResponse> => {
    const response = await api.patch(`/work-orders/${id}`, workOrderData);
    return response.data;
  },

  // Delete work order
  deleteWorkOrder: async (id: string): Promise<void> => {
    await api.delete(`/work-orders/${id}`);
  },

  // Assign work order to user
  assignWorkOrder: async (
    id: string,
    assignData: AssignWorkOrderData
  ): Promise<WorkOrderResponse> => {
    const response = await api.patch(`/work-orders/${id}/assign`, assignData);
    return response.data;
  },

  // Add comment to work order
  addComment: async (
    id: string,
    commentData: AddWorkOrderCommentData
  ): Promise<any> => {
    const response = await api.post(`/work-orders/${id}/comments`, commentData);
    return response.data;
  },

  // Mark work order as completed
  markCompleted: async (id: string): Promise<WorkOrderResponse> => {
    const response = await api.patch(`/work-orders/${id}/complete`);
    return response.data;
  },

  // Mark work order as in progress
  markInProgress: async (id: string): Promise<WorkOrderResponse> => {
    const response = await api.patch(`/work-orders/${id}/start`);
    return response.data;
  },
};
