// src/lib/api/unwrap.ts
import type { ApiResponse, ListMeta } from "@/logaxp/lib/project-management/projectManagement.types";

export function unwrapApi<T>(res: ApiResponse<T> | T | null | undefined): T | null {
  if (!res) return null;
  if (typeof res === "object" && res && "data" in res && "statusCode" in res) {
    return (res as ApiResponse<T>).data;
  }
  return res as T;
}

export function unwrapList<T>(res: unknown): { items: T[]; meta?: ListMeta } {
  const data = unwrapApi<unknown>(res);

  if (!data) return { items: [] };

  // array
  if (Array.isArray(data)) return { items: data };

  // ListData<{items, meta}>
  if (typeof data !== "object") return { items: [] };
  if ("items" in data && Array.isArray(data.items)) {
    const meta = "meta" in data && typeof data.meta === "object" && data.meta !== null && !Array.isArray(data.meta)
      ? data.meta as ListMeta : undefined;
    return { items: data.items, meta };
  }

  // some endpoints return { columns: [...] }
  if ("columns" in data && Array.isArray(data.columns)) return { items: data.columns };

  return { items: [] };
}
