import api from "./api";

export interface Team{
  id : string;
  organizationId : string;
  name : string;
  description?: string;
  color?: string;
  isEscalationTeam : boolean;
  criticalParts : boolean;
  createdAt: Date;
  updatedAt: Date;
}
// For API responses
export type TeamResponse = Team;

// For creating new teams
export interface CreateTeamData {
  organizationId : string;
  name : string;
  description?: string;
  color?: string;
  isEscalationTeam : boolean;
  criticalParts : boolean;
}

// For updating existing teams
export interface UpdateTeamData {
  organizationId : string;
  name : string;
  description?: string;
  color?: string;
  isEscalationTeam : boolean;
  criticalParts : boolean;
}

export const teamService = {
  // Fetch all teams
  fetchTeams: async (): Promise<TeamResponse[]> => {
    const response = await api.get("/teams");
    return response.data;
  },

  // Fetch team by ID
  fetchTeamById: async (id: string): Promise<TeamResponse> => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },

  // Create a new team
  createTeam: async (teamData: CreateTeamData): Promise<TeamResponse> => {
    const response = await api.post("/teams", teamData);
    return response.data;
  },

  // Update team
  updateTeam: async (
    id: string,
    teamData: UpdateTeamData
  ): Promise<TeamResponse> => {
    const response = await api.patch(`/teams/${id}`, teamData);
    return response.data;
  },

  // Delete team
  deleteTeam: async (id: string): Promise<void> => {
    await api.delete(`/teams/${id}`);
  },
};
