import { IsString, IsUUID } from 'class-validator';

export class CreateWorkOrderCommentDto {
  @IsUUID()
  authorId!: string;

  @IsString()
  message!: string;
}
