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
import { Toaster } from "react-hot-toast";
import Loader from "../Loader/Loader";

export function Messages() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);

  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingMessage, setIsCreatingMessage] = useState(false);

  const [active, setActive] = useState<"messages" | "threads">("messages");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // local loaders
  const [isDMsLoading, setIsDMsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const allConvos =
    useSelector((state: RootState) => state.messaging.dms) || [];
  const activeConversation = useSelector(
    (state: RootState) => state.messaging.activeConversation
  );
  const dmsStatus = useSelector(
    (state: RootState) => state.messaging.dmsStatus
  );

  // split lists
  const oneOnOneDMs = allConvos.filter(
    (convo) => convo && convo.participants && convo.participants.length === 1
  );
  const threads = allConvos.filter(
    (convo) => convo && convo.participants && convo.participants.length > 1
  );
  const items: DMConversation[] = active === "messages" ? oneOnOneDMs : threads;

  const transformMessages = (conversation: any) => {
    if (!conversation || !conversation.messages) return [];

    return conversation.messages
      .map((msg: any, index: number) => {
        let senderName = "Unknown User";
        let senderAvatar = "/avatar.png";
        let isSelf = false; // 👈 new flag for sender alignment

        if (msg.sender?.fullName) {
          // Full sender info from API
          senderName = msg.sender.fullName;
          senderAvatar = msg.sender.avatarUrl || "/avatar.png";
          if (msg.sender.id === currentUserId) {
            isSelf = true; // 👈 user sent this message
          }
        } else if (msg.senderId === currentUserId) {
          // If senderId matches current user
          senderName = "You";
          isSelf = true;
        } else {
          // Otherwise, find in participants
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

        return {
          id: parseInt(msg.id) || index,
          sender: senderName,
          text: msg.body || "",
          avatar: senderAvatar,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          createdAt: msg.createdAt,
          messageImages: msg.messageImages || [],
          messageDocs: msg.messageDocs || [],
          isSelf, // 👈 now we have left/right alignment info
        };
      })
      .sort(
        (a: any, b: any) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  };

  // initial DMs load (if idle)
  useEffect(() => {
    const fetchDMs = async () => {
      if (!currentUserId) return;
      // only fetch when idle to avoid unnecessary repeats
      if (dmsStatus === "idle") {
        setIsDMsLoading(true);
        try {
          await dispatch(getDMs(currentUserId));
        } catch (err) {
          console.error("Error fetching DMs:", err);
        } finally {
          setIsDMsLoading(false);
        }
      }
    };
    fetchDMs();
  }, [dispatch, currentUserId, dmsStatus]);

  // Auto-select first item only once (when DMs succeeded and selectedId is null)
  useEffect(() => {
    if (dmsStatus !== "succeeded") return;
    if (isCreatingMessage) return;
    if (selectedId) return; // user already selected something

    // prefer the active tab's list
    if (active === "messages" && oneOnOneDMs.length > 0) {
      setSelectedId(oneOnOneDMs[0].id);
      return;
    }
    if (active === "threads" && threads.length > 0) {
      setSelectedId(threads[0].id);
      return;
    }
    // else nothing to select
  }, [
    dmsStatus,
    oneOnOneDMs.length,
    threads.length,
    active,
    isCreatingMessage,
    selectedId,
  ]);

  // Fetch chat history whenever selectedId changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedId) return;
      setIsChatLoading(true);
      try {
        await dispatch(chatHistory(selectedId));
      } catch (err) {
        console.error("Error fetching chat history:", err);
      } finally {
        setIsChatLoading(false);
      }
    };
    fetchHistory();
  }, [dispatch, selectedId]);

  const location = useLocation();
  useEffect(() => {
    if (location.pathname.endsWith("/messages/new")) {
      setIsCreatingMessage(true);
    }
  }, [location]);

  // When user clicks Messages tab: activate and open first DM immediately (if available)
  const handleClickMessagesTab = () => {
    setActive("messages");
    setIsCreatingMessage(false);

    // If there's a DM and user hasn't manually selected one OR the current selected is not within DMs,
    // pick the first DM
    if (oneOnOneDMs.length > 0) {
      const firstId = oneOnOneDMs[0].id;
      if (!selectedId || selectedId !== firstId) {
        setSelectedId(firstId);
        // chatHistory will be fetched by the selectedId effect
      }
    } else {
      // clear selection if no DMs
      setSelectedId(null);
    }
  };

  // When user clicks Threads tab: activate and open first thread immediately (if available)
  const handleClickThreadsTab = () => {
    setActive("threads");
    setIsCreatingMessage(false);

    if (threads.length > 0) {
      const firstThreadId = threads[0].id;
      if (!selectedId || selectedId !== firstThreadId) {
        setSelectedId(firstThreadId);
      }
    } else {
      setSelectedId(null);
    }
  };

  // Called when a new conversation is created (e.g., user sends message in new chat)
  const handleConversationCreated = async (newConversationId: string) => {
    setIsSendingMessage(true);
    try {
      if (!currentUserId) {
        console.error("No current user id available to refetch DMs");
        return;
      }

      // Refetch DMs and wait for completion
      const resultAction = await dispatch(getDMs(currentUserId));
      if (getDMs.fulfilled.match(resultAction)) {
        // Only set selection after DMs updated
        setSelectedId(newConversationId);

        // Fetch the chat history for the newly created convo
        await dispatch(chatHistory(newConversationId));
      } else {
        console.error(
          "Failed to refetch DMs after creating conversation",
          resultAction
        );
      }
    } catch (err) {
      console.error("Error in handleConversationCreated:", err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleExitCreateMode = () => {
    setIsCreatingMessage(false);
    navigate("/messages");
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <MessagesHeaderComponent
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setIsCreatingForm={setIsCreatingMessage}
      />

      <div className="ml-3 ml-2 gap-4 flex flex-1 min-h-0">
        {/* Chat List Section */}
        <div className="w-96 border border-border bg-card flex flex-col ">
          {/* Chat/Thread Buttons */}
          <div className="border border-border flex w-full">
            <Button
              onClick={handleClickMessagesTab}
              className={cn(
                "w-half mb-2 mt-2 rounded-none bg-white text-black border-b-4 border-transparent",
                active === "messages" && "text-orange-600 border-orange-600"
              )}
              disabled={isDMsLoading || isSendingMessage}
            >
              <User /> Messages
            </Button>
            <Button
              onClick={handleClickThreadsTab}
              className={cn(
                "w-half mb-2 mt-2 rounded-none bg-white text-black border-b-4 border-transparent",
                active === "threads" && "text-orange-600 border-orange-600"
              )}
              disabled={isDMsLoading || isSendingMessage}
            >
              <Users /> Threads
            </Button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto border border-border">
            {isDMsLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader />
              </div>
            ) : items.length === 0 ? (
              <p className="text-center text-muted-foreground mt-4">
                No conversations found
              </p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between p-3 border-b cursor-pointer hover:bg-orange-50 transition-colors",
                    selectedId === item.id && "bg-orange-50"
                  )}
                  onClick={() => {
                    if (!isSendingMessage) {
                      setSelectedId(item.id);
                      setIsCreatingMessage(false);
                      navigate("/messages");
                    }
                  }}
                >
                  {/* Left section: Avatar + Info */}
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Avatar>
                      <AvatarImage
                        src={item.participants[0]?.avatarUrl || "/avatar.png"}
                      />
                      <AvatarFallback>
                        {item.participants[0]?.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="truncate max-w-[180px]">
                      <p className="font-medium truncate">
                        {item.participants
                          .map((p) => p.name || p.id)
                          .join(", ")}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.lastMessage?.body || "New Attachment"}
                      </p>
                    </div>
                  </div>

                  {/* Right section: Unread badge */}
                  {item.unreadCount > 0 && (
                    <span className="ml-auto bg-orange-600 text-white text-xs font-medium px-2 py-1 rounded-full min-w-[22px] text-center">
                      {item.unreadCount}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 w-full border border-border bg-card mr-3">
          {isChatLoading || isSendingMessage ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <Loader />
            </div>
          ) : selectedId ? (
            activeConversation.status === "loading" ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <Loader />
              </div>
            ) : activeConversation.messages.length === 0 ? (
              <ChatWindow
                messages={[]}
                isCreatingMessage={false}
                conversationId={selectedId}
                onConversationCreated={handleConversationCreated}
                onExitCreateMode={handleExitCreateMode}
                currentChatUser={(() => {
                  const selectedConversation = items.find(
                    (item) => item.id === selectedId
                  );
                  if (!selectedConversation) return undefined;

                  if (selectedConversation.participants.length === 1) {
                    const participant = selectedConversation.participants[0];
                    return {
                      name: participant.name,
                      avatarUrl: participant.avatarUrl,
                      isGroup: false,
                    };
                  }

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
            ) : (
              <ChatWindow
                messages={transformMessages({
                  ...activeConversation,
                  messages: activeConversation.messages.filter(
                    (msg: any) => msg.conversationId === selectedId
                  ),
                })}
                isCreatingMessage={isCreatingMessage}
                conversationId={selectedId}
                onConversationCreated={handleConversationCreated}
                onExitCreateMode={handleExitCreateMode}
                currentChatUser={(() => {
                  const selectedConversation = items.find(
                    (item) => item.id === selectedId
                  );
                  if (!selectedConversation) return undefined;

                  if (selectedConversation.participants.length === 1) {
                    const participant = selectedConversation.participants[0];
                    return {
                      name: participant.name,
                      avatarUrl: participant.avatarUrl,
                      isGroup: false,
                    };
                  }

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
          ) : isCreatingMessage ? (
            <ChatWindow
              messages={[]}
              isCreatingMessage={isCreatingMessage}
              conversationId={undefined}
              currentChatUser={undefined}
              onConversationCreated={handleConversationCreated}
              onExitCreateMode={handleExitCreateMode}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a conversation
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
