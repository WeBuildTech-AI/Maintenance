import { type Dispatch, type SetStateAction } from "react";

export type ViewMode = "todo" | "list" | "calendar" | "workload" | "calendar-week";

export interface WorkOrderAssignee {
  name: string;
  avatar: string;
  team?: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  description?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  estimated_time?: string;
  work_type?: string;
  assignedTo: WorkOrderAssignee;
  asset: string;
  location: string;
  isCompleted: boolean;
  wasDeleted?: boolean;
  deletedDate?: string;
  assignees: string;
  categories: [];
  name: string;
  workType: string;
  assets: any[];
  fullName: string;
}

export interface ListViewProps {
  workOrders: WorkOrder[];
  onRefreshWorkOrders: any;
  setIsSettingsModalOpen: any;
  isSettingsModalOpen: boolean;
  showDeleted: boolean;
  setShowDeleted: (value: boolean) => void;
}

export interface ToDoViewProps {
  todoWorkOrders: WorkOrder[];
  doneWorkOrders: WorkOrder[];
  selectedWorkOrder: WorkOrder;
  onSelectWorkOrder: Dispatch<SetStateAction<WorkOrder>>;
}
