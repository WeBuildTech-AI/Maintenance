import { createAsyncThunk } from "@reduxjs/toolkit";

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
