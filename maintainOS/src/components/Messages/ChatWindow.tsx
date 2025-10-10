import { useState, useRef, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Paperclip, Send, Info, StepBack, ChevronDown } from "lucide-react";
import type {  ChatWindowProps, ConversationType } from "../../store/messages/messages.types";
import { UserSelect } from "./UserSelect";
import { CreateConversationModal } from "./GroupInfoForm";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../store";
import type { User } from "../../store/messages";
import type { AppDispatch } from "../../store";
import { useNavigate } from "react-router-dom";
import { unwrapResult } from "@reduxjs/toolkit";
import {createConversation} from "../../store/messages/messages.thunks"

export function ChatWindow({
  messages,
  isCreatingMessage,
  conversationId,
  currentChatUser,
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [showSharedFiles, setShowSharedFiles] = useState(false);
  const [showChatsInCommon, setShowChatsInCommon] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<User[]>([]);
  const [showGroupModal, setShowGroupModal] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Get real-time state from Redux store
  const isConnected = useSelector(
    (state: RootState) => state.messaging.isConnected
  );
  const lastMessage = useSelector(
    (state: RootState) => state.messaging.activeConversation.messages[0]
  );

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Handle user selection from UserSelect component
  const handleUsersSelect = useCallback((selectedUsers: User[]) => {
    setSelectedRecipients(selectedUsers);
  }, []);

  // Handle group creation
  const handleCreateGroup = useCallback(
    (groupName: string) => {
      // TODO: Implement group creation logic here
      setShowGroupModal(false);
    },
    [selectedRecipients]
  );

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (lastMessage) {
      console.log("New message received:", lastMessage);
    }
  }, [lastMessage]);

  // Join conversation when conversationId changes
  useEffect(() => {
    if (conversationId) {
      dispatch({
        type: "socket/joinConversation",
        payload: { conversationId },
      });
    }
  }, [conversationId, dispatch]);


  const handleSendMessage = async () => {
  if (isCreatingMessage) {
    if (!newMessage.trim() || selectedRecipients.length === 0) return;

    try {
      const participantIds = selectedRecipients.map((u) => u.id);
      
      const conversationType: ConversationType = participantIds.length === 1 ? 'dm' : 'group';


      const payload = {
        participantIds,
        type: conversationType,
      };
      
      const createAction = await dispatch(createConversation(payload));
      const newConversation = unwrapResult(createAction);

      dispatch({
        type: "socket/sendMessage",
        payload: {
          conversationId: newConversation.id,
          body: newMessage,
          type: "text",
        },
      });
      
      setNewMessage("");
      // navigate(`/messaging/t/${newConversation.id}`);

    } catch (error) {
      console.error("Failed to start new conversation:", error);
      // TODO: Show an error toast to the user
    }
  } 
  else {
    if (!newMessage.trim() || !conversationId) return;

    dispatch({
      type: "socket/sendMessage",
      payload: {
        conversationId,
        type: "text",
        body: newMessage,
      },
    });

    setNewMessage("");
  }
};

  

  return (
    <div className="relative flex flex-col h-full">
      {!showInfo ? (
        <>
          <p className="text-center mt-4">
            <span className="bg-orange-600 px-4 py-1 rounded-full">
              Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
            </span>
          </p>

          {/* Header */}
          {isCreatingMessage ? (
            <div className="flex items-center justify-between border-b border-border p-4 bg-white w-full">
              <p className="text-sm text-muted-foreground">To:</p>
              {/* Functionality to select the user for the new message */}
              {/* TODO - This component needs to change, we can add multiple people from here */}
              <div className="p-2 flex-1">
                <UserSelect onUsersSelect={handleUsersSelect} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between border-b border-border p-4 bg-white">
              <div className="flex items-center gap-3">
                <Avatar className="size-15">
                  <AvatarImage
                    src={currentChatUser?.avatarUrl || "/avatar.png"}
                  />
                  <AvatarFallback>
                    {currentChatUser?.name
                      ? currentChatUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : "AB"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">
                    {currentChatUser?.name || "Chat Window"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {currentChatUser?.isGroup ? "Group Chat" : "Conversation"}
                  </p>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setShowInfo(true)}>
                <Info size={18} />
                View Info
              </Button>
            </div>
          )}

          {/* Messages list */}
          {isCreatingMessage ? (
            <div className="flex-1 p-4 flex items-center justify-center items-end text-sm text-muted-foreground">
              {selectedRecipients.length > 1 ? (
                <div className="text-center">
                  <p className="mb-4">
                    You've selected {selectedRecipients.length} people for this
                    conversation.
                  </p>
                  <button
                    onClick={() => setShowGroupModal(true)}
                    className="px-6 py-2 bg-orange-600 text-black rounded-md hover:bg-orange-700 transition-colors"
                  >
                    Give a name or image to this group
                  </button>
                </div>
              ) : selectedRecipients.length === 1 ? (
                <div className="text-center">
                  <p className="mb-2 text-sm">
                    Starting a conversation with {selectedRecipients[0].name}
                  </p>
                  <p>Go ahead and write the first message!</p>
                </div>
              ) : (
                "Go ahead and write the first message!"
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-card">
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  {/* Avatar */}
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={msg.avatar} />
                    <AvatarFallback>
                      {msg.sender
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  {/* Message block */}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{msg.sender}</p>
                      <span className="text-xs text-muted-foreground">
                        {msg.timestamp}
                      </span>
                    </div>
                    <div className="mt-1 space-y-1">
                      {msg.text.split("\n").map((line, i) => (
                        <p key={i} className="text-sm">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input area */}
          <div className="border-t border-border p-3 flex items-center gap-2 bg-white">
            <Button variant="ghost" size="icon">
              <Paperclip size={18} />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Write a message..."
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>
              <Send size={18} />
            </Button>
          </div>
        </>
      ) : (
        /* Conversation Info panel */
        <div className="absolute inset-0 h-full w-full bg-white border-l border-border shadow-lg p-4 flex flex-col">
          <Button
            variant="ghost"
            className="flex-shrink-0 self-start"
            onClick={() => setShowInfo(false)}
          >
            <StepBack />
            Back to Conversation
          </Button>

          <div className="flex mt-4 items-center justify-center">
            <div className="flex-col">
              <Avatar className="size-40 p-4 bg-gray-100 rounded-full">
                <AvatarImage
                  src={currentChatUser?.avatarUrl || "/avatar.png"}
                />
                <AvatarFallback>
                  {currentChatUser?.name
                    ? currentChatUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "RM"}
                </AvatarFallback>
              </Avatar>
              <div className="mt-2 text-center font-medium">
                {currentChatUser?.name || "Unknown User"}
              </div>
              <div className="mt-1 text-center text-sm text-muted-foreground">
                {currentChatUser?.isGroup ? "Group Chat" : "Private Chat"}
              </div>
            </div>
          </div>

          <div className="mt-4 border-b flex w-full justify-between pb-3">
            <p className="text-sm">Email</p>
            <p className="text-sm text-muted-foreground">user@gmail.com</p>
          </div>

          <div className="mt-4 flex w-full justify-between pb-3">
            <p className="text-sm">Mobile Phone Number</p>
            <p className="text-sm text-muted-foreground">+91 1234</p>
          </div>

          <div className="mt-6 mb-2 border-b">
            <Button
              variant="ghost"
              className="flex-shrink-0 self-start text-sm"
              onClick={() => setShowSharedFiles((prev) => !prev)}
            >
              Shared Files
              <ChevronDown />
            </Button>
          </div>

          {showSharedFiles && (
            <div className="text-sm text-muted-background">No Shared Files</div>
          )}

          <div className="mt-6 mb-2 border-b">
            <Button
              variant="ghost"
              className="flex-shrink-0 self-start text-sm"
              onClick={() => setShowChatsInCommon((prev) => !prev)}
            >
              Chats In Common
              <ChevronDown />
            </Button>
          </div>

          {showChatsInCommon && (
            <div className="text-sm text-muted-background">
              No Chats in Common
            </div>
          )}
        </div>
      )}

      {/* Group Info Modal */}
      <CreateConversationModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        onCreate={handleCreateGroup}
      />
    </div>
  );
}
