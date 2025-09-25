import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLocationDto {
  @IsUUID()
  organizationId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoUrls?: string[];

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  teamsInCharge?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  vendorIds?: string[];

  @IsOptional()
  @IsUUID()
  parentLocationId?: string;
}
