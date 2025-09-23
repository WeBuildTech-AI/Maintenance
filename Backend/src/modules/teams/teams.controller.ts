import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamsService } from './teams.service';

@Controller({ path: 'teams', version: '1' })
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  findAll(@Query() _pagination: PaginationQueryDto) {
    return this.teamsService.findAllTeams();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamsService.findTeamById(id);
  }

  @Post()
  create(@Body() body: CreateTeamDto) {
    return this.teamsService.createTeam(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateTeamDto) {
    return this.teamsService.updateTeam(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamsService.removeTeam(id);
  }
}
