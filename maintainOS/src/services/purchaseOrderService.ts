import api from "./api";

//  Type definitions 

export type PurchaseOrderStatus = "draft" | "pending_approval" | "approval" | "rejected" | "ordered" | "completed" | "cancelled";

export interface PurchaseOrder {
  id: string;
  organizationId: string;
  vendorId: string;
  status?: PurchaseOrderStatus;
  items: any; 
  taxesAndCosts?: any; 
  shippingAddress?: string;
  billingAddress?: string;
  shippingContact?: any; 
  dueDate?: Date;
  notes?: string;
  files: string[];
  createdAt: Date;
  updatedAt: Date;
}

// For API responses
export type PurchaseOrderResponse = PurchaseOrder;

// For creating new purchase orders
export interface CreatePurchaseOrderData {
  organizationId: string;
  vendorId: string;
  status?: PurchaseOrderStatus;
  items: any; 
  taxesAndCosts?: any; 
  shippingAddress?: string;
  billingAddress?: string;
  shippingContact?: any; 
  dueDate?: Date;
  notes?: string;
  files: string[];
}

// For updating existing purchase orders
export interface UpdatePurchaseOrderData {
  organizationId: string;
  vendorId: string;
  status?: PurchaseOrderStatus;
  items: any; 
  taxesAndCosts?: any; 
  shippingAddress?: string;
  billingAddress?: string;
  shippingContact?: any; 
  dueDate?: Date;
  notes?: string;
  files: string[];
}

export const purchaseOrderService = {
  // Fetch all purchase orders
  fetchPurchaseOrders: async (): Promise<PurchaseOrderResponse[]> => {
    const response = await api.get("/purchase-orders");
    return response.data;
  },

  // Fetch purchase order by ID
  fetchPurchaseOrderById: async (
    id: string
  ): Promise<PurchaseOrderResponse> => {
    const response = await api.get(`/purchase-orders/${id}`);
    return response.data;
  },

  // Create a new purchase order
  createPurchaseOrder: async (
    purchaseOrderData: CreatePurchaseOrderData
  ): Promise<PurchaseOrderResponse> => {
    const response = await api.post("/purchase-orders", purchaseOrderData);
    return response.data;
  },

  // Update purchase order
  updatePurchaseOrder: async (
    id: string,
    purchaseOrderData: UpdatePurchaseOrderData
  ): Promise<PurchaseOrderResponse> => {
    const response = await api.patch(
      `/purchase-orders/${id}`,
      purchaseOrderData
    );
    return response.data;
  },

  // Delete purchase order
  deletePurchaseOrder: async (id: string): Promise<void> => {
    await api.delete(`/purchase-orders/${id}`);
  },
};
