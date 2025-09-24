import api from "./api";
import type { TeamMember } from "@prisma/client";

// Re-export Prisma types for convenience
export type { TeamMember } from "@prisma/client";

// For API responses
export type TeamMemberResponse = TeamMember;

// For creating new team members
export interface CreateTeamMemberData {
  teamId: string;
  userId: string;
  organizationId: string;
  role?: string;
}

// For updating existing team members
export interface UpdateTeamMemberData {
  role?: string;
}

export const teamMemberService = {
  // Fetch all team members
  fetchTeamMembers: async (): Promise<TeamMemberResponse[]> => {
    const response = await api.get("/team-members");
    return response.data;
  },

  // Fetch team member by ID
  fetchTeamMemberById: async (id: string): Promise<TeamMemberResponse> => {
    const response = await api.get(`/team-members/${id}`);
    return response.data;
  },

  // Create a new team member
  createTeamMember: async (
    teamMemberData: CreateTeamMemberData
  ): Promise<TeamMemberResponse> => {
    const response = await api.post("/team-members", teamMemberData);
    return response.data;
  },

  // Update team member
  updateTeamMember: async (
    id: string,
    teamMemberData: UpdateTeamMemberData
  ): Promise<TeamMemberResponse> => {
    const response = await api.patch(`/team-members/${id}`, teamMemberData);
    return response.data;
  },

  // Delete team member
  deleteTeamMember: async (id: string): Promise<void> => {
    await api.delete(`/team-members/${id}`);
  },
};
