import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
  TeamMemberResponse,
  TeamMembersState,
} from "./teamMembers.types";
import {
  createTeamMember,
  deleteTeamMember,
  fetchTeamMemberById,
  fetchTeamMembers,
  updateTeamMember,
} from "./teamMembers.thunks";

const initialState: TeamMembersState = {
  teamMembers: [],
  selectedTeamMember: null,
  loading: false,
  error: null,
};

const teamMembersSlice = createSlice({
  name: "teamMembers",
  initialState,
  reducers: {
    clearSelectedTeamMember: (state) => {
      state.selectedTeamMember = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeamMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchTeamMembers.fulfilled,
        (state, action: PayloadAction<TeamMemberResponse[]>) => {
          state.loading = false;
          state.teamMembers = action.payload;
        }
      )
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchTeamMemberById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchTeamMemberById.fulfilled,
        (state, action: PayloadAction<TeamMemberResponse>) => {
          state.loading = false;
          state.selectedTeamMember = action.payload;
        }
      )
      .addCase(fetchTeamMemberById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createTeamMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createTeamMember.fulfilled,
        (state, action: PayloadAction<TeamMemberResponse>) => {
          state.loading = false;
          state.teamMembers.push(action.payload);
        }
      )
      .addCase(createTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateTeamMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateTeamMember.fulfilled,
        (state, action: PayloadAction<TeamMemberResponse>) => {
          state.loading = false;
          const index = state.teamMembers.findIndex(
            (teamMember) => teamMember.id === action.payload.id
          );
          if (index !== -1) {
            state.teamMembers[index] = action.payload;
          }
          if (state.selectedTeamMember?.id === action.payload.id) {
            state.selectedTeamMember = action.payload;
          }
        }
      )
      .addCase(updateTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteTeamMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteTeamMember.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.teamMembers = state.teamMembers.filter(
            (teamMember) => teamMember.id !== action.payload
          );
          if (state.selectedTeamMember?.id === action.payload) {
            state.selectedTeamMember = null;
          }
        }
      )
      .addCase(deleteTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedTeamMember, clearError } = teamMembersSlice.actions;
export default teamMembersSlice.reducer;
