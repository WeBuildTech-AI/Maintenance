import { IsArray, IsObject, IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';

export class CreateVendorDto {
  @IsUUID()
  organizationId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsUrl()
  pictureUrl?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  contacts?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: string[];

  @IsOptional()
  @IsString()
  vendorType?: string;
}
