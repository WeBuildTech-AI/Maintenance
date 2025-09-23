import { Injectable } from '@nestjs/common';
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

@Injectable()
export class TeamsService extends BaseInMemoryService<TeamDetails> {
  createTeam(payload: CreateTeamDto): TeamEntity {
    return super.create(payload);
  }

  updateTeam(id: string, payload: UpdateTeamDto): TeamEntity {
    return super.update(id, payload);
  }

  removeTeam(id: string): TeamEntity {
    return super.remove(id);
  }

  findAllTeams(): TeamEntity[] {
    return super.findAll();
  }

  findTeamById(id: string): TeamEntity {
    return super.findOne(id);
  }
}
