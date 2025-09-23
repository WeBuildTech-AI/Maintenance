import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateInventoryDto {
  @IsUUID()
  organizationId!: string;

  @IsUUID()
  partId!: string;

  @IsInt()
  @Min(0)
  quantity!: number;

  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
