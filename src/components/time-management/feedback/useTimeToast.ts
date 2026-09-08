"use client";

import { useTimeToastStore, type ToastTone } from "./toast.store";

export function useTimeToast() {
  const push = useTimeToastStore((s) => s.push);

  return {
    toast: (opts: {
      tone?: ToastTone;
      title: string;
      description?: string;
      ttlMs?: number;
    }) =>
      push({
        tone: opts.tone ?? "info",
        title: opts.title,
        description: opts.description,
        ttlMs: opts.ttlMs ?? 4000,
      }),
  };
}