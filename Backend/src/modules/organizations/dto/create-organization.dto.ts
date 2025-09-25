import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
} from "class-validator";
import { $Enums } from "@prisma/client";

export enum IndustryType {
  MANUFACTURING = "manufacturing",
  REAL_ESTATE = "real_estate",
  HEALTHCARE = "healthcare",
  HOSPITALITY = "hospitality",
  EDUCATION = "education",
  OTHER = "other",
}

export class CreateOrganizationDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsEnum(IndustryType)
  industry?: IndustryType;

  @IsOptional()
  @IsInt()
  @IsPositive()
  size?: number;

  // Default user settings for the organization
  @IsOptional()
  @IsEnum($Enums.UserVisibility)
  defaultWorkOrderVisibility?: $Enums.UserVisibility;

  @IsOptional()
  @IsNumber()
  defaultHourlyRate?: number;

  @IsOptional()
  @IsEnum($Enums.RateVisibility)
  defaultRateVisibility?: $Enums.RateVisibility;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  defaultWorkingDays?: string[];

  @IsOptional()
  @IsNumber()
  defaultHoursPerDay?: number;

  @IsOptional()
  @IsBoolean()
  defaultSchedulableUser?: boolean;
}
