import { IsString, IsUUID, IsArray, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AddUsersToTeamDto {
  @ApiProperty({
    description: "Array of user IDs to add to the team",
    example: [
      "123e4567-e89b-12d3-a456-426614174001",
      "123e4567-e89b-12d3-a456-426614174002",
    ],
    type: [String],
  })
  @IsArray()
  @IsUUID("4", { each: true })
  users!: string[];
}

export class RemoveUsersFromTeamDto {
  @ApiProperty({
    description: "Array of user IDs to remove from the team",
    example: ["123e4567-e89b-12d3-a456-426614174001"],
    type: [String],
  })
  @IsArray()
  @IsUUID("4", { each: true })
  users!: string[];
}
