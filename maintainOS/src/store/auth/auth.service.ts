import axios from "axios";
import type { LoginData, RegisterData } from "./auth.types";

/* =========================
   TYPES (UNCHANGED)
   ========================= */

interface LoginResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

/* =========================
   AXIOS INSTANCE (SYNC)
   ========================= */

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
    "X-Client-Type": "web",
  },
});

/* =========================
   SET BASE URL FROM WORKER
   (ASYNC, ONCE)
   ========================= */

(async () => {
  try {
    const res = await fetch(
      import.meta.env.VITE_RUNTIME_CONFIG_URL,
      { cache: "no-store" }
    );

    if (!res.ok) {
      throw new Error("Failed to load runtime config");
    }

    const config = await res.json();
    api.defaults.baseURL = config.api_url;
  } catch (err) {
    console.error("API baseURL not initialized", err);
  }
})();

/* =========================
   REQUEST INTERCEPTOR
   (UNCHANGED)
   ========================= */

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
   (UNCHANGED)
   ========================= */

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        isRefreshing = false;
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await api.post(
          "/auth/refresh",
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        );

        const { accessToken, refreshToken: newRefreshToken } = res.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        api.defaults.headers.common.Authorization = "Bearer " + accessToken;
        originalRequest.headers.Authorization = "Bearer " + accessToken;

        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        processQueue(refreshError, null);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/* =========================
   SERVICES (UNCHANGED)
   ========================= */

export interface User {
  id: string;
  email: string;
  organizationId: string;
}

export const authService = {
  login: async (
    data: LoginData
  ): Promise<{ accessToken: string; refreshToken: string }> => {
    const res = await api.post<LoginResponse>("/auth/login", data);
    return res.data.tokens;
  },

  register: async (data: RegisterData): Promise<any> => {
    const res = await api.post("/auth/register", data);
    return res.data;
  },

  getProfile: async (): Promise<User> => {
    const res = await api.get("/auth/profile");
    return res.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      await api.post(
        "/auth/logout",
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } }
      );
    }
  },
};

export default api;