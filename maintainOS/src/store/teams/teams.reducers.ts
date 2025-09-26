import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { TeamResponse, TeamsState } from "./teams.types";
import {
  createTeam,
  deleteTeam,
  fetchTeamById,
  fetchTeams,
  updateTeam,
} from "./teams.thunks";

const initialState: TeamsState = {
  teams: [],
  selectedTeam: null,
  loading: false,
  error: null,
};

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
