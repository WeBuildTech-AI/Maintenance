import type { Middleware } from "@reduxjs/toolkit";
import { io, Socket } from "socket.io-client";

import {
  setSocketStatus,
  addMessage,
  updateConversationPreview,
} from "./messages.reducers";
import type { RootState } from "../index";

const WEBSOCKET_BASE_URL = import.meta.env.VITE_API_SOCKETS;

const socketMiddleware: Middleware = (store) => {
  let socket: Socket | null = null;

  return (next) => (action) => {
    if (
      typeof action !== "object" ||
      action === null ||
      !("type" in action) ||
      typeof (action as any).type !== "string"
    ) {
      return next(action);
    }
    if (action.type === "socket/connect") {
      if (socket) {
        return;
      }

      const { auth } = store.getState() as RootState;
      const userId = auth.user?.id; 

      if (!userId) {
        console.error("Socket: No user ID found, connection aborted.");
        return;
      }

      socket = io(`${WEBSOCKET_BASE_URL}/ws/messaging`, {
        auth: { userId },
        transports: ["websocket"],
      });


      socket.on("connect", () => {
        console.log("✅ WebSocket Connected");
        store.dispatch(setSocketStatus(true));
      });

      socket.on("disconnect", () => {
        console.log("❌ WebSocket Disconnected");
        store.dispatch(setSocketStatus(false));
      });

      socket.on("message:new", (newMessage) => {
        console.log("📩 WebSocket received message:new", newMessage);
        // Dispatch the action to add the message to the store
        store.dispatch(addMessage(newMessage));
      });

      socket.on("conversation:update", (updateInfo) => {
        // Dispatch the action to update the conversation list
        store.dispatch(updateConversationPreview(updateInfo));
      });

    }


    if (socket) {
      if (action.type === "socket/sendMessage") {
        socket.emit("message:send", (action as any).payload);
      }

      if (action.type === "socket/joinConversation") {
        const conversationId = (action as any).payload.conversationId;
        const roomName = `conv:${conversationId}`;
        socket.emit("conversation:join", { conversationId, roomName });
      }

      if (action.type === "socket/leaveConversation") {
        socket.emit("conversation:leave", (action as any).payload);
      }

      if (action.type === "socket/markAsRead") {
        socket.emit("message:read", (action as any).payload);
      }

      if (action.type === "socket/disconnect") {
        socket.disconnect();
        socket = null;
      }
    }

    // Pass the action to the next middleware or the reducer
    return next(action);
  };
};

export default socketMiddleware;
