import api from "./api";

// type definitions 
export interface TeamMember {
  id : string;
  teamId : string;
  users : string[];
  createdAt: Date;
  updatedAt: Date;
}

// For API responses
export type TeamMemberResponse = TeamMember;

// For creating new team members
export interface CreateTeamMemberData {
  teamId : string;
  users : string[];
}

// For updating existing team members
export interface UpdateTeamMemberData {
  teamId : string;
  users : string[];
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
