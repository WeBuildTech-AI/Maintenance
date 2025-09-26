import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
  AuditLogFilters,
  AuditLogResponse,
  AuditLogsState,
} from "./auditLogs.types";
import {
  createAuditLog,
  fetchAuditLogById,
  fetchAuditLogs,
  fetchAuditLogsByEntity,
  fetchAuditLogsByUser,
  fetchRecentAuditLogs,
} from "./auditLogs.thunks";

const initialState: AuditLogsState = {
  auditLogs: [],
  selectedAuditLog: null,
  recentLogs: [],
  loading: false,
  error: null,
  filters: {},
};

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

      .addCase(createAuditLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createAuditLog.fulfilled,
        (state, action: PayloadAction<AuditLogResponse>) => {
          state.loading = false;
          state.auditLogs.unshift(action.payload);
          state.recentLogs.unshift(action.payload);
          if (state.recentLogs.length > 50) {
            state.recentLogs = state.recentLogs.slice(0, 50);
          }
        }
      )
      .addCase(createAuditLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

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
