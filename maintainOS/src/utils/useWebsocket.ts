import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const WEBSOCKET_BASE_URL = import.meta.env.VITE_API_SOCKETS;

let socket: Socket | null = null; // Singleton WebSocket instance
let socketUserId: string | null = null; // Track which user the socket belongs to
let connectionCount = 0; // Track how many components are using the socket

export function useMessagingSocket(userId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [updatedConversation, setUpdatedConversation] = useState<any>(null);

  useEffect(() => {
    if (!userId) {
      console.log("No userId provided, skipping WebSocket connection");
      return;
    }

    // If socket exists but for a different user, disconnect it first
    if (socket && socketUserId !== userId) {
      console.log(
        `Disconnecting existing socket for user ${socketUserId}, connecting for ${userId}`
      );
      socket.disconnect();
      socket = null;
      socketUserId = null;
    }

    // Increment connection count
    connectionCount++;
    console.log(`Connection count: ${connectionCount}`);

    if (!socket) {
      console.log(`Creating new WebSocket connection for user: ${userId}`);
      socket = io(`${WEBSOCKET_BASE_URL}/ws/messaging`, {
        auth: { userId },
        transports: ["websocket"],
      });

      socketUserId = userId;

      socketUserId = userId;

      socket.on("connect", () => {
        console.log("✅ Connected to Messaging WS");
        setIsConnected(true);
      });

      socket.on("disconnect", (reason) => {
        console.log("❌ Disconnected from Messaging WS. Reason:", reason);
        setIsConnected(false);

        // If disconnected due to server action, try to reconnect after a delay
        if (reason === "io server disconnect") {
          console.log(
            "Server disconnected us, attempting to reconnect in 2 seconds..."
          );
          setTimeout(() => {
            if (socket && socketUserId === userId) {
              console.log("Attempting manual reconnect...");
              socket.connect();
            }
          }, 2000);
        }
      });

      socket.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error);
        setIsConnected(false);
      });

      socket.on("message:new", (msg) => {
        console.log("📩 New Message:", msg);
        setLastMessage(msg);
      });

      socket.on("conversation:update", (conversation) => {
        console.log("🔄 Conversation Updated:", conversation);
        setUpdatedConversation(conversation);
      });
    } else {
      console.log("Using existing WebSocket connection");
      // Update connection state for existing socket
      setIsConnected(socket.connected);
    }

    return () => {
      connectionCount--;
      console.log(`Cleanup called, connection count: ${connectionCount}`);

      // Only disconnect if this is the last component using the socket
      if (connectionCount === 0 && socket) {
        console.log("Last component unmounted, disconnecting WebSocket");
        socket.disconnect();
        socket = null;
        socketUserId = null;
      }
    };
  }, [userId]);

  const joinConversation = (conversationId: string) => {
    if (!socket) return;
    socket.emit("conversation:join", { conversationId }, (response: any) => {
      console.log("Joined conversation:", response);
    });
  };

  const sendMessage = (conversationId: string, text: string) => {
    if (!socket) return;
    socket.emit("message:send", { conversationId, text }, (response: any) => {
      console.log("Server ack:", response);
    });
  };

  return {
    isConnected,
    lastMessage,
    sendMessage,
    joinConversation,
    updatedConversation,
  };
}
