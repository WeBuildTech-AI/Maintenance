import axios from "axios";
import type { LoginData, RegisterData } from "./auth.types"; // We don't need AuthResponse


interface LoginResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Client-Type": "web"
  }
  //  withCredentials: true, // No longer needed
});

// 1. ADD THIS REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Attach it to the header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: { resolve: (token: string | null) => void; reject: (error: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        // If a refresh is already in progress, "pause" this request
        // by returning a new Promise that will be resolved or rejected
        // when the refresh finishes.
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
      }

      // This is the first 401. Start the refresh.
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // No refresh token, immediate logout
        isRefreshing = false; // Reset flag
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // 1. Call the refresh endpoint
        const res = await api.post('/auth/refresh', {}, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        });

        // 2. Get new tokens
        const { accessToken, refreshToken: newRefreshToken } = res.data;

        // 3. Save new tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // 4. Update the default header for all future 'api' calls
        api.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
        
        // 5. Update the header for this *original* failed request
        originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;

        // 6. "Un-pause" all other waiting requests
        processQueue(null, accessToken);
        
        // 7. Retry the original request
        return api(originalRequest);

      } catch (refreshError) {
        // The refresh itself failed. Log everyone out.
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // "Un-pause" all waiting requests by rejecting them
        processQueue(refreshError, null);
        
        window.location.href = '/login'; 
        return Promise.reject(refreshError);
      
      } finally {
        // No matter what, the refresh attempt is over
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);


export interface User {
  id: string;
  email: string;
  organizationId: string;
}

export const authService = {
  login: async (data: LoginData): Promise<{accessToken: string, refreshToken: string}> => {
    const res = await api.post<LoginResponse>("/auth/login", data);
    return res.data.tokens;
  },

  register: async (data: RegisterData): Promise<any> => {
    const res  = await api.post("/auth/register", data);
    return res.data;
  },

  getProfile: async (): Promise<User> => {
    const res = await api.get("/auth/profile");
    return res.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await api.post('/auth/logout', {}, {
        headers: { Authorization: `Bearer ${refreshToken}` }
      });
    }
  },
};

export default api;