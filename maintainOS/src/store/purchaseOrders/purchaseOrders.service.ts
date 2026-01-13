import type {
  CreateAddressData,
  CreatePurchaseOrderComment,
  CreatePurchaseOrderData,
  GetPurchaseOrderLog,
  PurchaseOrderResponse,
  UpdatePurchaseOrderData,
  FetchPurchaseOrdersParams,
} from "./purchaseOrders.types";
import api from "../auth/auth.service";

export const purchaseOrderService = {
  // ✅ Fetch all purchase orders (with params)
  fetchPurchaseOrders: async (
    params?: FetchPurchaseOrdersParams
  ): Promise<PurchaseOrderResponse[]> => {
    const res = await api.get(`/purchase-orders`, {
      params,
      paramsSerializer: { indexes: null },
    });

    if (res.data && Array.isArray(res.data.items)) return res.data.items;
    if (Array.isArray(res.data)) return res.data;
    return [];
  },

  // ✅ Fetch a single purchase order by ID
  fetchPurchaseOrderById: async (
    id: string
  ): Promise<PurchaseOrderResponse> => {
    const res = await api.get(`/purchase-orders/${id}`);
    return res.data;
  },

  // ✅ Create a new purchase order
  createPurchaseOrder: async (
    data: CreatePurchaseOrderData
  ): Promise<PurchaseOrderResponse> => {
    const res = await api.post(`/purchase-orders`, data);
    return res.data;
  },

  // ✅ Update a purchase order
  updatePurchaseOrder: async (
    id: string,
    data: UpdatePurchaseOrderData
  ): Promise<PurchaseOrderResponse> => {
    const res = await api.patch(`/purchase-orders/${id}`, data);
    return res.data;
  },

  // ✅ Delete a purchase order
  deletePurchaseOrder: async (id: string): Promise<void> => {
    await api.delete(`/purchase-orders/${id}`);
  },

  // ✅ Approve PO
  approvePurchaseOrder: async (id: string): Promise<void> => {
    await api.patch(`/purchase-orders/${id}/approve`);
  },

  // ✅ Reject PO
  rejectPurchaseOrder: async (id: string): Promise<void> => {
    await api.patch(`/purchase-orders/${id}/reject`);
  },

  // ✅ Cancel PO
  cancelPurchaseOrder: async (id: string): Promise<void> => {
    await api.patch(`/purchase-orders/${id}/cancel`);
  },

  // ✅ Fulfill PO
  fulfillPurchaseOrder: async (id: string): Promise<void> => {
    await api.patch(`/purchase-orders/${id}/fulfill`);
  },

  // ✅ Fetch Addresses
  fetchAddresses: async (): Promise<any[]> => {
    const res = await api.get(`/purchase-orders/get/addresses`);
    return res.data;
  },

  createAddress: async (data: CreateAddressData): Promise<any> => {
    const res = await api.post(`/purchase-orders/create/address`, data);
    return res.data;
  },

  // --- Order Items ---
  addOrderItem: async (
    poId: string,
    data: CreatePurchaseOrderData
  ): Promise<PurchaseOrderResponse> => {
    const res = await api.post(`/purchase-orders/${poId}/order-items`, data);
    return res.data;
  },

  removeOrderItem: async (
    poId: string,
    itemId: string
  ): Promise<PurchaseOrderResponse> => {
    const res = await api.delete(
      `/purchase-orders/${poId}/order-items/${itemId}`
    );
    return res.data;
  },

  updateOrderItem: async (
    poId: string,
    itemId: string,
    data: UpdatePurchaseOrderData
  ): Promise<PurchaseOrderResponse> => {
    const res = await api.patch(
      `/purchase-orders/${poId}/order-items/${itemId}`,
      data
    );
    return res.data;
  },

  // --- Comments ---
  createPurchaseOrderComment: async (
    id: string,
    data: CreatePurchaseOrderComment
  ): Promise<PurchaseOrderResponse> => {
    const res = await api.post(`/purchase-orders/${id}/comment`, data);
    return res.data;
  },

  FetchPurchaseOrderComment: async (
    id: string
  ): Promise<PurchaseOrderResponse> => {
    const res = await api.get(`/purchase-orders/${id}/comments`);
    return res.data;
  },

  // 🔴 FIXED: URL updated to match your backend API documentation
  fetchPurchaseOrderLog: async (id: string): Promise<GetPurchaseOrderLog> => {
    // Was: /purchase-orders/${id}/logs (Caused 404)
    // Now: /purchase-orders/get/logs/${id} (Correct)
    const res = await api.get(`/purchase-orders/get/logs/${id}`);
    return res.data;
  },

  deletePurchaseOrderComment: async (id: string): Promise<void> => {
    await api.delete(`/purchase-orders/comments/${id}`);
  },

  batchDeletePurchaseOrder: async (ids: string[]): Promise<void> => {
    await api.delete(`purchase-orders/batch-delete`, {
      data: { ids: ids },
    });
  },

  fetchDeletePurchaseOrder: async (): Promise<PurchaseOrderResponse[]> => {
    const res = await api.get(`/purchase-orders/get/deleted`);
    return res.data;
  },

  restorePurchaseOrderData: async (id: string): Promise<any> => {
    const res = await api.post(`/purchase-orders/${id}/restore`);
    return res.data;
  },
};