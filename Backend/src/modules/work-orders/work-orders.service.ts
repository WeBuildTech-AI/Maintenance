import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BaseInMemoryService } from '../../common/base-in-memory.service';
import { AssignWorkOrderDto } from './dto/assign-work-order.dto';
import { CreateWorkOrderDto, WorkOrderPriority } from './dto/create-work-order.dto';
import { CreateWorkOrderCommentDto } from './dto/create-work-order-comment.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { WorkOrderDetails, WorkOrderEntity, WorkOrderComment } from './view-models/work-order.view';

@Injectable()
export class WorkOrdersService extends BaseInMemoryService<WorkOrderDetails> {
  createWorkOrder(payload: CreateWorkOrderDto): WorkOrderEntity {
    return super.create({
      ...payload,
      comments: [],
    });
  }

  updateWorkOrder(id: string, payload: UpdateWorkOrderDto): WorkOrderEntity {
    return super.update(id, payload);
  }

  removeWorkOrder(id: string): WorkOrderEntity {
    return super.remove(id);
  }

  findAllWorkOrders(): WorkOrderEntity[] {
    return super.findAll();
  }

  findWorkOrderById(id: string): WorkOrderEntity {
    return super.findOne(id);
  }

  assignWorkOrder(id: string, payload: AssignWorkOrderDto): WorkOrderEntity {
    const workOrder = this.findWorkOrderById(id);
    return super.update(id, {
      ...workOrder,
      assigneeIds: payload.assigneeIds,
    });
  }

  addWorkOrderComment(id: string, payload: CreateWorkOrderCommentDto): WorkOrderEntity {
    const workOrder = this.findWorkOrderById(id);
    const comment: WorkOrderComment = {
      id: randomUUID(),
      authorId: payload.authorId,
      message: payload.message,
      createdAt: new Date().toISOString(),
    };
    return super.update(id, {
      ...workOrder,
      comments: [...(workOrder.comments ?? []), comment],
    });
  }

  updatePriority(id: string, priority: WorkOrderPriority): WorkOrderEntity {
    return super.update(id, { priority });
  }
}
