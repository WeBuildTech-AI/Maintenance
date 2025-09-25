import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryService } from './inventory.service';

@Controller({ path: 'inventory', version: '1' })
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(@Query() _pagination: PaginationQueryDto) {
    return this.inventoryService.findAllInventory();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findInventoryById(id);
  }

  @Post()
  create(@Body() body: CreateInventoryDto) {
    return this.inventoryService.createInventory(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateInventoryDto) {
    return this.inventoryService.updateInventory(id, body);
  }
}
