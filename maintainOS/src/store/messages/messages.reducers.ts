import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getDMs,searchUsers } from "./messages.thunks";
import type { DMConversation, User, MessagingState } from "./messages.types";

const initialState: MessagingState = {
  searchResults: [],
  dms: [],
  searchStatus: "idle",
  dmsStatus: "idle",
  error: null,
  searchError: null,
  dmsError : null,
};

const messagingSlice = createSlice({
  name: "messaging",
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchStatus = "idle";
    },
    clearDMs: (state) => {
      state.dms = [];
      state.dmsStatus = "idle";
    },
  },
  extraReducers: (builder) => {

    builder
      // Reducers for searchUsersThunk
      .addCase(searchUsers.pending, (state) => {
        state.searchStatus = "loading";
        state.searchError = null;
      })
      .addCase(
        searchUsers.fulfilled,
        (state, action: PayloadAction<User[]>) => {
          state.searchStatus = "succeeded";
          state.searchResults = action.payload;
        }
      )
      .addCase(searchUsers.rejected, (state, action) => {
        state.searchStatus = "failed";
        state.searchError = action.payload as string;
      });

      builder
      // Reducer for getDMs thunk
      .addCase(getDMs.pending, (state) => {
        state.dmsStatus = "loading";
        state.dmsError = null;
      })
      .addCase(getDMs.fulfilled, (state, action: PayloadAction<DMConversation[]>) => {
        state.dmsStatus = "succeeded";
        state.dms = action.payload;
      })
      .addCase(getDMs.rejected, (state, action) => {
        state.dmsStatus = "failed";
        state.dmsError = action.payload as string;
      });
  },
});




export const { clearSearchResults, clearDMs} = messagingSlice.actions;
export default messagingSlice.reducer;
