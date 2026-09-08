// src/lib/chat/chatService.ts
"use client";

import { api } from "@/logaxp/lib/api/apiClient";
import type {
  AddMemberDto,
  CreateThreadDto,
  EditMessageDto,
  ListMessagesDto,
  ListThreadsDto,
  ReactMessageDto,
  SendMessageDto,
  ChatMemberResponse,
  ChatMessageResponse,
  ChatMessagesResponse,
  ChatOkResponse,
  ChatThreadListResponse,
  ChatThreadResponse,
} from "./chat.types";

function cleanParams<T extends Record<string, unknown>>(obj?: T): Record<string, unknown> | undefined {
  if (!obj) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

function enc(v: string) {
  return encodeURIComponent(v);
}

export const chatService = {
  /** Threads */
  async listThreads(membershipId: string, query?: ListThreadsDto): Promise<ChatThreadListResponse> {
    const res = await api.get<ChatThreadListResponse>(`/chat/threads/${enc(membershipId)}`, {
      params: cleanParams(query as Record<string, unknown>),
    });
    return res.data;
  },

  async createThread(membershipId: string, dto: CreateThreadDto): Promise<ChatThreadResponse> {
    const res = await api.post<ChatThreadResponse>(`/chat/threads/${enc(membershipId)}`, dto);
    return res.data;
  },

  async addMember(
    threadId: string,
    actorMembershipId: string,
    dto: AddMemberDto
  ): Promise<ChatMemberResponse> {
    const res = await api.post<ChatMemberResponse>(
      `/chat/threads/${enc(threadId)}/members/${enc(actorMembershipId)}`,
      dto
    );
    return res.data;
  },

  async removeMember(
    threadId: string,
    actorMembershipId: string,
    membershipIdToRemove: string
  ): Promise<ChatOkResponse> {
    const res = await api.delete<ChatOkResponse>(
      `/chat/threads/${enc(threadId)}/members/${enc(actorMembershipId)}/${enc(membershipIdToRemove)}`
    );
    return res.data;
  },

  /** Messages */
  async sendMessage(
    threadId: string,
    membershipId: string,
    dto: SendMessageDto
  ): Promise<ChatMessageResponse> {
    const res = await api.post<ChatMessageResponse>(
      `/chat/threads/${enc(threadId)}/messages/${enc(membershipId)}`,
      dto
    );
    return res.data;
  },

  async listMessages(
    threadId: string,
    membershipId: string,
    query?: ListMessagesDto
  ): Promise<ChatMessagesResponse> {
    const res = await api.get<ChatMessagesResponse>(
      `/chat/threads/${enc(threadId)}/messages/${enc(membershipId)}`,
      { params: cleanParams(query as Record<string, unknown>) }
    );
    return res.data;
  },

  async markRead(threadId: string, membershipId: string): Promise<ChatOkResponse> {
    const res = await api.post<ChatOkResponse>(
      `/chat/threads/${enc(threadId)}/read/${enc(membershipId)}`
    );
    return res.data;
  },

  async editMessage(
    messageId: string,
    membershipId: string,
    dto: EditMessageDto
  ): Promise<ChatMessageResponse> {
    const res = await api.patch<ChatMessageResponse>(
      `/chat/messages/${enc(messageId)}/${enc(membershipId)}`,
      dto
    );
    return res.data;
  },

  async deleteMessage(messageId: string, membershipId: string): Promise<ChatOkResponse> {
    const res = await api.delete<ChatOkResponse>(`/chat/messages/${enc(messageId)}/${enc(membershipId)}`);
    return res.data;
  },

  async reactToMessage(
    messageId: string,
    membershipId: string,
    dto: ReactMessageDto
  ): Promise<ChatMessageResponse | ChatOkResponse> {
    const res = await api.post<ChatMessageResponse | ChatOkResponse>(
      `/chat/messages/${enc(messageId)}/reactions/${enc(membershipId)}`,
      dto
    );
    return res.data;
  },
};