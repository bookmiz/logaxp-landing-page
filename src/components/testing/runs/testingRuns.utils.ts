"use client";

import type { ApiEnvelope, Paginated } from "@/logaxp/lib/testing/testing.types";

export function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && payload !== null && "data" in (payload as any)) {
    return (payload as ApiEnvelope<T>).data;
  }
  return payload as T;
}

export function normalizePaginated<T>(payload: unknown): { items: T[]; total: number } {
  const data = unwrap<any>(payload);

  if (Array.isArray(data)) return { items: data as T[], total: data.length };

  const maybe = data as Paginated<T>;
  if (maybe && Array.isArray(maybe.items)) return { items: maybe.items, total: maybe.total ?? maybe.items.length };

  // common variations
  if (Array.isArray((data as any)?.data?.items)) {
    const items = (data as any).data.items as T[];
    return { items, total: (data as any).data.total ?? items.length };
  }

  return { items: [], total: 0 };
}

export function clampPage(page: number, totalPages: number) {
  if (Number.isNaN(page) || page < 1) return 1;
  if (page > totalPages) return totalPages;
  return page;
}

export function groupBy<T>(rows: T[], keyFn: (row: T) => string) {
  const out: Record<string, T[]> = {};
  for (const r of rows) {
    const k = keyFn(r);
    out[k] = out[k] ?? [];
    out[k].push(r);
  }
  return out;
}