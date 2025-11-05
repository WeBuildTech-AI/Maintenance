
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
// Import the User type you defined in your auth.service
import type { User } from "./auth.service"; 
import { login, register, logout, checkAuth } from "./auth.thunks";

// Define the new state shape
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  loading: null;
}

// 👇 Helper to get initial state from localStorage
const getInitialUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
const getInitialToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

const initialState: AuthState = {
  user: getInitialUser(),
  isAuthenticated: !!getInitialToken(),
  status: 'idle', // 'idle' means we haven't checked auth yet
  error: null,
  loading: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  // 'reducers' are for actions that *don't* talk to an API
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  // 'extraReducers' are for actions that *do* talk to an API (thunks)
  extraReducers: (builder) => {
    builder
      // --- Login ---
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload; // Payload is just the User object
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      })

      // --- Register ---
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload; // Payload is just the User object
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      })

      // --- Logout ---
      // This thunk just resets the state after the API call succeeds
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = 'idle';
      })

      // --- Check Auth (for app load) ---
      .addCase(checkAuth.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state) => {
        // This is not a "failure", it just means no user is logged in
        state.status = 'idle'; 
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;