import axios from "axios";

import type {
  CreateAddressData,
  CreatePurchaseOrderData,
  PurchaseOrderResponse,
  UpdatePurchaseOrderData,
} from "./purchaseOrders.types";

const API_URL = import.meta.env.VITE_API_URL;

export const purchaseOrderService = {
  // 🔹 Fetch all purchase orders
  fetchPurchaseOrders: async (): Promise<PurchaseOrderResponse[]> => {
    const res = await axios.get(`${API_URL}/purchase-orders`);
    return res.data;
  },

  // 🔹 Fetch a single purchase order by ID
  fetchPurchaseOrderById: async (
    id: string
  ): Promise<PurchaseOrderResponse> => {
    const res = await axios.get(`${API_URL}/purchase-orders/${id}`);
    return res.data;
  },

  // 🔹 Create a new purchase order
  createPurchaseOrder: async (
    data: CreatePurchaseOrderData
  ): Promise<PurchaseOrderResponse> => {
    const res = await axios.post(`${API_URL}/purchase-orders`, data);
    return res.data;
  },

  // 🔹 Update a purchase order
  updatePurchaseOrder: async (
    id: string,
    data: UpdatePurchaseOrderData
  ): Promise<PurchaseOrderResponse> => {
    const res = await axios.patch(`${API_URL}/purchase-orders/${id}`, data);
    return res.data;
  },

  // 🔹 Delete a purchase order
  deletePurchaseOrder: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/purchase-orders/${id}`);
  },

  // 🔹 Create or add an address for a purchase order
  createAddressOrder: async (
    data: CreateAddressData
  ): Promise<PurchaseOrderResponse> => {
    const res = await axios.post(`${API_URL}/purchase-orders/addresses`, data);
    return res.data;
  },

  fetchAdressess: async (): Promise<PurchaseOrderResponse[]> => {
    const res = await axios.get(`${API_URL}/purchase-orders/get/addresses`);
    return res.data;
  },

  rejectPurchaseOrder: async (id: string): Promise<void> => {
    await axios.patch(`${API_URL}/purchase-orders/${id}/reject`);
  },
  approvePurchaseOrder: async (id: string): Promise<void> => {
    await axios.patch(`${API_URL}/purchase-orders/${id}/approve`);
  },
};
