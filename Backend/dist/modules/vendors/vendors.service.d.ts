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
export declare class VendorsService extends BaseInMemoryService<VendorDetails> {
    createVendor(payload: CreateVendorDto): VendorEntity;
    updateVendor(id: string, payload: UpdateVendorDto): VendorEntity;
    removeVendor(id: string): VendorEntity;
    findVendorById(id: string): VendorEntity;
    findAllVendors(): VendorEntity[];
}
