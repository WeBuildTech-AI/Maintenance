import { createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "./auth.service";
import type { LoginData, RegisterData, AuthResponse } from "./auth.types";

// Login thunk
export const login = createAsyncThunk<AuthResponse, LoginData>(
  "auth/login",
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await authService.login(loginData);
      localStorage.setItem("accessToken", response.accessToken);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// Register thunk
export const register = createAsyncThunk<AuthResponse, RegisterData>(
  "auth/register",
  async (registerData, { rejectWithValue }) => {
    try {
      const response = await authService.register(registerData);
      localStorage.setItem("accessToken", response.accessToken);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);
