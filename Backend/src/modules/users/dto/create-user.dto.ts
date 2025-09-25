import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  IsNumber,
  IsBoolean,
} from "class-validator";
import { $Enums } from "@prisma/client";

export class CreateUserDto {
  @IsUUID()
  organizationId!: string;

  @IsString()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
  
  @IsOptional()
  @IsEnum($Enums.UserRole)
  role!: $Enums.UserRole;

  @IsOptional()
  @IsEnum($Enums.UserVisibility)
  fullUserVisibility?: $Enums.UserVisibility;

  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @IsOptional()
  @IsEnum($Enums.RateVisibility)
  rateVisibility?: $Enums.RateVisibility;

  @IsOptional()
  @IsBoolean()
  schedulableUser?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  workingDays?: string[];

  @IsOptional()
  @IsNumber()
  hoursPerDay?: number;

  @IsOptional()
  @IsString()
  password?: string;
}

export { $Enums };
