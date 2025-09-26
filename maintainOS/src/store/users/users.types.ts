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

export interface UsersState {
  users: UserResponse[];
  selectedUser: UserResponse | null;
  loading: boolean;
  error: string | null;
}
