import axios from "axios";
import api from "../auth/auth.service";
import type {
  CreateTeamData,
  TeamResponse,
  UpdateTeamData,
} from "./teams.types";

const API_URL = import.meta.env.VITE_API_URL;

export const teamService = {
  fetchTeams: async (): Promise<TeamResponse[]> => {
    const res = await api.get(`/teams`);
    return res.data;
  },

  fetchTeamsName: async (): Promise<TeamResponse[]> => {
    const res = await api.get(`/teams/summary`);
    return res.data;
  },

  fetchTeamById: async (id: string): Promise<TeamResponse> => {
    const res = await api.get(`/teams/${id}`);
    return res.data;
  },

  createTeam: async (data: CreateTeamData): Promise<TeamResponse> => {
    const res = await api.post(`/teams`, data);
    return res.data;
  },

  updateTeam: async (
    id: string,
    data: UpdateTeamData
  ): Promise<TeamResponse> => {
    const res = await api.patch(`/teams/${id}`, data);
    return res.data;
  },

  deleteTeam: async (id: string): Promise<void> => {
    await api.delete(`/teams/${id}`);
  },
};
