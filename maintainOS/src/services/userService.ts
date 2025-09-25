import api from "./api";

// type defintions
export type UserRole = "administrator" | "fulluser" | "requester";

export type UserVisibility = "full" | "limited";

export type RateVisibility = "view_only" | "view_and_edit" | "hidden";

export interface User {
  id: string;
  organizationId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  fullUserVisibility?: UserVisibility;
  hourlyRate?: number;
  rateVisibility?: RateVisibility;
  schedulableUser?: boolean;
  workingDays: string[];
  hoursPerDay?: number;
  passwordHash?: string; 
  createdAt: Date;
  updatedAt: Date;
}

export type UserResponse = Omit<User, "passwordHash">;


export interface CreateUserData {
  organizationId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  fullUserVisibility?: UserVisibility;
  hourlyRate?: number;
  rateVisibility?: RateVisibility;
  schedulableUser?: boolean;
  workingDays: string[];
  hoursPerDay?: number;
  passwordHash?: string; 
}

export interface UpdateUserData {
  organizationId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  fullUserVisibility?: UserVisibility;
  hourlyRate?: number;
  rateVisibility?: RateVisibility;
  schedulableUser?: boolean;
  workingDays: string[];
  hoursPerDay?: number;
  passwordHash?: string; 
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
