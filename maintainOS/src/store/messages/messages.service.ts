import axios from "axios";

import type { User } from "./messages.types";

const API_URL = import.meta.env.VITE_API_URL;

export const messageService = {
  searchUsers: async (currentUserId: string): Promise<User[]> => {
    // Get all users and filter out the current user on the frontend
    const response = await axios.get(`${API_URL}/users`);

    const allUsers = response.data;
    const filteredUsers = allUsers.filter(
      (user: any) => user.id !== currentUserId
    );

    // Transform the response to match our User interface if needed
    const transformedUsers = filteredUsers.map((user: any) => ({
      id: user.id,
      name: user.fullName || user.name,
      avatarUrl: user.avatarUrl,
    }));
    return transformedUsers;
  },
};
