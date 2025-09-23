import { BaseInMemoryService, StoredEntity } from '../../common/base-in-memory.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
export interface TeamDetails {
    organizationId: string;
    name: string;
    description?: string;
    color?: string;
    isEscalationTeam?: boolean;
    criticalParts?: boolean;
}
export type TeamEntity = StoredEntity<TeamDetails>;
export declare class TeamsService extends BaseInMemoryService<TeamDetails> {
    createTeam(payload: CreateTeamDto): TeamEntity;
    updateTeam(id: string, payload: UpdateTeamDto): TeamEntity;
    removeTeam(id: string): TeamEntity;
    findAllTeams(): TeamEntity[];
    findTeamById(id: string): TeamEntity;
}
