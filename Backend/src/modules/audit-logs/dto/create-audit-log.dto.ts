import { IsEnum, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  ASSIGN = 'assign',
}

export class CreateAuditLogDto {
  @IsUUID()
  organizationId!: string;

  @IsUUID()
  actorId!: string;

  @IsEnum(AuditAction)
  action!: AuditAction;

  @IsString()
  targetType!: string;

  @IsOptional()
  @IsString()
  targetId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
