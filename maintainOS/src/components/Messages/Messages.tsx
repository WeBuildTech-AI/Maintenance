import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { User, Users } from "lucide-react";
import { cn } from "../ui/utils";
import { ChatWindow } from "./ChatWindow";
import { MessagesHeaderComponent } from "./MessagesHeader";
import type { ViewMode } from "../purchase-orders/po.types";
import { dummyConversation, dummyMessages, dummyThreads } from "./messages.types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";


export function Messages() {
  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isCreatingMessage, setIsCreatingMessage] = useState(false);

  const [active, setActive] = useState<"messages" | "threads">("messages");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items = active === "messages" ? dummyMessages : dummyThreads;

  // 👇 Always select the first item when "active" changes
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
                "w-1/2 mb-2 mt-2 rounded-none bg-white text-black border-b-4 border-transparent",
                active === "messages" && "text-orange-600 border-orange-600"
              )}
            >
              <User /> Messages
            </Button>
            <Button
              onClick={() => setActive("threads")}
              className={cn(
                "w-1/2 mb-2 mt-2 rounded-none bg-white text-black border-b-4 border-transparent",
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
                onClick={() => setSelectedId(item.id)}
                >
                <Avatar className="size-15">
                  <AvatarImage src="/avatar.png"/>
                  <AvatarFallback>AB</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {item.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 border border-border bg-card min-h-0">
          {selectedId ? (
            <ChatWindow messages={dummyConversation[selectedId] || []} />
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
