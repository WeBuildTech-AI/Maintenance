import { PartialType } from "@nestjs/mapped-types";
import { CreateTeamMemberDto } from "./create-team-member.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsUUID, IsArray, IsOptional } from "class-validator";

export class UpdateTeamMemberDto extends PartialType(CreateTeamMemberDto) {
  @ApiPropertyOptional({
    description: "Array of user IDs to update team members",
    example: [
      "123e4567-e89b-12d3-a456-426614174001",
      "123e4567-e89b-12d3-a456-426614174002",
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  users?: string[];
}
