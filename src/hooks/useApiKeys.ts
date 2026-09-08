// src/features/security/api-keys/hooks/useApiKeys.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiKeysService } from "@/logaxp/lib/apiKeys/api-keys.service";
import type { CreateApiKeyDto, ListApiKeysDto, UpdateApiKeyDto } from "@/logaxp/lib/apiKeys/api-keys.types";

export const apiKeysKeys = {
  all: ["api-keys"] as const,
  list: (params?: ListApiKeysDto) => [...apiKeysKeys.all, "list", params ?? {}] as const,
  detail: (id?: string) => [...apiKeysKeys.all, "detail", id] as const,
};

/** =========================
 * Queries
 * ========================= */

export function useApiKeys(params?: ListApiKeysDto) {
  return useQuery({
    queryKey: apiKeysKeys.list(params),
    queryFn: () => apiKeysService.list(params),
  });
}

export function useApiKey(id?: string) {
  return useQuery({
    queryKey: apiKeysKeys.detail(id),
    queryFn: () => apiKeysService.getById(id as string),
    enabled: !!id,
  });
}

/** =========================
 * Mutations
 * ========================= */

export function useCreateApiKey() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateApiKeyDto) => apiKeysService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: apiKeysKeys.all });
    },
  });
}

export function useUpdateApiKey() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateApiKeyDto }) =>
      apiKeysService.update(id, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: apiKeysKeys.all });
      qc.invalidateQueries({ queryKey: apiKeysKeys.detail(vars.id) });
    },
  });
}

export function useRevokeApiKey() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiKeysService.revoke(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: apiKeysKeys.all });
      qc.invalidateQueries({ queryKey: apiKeysKeys.detail(id) });
    },
  });
}

export function useRotateApiKey() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiKeysService.rotate(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: apiKeysKeys.all });
      qc.invalidateQueries({ queryKey: apiKeysKeys.detail(id) });
    },
  });
}

export function useDeleteApiKey() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiKeysService.remove(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: apiKeysKeys.all });
      qc.removeQueries({ queryKey: apiKeysKeys.detail(id) });
    },
  });
}