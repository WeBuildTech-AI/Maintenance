export declare enum PurchaseOrderStatus {
    DRAFT = "draft",
    PENDING_APPROVAL = "pending_approval",
    APPROVED = "approved",
    REJECTED = "rejected",
    ORDERED = "ordered",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class PurchaseOrderItemDto {
    partId: string;
    quantity: number;
    unitCost: number;
}
export declare class AdditionalCostDto {
    name: string;
    value: number;
    type: string;
}
export declare class CreatePurchaseOrderDto {
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
