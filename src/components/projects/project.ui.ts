import type { ApiResponse, ListData, ListMeta } from "@/logaxp/lib/project-management/projectManagement.types";

/**
 * Normalizes list payloads across:
 * - ApiResponse<ListData<T>>
 * - ListData<T> (array or { items, meta })
 * - undefined/null
 */
export function normalizeList<T>(
  payload?: ApiResponse<ListData<T>> | ListData<T> | null
): { items: T[]; meta?: ListMeta } {
  if (!payload) return { items: [] };

  // ApiResponse envelope
  const maybeEnvelope = payload as ApiResponse<ListData<T>>;
  if (maybeEnvelope && typeof maybeEnvelope === "object" && "data" in maybeEnvelope) {
    return normalizeList<T>(maybeEnvelope.data as ListData<T>);
  }

  // ListData can be T[]
  if (Array.isArray(payload)) return { items: payload };

  // Or { items, meta }
  const obj = payload as { items?: T[]; meta?: ListMeta };
  return { items: Array.isArray(obj.items) ? obj.items : [], meta: obj.meta };
}

export function cleanParams(obj?: Record<string, unknown> | object): Record<string, unknown> | undefined {
  if (!obj) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

export function enc(v: string) {
  return encodeURIComponent(v);
}