import { StoredEntity } from '../../../common/base-in-memory.service';
import { WorkOrderPriority } from '../dto/create-work-order.dto';

export interface WorkOrderComment {
  id: string;
  authorId: string;
  message: string;
  createdAt: string;
}

export interface WorkOrderDetails {
  organizationId: string;
  title: string;
  status?: string;
  pictures?: string[];
  description?: string;
  locationId?: string;
  assetIds?: string[];
  procedureIds?: string[];
  assigneeIds?: string[];
  estimatedTimeHours?: number;
  dueDate?: string;
  startDate?: string;
  recurrenceRule?: string;
  workType?: string;
  priority?: WorkOrderPriority;
  files?: string[];
  partIds?: string[];
  categoryIds?: string[];
  vendorIds?: string[];
  comments?: WorkOrderComment[];
}

export type WorkOrderEntity = StoredEntity<WorkOrderDetails>;
