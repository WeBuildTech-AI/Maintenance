// src/store/workOrders/workOrders.types.ts

export interface WorkOrderComment {
  id: string;
  workOrderId: string;
  authorId: string; // ✅ Matches API
  message: string;
  createdAt: string;
  author?: {        // ✅ Matches API
    id: string;
    fullName: string;
    email?: string;
    avatarUrl?: string;
  };
}

export interface WorkOrderLog {
  id: string;
  workOrderId: string;
  authorId: string;
  responseLog: string; // ✅ Matches API JSON "responseLog"
  activityType: string;
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: string;
  author?: {           // ✅ Matches API JSON "author"
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  // Optional legacy fields (can be kept for compatibility)
  action?: string;
  description?: string;
  performedBy?: string;
}

export interface OtherCost {
  id: string;
  description: string;
  amount: number;
  category?: string;
  createdAt?: string;
  user?: { fullName: string; id?: string };
  [key: string]: any;
}

export interface CreateOtherCostData {
  description: string;
  amount: number;
  category?: string;
  userId?: string;
  [key: string]: any;
}

export interface WorkOrderTimeEntry {
  id: string;
  workOrderId: string;
  description?: string;
  totalMinutes: number;
  entryType: string;
  rate: number;
  user?: { fullName: string; id?: string };
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTimeEntryData {
  userId: string;
  totalMinutes: number;
  entryType: string; // 'work', 'travel', etc.
  rate?: number;
}

export interface WorkOrderResponse {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "completed" | "on_hold" | "done";
  dueDate?: string;
  startDate?: string;
  assigneeIds?: string[];
  assignedTeamIds?: string[];
  // Expanded objects for UI
  assignees?: any[];
  teams?: any[];
  location?: any;
  assets?: any[];
  parts?: any[];
  vendors?: any[];
  categories?: any[];
  procedures?: any[];
  meters?: any[];
  
  otherCosts?: OtherCost[];
  timeEntries?: WorkOrderTimeEntry[];
  comments?: WorkOrderComment[]; // ✅ Added comments array
  
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  deletedDate?: string;
  wasDeleted?: boolean;
  
  // Cost totals
  grandTotalCost?: string;
  otherCostTotal?: string;
  partsCostTotal?: string;
  timeCostTotal?: string;
}

export interface CreateWorkOrderData {
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  dueDate?: string;
  startDate?: string;
  locationId?: string;
  assigneeIds?: string[];
  assignedTeamIds?: string[];
  assetIds?: string[];
  vendorIds?: string[];
  partIds?: string[];
  categoryIds?: string[];
  procedureIds?: string[];
  qrCode?: string;
  workType?: string;
  recurrence?: string;
}

export interface UpdateWorkOrderData extends Partial<CreateWorkOrderData> {
  status?: "open" | "in_progress" | "completed" | "on_hold" | "done";
}

export interface AssignWorkOrderData {
  assigneeIds: string[];
}

// ✅ Payload for Adding Comment
export interface AddCommentPayload {
  message: string;
}

export interface WorkOrdersState {
  workOrders: WorkOrderResponse[];
  selectedWorkOrder: WorkOrderResponse | null;
  logs: WorkOrderLog[]; // ✅ Added Logs State
  loading: boolean;
  error: string | null;
}