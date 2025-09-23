import { WorkOrder, WorkOrderComment } from '@prisma/client';
export type WorkOrderEntity = WorkOrder & {
    comments: WorkOrderComment[];
};
