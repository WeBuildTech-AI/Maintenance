import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
  PurchaseOrderResponse,
  PurchaseOrdersState,
} from "./purchaseOrders.types";
import {
  createPurchaseOrder,
  deletePurchaseOrder,
  fetchPurchaseOrderById,
  fetchPurchaseOrders,
  updatePurchaseOrder,
} from "./purchaseOrders.thunks";

const initialState: PurchaseOrdersState = {
  purchaseOrders: [],
  selectedPurchaseOrder: null,
  loading: false,
  error: null,
};

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
