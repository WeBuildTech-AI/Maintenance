import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { AuditLogsService } from './audit-logs.service';
export declare class AuditLogsController {
    private readonly auditLogsService;
    constructor(auditLogsService: AuditLogsService);
    findAll(): import("./audit-logs.service").AuditLogEntity[];
    create(body: CreateAuditLogDto): import("./audit-logs.service").AuditLogEntity;
}
