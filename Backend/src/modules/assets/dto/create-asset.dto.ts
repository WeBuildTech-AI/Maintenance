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
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export enum AssetCriticality {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export enum AssetStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  DO_NOT_TRACK = "doNotTrack"
}

export class CreateAssetDto {
  @ApiProperty({
    description: "Organization ID that owns this asset",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  organizationId!: string;

  @ApiProperty({
    description: "Asset name",
    example: "HVAC Unit #1",
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    description: "Asset description",
    example: "Main HVAC unit for building A",
  })
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
  @IsEnum(AssetStatus)
  status?: AssetStatus;

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
  @IsUUID("4", { each: true })
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
  @IsUUID("4", { each: true })
  partIds?: string[];

  @IsOptional()
  @IsUUID()
  parentAssetId?: string;
}
