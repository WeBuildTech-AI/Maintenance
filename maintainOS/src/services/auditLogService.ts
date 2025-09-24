import api from "./api";
import type { AuditLog } from "@prisma/client";

// Re-export Prisma types for convenience
export type { AuditLog } from "@prisma/client";

// For API responses
export type AuditLogResponse = AuditLog;

// For creating new audit logs
export interface CreateAuditLogData {
  action: string;
  entityType: string;
  entityId: string;
  organizationId: string;
  userId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
}

// For filtering audit logs
export interface AuditLogFilters {
  action?: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export const auditLogService = {
  // Fetch all audit logs with optional filters
  fetchAuditLogs: async (
    filters?: AuditLogFilters
  ): Promise<AuditLogResponse[]> => {
    const response = await api.get("/audit-logs", { params: filters });
    return response.data;
  },

  // Fetch audit log by ID
  fetchAuditLogById: async (id: string): Promise<AuditLogResponse> => {
    const response = await api.get(`/audit-logs/${id}`);
    return response.data;
  },

  // Create a new audit log
  createAuditLog: async (
    auditLogData: CreateAuditLogData
  ): Promise<AuditLogResponse> => {
    const response = await api.post("/audit-logs", auditLogData);
    return response.data;
  },

  // Fetch audit logs by entity
  fetchAuditLogsByEntity: async (
    entityType: string,
    entityId: string
  ): Promise<AuditLogResponse[]> => {
    const response = await api.get(
      `/audit-logs/entity/${entityType}/${entityId}`
    );
    return response.data;
  },

  // Fetch audit logs by user
  fetchAuditLogsByUser: async (userId: string): Promise<AuditLogResponse[]> => {
    const response = await api.get(`/audit-logs/user/${userId}`);
    return response.data;
  },

  // Fetch recent audit logs
  fetchRecentAuditLogs: async (
    limit: number = 50
  ): Promise<AuditLogResponse[]> => {
    const response = await api.get(`/audit-logs/recent?limit=${limit}`);
    return response.data;
  },
};
