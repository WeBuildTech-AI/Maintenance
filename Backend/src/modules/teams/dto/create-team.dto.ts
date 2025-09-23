import { IsBoolean, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class CreateTeamDto {
  @IsUUID()
  organizationId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Matches(/^#([A-Fa-f0-9]{6})$/)
  color?: string;

  @IsOptional()
  @IsBoolean()
  isEscalationTeam?: boolean;

  @IsOptional()
  @IsBoolean()
  criticalParts?: boolean;
}
