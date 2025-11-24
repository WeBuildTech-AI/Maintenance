import { createAsyncThunk } from "@reduxjs/toolkit";

import { purchaseOrderService } from "./purchaseOrders.service";
import type {
  CreatePurchaseOrderData,
  UpdatePurchaseOrderData,
  CreateAddressData,
  PurchaseOrderResponse,
  CreatePurchaseOrderComment,
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
        error.response?.data?.message || "Failed to reject purchase order"
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
        error.response?.data?.message || "Failed to approve purchase order"
      );
    }
  }
);

export const fullfillPurchaseOrder = createAsyncThunk(
  "purchaseOrders/fulfillPurchaseOrder",
  async (id: string, { rejectWithValue }) => {
    try {
      await purchaseOrderService.fullfillPurchaseOrder(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fullfill purchase order"
      );
    }
  }
);
export const completePurchaseOrder = createAsyncThunk(
  "purchaseOrders/completePurchaseOrder",
  async (id: string, { rejectWithValue }) => {
    try {
      await purchaseOrderService.completePurchaseOrder(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to complete purchase order"
      );
    }
  }
);
export const cancelPurchaseOrder = createAsyncThunk(
  "purchaseOrders/cancelPurchaseOrder",
  async (id: string, { rejectWithValue }) => {
    try {
      await purchaseOrderService.cancelPurchaseOrder(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel purchase order"
      );
    }
  }
);

export const updateItemOrder = createAsyncThunk(
  "purchaseOrders/updatePurchaseOrder",
  async (
    {
      poId,
      orderItem,
      data,
    }: { poId: string; orderItem: string; data: UpdatePurchaseOrderData },
    { rejectWithValue }
  ) => {
    try {
      return await purchaseOrderService.updateItemOrder(poId, orderItem, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update purchase order"
      );
    }
  }
);

export const createPurchaseOrderComment = createAsyncThunk(
  "purchaseOrders/createPurchaseOrderComment",
  async (
    { id, data }: { id: string; data: CreatePurchaseOrderComment },
    { rejectWithValue }
  ) => {
    try {
      return await purchaseOrderService.updatePurchaseOrder(id, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to create the comment in purchase order"
      );
    }
  }
);

export const fetchPurchaseOrderComment = createAsyncThunk(
  "purchaseOrders/fetchPurchaseOrderComment",
  async (_, { rejectWithValue }) => {
    try {
      return await purchaseOrderService.FetchPurchaseOrderComment;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch purchase orders comment"
      );
    }
  }
);
export const fetchPurchaseOrderLog = createAsyncThunk(
  "purchaseOrders/fetchPurchaseOrderLog",
  async (_, { rejectWithValue }) => {
    try {
      return await purchaseOrderService.FetchPurchaseOrderLog;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch purchase orders log"
      );
    }
  }
);

export const deletePurchaseOrderComment = createAsyncThunk(
  "purchaseOrders/deletePurchaseOrderComment",
  async (id: string, { rejectWithValue }) => {
    try {
      await purchaseOrderService.deletePurchaseOrderComment;
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to delete purchase order comment"
      );
    }
  }
);

export const batchDeletePurchaseOrder = createAsyncThunk(
  "purchaseOrder/batchDeletePurhaseOrder",
  async (ids: string[], { rejectWithValue }) => {
    try {
      await purchaseOrderService.batchDeletePurchaseOrder(ids);
      return ids;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete Purchase Order"
      );
    }
  }
);

export const fetchDeletePart = createAsyncThunk(
  "purchaseOrder/fetchDeletePurchaseOrder",
  async (_, { rejectWithValue }) => {
    try {
      const assets = await purchaseOrderService.fetchDeletePurchaseOrder();
      return assets;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch Delete Purchase Order "
      );
    }
  }
);

export const restorePurchaseOrderData = createAsyncThunk(
  "purchasrOrder/restorePurchaseOrderData",
  async (
    {
      id,
    }: {
      id: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const asset = await purchaseOrderService.restorePurchaseOrderData(id);
      return asset;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to restore Purchase Order Data"
      );
    }
  }
);
