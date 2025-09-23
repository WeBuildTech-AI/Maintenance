import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AssignWorkOrderDto } from './dto/assign-work-order.dto';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { CreateWorkOrderCommentDto } from './dto/create-work-order-comment.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { WorkOrdersService } from './work-orders.service';
export declare class WorkOrdersController {
    private readonly workOrdersService;
    constructor(workOrdersService: WorkOrdersService);
    findAll(_pagination: PaginationQueryDto): import("./view-models/work-order.view").WorkOrderEntity[];
    findOne(id: string): import("./view-models/work-order.view").WorkOrderEntity;
    create(body: CreateWorkOrderDto): import("./view-models/work-order.view").WorkOrderEntity;
    update(id: string, body: UpdateWorkOrderDto): import("./view-models/work-order.view").WorkOrderEntity;
    remove(id: string): import("./view-models/work-order.view").WorkOrderEntity;
    assign(id: string, body: AssignWorkOrderDto): import("./view-models/work-order.view").WorkOrderEntity;
    comment(id: string, body: CreateWorkOrderCommentDto): import("./view-models/work-order.view").WorkOrderEntity;
}
