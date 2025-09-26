import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

// src/services/auditLogService.ts
import axios from "axios";

export interface AuditLogResponse {
  id: string;
  organizationId: string;
  actorId: string;
  action: string; // e.g., create, update, delete, login
  targetType: string;
  targetId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface CreateAuditLogData {
  organizationId: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, any>;
}

export interface AuditLogFilters {
  action?: string;
  actorId?: string;
  targetType?: string;
  targetId?: string;
  startDate?: string;
  endDate?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const auditLogService = {
  fetchAuditLogs: async (
    filters?: AuditLogFilters
  ): Promise<AuditLogResponse[]> => {
    const res = await axios.get(`${API_URL}/audit-logs`, { params: filters });
    return res.data;
  },

  fetchAuditLogById: async (id: string): Promise<AuditLogResponse> => {
    const res = await axios.get(`${API_URL}/audit-logs/${id}`);
    return res.data;
  },

  createAuditLog: async (
    data: CreateAuditLogData
  ): Promise<AuditLogResponse> => {
    const res = await axios.post(`${API_URL}/audit-logs`, data);
    return res.data;
  },

  fetchAuditLogsByEntity: async (
    entityType: string,
    entityId: string
  ): Promise<AuditLogResponse[]> => {
    const res = await axios.get(
      `${API_URL}/audit-logs/entity/${entityType}/${entityId}`
    );
    return res.data;
  },

  fetchAuditLogsByUser: async (userId: string): Promise<AuditLogResponse[]> => {
    const res = await axios.get(`${API_URL}/audit-logs/user/${userId}`);
    return res.data;
  },

  fetchRecentAuditLogs: async (limit: number = 50): Promise<AuditLogResponse[]> => {
    const res = await axios.get(`${API_URL}/audit-logs/recent`, {
      params: { limit },
    });
    return res.data;
  },
};


interface AuditLogsState {
  auditLogs: AuditLogResponse[];
  selectedAuditLog: AuditLogResponse | null;
  recentLogs: AuditLogResponse[];
  loading: boolean;
  error: string | null;
  filters: AuditLogFilters;
}

const initialState: AuditLogsState = {
  auditLogs: [],
  selectedAuditLog: null,
  recentLogs: [],
  loading: false,
  error: null,
  filters: {},
};

// Async thunks
export const fetchAuditLogs = createAsyncThunk(
  "auditLogs/fetchAuditLogs",
  async (filters: AuditLogFilters | undefined, { rejectWithValue }) => {
    try {
      return await auditLogService.fetchAuditLogs(filters);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch audit logs"
      );
    }
  }
);

export const fetchAuditLogById = createAsyncThunk(
  "auditLogs/fetchAuditLogById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await auditLogService.fetchAuditLogById(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch audit log"
      );
    }
  }
);

export const createAuditLog = createAsyncThunk(
  "auditLogs/createAuditLog",
  async (auditLogData: CreateAuditLogData, { rejectWithValue }) => {
    try {
      return await auditLogService.createAuditLog(auditLogData);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create audit log"
      );
    }
  }
);

export const fetchAuditLogsByEntity = createAsyncThunk(
  "auditLogs/fetchAuditLogsByEntity",
  async (
    { entityType, entityId }: { entityType: string; entityId: string },
    { rejectWithValue }
  ) => {
    try {
      return await auditLogService.fetchAuditLogsByEntity(entityType, entityId);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch audit logs by entity"
      );
    }
  }
);

export const fetchAuditLogsByUser = createAsyncThunk(
  "auditLogs/fetchAuditLogsByUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      return await auditLogService.fetchAuditLogsByUser(userId);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch audit logs by user"
      );
    }
  }
);

export const fetchRecentAuditLogs = createAsyncThunk(
  "auditLogs/fetchRecentAuditLogs",
  async (limit: number = 50, { rejectWithValue }) => {
    try {
      return await auditLogService.fetchRecentAuditLogs(limit);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch recent audit logs"
      );
    }
  }
);

const auditLogsSlice = createSlice({
  name: "auditLogs",
  initialState,
  reducers: {
    clearSelectedAuditLog: (state) => {
      state.selectedAuditLog = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<AuditLogFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all audit logs
      .addCase(fetchAuditLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAuditLogs.fulfilled,
        (state, action: PayloadAction<AuditLogResponse[]>) => {
          state.loading = false;
          state.auditLogs = action.payload;
        }
      )
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch audit log by ID
      .addCase(fetchAuditLogById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAuditLogById.fulfilled,
        (state, action: PayloadAction<AuditLogResponse>) => {
          state.loading = false;
          state.selectedAuditLog = action.payload;
        }
      )
      .addCase(fetchAuditLogById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create audit log
      .addCase(createAuditLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createAuditLog.fulfilled,
        (state, action: PayloadAction<AuditLogResponse>) => {
          state.loading = false;
          state.auditLogs.unshift(action.payload); // Add to beginning for chronological order
          state.recentLogs.unshift(action.payload);
          // Keep only latest 50 recent logs
          if (state.recentLogs.length > 50) {
            state.recentLogs = state.recentLogs.slice(0, 50);
          }
        }
      )
      .addCase(createAuditLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch audit logs by entity
      .addCase(fetchAuditLogsByEntity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAuditLogsByEntity.fulfilled,
        (state, action: PayloadAction<AuditLogResponse[]>) => {
          state.loading = false;
          state.auditLogs = action.payload;
        }
      )
      .addCase(fetchAuditLogsByEntity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch audit logs by user
      .addCase(fetchAuditLogsByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAuditLogsByUser.fulfilled,
        (state, action: PayloadAction<AuditLogResponse[]>) => {
          state.loading = false;
          state.auditLogs = action.payload;
        }
      )
      .addCase(fetchAuditLogsByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch recent audit logs
      .addCase(fetchRecentAuditLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchRecentAuditLogs.fulfilled,
        (state, action: PayloadAction<AuditLogResponse[]>) => {
          state.loading = false;
          state.recentLogs = action.payload;
        }
      )
      .addCase(fetchRecentAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedAuditLog, clearError, setFilters, clearFilters } =
  auditLogsSlice.actions;
export default auditLogsSlice.reducer;
