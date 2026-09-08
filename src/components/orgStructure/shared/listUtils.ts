// src/components/orgStructure/shared/listUtils.ts
import type { ListData } from "@/logaxp/lib/orgStructure/orgStructure.types";

export function unwrapList<T>(data: ListData<T> | undefined | null): { items: T[]; meta?: any } {
  if (!data) return { items: [] };

  if (Array.isArray(data)) return { items: data };

  const items = Array.isArray((data as any).items) ? ((data as any).items as T[]) : [];
  const meta = (data as any).meta;
  return { items, meta };
}