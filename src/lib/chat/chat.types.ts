// src/lib/chat/chat.types.ts

export type ApiResponse<T = unknown> = {
  statusCode: number;
  message: string;
  data: T;
};

export type ChatType = "DIRECT" | "GROUP";
export type ChatScope = "TENANT" | "PROJECT";

export interface ListMessagesResult<TMessage = ChatMessage> {
  items: TMessage[];
  nextCursor: string | null;
}

export interface ChatUserLite {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  [key: string]: unknown;
}

export interface ChatMembershipLite {
  id: string;
  userId?: string | null;
  tenantId?: string;
  user?: ChatUserLite | null;
  [key: string]: unknown;
}

export interface ChatMember {
  id?: string;
  tenantId?: string;
  threadId: string;
  membershipId: string;
  lastReadAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  membership?: ChatMembershipLite | null;
  [key: string]: unknown;
}

export interface ChatThread {
  id: string;
  tenantId: string;
  type: ChatType;
  title?: string | null;
  createdByUserId?: string | null;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  members?: ChatMember[];
  [key: string]: unknown;
}

export interface ChatFileObject {
  id: string;
  originalName?: string | null;
  mimeType?: string | null;
  size?: number | null;
  url?: string | null;
  [key: string]: unknown;
}

export interface ChatMessageAttachment {
  id?: string;
  messageId: string;
  fileId: string;
  file?: ChatFileObject | null;
  [key: string]: unknown;
}

export interface ChatMessage {
  id: string;
  tenantId: string;
  threadId: string;
  authorMembershipId: string;
  body: string;
  metadata?: Record<string, unknown> | null;
  editedAt?: string | null;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;

  authorMembership?: ChatMembershipLite | null;
  attachments?: ChatMessageAttachment[];
  [key: string]: unknown;
}

/** =========================
 * REST DTOs
 * ========================= */
export interface CreateThreadDto {
  type: ChatType; // DIRECT | GROUP

  // GROUP
  scope?: ChatScope;
  projectId?: string | null;
  title?: string | null;

  // DIRECT
  memberA?: string | null;
  memberB?: string | null;
}

export interface AddMemberDto {
  membershipId: string;
}

export interface RemoveMemberDto {
  membershipId: string;
}

export interface SendMessageDto {
  body: string;
  attachmentFileIds?: string[];
  metadata?: Record<string, unknown>;
}

export interface EditMessageDto {
  body: string;
}

export interface ReactMessageDto {
  emoji: string;
}

export interface ListMessagesDto {
  cursor?: string;
  pageSize?: number;
}

export interface ListThreadsDto {
  scope?: ChatScope;
  projectId?: string;
}

/** =========================
 * REST responses (common)
 * Adjust if your backend wraps/not wraps
 * ========================= */
export type ChatThreadListResponse = ApiResponse<ChatThread[]>;
export type ChatThreadResponse = ApiResponse<ChatThread>;
export type ChatMemberResponse = ApiResponse<ChatMember>;
export type ChatMessageResponse = ApiResponse<ChatMessage>;
export type ChatMessagesResponse = ApiResponse<ListMessagesResult>;
export type ChatOkResponse = ApiResponse<{ ok: boolean }>;

/** =========================
 * Socket event payloads
 * ========================= */
export interface ChatPresenceEvent {
  membershipId: string;
  status: "online" | "offline";
  at: string; // ISO
}

export interface ChatTypingEvent {
  threadId: string;
  membershipId: string;
  isTyping: boolean;
  at: string; // ISO
}

export interface ChatMessageDeletedEvent {
  id: string;
  threadId: string;
  deletedAt: string; // ISO
}

export interface ChatMessageReactionEvent {
  messageId: string;
  threadId: string;
  metadata: Record<string, unknown> | null;
}

export interface ChatReadEvent {
  threadId: string;
  membershipId: string;
  at: string; // ISO
}

/** =========================
 * Socket emit payloads
 * ========================= */
export interface TypingDto {
  threadId: string;
  isTyping: boolean;
}

export interface ChatSocketSendPayload {
  threadId: string;
  dto: SendMessageDto;
}

export interface ChatSocketEditPayload {
  messageId: string;
  dto: EditMessageDto;
}

export interface ChatSocketDeletePayload {
  messageId: string;
}

export interface ChatSocketReactPayload {
  messageId: string;
  dto: ReactMessageDto;
}

export interface ChatSocketReadPayload {
  threadId: string;
}

/** =========================
 * Socket ACK responses
 * ========================= */
export interface ChatSocketAck<T = unknown> {
  ok: boolean;
  message?: string | T;
}