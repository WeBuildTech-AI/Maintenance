import { IsArray, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePartDto {
  @IsUUID()
  organizationId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsNumber()
  unitCost?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  qrCode?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  partsType?: string[];

  @IsOptional()
  @IsObject()
  location?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  assetIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  teamsInCharge?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  vendorIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: string[];
}
