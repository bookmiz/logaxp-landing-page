// src/features/security/api-keys/services/api-keys.service.ts

import { api } from "@/logaxp/lib/api/apiClient";
import type {
  ApiKey,
  CreateApiKeyDto,
  CreateApiKeyResponse,
  DeleteApiKeyResponse,
  ListApiKeysDto,
  RevokeApiKeyResponse,
  RotateApiKeyResponse,
  UpdateApiKeyDto,
} from "./api-keys.types";

function cleanParams<T extends Record<string, unknown>>(params?: T): Record<string, unknown> | undefined {
  if (!params) return undefined;

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") out[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

export const apiKeysService = {
  // GET /api-keys
  async list(params?: ListApiKeysDto): Promise<ApiKey[]> {
    const { data } = await api.get("/api-keys", {
      params: cleanParams(params as Record<string, unknown>),
    });
    return data;
  },

  // GET /api-keys/:id
  async getById(id: string): Promise<ApiKey> {
    const { data } = await api.get(`/api-keys/${id}`);
    return data;
  },

  // POST /api-keys
  async create(payload: CreateApiKeyDto): Promise<CreateApiKeyResponse> {
    const { data } = await api.post("/api-keys", payload);
    return data;
  },

  // PATCH /api-keys/:id
  async update(id: string, payload: UpdateApiKeyDto): Promise<ApiKey> {
    const { data } = await api.patch(`/api-keys/${id}`, payload);
    return data;
  },

  // POST /api-keys/:id/revoke
  async revoke(id: string): Promise<RevokeApiKeyResponse> {
    const { data } = await api.post(`/api-keys/${id}/revoke`);
    return data;
  },

  // POST /api-keys/:id/rotate
  async rotate(id: string): Promise<RotateApiKeyResponse> {
    const { data } = await api.post(`/api-keys/${id}/rotate`);
    return data;
  },

  // DELETE /api-keys/:id
  async remove(id: string): Promise<DeleteApiKeyResponse> {
    const { data } = await api.delete(`/api-keys/${id}`);
    return data;
  },
};