import axios from "axios";

import type {
  CreateTeamData,
  TeamResponse,
  UpdateTeamData,
} from "./teams.types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const teamService = {
  fetchTeams: async (): Promise<TeamResponse[]> => {
    const res = await axios.get(`${API_URL}/teams`);
    return res.data;
  },

  fetchTeamById: async (id: string): Promise<TeamResponse> => {
    const res = await axios.get(`${API_URL}/teams/${id}`);
    return res.data;
  },

  createTeam: async (data: CreateTeamData): Promise<TeamResponse> => {
    const res = await axios.post(`${API_URL}/teams`, data);
    return res.data;
  },

  updateTeam: async (
    id: string,
    data: UpdateTeamData
  ): Promise<TeamResponse> => {
    const res = await axios.patch(`${API_URL}/teams/${id}`, data);
    return res.data;
  },

  deleteTeam: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/teams/${id}`);
  },
};
