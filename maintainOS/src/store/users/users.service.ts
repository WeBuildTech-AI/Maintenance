import axios from "axios";

import type {
  CreateUserData,
  UpdateUserData,
  UserResponse,
} from "./users.types";

const API_URL = import.meta.env.VITE_API_URL;

export const userService = {
  fetchUsers: async (
    limit: number,
    page: number,
    offset: number
  ): Promise<UserResponse[]> => {
    const res = await axios.get(`${API_URL}/users`, {
      params: { limit, page, offset },
      headers: { Accept: "application/json" },
    });
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
