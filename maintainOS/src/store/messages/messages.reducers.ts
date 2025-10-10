import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { chatHistory, getDMs, searchUsers } from "./messages.thunks";
import type {
  DMConversation,
  User,
  MessagingState,
  SendMessagePayload,
  MessageWithSender,
} from "./messages.types";

const initialState: MessagingState = {
  searchResults: [],
  dms: [],
  searchStatus: "idle",
  dmsStatus: "idle",
  error: null,
  searchError: null,
  dmsError: null,

  // Initial state for the active conversation
  activeConversation: {
    messages: [],
    status: "idle",
    error: null,
  },
  isConnected: false,
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
      const newMessage = action.payload;
      console.log("🔄 Redux addMessage received:", newMessage);

      // If the message doesn't have a complete sender object, we need to handle it
      // For now, we'll add it as-is and let the UI transformation handle the fallback
      // In a production app, you might want to fetch user data or maintain a user cache
      state.activeConversation.messages.unshift(newMessage);
      console.log(
        "🔄 Redux state updated, total messages:",
        state.activeConversation.messages.length
      );
    },

    // Reducer for connection status
    setSocketStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },

    // Reducer to update the conversation list when a new message arrives
    updateConversationPreview: (
      state,
      action: PayloadAction<{
        conversationId: string;
        lastMessage: MessageWithSender;
      }>
    ) => {
      const { conversationId, lastMessage } = action.payload;
      const convoIndex = state.dms.findIndex((c) => c.id === conversationId);

      if (convoIndex !== -1) {
        const conversation = state.dms[convoIndex];
        // Directly assign the new, complete message object
        conversation.lastMessage = lastMessage;

        // Move the updated conversation to the top of the list
        state.dms.splice(convoIndex, 1);
        state.dms.unshift(conversation);
      }
    },

    // Example reducer for sending a message (will be caught by middleware)
    // This action doesn't need to change state here, it's just a trigger.
    sendMessage: (
      state,
      action: PayloadAction<SendMessagePayload & { conversationId: string }>
    ) => {
      // You could implement optimistic UI updates here if you want
      // For now, it does nothing. The middleware will handle the emit.
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
      .addCase(
        getDMs.fulfilled,
        (state, action: PayloadAction<DMConversation[]>) => {
          state.dmsStatus = "succeeded";
          state.dms = action.payload;
        }
      )
      .addCase(getDMs.rejected, (state, action) => {
        state.dmsStatus = "failed";
        state.dmsError = action.payload as string;
      });

    builder
      // get chat by conversation id
      .addCase(chatHistory.pending, (state) => {
        state.activeConversation.status = "loading";
        state.activeConversation.error = null;
      })
      .addCase(chatHistory.fulfilled, (state, action) => {
        state.activeConversation.status = "succeeded";
        // The payload is the array of messages
        state.activeConversation.messages = action.payload;
      })
      .addCase(chatHistory.rejected, (state, action) => {
        state.activeConversation.status = "failed";
        state.activeConversation.error = action.payload as string;
      });
  },
});

export const {
  clearSearchResults,
  clearDMs,
  addMessage,
  setSocketStatus,
  updateConversationPreview,
  sendMessage,
} = messagingSlice.actions;

export default messagingSlice.reducer;
