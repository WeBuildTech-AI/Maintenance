export interface TeamResponse {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  color?: string;
  isEscalationTeam?: boolean;
  criticalParts?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamData {
  organizationId: string;
  name: string;
  description?: string;
  color?: string;
  isEscalationTeam?: boolean;
  criticalParts?: boolean;
}

export interface UpdateTeamData {
  name?: string;
  description?: string;
  color?: string;
  isEscalationTeam?: boolean;
  criticalParts?: boolean;
}

export interface TeamsState {
  teams: TeamResponse[];
  selectedTeam: TeamResponse | null;
  loading: boolean;
  error: string | null;
}
