import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { TeamMembersService } from "./team-members.service";
import { CreateTeamMemberDto } from "./dto/create-team-member.dto";
import { UpdateTeamMemberDto } from "./dto/update-team-member.dto";
import {
  AddUsersToTeamDto,
  RemoveUsersFromTeamDto,
} from "./dto/team-member-operations.dto";

@ApiTags("team-members")
@Controller({ path: "team-members", version: "1" })
export class TeamMembersController {
  constructor(private readonly teamMembersService: TeamMembersService) {}

  @Get()
  @ApiOperation({ summary: "Get all team member assignments" })
  @ApiResponse({
    status: 200,
    description: "Team member assignments retrieved successfully",
  })
  findAll(@Query() _pagination: PaginationQueryDto) {
    return this.teamMembersService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get team member assignment by ID" })
  @ApiParam({ name: "id", description: "Team member assignment ID" })
  @ApiResponse({
    status: 200,
    description: "Team member assignment retrieved successfully",
  })
  @ApiResponse({ status: 404, description: "Team member assignment not found" })
  findOne(@Param("id") id: string) {
    return this.teamMembersService.findOne(id);
  }

  @Get("team/:teamId")
  @ApiOperation({ summary: "Get team members by team ID" })
  @ApiParam({ name: "teamId", description: "Team ID" })
  @ApiResponse({
    status: 200,
    description: "Team members retrieved successfully",
  })
  @ApiResponse({ status: 404, description: "Team or team members not found" })
  findByTeamId(@Param("teamId") teamId: string) {
    return this.teamMembersService.findByTeamId(teamId);
  }

  @Get("team/:teamId/users")
  @ApiOperation({ summary: "Get user details for team members" })
  @ApiParam({ name: "teamId", description: "Team ID" })
  @ApiResponse({
    status: 200,
    description: "Team member user details retrieved successfully",
  })
  @ApiResponse({ status: 404, description: "Team not found" })
  getUsersInTeam(@Param("teamId") teamId: string) {
    return this.teamMembersService.getUsersInTeam(teamId);
  }

  @Post()
  @ApiOperation({ summary: "Create a new team member assignment" })
  @ApiBody({ type: CreateTeamMemberDto })
  @ApiResponse({
    status: 201,
    description: "Team member assignment created successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid input data or team members already exist",
  })
  @ApiResponse({ status: 404, description: "Team or users not found" })
  create(@Body() createTeamMemberDto: CreateTeamMemberDto) {
    return this.teamMembersService.create(createTeamMemberDto);
  }

  @Post("team/:teamId/add-users")
  @ApiOperation({ summary: "Add users to an existing team" })
  @ApiParam({ name: "teamId", description: "Team ID" })
  @ApiBody({ type: AddUsersToTeamDto })
  @ApiResponse({ status: 200, description: "Users added to team successfully" })
  @ApiResponse({ status: 400, description: "Invalid user IDs" })
  @ApiResponse({ status: 404, description: "Team not found" })
  addUsersToTeam(
    @Param("teamId") teamId: string,
    @Body() addUsersDto: AddUsersToTeamDto
  ) {
    return this.teamMembersService.addUsersToTeam(teamId, addUsersDto);
  }

  @Post("team/:teamId/remove-users")
  @ApiOperation({ summary: "Remove users from a team" })
  @ApiParam({ name: "teamId", description: "Team ID" })
  @ApiBody({ type: RemoveUsersFromTeamDto })
  @ApiResponse({
    status: 200,
    description: "Users removed from team successfully",
  })
  @ApiResponse({ status: 404, description: "Team not found" })
  removeUsersFromTeam(
    @Param("teamId") teamId: string,
    @Body() removeUsersDto: RemoveUsersFromTeamDto
  ) {
    return this.teamMembersService.removeUsersFromTeam(teamId, removeUsersDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update team member assignment" })
  @ApiParam({ name: "id", description: "Team member assignment ID" })
  @ApiBody({ type: UpdateTeamMemberDto })
  @ApiResponse({
    status: 200,
    description: "Team member assignment updated successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid user IDs" })
  @ApiResponse({ status: 404, description: "Team member assignment not found" })
  update(
    @Param("id") id: string,
    @Body() updateTeamMemberDto: UpdateTeamMemberDto
  ) {
    return this.teamMembersService.update(id, updateTeamMemberDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete team member assignment" })
  @ApiParam({ name: "id", description: "Team member assignment ID" })
  @ApiResponse({
    status: 200,
    description: "Team member assignment deleted successfully",
  })
  @ApiResponse({ status: 404, description: "Team member assignment not found" })
  remove(@Param("id") id: string) {
    return this.teamMembersService.remove(id);
  }

  @Delete("team/:teamId")
  @ApiOperation({ summary: "Delete all team members for a team" })
  @ApiParam({ name: "teamId", description: "Team ID" })
  @ApiResponse({
    status: 200,
    description: "Team members deleted successfully",
  })
  @ApiResponse({ status: 404, description: "Team not found" })
  removeByTeamId(@Param("teamId") teamId: string) {
    return this.teamMembersService.removeByTeamId(teamId);
  }
}
