import axios from "axios";

import type {
  AuditLogFilters,
  AuditLogResponse,
  CreateAuditLogData,
} from "./auditLogs.types";

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
