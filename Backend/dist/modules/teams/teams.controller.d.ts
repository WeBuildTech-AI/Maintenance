import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamsService } from './teams.service';
export declare class TeamsController {
    private readonly teamsService;
    constructor(teamsService: TeamsService);
    findAll(_pagination: PaginationQueryDto): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        color: string | null;
        isEscalationTeam: boolean;
        criticalParts: boolean;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        color: string | null;
        isEscalationTeam: boolean;
        criticalParts: boolean;
    }>;
    create(body: CreateTeamDto): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        color: string | null;
        isEscalationTeam: boolean;
        criticalParts: boolean;
    }>;
    update(id: string, body: UpdateTeamDto): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        color: string | null;
        isEscalationTeam: boolean;
        criticalParts: boolean;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        color: string | null;
        isEscalationTeam: boolean;
        criticalParts: boolean;
    }>;
}
