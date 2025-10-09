import { createAsyncThunk } from "@reduxjs/toolkit";
import type { DMConversation } from "./messages.types";
import { messageService } from "./messages.service";

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

