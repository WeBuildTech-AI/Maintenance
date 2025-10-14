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
    organizationId?: string;
    phoneNumber?: string;
    avatarUrl?: string;
    fullUserVisiblity?: string;
    hourlyRate?: number;
    rateVisibility?: string;
    schedulableUser?: boolean;
    hoursPerDay?: number;
    workingDays?: string[];
    createdAt: string;
    updatedAt: string;
  };
}

export interface AuthState {
  user: AuthResponse["user"] | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}
