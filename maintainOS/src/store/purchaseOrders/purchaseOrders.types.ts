export interface PurchaseOrderItem {
  partId: string;
  quantity: number;
  unitCost: number;
}

export interface AdditionalCost {
  name: string;
  value: number;
  type: string;
}

export interface PurchaseOrderResponse {
  id: string;
  organizationId: string;
  vendorId: string;
  status:
    | "draft"
    | "pending_approval"
    | "approved"
    | "rejected"
    | "ordered"
    | "completed"
    | "cancelled";
  items: PurchaseOrderItem[];
  taxesAndCosts?: AdditionalCost[];
  shippingAddress?: string;
  billingAddress?: string;
  shippingContact?: Record<string, any>;
  dueDate?: string;
  notes?: string;
  files?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrderData {
  organizationId: string;
  vendorId: string;
  status:
    | "draft"
    | "pending_approval"
    | "approved"
    | "rejected"
    | "ordered"
    | "completed"
    | "cancelled";
  items: PurchaseOrderItem[];
  taxesAndCosts?: AdditionalCost[];
  shippingAddress?: string;
  billingAddress?: string;
  shippingContact?: Record<string, any>;
  dueDate?: string;
  notes?: string;
  files?: string[];
}

export interface UpdatePurchaseOrderData {
  vendorId?: string;
  status?:
    | "draft"
    | "pending_approval"
    | "approved"
    | "rejected"
    | "ordered"
    | "completed"
    | "cancelled";
  items?: PurchaseOrderItem[];
  taxesAndCosts?: AdditionalCost[];
  shippingAddress?: string;
  billingAddress?: string;
  shippingContact?: Record<string, any>;
  dueDate?: string;
  notes?: string;
  files?: string[];
}

export interface PurchaseOrdersState {
  purchaseOrders: PurchaseOrderResponse[];
  selectedPurchaseOrder: PurchaseOrderResponse | null;
  loading: boolean;
  error: string | null;
}
