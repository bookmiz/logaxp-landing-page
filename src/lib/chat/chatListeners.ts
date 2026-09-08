// src/lib/chat/chatListeners.ts
"use client";

import type { ChatSocket } from "./chatSocket";
import type {
  ChatMessage,
  ChatMessageDeletedEvent,
  ChatMessageReactionEvent,
  ChatPresenceEvent,
  ChatReadEvent,
  ChatTypingEvent,
} from "./chat.types";

/**
 * Centralized listener registration for chat socket events.
 * Returns a cleanup function you can call in useEffect cleanup.
 */
export interface ChatSocketListeners {
  // lifecycle
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onConnectError?: (error: Error) => void;

  // server events
  onPresence?: (payload: ChatPresenceEvent) => void;
  onTyping?: (payload: ChatTypingEvent) => void;

  onMessageNew?: (message: ChatMessage) => void;
  onMessageUpdated?: (message: ChatMessage) => void;
  onMessageDeleted?: (payload: ChatMessageDeletedEvent) => void;
  onMessageReaction?: (payload: ChatMessageReactionEvent) => void;

  onRead?: (payload: ChatReadEvent) => void;
}

export function attachChatListeners(socket: ChatSocket, listeners: ChatSocketListeners) {
  const {
    onConnect,
    onDisconnect,
    onConnectError,
    onPresence,
    onTyping,
    onMessageNew,
    onMessageUpdated,
    onMessageDeleted,
    onMessageReaction,
    onRead,
  } = listeners;

  // lifecycle
  const handleConnect = () => onConnect?.();
  const handleDisconnect = (reason: string) => onDisconnect?.(reason);
  const handleConnectError = (err: Error) => onConnectError?.(err);

  // chat events
  const handlePresence = (payload: ChatPresenceEvent) => onPresence?.(payload);
  const handleTyping = (payload: ChatTypingEvent) => onTyping?.(payload);

  const handleMessageNew = (message: ChatMessage) => onMessageNew?.(message);
  const handleMessageUpdated = (message: ChatMessage) => onMessageUpdated?.(message);
  const handleMessageDeleted = (payload: ChatMessageDeletedEvent) => onMessageDeleted?.(payload);
  const handleMessageReaction = (payload: ChatMessageReactionEvent) => onMessageReaction?.(payload);

  const handleRead = (payload: ChatReadEvent) => onRead?.(payload);

  socket.on("connect", handleConnect);
  socket.on("disconnect", handleDisconnect);
  socket.on("connect_error", handleConnectError);

  socket.on("chat:presence", handlePresence);
  socket.on("chat:typing", handleTyping);

  socket.on("chat:message:new", handleMessageNew);
  socket.on("chat:message:updated", handleMessageUpdated);
  socket.on("chat:message:deleted", handleMessageDeleted);
  socket.on("chat:message:reaction", handleMessageReaction);

  socket.on("chat:read", handleRead);

  return () => {
    socket.off("connect", handleConnect);
    socket.off("disconnect", handleDisconnect);
    socket.off("connect_error", handleConnectError);

    socket.off("chat:presence", handlePresence);
    socket.off("chat:typing", handleTyping);

    socket.off("chat:message:new", handleMessageNew);
    socket.off("chat:message:updated", handleMessageUpdated);
    socket.off("chat:message:deleted", handleMessageDeleted);
    socket.off("chat:message:reaction", handleMessageReaction);

    socket.off("chat:read", handleRead);
  };
}