// import { createAsyncThunk } from "@reduxjs/toolkit";
// import { authService } from "./auth.service";
// import type { LoginData, RegisterData, AuthResponse } from "./auth.types";

// // Login thunk
// export const login = createAsyncThunk<AuthResponse, LoginData>(
//   "auth/login",
//   async (loginData, { rejectWithValue }) => {
//     try {
//       const response = await authService.login(loginData);
//       localStorage.setItem("accessToken", response.accessToken);
//       return response;
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data?.message || "Login failed");
//     }
//   }
// );

// // Register thunk
// export const register = createAsyncThunk<AuthResponse, RegisterData>(
//   "auth/register",
//   async (registerData, { rejectWithValue }) => {
//     try {
//       const response = await authService.register(registerData);
//       localStorage.setItem("accessToken", response.accessToken);
//       return response;
//     } catch (error: any) {
//       return rejectWithValue(
//         error.response?.data?.message || "Registration failed"
//       );
//     }
//   }
// );

import { createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "./auth.service";
import type { User } from "./auth.service"; // 👈 Import new User type
import type { LoginData, RegisterData } from "./auth.types";

// // Login thunk
// export const login = createAsyncThunk<User, LoginData>(
//   "auth/login",
//   async (loginData, { rejectWithValue }) => {
//     try {
//       // 1. Call login. This just sets the cookie.
//       await authService.login(loginData);

//       // 2. Call profile. This proves login worked and gets user data.
//       const user = await authService.getProfile();

//       // 3. Return the user data as the payload
//       return user;
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data?.message || "Login failed");
//     }
//   }
// );

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
      // 1. Call register.
      await authService.register(registerData);

      // 2. Call profile to get the new user's data.
      const user = await authService.getProfile();

      // 3. Return the user
      return user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

// export const logout = createAsyncThunk(
//   "auth/logout",
//   async (_, { rejectWithValue }) => {
//     try {
//       // Calls the backend endpoint
//       // The backend will clear the httpOnly cookie
//       await authService.logout();
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data?.message || "Logout failed");
//     }
//   }
// );

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout(); // Backend call
    } catch (error: any) {
      // Even if backend fails, clear frontend
      console.error("Logout failed on server, clearing client anyway");
      rejectWithValue("Logout failed")
    } finally {
      // Always clear localStorage on logout
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
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