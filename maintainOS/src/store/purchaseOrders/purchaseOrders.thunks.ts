import { createAsyncThunk } from "@reduxjs/toolkit";

import { purchaseOrderService } from "./purchaseOrders.service";
import type {
  CreatePurchaseOrderData,
  UpdatePurchaseOrderData,
  CreateAddressData,
  PurchaseOrderResponse,
} from "./purchaseOrders.types";

export const fetchPurchaseOrders = createAsyncThunk(
  "purchaseOrders/fetchPurchaseOrders",
  async (_, { rejectWithValue }) => {
    try {
      return await purchaseOrderService.fetchPurchaseOrders();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch purchase orders"
      );
    }
  }
);

export const fetchPurchaseOrderById = createAsyncThunk(
  "purchaseOrders/fetchPurchaseOrderById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await purchaseOrderService.fetchPurchaseOrderById(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch purchase order"
      );
    }
  }
);

export const createPurchaseOrder = createAsyncThunk(
  "purchaseOrders/createPurchaseOrder",
  async (purchaseOrderData: CreatePurchaseOrderData, { rejectWithValue }) => {
    try {
      return await purchaseOrderService.createPurchaseOrder(purchaseOrderData);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create purchase order"
      );
    }
  }
);

export const updatePurchaseOrder = createAsyncThunk(
  "purchaseOrders/updatePurchaseOrder",
  async (
    { id, data }: { id: string; data: UpdatePurchaseOrderData },
    { rejectWithValue }
  ) => {
    try {
      return await purchaseOrderService.updatePurchaseOrder(id, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update purchase order"
      );
    }
  }
);

export const deletePurchaseOrder = createAsyncThunk(
  "purchaseOrders/deletePurchaseOrder",
  async (id: string, { rejectWithValue }) => {
    try {
      await purchaseOrderService.deletePurchaseOrder(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete purchase order"
      );
    }
  }
);

export const createAddress = createAsyncThunk<
  PurchaseOrderResponse,
  CreateAddressData,
  { rejectValue: string }
>(
  "purchaseOrders/createAddress",
  async (data: CreateAddressData, { rejectWithValue }) => {
    try {
      return await purchaseOrderService.createAddressOrder(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create address"
      );
    }
  }
);

export const fetchAddressess = createAsyncThunk(
  "purchaseOrders/get/addresses",
  async (_, { rejectWithValue }) => {
    try {
      return await purchaseOrderService.fetchAdressess;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch purchase orders"
      );
    }
  }
);

export const rejectPurchaseOrder = createAsyncThunk(
  "purchaseOrders/rejectPurchaseOrder",
  async (id: string, { rejectWithValue }) => {
    try {
      await purchaseOrderService.rejectPurchaseOrder(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete purchase order"
      );
    }
  }
);

export const approvePurchaseOrder = createAsyncThunk(
  "purchaseOrders/approvePurchaseOrder",
  async (id: string, { rejectWithValue }) => {
    try {
      await purchaseOrderService.approvePurchaseOrder(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete purchase order"
      );
    }
  }
);
