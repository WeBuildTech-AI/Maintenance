import {
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export enum VendorType {
  MANUFACTURER = "manufacturer",
  DISTRIBUTOR = "distributor",
}

export class CreateVendorDto {
  @ApiProperty({
    description: "Organization ID that owns this vendor",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  organizationId!: string;

  @ApiProperty({
    description: "Vendor name",
    example: "ABC Manufacturing Inc.",
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    description: "URL to vendor picture/logo",
    example: "https://example.com/logo.png",
  })
  @IsOptional()
  @IsUrl()
  pictureUrl?: string;

  @ApiPropertyOptional({
    description: "Vendor color code (hex)",
    example: "#FF5733",
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    description: "Vendor description",
    example: "Leading manufacturer of industrial equipment",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: "Contact information in JSON format",
    example: { email: "contact@abc.com", phone: "+1234567890" },
  })
  @IsOptional()
  @IsObject()
  contacts?: Record<string, any>;

  @ApiPropertyOptional({
    description: "Array of file URLs",
    example: ["https://example.com/doc1.pdf", "https://example.com/doc2.pdf"],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: string[];

  @ApiPropertyOptional({
    description: "Array of location IDs where vendor operates",
    example: [
      "123e4567-e89b-12d3-a456-426614174001",
      "123e4567-e89b-12d3-a456-426614174002",
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  locations?: string[];

  @ApiPropertyOptional({
    description: "Array of asset IDs associated with vendor",
    example: [
      "123e4567-e89b-12d3-a456-426614174003",
      "123e4567-e89b-12d3-a456-426614174004",
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  assetIds?: string[];

  @ApiPropertyOptional({
    description: "Array of part IDs supplied by vendor",
    example: [
      "123e4567-e89b-12d3-a456-426614174005",
      "123e4567-e89b-12d3-a456-426614174006",
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  partIds?: string[];

  @ApiPropertyOptional({
    description: "Type of vendor",
    enum: VendorType,
    example: VendorType.MANUFACTURER,
  })
  @IsOptional()
  @IsEnum(VendorType)
  vendorType?: VendorType;
}
