import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ORDERED = 'ordered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class PurchaseOrderItemDto {
  @IsUUID()
  partId!: string;

  @IsPositive()
  quantity!: number;

  @IsNumber()
  unitCost!: number;
}

export class AdditionalCostDto {
  @IsString()
  name!: string;

  @IsNumber()
  value!: number;

  @IsString()
  type!: string;
}

export class CreatePurchaseOrderDto {
  @IsUUID()
  organizationId!: string;

  @IsUUID()
  vendorId!: string;

  @IsEnum(PurchaseOrderStatus)
  status!: PurchaseOrderStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items!: PurchaseOrderItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdditionalCostDto)
  taxesAndCosts?: AdditionalCostDto[];

  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @IsOptional()
  @IsString()
  billingAddress?: string;

  @IsOptional()
  @IsObject()
  shippingContact?: Record<string, any>;

  @IsOptional()
  @IsISO8601({ strict: false })
  dueDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: string[];
}
