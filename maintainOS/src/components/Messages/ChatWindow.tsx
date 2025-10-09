import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Paperclip, Send, Info, StepBack, ChevronDown } from "lucide-react";
import { cn } from "../ui/utils";
import { type ChatWindowProps } from "./messages.types";
import { UserSelect } from "./UserSelect";
import { useMessagingSocket, useWebSocket } from "../../utils/useWebsocket";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import type { User } from "../../store/messages";

export function ChatWindow({ messages, isCreatingMessage }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [showSharedFiles, setShowSharedFiles] = useState(false);
  const [showChatsInCommon, setShowChatsInCommon] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);

  const user = useSelector((state: RootState) => state.auth.user);

  const { isConnected, lastMessage, sendMessage } = useMessagingSocket(
    user?.id ?? ""
  );

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Handle user selection from UserSelect component
  const handleUserSelect = (selectedUser: User) => {
    setSelectedRecipient(selectedUser);
    console.log("Selected recipient:", selectedUser);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (lastMessage) {
      console.log("New message:", lastMessage);
    }
  }, [lastMessage]);

  const startSendingMessage = () => {
    if (!newMessage.trim()) return;
    setNewMessage("");
    // TO-DO Complete this
    sendMessage("af0d6e00-80ed-4f53-b010-78f4a516e78f", "Hello from client!");
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
                <UserSelect onUserSelect={handleUserSelect} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between border-b border-border p-4 bg-white">
              <div className="flex items-center gap-3">
                <Avatar className="size-15">
                  <AvatarImage src="/avatar.png" />
                  <AvatarFallback>AB</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">Chat Window</h2>
                  <p className="text-sm text-muted-foreground">Conversation</p>
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
            <div className="flex-1 p-4 flex items-end justify-start text-sm text-muted-foreground">
              Go ahead and write the first message!
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
                    <div className="flex items-baseline gap-2">
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
              onKeyDown={(e) => e.key === "Enter" && startSendingMessage()}
            />
            <Button onClick={startSendingMessage}>
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
                <AvatarImage src="/avatar.png" />
                <AvatarFallback>RM</AvatarFallback>
              </Avatar>
              <div className="mt-2 text-center font-medium">Rajesh Meena</div>
              <div className="mt-1 text-center text-sm text-muted-foreground">
                Private Chat
              </div>
            </div>
          </div>

          <div className="mt-4 border-b flex w-full justify-between pb-3">
            <p className="text-sm">Email</p>
            <p className="text-sm text-muted-foreground">
              rajeshkumarmeena094@gmail.com
            </p>
          </div>

          <div className="mt-4 flex w-full justify-between pb-3">
            <p className="text-sm">Mobile Phone Number</p>
            <p className="text-sm text-muted-foreground">+91 70239 64317</p>
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
    </div>
  );
}
