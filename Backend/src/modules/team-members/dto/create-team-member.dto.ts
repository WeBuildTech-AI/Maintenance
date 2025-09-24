import { IsString, IsUUID, IsArray, ArrayNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateTeamMemberDto {
  @ApiProperty({
    description: "Team ID to assign members to",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsString()
  @IsUUID()
  teamId!: string;

  @ApiProperty({
    description: "Array of user IDs to add as team members",
    example: [
      "123e4567-e89b-12d3-a456-426614174001",
      "123e4567-e89b-12d3-a456-426614174002",
    ],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID("4", { each: true })
  users!: string[];
}
