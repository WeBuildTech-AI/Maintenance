import axios from "axios";

import type {
  CreateTeamMemberData,
  TeamMemberResponse,
  UpdateTeamMemberData,
} from "./teamMembers.types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const teamMemberService = {
  fetchTeamMembers: async (): Promise<TeamMemberResponse[]> => {
    const res = await axios.get(`${API_URL}/team-members`);
    return res.data;
  },

  fetchTeamMemberById: async (id: string): Promise<TeamMemberResponse> => {
    const res = await axios.get(`${API_URL}/team-members/${id}`);
    return res.data;
  },

  createTeamMember: async (
    data: CreateTeamMemberData
  ): Promise<TeamMemberResponse> => {
    const res = await axios.post(`${API_URL}/team-members`, data);
    return res.data;
  },

  updateTeamMember: async (
    id: string,
    data: UpdateTeamMemberData
  ): Promise<TeamMemberResponse> => {
    const res = await axios.patch(`${API_URL}/team-members/${id}`, data);
    return res.data;
  },

  deleteTeamMember: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/team-members/${id}`);
  },
};
