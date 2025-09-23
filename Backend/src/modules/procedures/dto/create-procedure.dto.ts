import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum ProcedureType {
  MAINTENANCE = 'maintenance',
  INSPECTION = 'inspection',
  SAFETY_CHECK = 'safety_check',
}

export enum ProcedureFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export class CreateProcedureDto {
  @IsUUID()
  organizationId!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  assetIds?: string[];

  @IsOptional()
  @IsEnum(ProcedureType)
  type?: ProcedureType;

  @IsOptional()
  @IsEnum(ProcedureFrequency)
  frequency?: ProcedureFrequency;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: string[];
}
