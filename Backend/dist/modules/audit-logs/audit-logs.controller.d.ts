import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { AuditLogsService } from './audit-logs.service';
export declare class AuditLogsController {
    private readonly auditLogsService;
    constructor(auditLogsService: AuditLogsService);
    findAll(): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        actorId: string | null;
        action: string;
        targetType: string;
        targetId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    create(body: CreateAuditLogDto): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        actorId: string | null;
        action: string;
        targetType: string;
        targetId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
