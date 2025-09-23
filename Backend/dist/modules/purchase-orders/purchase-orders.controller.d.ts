import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseOrdersService } from './purchase-orders.service';
export declare class PurchaseOrdersController {
    private readonly purchaseOrdersService;
    constructor(purchaseOrdersService: PurchaseOrdersService);
    findAll(_pagination: PaginationQueryDto): import("./purchase-orders.service").PurchaseOrderEntity[];
    findOne(id: string): import("./purchase-orders.service").PurchaseOrderEntity;
    create(body: CreatePurchaseOrderDto): import("./purchase-orders.service").PurchaseOrderEntity;
    update(id: string, body: UpdatePurchaseOrderDto): import("./purchase-orders.service").PurchaseOrderEntity;
}
