// src/lib/chat/chatSocket.ts
"use client";

import { io, Socket } from "socket.io-client";
import type {
  ChatSocketAck,
  ChatSocketDeletePayload,
  ChatSocketEditPayload,
  ChatSocketReactPayload,
  ChatSocketReadPayload,
  ChatSocketSendPayload,
  TypingDto,
} from "./chat.types";

export type ChatSocket = Socket;

export interface CreateChatSocketOptions {
  baseUrl: string;        // e.g. NEXT_PUBLIC_API_BASE_URL
  accessToken: string;    // JWT access token
  autoConnect?: boolean;
}

/**
 * IMPORTANT:
 * Your backend currently reads Authorization from handshake.headers.authorization.
 * Browsers usually cannot send custom WS headers reliably.
 *
 * This client sends token in `auth.token`.
 * Backend should support `client.handshake.auth?.token`.
 */
export function createChatSocket(options: CreateChatSocketOptions): ChatSocket {
  const { baseUrl, accessToken, autoConnect = true } = options;

  const socket = io(`${baseUrl}/chat`, {
    transports: ["websocket", "polling"],
    withCredentials: true,
    autoConnect,
    auth: {
      token: `Bearer ${accessToken}`,
    },
  });

  return socket;
}

/** Promise-based emit with ack helper */
function emitWithAck<TAck = ChatSocketAck>(
  socket: ChatSocket,
  event: string,
  payload?: unknown,
  timeoutMs = 15000
): Promise<TAck> {
  return new Promise((resolve, reject) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error(`Socket ACK timeout for event: ${event}`));
    }, timeoutMs);

    try {
      socket.emit(event, payload, (ack: TAck) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(ack);
      });
    } catch (e) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(e);
    }
  });
}

/** Typed socket actions */
export const chatSocketApi = {
  typing(socket: ChatSocket, dto: TypingDto) {
    socket.emit("chat:typing", dto);
  },

  send(socket: ChatSocket, payload: ChatSocketSendPayload) {
    return emitWithAck<ChatSocketAck>(socket, "chat:message:send", payload);
  },

  edit(socket: ChatSocket, payload: ChatSocketEditPayload) {
    return emitWithAck<ChatSocketAck>(socket, "chat:message:edit", payload);
  },

  delete(socket: ChatSocket, payload: ChatSocketDeletePayload) {
    return emitWithAck<ChatSocketAck>(socket, "chat:message:delete", payload);
  },

  react(socket: ChatSocket, payload: ChatSocketReactPayload) {
    return emitWithAck<ChatSocketAck>(socket, "chat:message:react", payload);
  },

  read(socket: ChatSocket, payload: ChatSocketReadPayload) {
    return emitWithAck<ChatSocketAck>(socket, "chat:read", payload);
  },
};