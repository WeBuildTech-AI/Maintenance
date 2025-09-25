import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AssignWorkOrderDto } from './dto/assign-work-order.dto';
import { CreateWorkOrderDto, WorkOrderPriority } from './dto/create-work-order.dto';
import { CreateWorkOrderCommentDto } from './dto/create-work-order-comment.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { WorkOrderEntity } from './view-models/work-order.view';

@Injectable()
export class WorkOrdersService {
  private readonly defaultInclude = { comments: true } as const;

  constructor(private readonly prisma: PrismaService) {}

  createWorkOrder(payload: CreateWorkOrderDto): Promise<WorkOrderEntity> {
    return this.prisma.workOrder.create({
      data: payload,
      include: this.defaultInclude,
    });
  }

  updateWorkOrder(id: string, payload: UpdateWorkOrderDto): Promise<WorkOrderEntity> {
    return this.prisma.workOrder.update({
      where: { id },
      data: payload,
      include: this.defaultInclude,
    });
  }

  removeWorkOrder(id: string): Promise<WorkOrderEntity> {
    return this.prisma.workOrder.delete({
      where: { id },
      include: this.defaultInclude,
    });
  }

  findAllWorkOrders(): Promise<WorkOrderEntity[]> {
    return this.prisma.workOrder.findMany({ include: this.defaultInclude });
  }

  findWorkOrderById(id: string): Promise<WorkOrderEntity> {
    return this.prisma.workOrder.findUniqueOrThrow({
      where: { id },
      include: this.defaultInclude,
    });
  }

  assignWorkOrder(id: string, payload: AssignWorkOrderDto): Promise<WorkOrderEntity> {
    return this.prisma.workOrder.update({
      where: { id },
      data: { assigneeIds: payload.assigneeIds },
      include: this.defaultInclude,
    });
  }

  async addWorkOrderComment(id: string, payload: CreateWorkOrderCommentDto): Promise<WorkOrderEntity> {
    await this.prisma.workOrderComment.create({
      data: {
        workOrderId: id,
        authorId: payload.authorId,
        message: payload.message,
      },
    });
    return this.findWorkOrderById(id);
  }

  updatePriority(id: string, priority: WorkOrderPriority): Promise<WorkOrderEntity> {
    return this.prisma.workOrder.update({
      where: { id },
      data: { priority },
      include: this.defaultInclude,
    });
  }
}
