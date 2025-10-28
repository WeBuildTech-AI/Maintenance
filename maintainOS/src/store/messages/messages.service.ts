import axios from "axios";

import type {
  DMConversation,
  MessageWithSender,
  User,
  CreateConversationPayload,
} from "./messages.types";

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

  userDMs: async (userId: string): Promise<DMConversation[]> => {
    const response = await axios.get(
      `${API_URL}/messaging/conversations/allconvo/${userId}`
    );
    const conversations = response.data;

    const transformed: DMConversation[] = conversations.map((convo: any) => {
      const otherUsers = convo.participants
        .filter((p: any) => p.userId !== userId) // Exclude current user
        .map((p: any) => ({
          id: p.userId,
          name: p.user?.fullName || p.userId, // Get fullName from backend user object
          avatarUrl: p.user?.avatarUrl,
        }));

      return {
        id: convo.id,
        participants: otherUsers,
        lastMessage: convo.messages?.[0] || null,
      };
    });

    return transformed;
  },

  // get all chats of a particular coversation ID
  getChatHistory: async (
    conversationId: string
  ): Promise<MessageWithSender[]> => {
    const response = await axios.get(
      `${API_URL}/messaging/conversations/${conversationId}/messages`
    );
    const messages = response.data;

    if (messages.length > 0) {
      console.log("Backend message structure:", messages[0]);
    }

    // The backend already returns the correct format, just ensure type safety
    const transformedMessages: MessageWithSender[] = messages.map(
      (msg: any) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        type: msg.type,
        body: msg.body || "",
        attachments: msg.attachments || [],
        messageImages: msg.messageImages || [], // ✅ Include messageImages
        messageDocs: msg.messageDocs || [], // ✅ Include messageDocs
        metadata: msg.metadata,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt || msg.createdAt,
        status: msg.status,
        // The sender object is already properly formatted from backend
        sender: {
          id: msg.sender.id,
          fullName: msg.sender.fullName,
          avatarUrl: msg.sender.avatarUrl || undefined,
        },
      })
    );

    console.log("Transformed message:", transformedMessages[0]);
    return transformedMessages;
  },

  createConversation: async (
    payload: CreateConversationPayload & { userId: string }
  ): Promise<DMConversation> => {
    const response = await axios.post(
      `${API_URL}/messaging/conversations`,
      payload
    );
    return response.data;
  },
};
