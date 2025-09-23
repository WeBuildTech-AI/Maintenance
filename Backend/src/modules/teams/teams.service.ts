import { Injectable } from '@nestjs/common';
import { Team } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  createTeam(payload: CreateTeamDto): Promise<Team> {
    return this.prisma.team.create({ data: payload });
  }

  updateTeam(id: string, payload: UpdateTeamDto): Promise<Team> {
    return this.prisma.team.update({ where: { id }, data: payload });
  }

  removeTeam(id: string): Promise<Team> {
    return this.prisma.team.delete({ where: { id } });
  }

  findAllTeams(): Promise<Team[]> {
    return this.prisma.team.findMany();
  }

  findTeamById(id: string): Promise<Team> {
    return this.prisma.team.findUniqueOrThrow({ where: { id } });
  }
}
