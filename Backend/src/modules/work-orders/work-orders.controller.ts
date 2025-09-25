import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AssignWorkOrderDto } from './dto/assign-work-order.dto';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { CreateWorkOrderCommentDto } from './dto/create-work-order-comment.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { WorkOrdersService } from './work-orders.service';

@Controller({ path: 'work-orders', version: '1' })
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Get()
  findAll(@Query() _pagination: PaginationQueryDto) {
    return this.workOrdersService.findAllWorkOrders();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workOrdersService.findWorkOrderById(id);
  }

  @Post()
  create(@Body() body: CreateWorkOrderDto) {
    return this.workOrdersService.createWorkOrder(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateWorkOrderDto) {
    return this.workOrdersService.updateWorkOrder(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workOrdersService.removeWorkOrder(id);
  }

  @Post(':id/assign')
  assign(@Param('id') id: string, @Body() body: AssignWorkOrderDto) {
    return this.workOrdersService.assignWorkOrder(id, body);
  }

  @Post(':id/comment')
  comment(@Param('id') id: string, @Body() body: CreateWorkOrderCommentDto) {
    return this.workOrdersService.addWorkOrderComment(id, body);
  }
}
