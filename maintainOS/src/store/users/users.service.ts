import axios from "axios";

import type {
  CreateUserData,
  UpdateUserData,
  UserResponse,
} from "./users.types";

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
