// messages.types.ts
import type { ViewMode } from "../../components/purchase-orders/po.types";

// ---------- ENUMS ----------
export type ConversationType = "org" | "dm" | "group";
export type MessageType = "text" | "file" | "system";

// ---------- CORE INTERFACES ----------

export interface Conversation {
  id: string;
  type: ConversationType;
  title?: string;
  description?: string;
  participants: User[];
  createdAt: string;
  updatedAt: string;
  lastMessage?: Message;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  body?: string;
  attachments?: Attachment[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  status?: "sent" | "delivered" | "read";
}

export interface DMConversation {
  id: string; // conversation ID
  participants: User[]; // only other users (exclude current user)
  lastMessage?: Message;
}

// ---------- SUPPORTING TYPES ----------

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface UserResponse {
  id: string;
  fullName: string;
  avatarUrl?: string;
}

export interface Attachment {
  id: string;
  url: string;
  name?: string;
  mimeType?: string;
  size?: number;
}

// ---------- PAYLOAD TYPES (correspond to your NestJS DTOs) ----------

// DTO: CreateConversationDto
export interface CreateConversationPayload {
  type: ConversationType;
  title?: string;
  description?: string;
  participantIds?: string[];
}

// DTO: UpdateConversationDto
export interface UpdateConversationPayload {
  title?: string;
  description?: string;
  addParticipantIds?: string[];
  removeParticipantIds?: string[];
}

// DTO: SendMessageDto
export interface SendMessagePayload {
  type: MessageType;
  body?: string;
  attachmentIds?: string[];
  metadata?: Record<string, any>;
}

// ADD THIS TYPE to represent the API response shape
export interface MessageWithSender extends Message {
  sender: UserResponse;
}

export interface MessagingState {
  searchResults: User[];
  dms: DMConversation[]; // new field
  dmsStatus: "idle" | "loading" | "succeeded" | "failed";
  searchStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  searchError: string | null;
  dmsError: string | null;

  // ADD THIS section to handle the active chat window's messages
  activeConversation: {
    messages: MessageWithSender[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  };

  isConnected: boolean;
}
export interface ChatWindowProps {
  messages: {
    id: number;
    sender: string; // Changed from "me" | "them" to string
    text: string;
    avatar: string;
    timestamp: string;
  }[];
  isCreatingMessage: boolean;
  conversationId?: string; // Add conversationId prop
  currentChatUser?: {
    name: string;
    avatarUrl?: string;
    isGroup?: boolean;
    participants?: User[];
  };
}

export type MessagesHeaderProps = {
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setIsCreatingForm: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
};
