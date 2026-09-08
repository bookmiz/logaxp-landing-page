// src/features/security/api-keys/types/api-keys.types.ts

export interface ApiKey {
  id: string;
  tenantId: string;
  name: string;
  scopes: string[];
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  revokedAt?: string | null;
  createdByUserId?: string | null;
  createdAt: string;
}

export interface CreateApiKeyDto {
  name: string;
  scopes?: string[];
  expiresAt?: string; // ISO string
}

export interface UpdateApiKeyDto {
  name?: string;
  scopes?: string[];
  expiresAt?: string | null; // null to clear expiration
}

export interface ListApiKeysDto {
  q?: string;
}

export interface CreateApiKeyResponse {
  apiKey: ApiKey;
  rawKey: string;      // only returned once
  maskedKey: string;   // safe to display later
  warning: string;
}

export interface RotateApiKeyResponse {
  apiKey: ApiKey;
  rawKey: string;      // only returned once after rotation
  maskedKey: string;
  warning: string;
}

export interface RevokeApiKeyResponse {
  ok: true;
  alreadyRevoked?: boolean;
  apiKey: ApiKey;
}

export interface DeleteApiKeyResponse {
  ok: true;
}