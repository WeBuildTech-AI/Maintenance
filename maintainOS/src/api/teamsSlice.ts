import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  teamService,
  type TeamResponse,
  type CreateTeamData,
  type UpdateTeamData,
} from "../../services/teamService";

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
