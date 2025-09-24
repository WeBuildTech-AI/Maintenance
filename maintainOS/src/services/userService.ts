import api from "./api";
import type {
  User,
  UserRole,
  UserVisibility,
  RateVisibility,
} from "@prisma/client";

// Re-export Prisma types for convenience
export type {
  User,
  UserRole,
  UserVisibility,
  RateVisibility,
} from "@prisma/client";

// For API responses - exclude sensitive fields like passwordHash
export type UserResponse = Omit<User, "passwordHash">;

// For creating new users - similar to Prisma's UserCreateInput but simplified

export interface CreateUserData {
  organizationId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role?: UserRole;
  fullUserVisibility?: UserVisibility;
  hourlyRate?: number;
  rateVisibility?: RateVisibility;
  schedulableUser?: boolean;
  workingDays?: string[];
  hoursPerDay?: number;
  passwordHash?: string; // Only for creation
}

export interface UpdateUserData {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  role?: UserRole;
  fullUserVisibility?: UserVisibility;
  hourlyRate?: number;
  rateVisibility?: RateVisibility;
  schedulableUser?: boolean;
  workingDays?: string[];
  hoursPerDay?: number;
}

export const userService = {
  fetchUsers: async (): Promise<UserResponse[]> => {
    const response = await api.get("/users");
    return response.data;
  },

  fetchUserById: async (id: string): Promise<UserResponse> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData: CreateUserData): Promise<UserResponse> => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  updateUser: async (
    id: string,
    userData: UpdateUserData
  ): Promise<UserResponse> => {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
