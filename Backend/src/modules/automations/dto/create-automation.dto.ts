import { IsBoolean, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAutomationDto {
  @IsUUID()
  organizationId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsObject()
  triggers?: Record<string, any>;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;

  @IsOptional()
  @IsObject()
  actions?: Record<string, any>;
}
