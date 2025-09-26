import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

// src/services/teamService.ts
import axios from "axios";

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
  color?: string; // hex color code
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

  updateTeam: async (id: string, data: UpdateTeamData): Promise<TeamResponse> => {
    const res = await axios.patch(`${API_URL}/teams/${id}`, data);
    return res.data;
  },

  deleteTeam: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/teams/${id}`);
  },
};


interface TeamsState {
  teams: TeamResponse[];
  selectedTeam: TeamResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: TeamsState = {
  teams: [],
  selectedTeam: null,
  loading: false,
  error: null,
};

// Async thunks
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

const teamsSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    clearSelectedTeam: (state) => {
      state.selectedTeam = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all teams
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchTeams.fulfilled,
        (state, action: PayloadAction<TeamResponse[]>) => {
          state.loading = false;
          state.teams = action.payload;
        }
      )
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch team by ID
      .addCase(fetchTeamById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchTeamById.fulfilled,
        (state, action: PayloadAction<TeamResponse>) => {
          state.loading = false;
          state.selectedTeam = action.payload;
        }
      )
      .addCase(fetchTeamById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create team
      .addCase(createTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createTeam.fulfilled,
        (state, action: PayloadAction<TeamResponse>) => {
          state.loading = false;
          state.teams.push(action.payload);
        }
      )
      .addCase(createTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update team
      .addCase(updateTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateTeam.fulfilled,
        (state, action: PayloadAction<TeamResponse>) => {
          state.loading = false;
          const index = state.teams.findIndex(
            (team) => team.id === action.payload.id
          );
          if (index !== -1) {
            state.teams[index] = action.payload;
          }
          if (state.selectedTeam?.id === action.payload.id) {
            state.selectedTeam = action.payload;
          }
        }
      )
      .addCase(updateTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete team
      .addCase(deleteTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTeam.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.teams = state.teams.filter((team) => team.id !== action.payload);
        if (state.selectedTeam?.id === action.payload) {
          state.selectedTeam = null;
        }
      })
      .addCase(deleteTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedTeam, clearError } = teamsSlice.actions;
export default teamsSlice.reducer;
