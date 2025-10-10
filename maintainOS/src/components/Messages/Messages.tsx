import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { User, Users } from "lucide-react";
import { cn } from "../ui/utils";
import { ChatWindow } from "./ChatWindow";
import { MessagesHeaderComponent } from "./MessagesHeader";
import type { ViewMode } from "../purchase-orders/po.types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useLocation, useNavigate } from "react-router-dom";
import type { RootState } from "../../store";
import { getDMs, chatHistory } from "../../store/messages/messages.thunks";
import type { DMConversation } from "../../store/messages/messages.types";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../store";

export function Messages() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);

  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isCreatingMessage, setIsCreatingMessage] = useState(false);

  const [active, setActive] = useState<"messages" | "threads">("messages");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const allConvos =
    useSelector((state: RootState) => state.messaging.dms) || [];
  const activeConversation = useSelector(
    (state: RootState) => state.messaging.activeConversation
  );

  // DMs: (only 1 other participant)
  const oneOnOneDMs = allConvos.filter(
    (convo) => convo && convo.participants && convo.participants.length === 1
  );

  // Threads: group conversations (>1 other participants)
  const threads = allConvos.filter(
    (convo) => convo && convo.participants && convo.participants.length > 1
  );

  const dmsStatus = useSelector(
    (state: RootState) => state.messaging.dmsStatus
  );

  useEffect(() => {
    if (currentUserId && dmsStatus === "idle") {
      dispatch(getDMs(currentUserId));
    }
  }, [dispatch, currentUserId, dmsStatus]);

  // Fetch chat history when a conversation is selected
  useEffect(() => {
    if (selectedId) {
      dispatch(chatHistory(selectedId));
    }
  }, [dispatch, selectedId]);

  const items: DMConversation[] = active === "messages" ? oneOnOneDMs : threads;

  const transformMessages = () => {
    console.log("Current user:", currentUserId);
    console.log("Active conversation messages:", activeConversation.messages);

    return [...activeConversation.messages] // Create a copy of the array to avoid mutating Redux state
      .filter((msg) => msg && msg.id) // Filter out any null/undefined/invalid messages
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ) // Sort by createdAt ascending (oldest first)
      .map((msg, index) => {
        console.log("Transforming message:", msg);
        console.log("Sender object:", msg.sender);
        console.log("Sender fullName:", msg.sender?.fullName);

        // Handle both complete sender objects and messages with just senderId
        let senderName = "Unknown User";
        let senderAvatar = "/avatar.png";

        if (msg.sender?.fullName) {
          // Complete sender object from API
          senderName = msg.sender.fullName;
          senderAvatar = msg.sender.avatarUrl || "/avatar.png";
        } else if (msg.senderId === currentUserId) {
          // If it's the current user's message, use "You" or get from auth state
          senderName = "You";
        } else {
          // Try to find the sender in the conversation participants
          const selectedConversation = items.find(
            (item) => item.id === selectedId
          );
          const participant = selectedConversation?.participants.find(
            (p) => p.id === msg.senderId
          );
          if (participant) {
            senderName = participant.name;
            senderAvatar = participant.avatarUrl || "/avatar.png";
          }
        }

        const transformedMsg = {
          id: parseInt(msg.id) || index,
          sender: senderName,
          text: msg.body || "",
          avatar: senderAvatar,
          timestamp: new Date(msg.createdAt).toLocaleString(),
        };

        console.log("Final transformed message:", transformedMsg);
        return transformedMsg;
      });
  };

  const location = useLocation();
  useEffect(() => {
    if (location.pathname.endsWith("/messages/new")) {
      setIsCreatingMessage(true);
    }
  }, [location]);

  useEffect(() => {
    if (items.length > 0) {
      setSelectedId(items[0].id);
    }
  }, [active]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <MessagesHeaderComponent
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setIsCreatingForm={setIsCreatingMessage}
        setShowSettings={setShowSettings}
      />

      <div className="p-6 gap-4 flex flex-1 min-h-0">
        {/* Chat List Section */}
        <div className="w-96 border border-border bg-card flex flex-col min-h-0">
          {/* Chat/Thread Buttons */}
          <div className="border border-border flex w-full">
            <Button
              onClick={() => setActive("messages")}
              className={cn(
                "w-half mb-2 mt-2 rounded-none bg-white text-black border-b-4 border-transparent",
                active === "messages" && "text-orange-600 border-orange-600"
              )}
            >
              <User /> Messages
            </Button>
            <Button
              onClick={() => setActive("threads")}
              className={cn(
                "w-half mb-2 mt-2 rounded-none bg-white text-black border-b-4 border-transparent",
                active === "threads" && "text-orange-600 border-orange-600"
              )}
            >
              <Users /> Threads
            </Button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto border border-border">
            {items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-3 p-3 border-b",
                  selectedId === item.id && "bg-orange-50"
                )}
                onClick={() => {
                  setSelectedId(item.id);
                  setIsCreatingMessage(false);
                  navigate("/messages");
                }}
              >
                <Avatar>
                  <AvatarImage
                    src={item.participants[0]?.avatarUrl || "/avatar.png"}
                  />
                  <AvatarFallback>
                    {item.participants[0]?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="truncate">
                  <p className="font-medium truncate">
                    {item.participants.map((p) => p.name || p.id).join(", ")}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {item.lastMessage?.body || "No messages yet"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 border border-border bg-card min-h-0">
          {selectedId ? (
            activeConversation.status === "loading" ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Loading messages...
              </div>
            ) : activeConversation.messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No messages in this conversation
              </div>
            ) : (
              <ChatWindow
                messages={transformMessages()}
                isCreatingMessage={isCreatingMessage}
                conversationId={selectedId}
                currentChatUser={(() => {
                  const selectedConversation = items.find(
                    (item) => item.id === selectedId
                  );
                  if (!selectedConversation) return undefined;

                  // For DMs, use the other participant's info
                  if (selectedConversation.participants.length === 1) {
                    const participant = selectedConversation.participants[0];
                    return {
                      name: participant.name,
                      avatarUrl: participant.avatarUrl,
                      isGroup: false,
                    };
                  }

                  // For group conversations, create a group name
                  return {
                    name: selectedConversation.participants
                      .map((p) => p.name)
                      .join(", "),
                    avatarUrl: selectedConversation.participants[0]?.avatarUrl,
                    isGroup: true,
                    participants: selectedConversation.participants,
                  };
                })()}
              />
            )
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
