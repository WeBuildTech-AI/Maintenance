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
  poNumber?: string;
  vendor?: { name: string; id: string; email?: string; phone?: string }; // Added for type safety in UI
  orderItems?: any[];
  extraCosts?: number;
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
  address:
    | string
    | {
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

// ✅ API FILTER PARAMETERS
export interface FetchPurchaseOrdersParams {
  page?: number | string;
  limit?: number | string;
  search?: string; 
  
  // Dynamic Keys from QueryBuilder 
  [key: string]: any; 
}

export interface PurchaseOrdersState {
  purchaseOrders: PurchaseOrderResponse[];
  selectedPurchaseOrder: PurchaseOrderResponse | null;
  loading: boolean;
  error: string | null;
}

export interface CreatePurchaseOrderComment {
  message: string;
}

export interface GetPurchaseOrderLog {
  id: string;
  authorId: string;
  purchaseOrderId: string;
  responseLog: string;
  activityType: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}