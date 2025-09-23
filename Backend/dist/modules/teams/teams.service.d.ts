import { Team } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
export declare class TeamsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createTeam(payload: CreateTeamDto): Promise<Team>;
    updateTeam(id: string, payload: UpdateTeamDto): Promise<Team>;
    removeTeam(id: string): Promise<Team>;
    findAllTeams(): Promise<Team[]>;
    findTeamById(id: string): Promise<Team>;
}
