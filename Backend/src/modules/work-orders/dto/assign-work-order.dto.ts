import { IsArray, IsUUID } from 'class-validator';

export class AssignWorkOrderDto {
  @IsArray()
  @IsUUID('4', { each: true })
  assigneeIds!: string[];
}
