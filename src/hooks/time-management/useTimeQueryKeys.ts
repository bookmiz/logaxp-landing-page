"use client";

export type QueryLike = Record<string, unknown> | undefined;

function clean(obj?: QueryLike) {
  if (!obj) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

export const timeQueryKeys = {
  root: ["time"] as const,

  timers: () => [...timeQueryKeys.root, "timers"] as const,
  running: (membershipId?: string) => [...timeQueryKeys.timers(), "running", membershipId ?? ""] as const,
  history: (filter?: QueryLike) => [...timeQueryKeys.timers(), "history", clean(filter)] as const,

  entries: () => [...timeQueryKeys.root, "entries"] as const,
  entryList: (filter?: QueryLike) => [...timeQueryKeys.entries(), "list", clean(filter)] as const,
  entryStats: (filter?: QueryLike) => [...timeQueryKeys.entries(), "stats", clean(filter)] as const,
  entryDailySummary: (filter?: QueryLike) => [...timeQueryKeys.entries(), "dailySummary", clean(filter)] as const,

  clocks: () => [...timeQueryKeys.root, "clocks"] as const,
  clockList: (filter?: QueryLike) => [...timeQueryKeys.clocks(), "list", clean(filter)] as const,
  clockSummary: (filter?: QueryLike) => [...timeQueryKeys.clocks(), "summary", clean(filter)] as const,
  openClock: (employeeId?: string) => [...timeQueryKeys.clocks(), "open", employeeId ?? ""] as const,
};