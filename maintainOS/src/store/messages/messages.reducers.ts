import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { chatHisory, getDMs,searchUsers } from "./messages.thunks";
import type { DMConversation, User, MessagingState } from "./messages.types";

const initialState: MessagingState = {
  searchResults: [],
  dms: [],
  searchStatus: "idle",
  dmsStatus: "idle",
  error: null,
  searchError: null,
  dmsError : null,

  // Initial state for the active conversation
  activeConversation: {
    messages: [],
    status: "idle",
    error: null,
  },
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
    addMessage: (state, action) => {
      state.activeConversation.messages.unshift(action.payload); // Add to the beginning
    }
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


      builder
      // get chat by conversation id 
      .addCase(chatHisory.pending, (state) => {
        state.activeConversation.status = "loading";
        state.activeConversation.error = null;
      })
      .addCase(chatHisory.fulfilled, (state, action) => {
        state.activeConversation.status = "succeeded";
        // The payload is the array of messages
        state.activeConversation.messages = action.payload;
      })
      .addCase(chatHisory.rejected, (state, action) => {
        state.activeConversation.status = "failed";
        state.activeConversation.error = action.payload as string;
      });
  },
});

export const { clearSearchResults, clearDMs, addMessage} = messagingSlice.actions;
export default messagingSlice.reducer;
