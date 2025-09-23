export declare enum AuditAction {
    CREATE = "create",
    UPDATE = "update",
    DELETE = "delete",
    LOGIN = "login",
    ASSIGN = "assign"
}
export declare class CreateAuditLogDto {
    organizationId: string;
    actorId: string;
    action: AuditAction;
    targetType: string;
    targetId?: string;
    metadata?: Record<string, any>;
}
