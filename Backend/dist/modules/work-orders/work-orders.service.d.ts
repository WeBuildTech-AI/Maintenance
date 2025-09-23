import { BaseInMemoryService } from '../../common/base-in-memory.service';
import { AssignWorkOrderDto } from './dto/assign-work-order.dto';
import { CreateWorkOrderDto, WorkOrderPriority } from './dto/create-work-order.dto';
import { CreateWorkOrderCommentDto } from './dto/create-work-order-comment.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { WorkOrderDetails, WorkOrderEntity } from './view-models/work-order.view';
export declare class WorkOrdersService extends BaseInMemoryService<WorkOrderDetails> {
    createWorkOrder(payload: CreateWorkOrderDto): WorkOrderEntity;
    updateWorkOrder(id: string, payload: UpdateWorkOrderDto): WorkOrderEntity;
    removeWorkOrder(id: string): WorkOrderEntity;
    findAllWorkOrders(): WorkOrderEntity[];
    findWorkOrderById(id: string): WorkOrderEntity;
    assignWorkOrder(id: string, payload: AssignWorkOrderDto): WorkOrderEntity;
    addWorkOrderComment(id: string, payload: CreateWorkOrderCommentDto): WorkOrderEntity;
    updatePriority(id: string, priority: WorkOrderPriority): WorkOrderEntity;
}
