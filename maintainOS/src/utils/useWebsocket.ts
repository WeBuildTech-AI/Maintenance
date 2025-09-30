import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useMessagingSocket(userId: string) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null); // 👈 only last message

  useEffect(() => {
    const socket = io("http://localhost:8000/ws/messaging", {
      auth: { userId },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected to Messaging WS");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from Messaging WS");
      setIsConnected(false);
    });

    // Store only last message
    socket.on("message:new", (msg) => {
      console.log("📩 New Message:", msg);
      setLastMessage(msg);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const sendMessage = (conversationId: string, text: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit(
      "message:send",
      { conversationId, text },
      (response: any) => {
        console.log("Server ack:", response);
      }
    );
  };

  return { isConnected, lastMessage, sendMessage };
}
