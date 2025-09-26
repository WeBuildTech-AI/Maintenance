export interface WorkOrderComment {
  id: string;
  authorId: string;
  message: string;
  createdAt: string;
}

export interface WorkOrderResponse {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "completed" | "on_hold";
  dueDate?: string;
  assigneeIds: string[];
  comments: WorkOrderComment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkOrderData {
  organizationId: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
  dueDate?: string;
  assigneeIds?: string[];
}

export interface UpdateWorkOrderData {
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
  status?: "open" | "in_progress" | "completed" | "on_hold";
  dueDate?: string;
  assigneeIds?: string[];
}

export interface AssignWorkOrderData {
  assigneeIds: string[];
}

export interface AddWorkOrderCommentData {
  authorId: string;
  message: string;
}

export interface WorkOrdersState {
  workOrders: WorkOrderResponse[];
  selectedWorkOrder: WorkOrderResponse | null;
  loading: boolean;
  error: string | null;
}
