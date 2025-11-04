// import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
// import type { AuthState, AuthResponse } from "./auth.types";
// import { login, register } from "./auth.thunks";

// const initialState: AuthState = {
//   user:
//     typeof window !== "undefined"
//       ? JSON.parse(localStorage.getItem("user") || "null")
//       : null,
//   accessToken:
//     typeof window !== "undefined" ? localStorage.getItem("accessToken") : null,
//   loading: false,
//   error: null,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     logout: (state) => {
//       state.user = null;
//       state.accessToken = null;
//       if (typeof window !== "undefined") {
//         localStorage.removeItem("user");
//         localStorage.removeItem("accessToken");
//       }
//     },
//     clearError: (state) => {
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Login
//       .addCase(login.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
//         state.loading = false;
//         state.user = action.payload.user;
//         state.accessToken = action.payload.accessToken;

//         // ✅ Save both user and token
//         if (typeof window !== "undefined") {
//           localStorage.setItem("user", JSON.stringify(action.payload.user));
//           localStorage.setItem("accessToken", action.payload.accessToken);
//         }
//       })
//       .addCase(login.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       })

//       // Register
//       .addCase(register.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(
//         register.fulfilled,
//         (state, action: PayloadAction<AuthResponse>) => {
//           state.loading = false;
//           state.user = action.payload.user;
//           state.accessToken = action.payload.accessToken;

//           // ✅ Save both user and token
//           if (typeof window !== "undefined") {
//             localStorage.setItem("user", JSON.stringify(action.payload.user));
//             localStorage.setItem("accessToken", action.payload.accessToken);
//           }
//         }
//       )
//       .addCase(register.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       });
//   },
// });

// export const { logout, clearError } = authSlice.actions;
// export default authSlice.reducer;



import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
// Import the User type you defined in your auth.service
import type { User } from "./auth.service"; 
// Import your thunks
import { login, register, logout, checkAuth } from "./auth.thunks";

// 1. Define the new state shape
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// 2. Create the new initial state
//    No localStorage, no accessToken.
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: 'idle', // 'idle' means we haven't checked auth yet
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  // 3. 'reducers' are for actions that *don't* talk to an API
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  // 4. 'extraReducers' are for actions that *do* talk to an API (thunks)
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