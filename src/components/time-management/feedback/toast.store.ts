"use client";

import { create } from "zustand";

export type ToastTone = "success" | "error" | "info" | "warning";

export type ToastItem = {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  createdAt: number;
  ttlMs: number;
};

type ToastState = {
  items: ToastItem[];
  push: (t: Omit<ToastItem, "id" | "createdAt">) => void;
  remove: (id: string) => void;
  clear: () => void;
};

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const useTimeToastStore = create<ToastState>((set, get) => ({
  items: [],
  push: (t) => {
    const item: ToastItem = {
      id: uid(),
      createdAt: Date.now(),
      ...t,
      ttlMs: t.ttlMs ?? 4000,
    };

    set((s) => ({ items: [item, ...s.items].slice(0, 6) }));

    // auto-remove
    window.setTimeout(() => {
      get().remove(item.id);
    }, item.ttlMs);
  },
  remove: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
  clear: () => set({ items: [] }),
}));