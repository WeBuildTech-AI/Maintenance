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

// Data used to create/add an address for a purchase order
export interface CreateAddressData {
  purchaseOrderId: string;
  // address can be a single string or a structured object depending on API
  address: string | {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  // optional type: 'shipping' | 'billing'
  type?: "shipping" | "billing";
  contact?: Record<string, any>;
}

export interface PurchaseOrdersState {
  purchaseOrders: PurchaseOrderResponse[];
  selectedPurchaseOrder: PurchaseOrderResponse | null;
  loading: boolean;
  error: string | null;
}


export interface CreatePurchaseOrderComment{
  message:string
}