import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { AuditLogsService } from './audit-logs.service';

@Controller({ path: 'audit-logs', version: '1' })
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  findAll() {
    return this.auditLogsService.findAllAuditLogs();
  }

  @Post()
  create(@Body() body: CreateAuditLogDto) {
    return this.auditLogsService.createAuditLog(body);
  }
}
