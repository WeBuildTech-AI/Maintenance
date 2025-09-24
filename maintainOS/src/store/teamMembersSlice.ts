import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  teamMemberService,
  type TeamMemberResponse,
  type CreateTeamMemberData,
  type UpdateTeamMemberData,
} from "../services/teamMemberService";

interface TeamMembersState {
  teamMembers: TeamMemberResponse[];
  selectedTeamMember: TeamMemberResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: TeamMembersState = {
  teamMembers: [],
  selectedTeamMember: null,
  loading: false,
  error: null,
};

// Async thunks
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
      // Fetch all team members
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

      // Fetch team member by ID
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

      // Create team member
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

      // Update team member
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

      // Delete team member
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
