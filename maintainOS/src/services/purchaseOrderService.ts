import api from "./api";
import type { PurchaseOrder, PurchaseOrderStatus } from "@prisma/client";

// Re-export Prisma types for convenience
export type { PurchaseOrder, PurchaseOrderStatus } from "@prisma/client";

// For API responses
export type PurchaseOrderResponse = PurchaseOrder;

// For creating new purchase orders
export interface CreatePurchaseOrderData {
  organizationId: string;
  vendorId: string;
  requestedById: string;
  orderNumber?: string;
  description?: string;
  totalAmount?: number;
  expectedDeliveryDate?: string;
  status?: PurchaseOrderStatus;
  notes?: string;
}

// For updating existing purchase orders
export interface UpdatePurchaseOrderData {
  vendorId?: string;
  requestedById?: string;
  orderNumber?: string;
  description?: string;
  totalAmount?: number;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  status?: PurchaseOrderStatus;
  notes?: string;
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
