import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryService } from './inventory.service';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    findAll(_pagination: PaginationQueryDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        locationId: string | null;
        notes: string | null;
        partId: string;
        quantity: number;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        locationId: string | null;
        notes: string | null;
        partId: string;
        quantity: number;
    }>;
    create(body: CreateInventoryDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        locationId: string | null;
        notes: string | null;
        partId: string;
        quantity: number;
    }>;
    update(id: string, body: UpdateInventoryDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        locationId: string | null;
        notes: string | null;
        partId: string;
        quantity: number;
    }>;
}
