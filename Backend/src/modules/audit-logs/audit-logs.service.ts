import { Injectable } from '@nestjs/common';
import { BaseInMemoryService, StoredEntity } from '../../common/base-in-memory.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

export interface AuditLogDetails {
  organizationId: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, any>;
}

export type AuditLogEntity = StoredEntity<AuditLogDetails>;

@Injectable()
export class AuditLogsService extends BaseInMemoryService<AuditLogDetails> {
  createAuditLog(payload: CreateAuditLogDto): AuditLogEntity {
    return super.create(payload);
  }

  findAllAuditLogs(): AuditLogEntity[] {
    return super.findAll();
  }
}
