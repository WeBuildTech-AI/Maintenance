import { Injectable } from '@nestjs/common';
import { BaseInMemoryService, StoredEntity } from '../../common/base-in-memory.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';

export interface PartDetails {
  organizationId: string;
  name: string;
  photos?: string[];
  unitCost?: number;
  description?: string;
  qrCode?: string;
  partsType?: string[];
  location?: Record<string, any>;
  assetIds?: string[];
  teamsInCharge?: string[];
  vendorIds?: string[];
  files?: string[];
}

export type PartEntity = StoredEntity<PartDetails>;

@Injectable()
export class PartsService extends BaseInMemoryService<PartDetails> {
  createPart(payload: CreatePartDto): PartEntity {
    return super.create(payload);
  }

  updatePart(id: string, payload: UpdatePartDto): PartEntity {
    return super.update(id, payload);
  }

  removePart(id: string): PartEntity {
    return super.remove(id);
  }

  findAllParts(): PartEntity[] {
    return super.findAll();
  }

  findPartById(id: string): PartEntity {
    return super.findOne(id);
  }
}
