export interface WorkOrderComment {
  id: string;
  authorId: string;
  message: string;
  createdAt: string;
}

export interface OtherCost {
  id: string;
  description: string;
  amount: number;
  [key: string]: any;
}

export interface CreateOtherCostData {
  description: string;
  amount: number;
  [key: string]: any;
}

export interface WorkOrderResponse {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "completed" | "on_hold";
  dueDate?: string;
  assigneeIds?: string[];
  otherCosts?: OtherCost[];
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

/**
 * 🧠 WorkOrdersState
 * selectedWorkOrder is now a full object instead of nullable,
 * to avoid 'possibly null' TS warnings.
 */
export interface WorkOrdersState {
  workOrders: WorkOrderResponse[];
  selectedWorkOrder: WorkOrderResponse; // ✅ no longer nullable
  loading: boolean;
  error: string | null;
}
