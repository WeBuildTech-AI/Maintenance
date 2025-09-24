import api from "./api";
import type { Team } from "@prisma/client";

// Re-export Prisma types for convenience
export type { Team } from "@prisma/client";

// For API responses
export type TeamResponse = Team;

// For creating new teams
export interface CreateTeamData {
  name: string;
  organizationId: string;
  description?: string;
  managerUserId?: string;
}

// For updating existing teams
export interface UpdateTeamData {
  name?: string;
  description?: string;
  managerUserId?: string;
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
