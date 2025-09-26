export interface AuditLogResponse {
  id: string;
  organizationId: string;
  actorId: string;
  action: string;
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

export interface AuditLogsState {
  auditLogs: AuditLogResponse[];
  selectedAuditLog: AuditLogResponse | null;
  recentLogs: AuditLogResponse[];
  loading: boolean;
  error: string | null;
  filters: AuditLogFilters;
}
