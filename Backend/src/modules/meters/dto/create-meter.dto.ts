import { IsArray, IsEnum, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export enum MeterType {
  ELECTRICITY = 'electricity',
  WATER = 'water',
  GAS = 'gas',
  RUNTIME = 'runtime',
}

export class CreateMeterDto {
  @IsUUID()
  organizationId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsEnum(MeterType)
  meterType?: MeterType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsUUID()
  assetId?: string;

  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @IsObject()
  readingFrequency?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];
}
