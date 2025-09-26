import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

// src/services/purchaseOrderService.ts
import axios from "axios";

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
  status: "draft" | "pending_approval" | "approved" | "rejected" | "ordered" | "completed" | "cancelled";
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
  status: "draft" | "pending_approval" | "approved" | "rejected" | "ordered" | "completed" | "cancelled";
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
  status?: "draft" | "pending_approval" | "approved" | "rejected" | "ordered" | "completed" | "cancelled";
  items?: PurchaseOrderItem[];
  taxesAndCosts?: AdditionalCost[];
  shippingAddress?: string;
  billingAddress?: string;
  shippingContact?: Record<string, any>;
  dueDate?: string;
  notes?: string;
  files?: string[];
}

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


interface PurchaseOrdersState {
  purchaseOrders: PurchaseOrderResponse[];
  selectedPurchaseOrder: PurchaseOrderResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: PurchaseOrdersState = {
  purchaseOrders: [],
  selectedPurchaseOrder: null,
  loading: false,
  error: null,
};

// Async thunks
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

const purchaseOrdersSlice = createSlice({
  name: "purchaseOrders",
  initialState,
  reducers: {
    clearSelectedPurchaseOrder: (state) => {
      state.selectedPurchaseOrder = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all purchase orders
      .addCase(fetchPurchaseOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPurchaseOrders.fulfilled,
        (state, action: PayloadAction<PurchaseOrderResponse[]>) => {
          state.loading = false;
          state.purchaseOrders = action.payload;
        }
      )
      .addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch purchase order by ID
      .addCase(fetchPurchaseOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPurchaseOrderById.fulfilled,
        (state, action: PayloadAction<PurchaseOrderResponse>) => {
          state.loading = false;
          state.selectedPurchaseOrder = action.payload;
        }
      )
      .addCase(fetchPurchaseOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create purchase order
      .addCase(createPurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createPurchaseOrder.fulfilled,
        (state, action: PayloadAction<PurchaseOrderResponse>) => {
          state.loading = false;
          state.purchaseOrders.push(action.payload);
        }
      )
      .addCase(createPurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update purchase order
      .addCase(updatePurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updatePurchaseOrder.fulfilled,
        (state, action: PayloadAction<PurchaseOrderResponse>) => {
          state.loading = false;
          const index = state.purchaseOrders.findIndex(
            (purchaseOrder) => purchaseOrder.id === action.payload.id
          );
          if (index !== -1) {
            state.purchaseOrders[index] = action.payload;
          }
          if (state.selectedPurchaseOrder?.id === action.payload.id) {
            state.selectedPurchaseOrder = action.payload;
          }
        }
      )
      .addCase(updatePurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete purchase order
      .addCase(deletePurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deletePurchaseOrder.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.purchaseOrders = state.purchaseOrders.filter(
            (purchaseOrder) => purchaseOrder.id !== action.payload
          );
          if (state.selectedPurchaseOrder?.id === action.payload) {
            state.selectedPurchaseOrder = null;
          }
        }
      )
      .addCase(deletePurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedPurchaseOrder, clearError } =
  purchaseOrdersSlice.actions;
export default purchaseOrdersSlice.reducer;
