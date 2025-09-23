import { PrismaService } from '../../database/prisma.service';
import { AssignWorkOrderDto } from './dto/assign-work-order.dto';
import { CreateWorkOrderDto, WorkOrderPriority } from './dto/create-work-order.dto';
import { CreateWorkOrderCommentDto } from './dto/create-work-order-comment.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { WorkOrderEntity } from './view-models/work-order.view';
export declare class WorkOrdersService {
    private readonly prisma;
    private readonly defaultInclude;
    constructor(prisma: PrismaService);
    createWorkOrder(payload: CreateWorkOrderDto): Promise<WorkOrderEntity>;
    updateWorkOrder(id: string, payload: UpdateWorkOrderDto): Promise<WorkOrderEntity>;
    removeWorkOrder(id: string): Promise<WorkOrderEntity>;
    findAllWorkOrders(): Promise<WorkOrderEntity[]>;
    findWorkOrderById(id: string): Promise<WorkOrderEntity>;
    assignWorkOrder(id: string, payload: AssignWorkOrderDto): Promise<WorkOrderEntity>;
    addWorkOrderComment(id: string, payload: CreateWorkOrderCommentDto): Promise<WorkOrderEntity>;
    updatePriority(id: string, priority: WorkOrderPriority): Promise<WorkOrderEntity>;
}
