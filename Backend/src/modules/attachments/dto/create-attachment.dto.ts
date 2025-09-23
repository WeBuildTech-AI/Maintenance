import { IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';

export class CreateAttachmentDto {
  @IsString()
  fileName!: string;

  @IsUrl()
  url!: string;

  @IsOptional()
  @IsUUID()
  uploadedBy?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
