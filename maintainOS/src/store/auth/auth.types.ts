export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role?: string;
  };
}

export interface AuthState {
  user: AuthResponse["user"] | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}
