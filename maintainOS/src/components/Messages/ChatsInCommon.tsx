import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Users, User as UserIcon } from "lucide-react";

interface ChatsInCommonProps {
  currentConversationId?: string;
  otherUserId?: string; // The user we're checking common chats with
}

export const ChatsInCommon: React.FC<ChatsInCommonProps> = ({
  currentConversationId,
  otherUserId,
}) => {
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const dms = useSelector((state: RootState) => state.messaging.dms);

  // Find all conversations where both current user and the other user are participants
  const commonConversations = useMemo(() => {
    if (!currentUserId || !otherUserId) return [];

    return dms.filter((conversation) => {
      // Exclude the current conversation
      if (conversation.id === currentConversationId) return false;

      // Check if the other user is a participant
      const hasOtherUser = conversation.participants.some(
        (participant) => participant.id === otherUserId
      );

      // The current user is implicitly part of all conversations in dms
      // (since getDMs fetches conversations for the current user)
      return hasOtherUser;
    });
  }, [currentUserId, otherUserId, dms, currentConversationId]);

  if (!otherUserId) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        Select a conversation to see common chats
      </div>
    );
  }

  if (commonConversations.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        No other chats in common
      </div>
    );
  }

  return (
    <div className="space-y-2 py-2">
      {commonConversations.map((conversation) => {
        const isGroup = conversation.participants.length > 1;
        const memberCount = conversation.participants.length + 1; 

        const conversationName = isGroup
          ? conversation.participants.map((p) => p.name).join(", ")
          : conversation.participants[0]?.name || "Unknown";

        const displayAvatar = conversation.participants[0]?.avatarUrl;

        return (
          <div
            key={conversation.id}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {/* Avatar */}
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={displayAvatar || "/avatar.png"} />
              <AvatarFallback>
                {isGroup ? (
                  <Users className="w-5 h-5" />
                ) : (
                  conversationName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                )}
              </AvatarFallback>
            </Avatar>

            {/* Conversation Info */}
            <div className="flex-1 min-w-0">
              <div>
                <p className="font-medium text-sm truncate">
                  {conversationName}
                </p>
                {isGroup && (
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {memberCount} members
                  </span>
                )}
              </div>
            </div>

            <div className="flex-shrink-0">
              {isGroup ? (
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-orange-600" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-blue-600" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
