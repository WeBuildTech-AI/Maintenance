import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseOrdersService } from './purchase-orders.service';

@Controller({ path: 'purchase-orders', version: '1' })
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Get()
  findAll(@Query() _pagination: PaginationQueryDto) {
    return this.purchaseOrdersService.findAllPurchaseOrders();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseOrdersService.findPurchaseOrderById(id);
  }

  @Post()
  create(@Body() body: CreatePurchaseOrderDto) {
    return this.purchaseOrdersService.createPurchaseOrder(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdatePurchaseOrderDto) {
    return this.purchaseOrdersService.updatePurchaseOrder(id, body);
  }
}
