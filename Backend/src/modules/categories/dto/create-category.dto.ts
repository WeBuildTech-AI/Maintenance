import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum CategoryIcon {
  WRENCH = 'wrench',
  BOLT = 'bolt',
  GEAR = 'gear',
  ELECTRIC = 'electric',
  PLUMBING = 'plumbing',
  HVAC = 'hvac',
}

export class CreateCategoryDto {
  @IsUUID()
  organizationId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsEnum(CategoryIcon)
  categoryIcon?: CategoryIcon;

  @IsOptional()
  @IsString()
  description?: string;
}
