import { createAsyncThunk } from "@reduxjs/toolkit";
import type { DMConversation, CreateConversationPayload } from "./messages.types";
import { messageService } from "./messages.service";
import type { RootState } from "../index"; 

export const searchUsers = createAsyncThunk(
  "messaging/searchUsers",
  async (currentUserId: string, { rejectWithValue }) => {
    try {
      const users = await messageService.searchUsers(currentUserId);
      return users;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

export const getDMs = createAsyncThunk<DMConversation[], string>(
  "messaging/getDMs",
  async (userId, { rejectWithValue }) => {
    try {
      const dms = await messageService.userDMs(userId);
      return dms;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch DMs"
      );
    }
  }
);

export const chatHistory = createAsyncThunk(
  "messaging/getChatHistory",
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const chat = await messageService.getChatHistory(conversationId);
      return chat;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch chat history"
      );
    }
  }
);

export const createConversation = createAsyncThunk(
  "messaging/createConversation",
  async (
    payload: CreateConversationPayload,
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      // Extract the current user's ID from the auth slice
      const userId = state.auth.user?.id;

      if (!userId) {
        return rejectWithValue("User not found. Please log in.");
      }

      const fullPayload = {
        ...payload,
        userId,
      };

      const newConversation = await messageService.createConversation(
        fullPayload
      );
      return newConversation;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create conversation"
      );
    }
  }
);