import { Injectable } from '@nestjs/common';
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

@Injectable()
export class InventoryService extends BaseInMemoryService<InventoryDetails> {
  createInventory(payload: CreateInventoryDto): InventoryEntity {
    return super.create(payload);
  }

  updateInventory(id: string, payload: UpdateInventoryDto): InventoryEntity {
    return super.update(id, payload);
  }

  findAllInventory(): InventoryEntity[] {
    return super.findAll();
  }

  findInventoryById(id: string): InventoryEntity {
    return super.findOne(id);
  }
}
