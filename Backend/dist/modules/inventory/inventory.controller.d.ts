import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryService } from './inventory.service';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    findAll(_pagination: PaginationQueryDto): import("./inventory.service").InventoryEntity[];
    findOne(id: string): import("./inventory.service").InventoryEntity;
    create(body: CreateInventoryDto): import("./inventory.service").InventoryEntity;
    update(id: string, body: UpdateInventoryDto): import("./inventory.service").InventoryEntity;
}
