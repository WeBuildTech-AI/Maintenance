import { createAsyncThunk } from "@reduxjs/toolkit";
import { userService } from "./users.service";
import type { CreateUserData, UpdateUserData } from "./users.types";

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const users = await userService.fetchUsers();
      return users;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

// ✅ NEW THUNK → Fetch summary
export const fetchUserSummary = createAsyncThunk(
  "users/fetchUserSummary",
  async (_, { rejectWithValue }) => {
    try {
      const users = await userService.fetchUserSummary();
      return users;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user summary"
      );
    }
  }
);

export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (id: string, { rejectWithValue }) => {
    try {
      const user = await userService.fetchUserById(id);
      return user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user"
      );
    }
  }
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (userData: CreateUserData, { rejectWithValue }) => {
    try {
      const user = await userService.createUser(userData);
      return user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create user"
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (
    {
      id,
      userData,
    }: {
      id: string;
      userData: UpdateUserData;
    },
    { rejectWithValue }
  ) => {
    try {
      const user = await userService.updateUser(id, userData);
      return user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user"
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id: string, { rejectWithValue }) => {
    try {
      await userService.deleteUser(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete user"
      );
    }
  }
);
