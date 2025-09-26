import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { WorkOrderResponse, WorkOrdersState } from "./workOrders.types";
import {
  addWorkOrderComment,
  assignWorkOrder,
  createWorkOrder,
  deleteWorkOrder,
  fetchWorkOrderById,
  fetchWorkOrders,
  markWorkOrderCompleted,
  markWorkOrderInProgress,
  updateWorkOrder,
} from "./workOrders.thunks";

const initialState: WorkOrdersState = {
  workOrders: [],
  selectedWorkOrder: null,
  loading: false,
  error: null,
};

const workOrdersSlice = createSlice({
  name: "workOrders",
  initialState,
  reducers: {
    clearSelectedWorkOrder: (state) => {
      state.selectedWorkOrder = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchWorkOrders.fulfilled,
        (state, action: PayloadAction<WorkOrderResponse[]>) => {
          state.loading = false;
          state.workOrders = action.payload;
        }
      )
      .addCase(fetchWorkOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchWorkOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchWorkOrderById.fulfilled,
        (state, action: PayloadAction<WorkOrderResponse>) => {
          state.loading = false;
          state.selectedWorkOrder = action.payload;
        }
      )
      .addCase(fetchWorkOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createWorkOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createWorkOrder.fulfilled,
        (state, action: PayloadAction<WorkOrderResponse>) => {
          state.loading = false;
          state.workOrders.push(action.payload);
        }
      )
      .addCase(createWorkOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateWorkOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateWorkOrder.fulfilled,
        (state, action: PayloadAction<WorkOrderResponse>) => {
          state.loading = false;
          const index = state.workOrders.findIndex(
            (workOrder) => workOrder.id === action.payload.id
          );
          if (index !== -1) {
            state.workOrders[index] = action.payload;
          }
          if (state.selectedWorkOrder?.id === action.payload.id) {
            state.selectedWorkOrder = action.payload;
          }
        }
      )
      .addCase(updateWorkOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteWorkOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteWorkOrder.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.workOrders = state.workOrders.filter(
            (workOrder) => workOrder.id !== action.payload
          );
          if (state.selectedWorkOrder?.id === action.payload) {
            state.selectedWorkOrder = null;
          }
        }
      )
      .addCase(deleteWorkOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(assignWorkOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        assignWorkOrder.fulfilled,
        (state, action: PayloadAction<WorkOrderResponse>) => {
          state.loading = false;
          const index = state.workOrders.findIndex(
            (workOrder) => workOrder.id === action.payload.id
          );
          if (index !== -1) {
            state.workOrders[index] = action.payload;
          }
          if (state.selectedWorkOrder?.id === action.payload.id) {
            state.selectedWorkOrder = action.payload;
          }
        }
      )
      .addCase(assignWorkOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(addWorkOrderComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addWorkOrderComment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addWorkOrderComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(markWorkOrderCompleted.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        markWorkOrderCompleted.fulfilled,
        (state, action: PayloadAction<WorkOrderResponse>) => {
          state.loading = false;
          const index = state.workOrders.findIndex(
            (workOrder) => workOrder.id === action.payload.id
          );
          if (index !== -1) {
            state.workOrders[index] = action.payload;
          }
          if (state.selectedWorkOrder?.id === action.payload.id) {
            state.selectedWorkOrder = action.payload;
          }
        }
      )
      .addCase(markWorkOrderCompleted.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(markWorkOrderInProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        markWorkOrderInProgress.fulfilled,
        (state, action: PayloadAction<WorkOrderResponse>) => {
          state.loading = false;
          const index = state.workOrders.findIndex(
            (workOrder) => workOrder.id === action.payload.id
          );
          if (index !== -1) {
            state.workOrders[index] = action.payload;
          }
          if (state.selectedWorkOrder?.id === action.payload.id) {
            state.selectedWorkOrder = action.payload;
          }
        }
      )
      .addCase(markWorkOrderInProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedWorkOrder, clearError } = workOrdersSlice.actions;
export default workOrdersSlice.reducer;
