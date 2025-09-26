import axios from "axios";

import type {
  CreatePurchaseOrderData,
  PurchaseOrderResponse,
  UpdatePurchaseOrderData,
} from "./purchaseOrders.types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const purchaseOrderService = {
  fetchPurchaseOrders: async (): Promise<PurchaseOrderResponse[]> => {
    const res = await axios.get(`${API_URL}/purchase-orders`);
    return res.data;
  },

  fetchPurchaseOrderById: async (id: string): Promise<PurchaseOrderResponse> => {
    const res = await axios.get(`${API_URL}/purchase-orders/${id}`);
    return res.data;
  },

  createPurchaseOrder: async (
    data: CreatePurchaseOrderData
  ): Promise<PurchaseOrderResponse> => {
    const res = await axios.post(`${API_URL}/purchase-orders`, data);
    return res.data;
  },

  updatePurchaseOrder: async (
    id: string,
    data: UpdatePurchaseOrderData
  ): Promise<PurchaseOrderResponse> => {
    const res = await axios.patch(`${API_URL}/purchase-orders/${id}`, data);
    return res.data;
  },

  deletePurchaseOrder: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/purchase-orders/${id}`);
  },
};
