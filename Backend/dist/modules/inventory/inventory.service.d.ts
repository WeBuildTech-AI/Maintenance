import { InventoryLevel } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
export declare class InventoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createInventory(payload: CreateInventoryDto): Promise<InventoryLevel>;
    updateInventory(id: string, payload: UpdateInventoryDto): Promise<InventoryLevel>;
    findAllInventory(): Promise<InventoryLevel[]>;
    findInventoryById(id: string): Promise<InventoryLevel>;
}
