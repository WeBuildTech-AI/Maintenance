import { createAsyncThunk } from "@reduxjs/toolkit";

import { teamMemberService } from "./teamMembers.service";
import type {
  CreateTeamMemberData,
  UpdateTeamMemberData,
} from "./teamMembers.types";

export const fetchTeamMembers = createAsyncThunk(
  "teamMembers/fetchTeamMembers",
  async (_, { rejectWithValue }) => {
    try {
      return await teamMemberService.fetchTeamMembers();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch team members"
      );
    }
  }
);

export const fetchTeamMemberById = createAsyncThunk(
  "teamMembers/fetchTeamMemberById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await teamMemberService.fetchTeamMemberById(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch team member"
      );
    }
  }
);

export const createTeamMember = createAsyncThunk(
  "teamMembers/createTeamMember",
  async (teamMemberData: CreateTeamMemberData, { rejectWithValue }) => {
    try {
      return await teamMemberService.createTeamMember(teamMemberData);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create team member"
      );
    }
  }
);

export const updateTeamMember = createAsyncThunk(
  "teamMembers/updateTeamMember",
  async (
    { id, data }: { id: string; data: UpdateTeamMemberData },
    { rejectWithValue }
  ) => {
    try {
      return await teamMemberService.updateTeamMember(id, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update team member"
      );
    }
  }
);

export const deleteTeamMember = createAsyncThunk(
  "teamMembers/deleteTeamMember",
  async (id: string, { rejectWithValue }) => {
    try {
      await teamMemberService.deleteTeamMember(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete team member"
      );
    }
  }
);
