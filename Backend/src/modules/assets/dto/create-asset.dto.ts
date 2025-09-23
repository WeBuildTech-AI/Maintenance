import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum AssetCriticality {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export class CreateAssetDto {
  @IsUUID()
  organizationId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pictures?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: string[];

  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @IsEnum(AssetCriticality)
  criticality?: AssetCriticality;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  year?: number;

  @IsOptional()
  @IsString()
  warrantyDate?: string;

  @IsOptional()
  @IsBoolean()
  isUnderWarranty?: boolean;

  @IsOptional()
  @IsBoolean()
  isUnderAmc?: boolean;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  teamsInCharge?: string[];

  @IsOptional()
  @IsString()
  qrCode?: string;

  @IsOptional()
  @IsString()
  assetTypeId?: string;

  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  partIds?: string[];

  @IsOptional()
  @IsUUID()
  parentAssetId?: string;
}
