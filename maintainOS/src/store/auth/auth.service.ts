// import axios from "axios";
// import type { LoginData, RegisterData, AuthResponse } from "./auth.types";

// const API_URL = import.meta.env.VITE_API_URL;

// export const authService = {
//   login: async (data: LoginData): Promise<AuthResponse> => {
//     const res = await axios.post(`${API_URL}/auth/login`, data);
//     return res.data;
//   },

//   register: async (data: RegisterData): Promise<AuthResponse> => {
//     const res = await axios.post(`${API_URL}/auth/register`, data);
//     return res.data;
//   },
// };

import axios from "axios";
import type { LoginData, RegisterData } from "./auth.types"; // We don't need AuthResponse

// This is your shared axios instance.
// We MUST set 'withCredentials: true' so that it sends
// cookies with every request.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // 👈 CRITICAL: This tells axios to send cookies
});

// Define the User type we expect from the /profile endpoint
export interface User {
  id: string;
  email: string;
  organizationId: string;
}

export const authService = {
  // Login just makes the call. The cookie is set by the browser.
  login: async (data: LoginData): Promise<void> => {
    await api.post("/auth/login", data);
  },

  // Register just makes the call.
  register: async (data: RegisterData): Promise<void> => {
    await api.post("/auth/register", data);
  },

  // This is the NEW essential function
  getProfile: async (): Promise<User> => {
    const res = await api.get("/auth/profile");
    return res.data;
  },

  // We'll need this later
  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },
};

// Export the configured axios instance so your thunks can use it
export default api;