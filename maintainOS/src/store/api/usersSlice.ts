import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

import axios from "axios";

export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role?: string;
  hourlyRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  fullName: string;
  email: string;
  phoneNumber?: string;
  role?: string;
  hourlyRate?: number;
  password?: string;
}

export interface UpdateUserData {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  hourlyRate?: number;
  password?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const userService = {
  fetchUsers: async (): Promise<UserResponse[]> => {
    const res = await axios.get(`${API_URL}/users`);
    return res.data;
  },

  fetchUserById: async (id: string): Promise<UserResponse> => {
    const res = await axios.get(`${API_URL}/users/${id}`);
    return res.data;
  },

  createUser: async (data: CreateUserData): Promise<UserResponse> => {
    const res = await axios.post(`${API_URL}/users`, data);
    return res.data;
  },

  updateUser: async (
    id: string,
    data: UpdateUserData
  ): Promise<UserResponse> => {
    const res = await axios.patch(`${API_URL}/users/${id}`, data);
    return res.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/users/${id}`);
  },
};

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

// Interface for the users state
interface UsersState {
  users: UserResponse[];
  selectedUser: UserResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
};

// Users slice
const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedUser: (state, action: PayloadAction<UserResponse | null>) => {
      state.selectedUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch user by ID cases
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create user cases
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update user cases
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(
          (user) => user.id === action.payload.id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete user cases
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((user) => user.id !== action.payload);
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedUser } = usersSlice.actions;
export default usersSlice.reducer;
