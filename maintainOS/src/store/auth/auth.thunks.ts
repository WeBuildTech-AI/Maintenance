import { createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "./auth.service";
import type { User } from "./auth.service"; // 👈 Import new User type
import type { LoginData, RegisterData } from "./auth.types";


export const login = createAsyncThunk<User, LoginData>(
  "auth/login",
  async (loginData, { rejectWithValue }) => {
    try {
      // 1. Call login. This now returns tokens.
      const { accessToken, refreshToken } = await authService.login(loginData);

      // 2. Save tokens to localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // 3. Call profile to get user data
      const user = await authService.getProfile();

      // 4. Save user to localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      return user; // Return user to slice
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const register = createAsyncThunk<User, RegisterData>(
  "auth/register",
  async (registerData, { rejectWithValue }) => {
    try {
      await authService.register(registerData);

      const user = await authService.getProfile();

      return user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);


export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout(); // Backend call
    } catch (error: any) {
      console.error("Logout failed on server, clearing client anyway");
      rejectWithValue("Logout failed")
    } finally {
      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }

    // Clear sessionStorage
    sessionStorage.clear();

    // Clear Cache Storage 
    if ("caches" in window) {
      caches.keys().then(keys => {
        keys.forEach(key => caches.delete(key));
      });
    }
  }
);

export const checkAuth = createAsyncThunk<User>(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getProfile();
      return user;
    } catch (error: any) {
      return rejectWithValue("No valid session");
    }
  }
);