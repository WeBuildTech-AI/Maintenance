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

// ✅ NEW — Work Order Time Entry structure
export interface WorkOrderTimeEntry {
  id: string;
  workOrderId: string;
  description: string;
  hours: number;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

// ✅ NEW — Data type for creating time entry
export interface CreateTimeEntryData {
  description: string;
  hours: number;
  createdBy: string;
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
  // ✅ Added — resolves TS error
  timeEntries?: WorkOrderTimeEntry[];
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
  selectedWorkOrder: WorkOrderResponse | null;
  loading: boolean;
  error: string | null;
}
