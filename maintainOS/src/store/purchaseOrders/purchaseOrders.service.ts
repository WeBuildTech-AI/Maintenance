// import { PurchaseOrder } from '../../components/purchase-orders/po.types';
import type {
  CreateAddressData,
  CreatePurchaseOrderComment,
  CreatePurchaseOrderData,
  GetPurchaseOrderLog,
  PurchaseOrderResponse,
  UpdatePurchaseOrderData,
  FetchPurchaseOrdersParams // ✅ Imported
} from "./purchaseOrders.types";
import api from "../auth/auth.service";

export const purchaseOrderService = {
  // ✅ Fetch all purchase orders (Updated with Params)
  fetchPurchaseOrders: async (params?: FetchPurchaseOrdersParams): Promise<PurchaseOrderResponse[]> => {
    const res = await api.get(`/purchase-orders`, { 
      params,
      paramsSerializer: { indexes: null } 
    });
    
    if (res.data && Array.isArray(res.data.items)) return res.data.items;
    if (Array.isArray(res.data)) return res.data;
    return [];
  },

  // 隼 Fetch a single purchase order by ID
  fetchPurchaseOrderById: async (
    id: string
  ): Promise<PurchaseOrderResponse> => {
    const res = await api.get(`/purchase-orders/${id}`);
    return res.data;
  },

  // 隼 Create a new purchase order
  createPurchaseOrder: async (
    data: CreatePurchaseOrderData
  ): Promise<PurchaseOrderResponse> => {
    const res = await api.post(`/purchase-orders`, data);
    return res.data;
  },

  // 隼 Update a purchase order
  updatePurchaseOrder: async (
    id: string,
    data: UpdatePurchaseOrderData
  ): Promise<PurchaseOrderResponse> => {
    const res = await api.patch(`/purchase-orders/${id}`, data);
    return res.data;
  },

  // 隼 Delete a purchase order
  deletePurchaseOrder: async (id: string): Promise<void> => {
    await api.delete(`/purchase-orders/${id}`);
  },

  // 隼 Create or add an address for a purchase order
  createAddressOrder: async (
    data: CreateAddressData
  ): Promise<PurchaseOrderResponse> => {
    const res = await api.post(`/purchase-orders/addresses`, data);
    return res.data;
  },

  fetchAdressess: async (): Promise<PurchaseOrderResponse[]> => {
    const res = await api.get(`/purchase-orders/get/addresses`);
    return res.data;
  },

  rejectPurchaseOrder: async (id: string): Promise<void> => {
    await api.patch(`/purchase-orders/${id}/reject`);
  },
  approvePurchaseOrder: async (id: string): Promise<void> => {
    await api.patch(`/purchase-orders/${id}/approve`);
  },
  fullfillPurchaseOrder: async (id: string): Promise<void> => {
    await api.patch(`/purchase-orders/${id}/fulfill`);
  },
  completePurchaseOrder: async (id: string): Promise<void> => {
    await api.patch(`/purchase-orders/${id}/complete`);
  },
  cancelPurchaseOrder: async (id: string): Promise<void> => {
    await api.patch(`/purchase-orders/${id}/cancel`);
  },

  updateItemOrder: async (
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

  FetchPurchaseOrderLog: async (id: string): Promise<GetPurchaseOrderLog> => {
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

  fetchDeletePurchaseOrder: async (): Promise<void> => {
    const res = await api.get(`purchase-orders/deleted/all`);
    return res.data;
  },

  restorePurchaseOrderData: async (id: string): Promise<PurchaseOrderResponse> => {
    const res = await api.patch(`/purchase-orders/${id}/restore`);
    return res.data;
  },
};