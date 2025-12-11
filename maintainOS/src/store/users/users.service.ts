import type {
  CreateUserData,
  UpdateUserData,
  UserResponse,
} from "./users.types";

import api from "../auth/auth.service";
export const userService = {
  // ✅ Fetch paginated users
  fetchUsers: async (
    limit?: number,
    page?: number,
    offset?: number
  ): Promise<UserResponse[]> => {
    const res = await api.get(`/users`, {
      params: { limit, page, offset },
      headers: { Accept: "application/json" },
    });
    return res.data;
  },

  // ✅ Fetch all user names / summary
  fetchUserSummary: async (): Promise<UserResponse[]> => {
    const res = await api.get(`/users/summary`, {
      headers: { Accept: "application/json" },
    });
    return res.data;
  },

  // ✅ Fetch single user
  fetchUserById: async (id: string): Promise<UserResponse> => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  // ✅ Create user
  createUser: async (data: CreateUserData): Promise<UserResponse> => {
    const res = await api.post(`/users`, data);
    return res.data;
  },

  // ✅ Update user
  updateUser: async (
    id: string,
    data: UpdateUserData
  ): Promise<UserResponse> => {
    const res = await api.patch(`/users/${id}`, data);
    return res.data;
  },

  // ✅ Delete user
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
