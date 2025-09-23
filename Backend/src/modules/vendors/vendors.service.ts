import { Injectable } from '@nestjs/common';
import { BaseInMemoryService, StoredEntity } from '../../common/base-in-memory.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

export interface VendorDetails {
  organizationId: string;
  name: string;
  pictureUrl?: string;
  color?: string;
  description?: string;
  contacts?: Record<string, any>;
  files?: string[];
  vendorType?: string;
}

export type VendorEntity = StoredEntity<VendorDetails>;

@Injectable()
export class VendorsService extends BaseInMemoryService<VendorDetails> {
  createVendor(payload: CreateVendorDto): VendorEntity {
    return super.create(payload);
  }

  updateVendor(id: string, payload: UpdateVendorDto): VendorEntity {
    return super.update(id, payload);
  }

  removeVendor(id: string): VendorEntity {
    return super.remove(id);
  }

  findVendorById(id: string): VendorEntity {
    return super.findOne(id);
  }

  findAllVendors(): VendorEntity[] {
    return super.findAll();
  }
}
