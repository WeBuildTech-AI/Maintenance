import { BaseInMemoryService, StoredEntity } from '../../common/base-in-memory.service';
import { AdditionalCostDto, CreatePurchaseOrderDto, PurchaseOrderItemDto, PurchaseOrderStatus } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
export interface PurchaseOrderDetails {
    organizationId: string;
    vendorId: string;
    status: PurchaseOrderStatus;
    items: PurchaseOrderItemDto[];
    taxesAndCosts?: AdditionalCostDto[];
    shippingAddress?: string;
    billingAddress?: string;
    shippingContact?: Record<string, any>;
    dueDate?: string;
    notes?: string;
    files?: string[];
}
export type PurchaseOrderEntity = StoredEntity<PurchaseOrderDetails>;
export declare class PurchaseOrdersService extends BaseInMemoryService<PurchaseOrderDetails> {
    createPurchaseOrder(payload: CreatePurchaseOrderDto): PurchaseOrderEntity;
    updatePurchaseOrder(id: string, payload: UpdatePurchaseOrderDto): PurchaseOrderEntity;
    findAllPurchaseOrders(): PurchaseOrderEntity[];
    findPurchaseOrderById(id: string): PurchaseOrderEntity;
}
