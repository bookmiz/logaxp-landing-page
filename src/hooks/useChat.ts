// src/hooks/useChat.ts
"use client";

import { useCallback, useMemo, useState } from "react";
import { chatService } from "@/logaxp/lib/chat/chatService";
import { chatSocketApi, createChatSocket, type ChatSocket } from "@/logaxp/lib/chat/chatSocket";
import { attachChatListeners, type ChatSocketListeners } from "@/logaxp/lib/chat/chatListeners";
import type {
  AddMemberDto,
  CreateThreadDto,
  EditMessageDto,
  ListMessagesDto,
  ListThreadsDto,
  ReactMessageDto,
  SendMessageDto,
  TypingDto,
} from "@/logaxp/lib/chat/chat.types";

type ApiErrorShape = {
  response?: { data?: { message?: unknown } };
  message?: unknown;
};

function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const e = err as ApiErrorShape;
    const apiMsg = e.response?.data?.message;

    if (typeof apiMsg === "string" && apiMsg.trim()) return apiMsg;
    if (Array.isArray(apiMsg) && apiMsg.length) {
      const first = apiMsg.find((x) => typeof x === "string" && x.trim());
      if (typeof first === "string") return first;
    }
    if (typeof e.message === "string" && e.message.trim()) return e.message;
  }
  return "Something went wrong";
}

export function useChat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrap = useCallback(async <T,>(fn: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  /** -----------------------------
   * REST - Threads
   * ----------------------------- */
  const listThreads = useCallback(
    (membershipId: string, q?: ListThreadsDto) => wrap(() => chatService.listThreads(membershipId, q)),
    [wrap]
  );

  const createThread = useCallback(
    (membershipId: string, dto: CreateThreadDto) => wrap(() => chatService.createThread(membershipId, dto)),
    [wrap]
  );

  const addMember = useCallback(
    (threadId: string, actorMembershipId: string, dto: AddMemberDto) =>
      wrap(() => chatService.addMember(threadId, actorMembershipId, dto)),
    [wrap]
  );

  const removeMember = useCallback(
    (threadId: string, actorMembershipId: string, membershipIdToRemove: string) =>
      wrap(() => chatService.removeMember(threadId, actorMembershipId, membershipIdToRemove)),
    [wrap]
  );

  /** -----------------------------
   * REST - Messages
   * ----------------------------- */
  const sendMessage = useCallback(
    (threadId: string, membershipId: string, dto: SendMessageDto) =>
      wrap(() => chatService.sendMessage(threadId, membershipId, dto)),
    [wrap]
  );

  const listMessages = useCallback(
    (threadId: string, membershipId: string, q?: ListMessagesDto) =>
      wrap(() => chatService.listMessages(threadId, membershipId, q)),
    [wrap]
  );

  const markRead = useCallback(
    (threadId: string, membershipId: string) => wrap(() => chatService.markRead(threadId, membershipId)),
    [wrap]
  );

  const editMessage = useCallback(
    (messageId: string, membershipId: string, dto: EditMessageDto) =>
      wrap(() => chatService.editMessage(messageId, membershipId, dto)),
    [wrap]
  );

  const deleteMessage = useCallback(
    (messageId: string, membershipId: string) => wrap(() => chatService.deleteMessage(messageId, membershipId)),
    [wrap]
  );

  const reactToMessage = useCallback(
    (messageId: string, membershipId: string, dto: ReactMessageDto) =>
      wrap(() => chatService.reactToMessage(messageId, membershipId, dto)),
    [wrap]
  );

  /** -----------------------------
   * Socket helpers
   * ----------------------------- */
  const connectSocket = useCallback((baseUrl: string, accessToken: string): ChatSocket => {
    return createChatSocket({ baseUrl, accessToken, autoConnect: true });
  }, []);

  const disconnectSocket = useCallback((socket?: ChatSocket | null) => {
    if (!socket) return;
    socket.removeAllListeners();
    socket.disconnect();
  }, []);

  const bindSocketListeners = useCallback((socket: ChatSocket, listeners: ChatSocketListeners) => {
    return attachChatListeners(socket, listeners);
  }, []);

  /** Socket emits (ack-based where applicable) */
  const socketTyping = useCallback((socket: ChatSocket, dto: TypingDto) => {
    chatSocketApi.typing(socket, dto);
  }, []);

  const socketSendMessage = useCallback(
    (socket: ChatSocket, threadId: string, dto: SendMessageDto) =>
      chatSocketApi.send(socket, { threadId, dto }),
    []
  );

  const socketEditMessage = useCallback(
    (socket: ChatSocket, messageId: string, dto: EditMessageDto) =>
      chatSocketApi.edit(socket, { messageId, dto }),
    []
  );

  const socketDeleteMessage = useCallback(
    (socket: ChatSocket, messageId: string) => chatSocketApi.delete(socket, { messageId }),
    []
  );

  const socketReactToMessage = useCallback(
    (socket: ChatSocket, messageId: string, dto: ReactMessageDto) =>
      chatSocketApi.react(socket, { messageId, dto }),
    []
  );

  const socketMarkRead = useCallback(
    (socket: ChatSocket, threadId: string) => chatSocketApi.read(socket, { threadId }),
    []
  );

  const socket = useMemo(
    () => ({
      connect: connectSocket,
      disconnect: disconnectSocket,
      bindListeners: bindSocketListeners,
      typing: socketTyping,
      sendMessage: socketSendMessage,
      editMessage: socketEditMessage,
      deleteMessage: socketDeleteMessage,
      reactToMessage: socketReactToMessage,
      markRead: socketMarkRead,
    }),
    [
      connectSocket,
      disconnectSocket,
      bindSocketListeners,
      socketTyping,
      socketSendMessage,
      socketEditMessage,
      socketDeleteMessage,
      socketReactToMessage,
      socketMarkRead,
    ]
  );

  return {
    loading,
    error,
    clearError,
    wrap,

    // REST
    listThreads,
    createThread,
    addMember,
    removeMember,

    listMessages,
    sendMessage,
    markRead,
    editMessage,
    deleteMessage,
    reactToMessage,

    // Socket
    socket,
  };
}