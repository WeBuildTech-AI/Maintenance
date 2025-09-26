import axios from "axios";
import type { LoginData, RegisterData, AuthResponse } from "./auth.types";

const API_URL = import.meta.env.VITE_API_URL;

export const authService = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const res = await axios.post(`${API_URL}/auth/login`, data);
    return res.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const res = await axios.post(`${API_URL}/auth/register`, data);
    return res.data;
  },
};
