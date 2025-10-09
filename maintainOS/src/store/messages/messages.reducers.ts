import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { searchUsers } from "./messages.thunks";
import type { User, MessagingState } from "./messages.types";

const initialState: MessagingState = {
  searchResults: [],
  searchStatus: "idle",
  error: null,
  searchError: null,
};

const messagingSlice = createSlice({
  name: "messaging",
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchStatus = "idle";
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
          console.log(
            "searchUsers.fulfilled - Users received:",
            action.payload
          );
          state.searchStatus = "succeeded";
          state.searchResults = action.payload;
        }
      )
      .addCase(searchUsers.rejected, (state, action) => {
        console.log("searchUsers.rejected - Error:", action.payload);
        state.searchStatus = "failed";
        state.searchError = action.payload as string;
      });
  },
});

export const { clearSearchResults } = messagingSlice.actions;
export default messagingSlice.reducer;
