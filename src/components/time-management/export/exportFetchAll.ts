"use client";

import type { ApiResponse, ListData, ListMeta } from "@/logaxp/lib/time-management/timeManagement.types";
import { normalizeTimeList, unwrapApi } from "@/logaxp/components/time-management/time.ui";

export type FetchPageFn<T> = (args: { page: number; pageSize: number }) => Promise<ApiResponse<ListData<T>>>;

export async function fetchAllPages<T>(opts: {
  fetchPage: FetchPageFn<T>;
  pageSize?: number;     // default 200
  maxRows?: number;      // default 5000
  hardMaxPages?: number; // default 50
}): Promise<{ items: T[]; meta?: ListMeta; truncated: boolean }> {
  const pageSize = opts.pageSize ?? 200;
  const maxRows = opts.maxRows ?? 5000;
  const hardMaxPages = opts.hardMaxPages ?? 50;

  const out: T[] = [];
  let page = 1;
  let meta: ListMeta | undefined;
  let truncated = false;

  while (page <= hardMaxPages) {
    const res = await opts.fetchPage({ page, pageSize });
    const raw = unwrapApi(res as any);
    const norm = normalizeTimeList<T>(raw as any);

    meta = norm.meta ?? meta;

    out.push(...norm.items);

    if (out.length >= maxRows) {
      truncated = true;
      return { items: out.slice(0, maxRows), meta, truncated };
    }

    // stopping heuristics
    const total = typeof meta?.total === "number" ? meta.total : undefined;
    const totalPages = typeof meta?.totalPages === "number" ? meta.totalPages : undefined;

    if (totalPages && page >= totalPages) break;
    if (total && out.length >= total) break;
    if (norm.items.length < pageSize) break;

    page += 1;
  }

  return { items: out, meta, truncated };
}