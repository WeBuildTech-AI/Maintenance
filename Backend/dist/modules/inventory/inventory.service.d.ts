import { BaseInMemoryService, StoredEntity } from '../../common/base-in-memory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
export interface InventoryDetails {
    organizationId: string;
    partId: string;
    quantity: number;
    locationId?: string;
    notes?: string;
}
export type InventoryEntity = StoredEntity<InventoryDetails>;
export declare class InventoryService extends BaseInMemoryService<InventoryDetails> {
    createInventory(payload: CreateInventoryDto): InventoryEntity;
    updateInventory(id: string, payload: UpdateInventoryDto): InventoryEntity;
    findAllInventory(): InventoryEntity[];
    findInventoryById(id: string): InventoryEntity;
}
