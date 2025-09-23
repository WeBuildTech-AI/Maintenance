import { IsEnum, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export enum IndustryType {
  MANUFACTURING = 'manufacturing',
  REAL_ESTATE = 'real_estate',
  HEALTHCARE = 'healthcare',
  HOSPITALITY = 'hospitality',
  EDUCATION = 'education',
  OTHER = 'other',
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
}
