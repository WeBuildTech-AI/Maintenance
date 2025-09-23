import { Injectable } from '@nestjs/common';
import { InventoryLevel } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  createInventory(payload: CreateInventoryDto): Promise<InventoryLevel> {
    return this.prisma.inventoryLevel.create({ data: payload });
  }

  updateInventory(id: string, payload: UpdateInventoryDto): Promise<InventoryLevel> {
    return this.prisma.inventoryLevel.update({ where: { id }, data: payload });
  }

  findAllInventory(): Promise<InventoryLevel[]> {
    return this.prisma.inventoryLevel.findMany();
  }

  findInventoryById(id: string): Promise<InventoryLevel> {
    return this.prisma.inventoryLevel.findUniqueOrThrow({ where: { id } });
  }
}
