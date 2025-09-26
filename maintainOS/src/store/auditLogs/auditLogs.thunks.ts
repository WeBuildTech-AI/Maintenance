import { createAsyncThunk } from "@reduxjs/toolkit";

import { auditLogService } from "./auditLogs.service";
import type {
  AuditLogFilters,
  CreateAuditLogData,
} from "./auditLogs.types";

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
