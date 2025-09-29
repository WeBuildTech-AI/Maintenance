export interface Assignee {
  name: string;
  avatar?: string;
  team?: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  assignedTo: Assignee;
}
