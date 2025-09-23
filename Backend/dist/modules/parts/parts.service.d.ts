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
export declare class PartsService extends BaseInMemoryService<PartDetails> {
    createPart(payload: CreatePartDto): PartEntity;
    updatePart(id: string, payload: UpdatePartDto): PartEntity;
    removePart(id: string): PartEntity;
    findAllParts(): PartEntity[];
    findPartById(id: string): PartEntity;
}
