import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

// src/services/workOrderService.ts
import axios from "axios";

export interface WorkOrderResponse {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "completed" | "on_hold";
  dueDate?: string;
  assigneeIds: string[];
  comments: Array<{
    id: string;
    authorId: string;
    message: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkOrderData {
  organizationId: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
  dueDate?: string;
  assigneeIds?: string[];
}

export interface UpdateWorkOrderData {
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
  status?: "open" | "in_progress" | "completed" | "on_hold";
  dueDate?: string;
  assigneeIds?: string[];
}

export interface AssignWorkOrderData {
  assigneeIds: string[];
}

export interface AddWorkOrderCommentData {
  authorId: string;
  message: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const workOrderService = {
  fetchWorkOrders: async (): Promise<WorkOrderResponse[]> => {
    const res = await axios.get(`${API_URL}/work-orders`);
    return res.data;
  },

  fetchWorkOrderById: async (id: string): Promise<WorkOrderResponse> => {
    const res = await axios.get(`${API_URL}/work-orders/${id}`);
    return res.data;
  },

  createWorkOrder: async (
    data: CreateWorkOrderData
  ): Promise<WorkOrderResponse> => {
    const res = await axios.post(`${API_URL}/work-orders`, data);
    return res.data;
  },

  updateWorkOrder: async (
    id: string,
    data: UpdateWorkOrderData
  ): Promise<WorkOrderResponse> => {
    const res = await axios.patch(`${API_URL}/work-orders/${id}`, data);
    return res.data;
  },

  deleteWorkOrder: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/work-orders/${id}`);
  },

  assignWorkOrder: async (
    id: string,
    data: AssignWorkOrderData
  ): Promise<WorkOrderResponse> => {
    const res = await axios.post(`${API_URL}/work-orders/${id}/assign`, data);
    return res.data;
  },

  addComment: async (
    id: string,
    data: AddWorkOrderCommentData
  ): Promise<WorkOrderResponse> => {
    const res = await axios.post(`${API_URL}/work-orders/${id}/comments`, data);
    return res.data;
  },

  markCompleted: async (id: string): Promise<WorkOrderResponse> => {
    const res = await axios.post(`${API_URL}/work-orders/${id}/complete`);
    return res.data;
  },

  markInProgress: async (id: string): Promise<WorkOrderResponse> => {
    const res = await axios.post(`${API_URL}/work-orders/${id}/in-progress`);
    return res.data;
  },
};


interface WorkOrdersState {
  workOrders: WorkOrderResponse[];
  selectedWorkOrder: WorkOrderResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: WorkOrdersState = {
  workOrders: [],
  selectedWorkOrder: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchWorkOrders = createAsyncThunk(
  "workOrders/fetchWorkOrders",
  async (_, { rejectWithValue }) => {
    try {
      return await workOrderService.fetchWorkOrders();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch work orders"
      );
    }
  }
);

export const fetchWorkOrderById = createAsyncThunk(
  "workOrders/fetchWorkOrderById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await workOrderService.fetchWorkOrderById(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch work order"
      );
    }
  }
);

export const createWorkOrder = createAsyncThunk(
  "workOrders/createWorkOrder",
  async (workOrderData: CreateWorkOrderData, { rejectWithValue }) => {
    try {
      return await workOrderService.createWorkOrder(workOrderData);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create work order"
      );
    }
  }
);

export const updateWorkOrder = createAsyncThunk(
  "workOrders/updateWorkOrder",
  async (
    { id, data }: { id: string; data: UpdateWorkOrderData },
    { rejectWithValue }
  ) => {
    try {
      return await workOrderService.updateWorkOrder(id, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update work order"
      );
    }
  }
);

export const deleteWorkOrder = createAsyncThunk(
  "workOrders/deleteWorkOrder",
  async (id: string, { rejectWithValue }) => {
    try {
      await workOrderService.deleteWorkOrder(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete work order"
      );
    }
  }
);

export const assignWorkOrder = createAsyncThunk(
  "workOrders/assignWorkOrder",
  async (
    { id, data }: { id: string; data: AssignWorkOrderData },
    { rejectWithValue }
  ) => {
    try {
      return await workOrderService.assignWorkOrder(id, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to assign work order"
      );
    }
  }
);

export const addWorkOrderComment = createAsyncThunk(
  "workOrders/addComment",
  async (
    { id, data }: { id: string; data: AddWorkOrderCommentData },
    { rejectWithValue }
  ) => {
    try {
      return await workOrderService.addComment(id, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add comment"
      );
    }
  }
);

export const markWorkOrderCompleted = createAsyncThunk(
  "workOrders/markCompleted",
  async (id: string, { rejectWithValue }) => {
    try {
      return await workOrderService.markCompleted(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to mark work order as completed"
      );
    }
  }
);

export const markWorkOrderInProgress = createAsyncThunk(
  "workOrders/markInProgress",
  async (id: string, { rejectWithValue }) => {
    try {
      return await workOrderService.markInProgress(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to mark work order as in progress"
      );
    }
  }
);

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
      // Fetch all work orders
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

      // Fetch work order by ID
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

      // Create work order
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

      // Update work order
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

      // Delete work order
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

      // Assign work order
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

      // Add comment
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

      // Mark completed
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

      // Mark in progress
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
