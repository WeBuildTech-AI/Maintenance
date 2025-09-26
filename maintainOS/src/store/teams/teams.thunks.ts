import { createAsyncThunk } from "@reduxjs/toolkit";

import { teamService } from "./teams.service";
import type { CreateTeamData, UpdateTeamData } from "./teams.types";

export const fetchTeams = createAsyncThunk(
  "teams/fetchTeams",
  async (_, { rejectWithValue }) => {
    try {
      return await teamService.fetchTeams();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch teams"
      );
    }
  }
);

export const fetchTeamById = createAsyncThunk(
  "teams/fetchTeamById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await teamService.fetchTeamById(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch team"
      );
    }
  }
);

export const createTeam = createAsyncThunk(
  "teams/createTeam",
  async (teamData: CreateTeamData, { rejectWithValue }) => {
    try {
      return await teamService.createTeam(teamData);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create team"
      );
    }
  }
);

export const updateTeam = createAsyncThunk(
  "teams/updateTeam",
  async (
    { id, data }: { id: string; data: UpdateTeamData },
    { rejectWithValue }
  ) => {
    try {
      return await teamService.updateTeam(id, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update team"
      );
    }
  }
);

export const deleteTeam = createAsyncThunk(
  "teams/deleteTeam",
  async (id: string, { rejectWithValue }) => {
    try {
      await teamService.deleteTeam(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete team"
      );
    }
  }
);
