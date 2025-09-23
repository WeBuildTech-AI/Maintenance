import { AuditLog } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
export declare class AuditLogsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createAuditLog(payload: CreateAuditLogDto): Promise<AuditLog>;
    findAllAuditLogs(): Promise<AuditLog[]>;
}
