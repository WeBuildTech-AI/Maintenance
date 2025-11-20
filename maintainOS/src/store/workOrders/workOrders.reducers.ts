import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { 
  WorkOrderResponse, 
  WorkOrdersState, 
  WorkOrderComment, 
  WorkOrderLog 
} from "./workOrders.types";
import {
  addWorkOrderComment,
  fetchWorkOrderComments,
  fetchWorkOrderLogs,
  assignWorkOrder,
  createWorkOrder,
  deleteWorkOrder,
  fetchWorkOrderById,
  fetchWorkOrders,
  markWorkOrderCompleted,
  markWorkOrderInProgress,
  updateWorkOrder,
  addOtherCost,
  deleteOtherCost,
  addTimeEntry,
  deleteTimeEntry,
  patchWorkOrderComplete,
} from "./workOrders.thunks";

const initialState: WorkOrdersState = {
  workOrders: [],
  selectedWorkOrder: null,
  logs: [], 
  loading: false,
  error: null,
};

const workOrdersSlice = createSlice({
  name: "workOrders",
  initialState,
  reducers: {
    clearSelectedWorkOrder(state) {
      state.selectedWorkOrder = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch All ---
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

      // --- Fetch By ID ---
      .addCase(fetchWorkOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchWorkOrderById.fulfilled,
        (state, action: PayloadAction<WorkOrderResponse>) => {
          state.loading = false;
          state.selectedWorkOrder = action.payload;
          const idx = state.workOrders.findIndex(
            (w) => w.id === action.payload.id
          );
          if (idx !== -1) state.workOrders[idx] = action.payload;
        }
      )
      .addCase(fetchWorkOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- Create ---
      .addCase(createWorkOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createWorkOrder.fulfilled,
        (state, action: PayloadAction<WorkOrderResponse>) => {
          state.loading = false;
          state.workOrders.unshift(action.payload);
        }
      )
      .addCase(createWorkOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- Update ---
      .addCase(updateWorkOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateWorkOrder.fulfilled,
        (state, action: PayloadAction<WorkOrderResponse>) => {
          state.loading = false;
          const idx = state.workOrders.findIndex(
            (w) => w.id === action.payload.id
          );
          if (idx !== -1) {
            state.workOrders[idx] = action.payload;
          }
          if (
            state.selectedWorkOrder &&
            state.selectedWorkOrder.id === action.payload.id
          ) {
            state.selectedWorkOrder = action.payload;
          }
        }
      )
      .addCase(updateWorkOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- Delete ---
      .addCase(deleteWorkOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteWorkOrder.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.meta.arg as string;
        state.workOrders = state.workOrders.filter((w) => w.id !== id);
        if (state.selectedWorkOrder?.id === id) {
          state.selectedWorkOrder = null;
        }
      })
      .addCase(deleteWorkOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- Assign ---
      .addCase(assignWorkOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        assignWorkOrder.fulfilled,
        (state, action: PayloadAction<WorkOrderResponse>) => {
          state.loading = false;
          const idx = state.workOrders.findIndex(
            (w) => w.id === action.payload.id
          );
          if (idx !== -1) {
            state.workOrders[idx] = action.payload;
          }
          if (
            state.selectedWorkOrder &&
            state.selectedWorkOrder.id === action.payload.id
          ) {
            state.selectedWorkOrder = action.payload;
          }
        }
      )
      .addCase(assignWorkOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- Add Comment ---
      .addCase(addWorkOrderComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        addWorkOrderComment.fulfilled,
        (state, action: PayloadAction<WorkOrderComment>) => {
          state.loading = false;
          
          const newComment = action.payload;
          const workOrderId = (action.meta as any).arg.id;

          // Helper: Add comment safely avoiding duplicates
          const addSafe = (existing: WorkOrderComment[] | undefined) => {
            const list = existing || [];
            if (list.some(c => c.id === newComment.id)) return list;
            return [...list, newComment];
          };

          // Update selected work order if it matches
          if (
            state.selectedWorkOrder &&
            state.selectedWorkOrder.id === workOrderId
          ) {
            state.selectedWorkOrder.comments = addSafe(state.selectedWorkOrder.comments);
          }
          
          // Update the list item if it exists
          const idx = state.workOrders.findIndex((w) => w.id === workOrderId);
          if (idx !== -1) {
            state.workOrders[idx].comments = addSafe(state.workOrders[idx].comments);
          }
        }
      )
      .addCase(addWorkOrderComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- Fetch Comments ---
      .addCase(fetchWorkOrderComments.fulfilled, (state, action: PayloadAction<WorkOrderComment[]>) => {
        const workOrderId = (action.meta as any).arg;
        // Update selected work order if open
        if (state.selectedWorkOrder && state.selectedWorkOrder.id === workOrderId) {
          state.selectedWorkOrder.comments = action.payload;
        }
        // Update list item if exists
        const idx = state.workOrders.findIndex((w) => w.id === workOrderId);
        if (idx !== -1) {
          state.workOrders[idx].comments = action.payload;
        }
      })

      // --- Fetch Logs (✅ Added) ---
      .addCase(fetchWorkOrderLogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorkOrderLogs.fulfilled, (state, action: PayloadAction<WorkOrderLog[]>) => {
        state.loading = false;
        // Ensure we store the array, regardless of API response structure
        if (Array.isArray(action.payload)) {
          state.logs = action.payload;
        } else {
          state.logs = [];
        }
      })
      .addCase(fetchWorkOrderLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- Mark Completed ---
      .addCase(markWorkOrderCompleted.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        markWorkOrderCompleted.fulfilled,
        (state, action: PayloadAction<WorkOrderResponse>) => {
          state.loading = false;
          const idx = state.workOrders.findIndex(
            (w) => w.id === action.payload.id
          );
          if (idx !== -1) {
            state.workOrders[idx] = action.payload;
          }
          if (
            state.selectedWorkOrder &&
            state.selectedWorkOrder.id === action.payload.id
          ) {
            state.selectedWorkOrder = action.payload;
          }
        }
      )
      .addCase(markWorkOrderCompleted.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- Patch Complete ---
      .addCase(patchWorkOrderComplete.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        patchWorkOrderComplete.fulfilled,
        (state, action: PayloadAction<WorkOrderResponse>) => {
          state.loading = false;
          const idx = state.workOrders.findIndex(
            (w) => w.id === action.payload.id
          );
          if (idx !== -1) {
            state.workOrders[idx] = action.payload;
          }
          if (
            state.selectedWorkOrder &&
            state.selectedWorkOrder.id === action.payload.id
          ) {
            state.selectedWorkOrder = action.payload;
          }
        }
      )
      .addCase(patchWorkOrderComplete.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- Mark In Progress ---
      .addCase(markWorkOrderInProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        markWorkOrderInProgress.fulfilled,
        (state, action: PayloadAction<WorkOrderResponse>) => {
          state.loading = false;
          const idx = state.workOrders.findIndex(
            (w) => w.id === action.payload.id
          );
          if (idx !== -1) {
            state.workOrders[idx] = action.payload;
          }
          if (
            state.selectedWorkOrder &&
            state.selectedWorkOrder.id === action.payload.id
          ) {
            state.selectedWorkOrder = action.payload;
          }
        }
      )
      .addCase(markWorkOrderInProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- Add Other Cost ---
      .addCase(addOtherCost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addOtherCost.fulfilled, (state, action) => {
        state.loading = false;
        const created = action.payload as any;
        const workOrderId = (action.meta as any)?.arg?.id;
        const wo = state.workOrders.find((w) => w.id === workOrderId);
        if (wo) {
          wo.otherCosts = [...(wo.otherCosts || []), created];
        }
        if (
          state.selectedWorkOrder &&
          state.selectedWorkOrder.id === workOrderId
        ) {
          state.selectedWorkOrder.otherCosts = [
            ...(state.selectedWorkOrder.otherCosts || []),
            created,
          ];
        }
      })
      .addCase(addOtherCost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- Delete Other Cost ---
      .addCase(deleteOtherCost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOtherCost.fulfilled, (state, action) => {
        state.loading = false;
        const { id, costId } = action.payload as any;
        const wo = state.workOrders.find((w) => w.id === id);
        if (wo && wo.otherCosts) {
          wo.otherCosts = wo.otherCosts.filter((c: any) => c.id !== costId);
        }
        if (
          state.selectedWorkOrder &&
          state.selectedWorkOrder.id === id &&
          state.selectedWorkOrder.otherCosts
        ) {
          state.selectedWorkOrder.otherCosts = state.selectedWorkOrder.otherCosts.filter(
            (c: any) => c.id !== costId
          );
        }
      })
      .addCase(deleteOtherCost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- Add Time Entry ---
      .addCase(addTimeEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTimeEntry.fulfilled, (state, action) => {
        state.loading = false;
        const created = action.payload as any;
        const workOrderId = (action.meta as any)?.arg?.id;
        const wo = state.workOrders.find((w) => w.id === workOrderId);
        if (wo) {
          wo.timeEntries = [...(wo.timeEntries || []), created];
        }
        if (
          state.selectedWorkOrder &&
          state.selectedWorkOrder.id === workOrderId
        ) {
          state.selectedWorkOrder.timeEntries = [
            ...(state.selectedWorkOrder.timeEntries || []),
            created,
          ];
        }
      })
      .addCase(addTimeEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- Delete Time Entry ---
      .addCase(deleteTimeEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTimeEntry.fulfilled, (state, action) => {
        state.loading = false;
        const { id, entryId } = action.payload as any;
        const wo = state.workOrders.find((w) => w.id === id);
        if (wo && wo.timeEntries) {
          wo.timeEntries = wo.timeEntries.filter((t: any) => t.id !== entryId);
        }
        if (
          state.selectedWorkOrder &&
          state.selectedWorkOrder.id === id &&
          state.selectedWorkOrder.timeEntries
        ) {
          state.selectedWorkOrder.timeEntries =
            state.selectedWorkOrder.timeEntries.filter(
              (t: any) => t.id !== entryId
            );
        }
      })
      .addCase(deleteTimeEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedWorkOrder, clearError } = workOrdersSlice.actions;
export default workOrdersSlice.reducer;