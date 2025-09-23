import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TECHNICIAN = 'technician',
  VIEWER = 'viewer',
}

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

  @IsEnum(UserRole)
  role!: UserRole;

  @IsOptional()
  @IsString()
  password?: string;
}

export { UserRole };
