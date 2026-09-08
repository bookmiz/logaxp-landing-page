// src/components/onboarding/onboarding.utils.ts
import type { ApiResponse, ListData, ListMeta } from "@/logaxp/lib/onboarding/onboarding.types";

function isObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

/**
 * Supports BOTH:
 *  - ApiResponse<T> envelope -> returns res.data
 *  - raw T (array/object)    -> returns as-is
 */
export function unwrapApi<T>(res: ApiResponse<T> | T): T {
  if (isObject(res) && "data" in res) {
    return (res as ApiResponse<T>).data;
  }
  return res as T;
}

/**
 * Supports:
 *  - T[]                        -> { items: T[] }
 *  - { items: T[], meta? }       -> { items, meta }
 *  - { data: T[] }               -> { items: data }
 */
export function unwrapList<T>(
  data:
    | ListData<T>
    | T[]
    | { items?: T[]; meta?: ListMeta }
    | { data?: T[] }
    | undefined
    | null
): { items: T[]; meta?: ListMeta } {
  if (!data) return { items: [] };

  if (Array.isArray(data)) return { items: data };

  if ("items" in data) {
    const itemsValue = (data as Record<string, unknown>).items;
    const items = Array.isArray(itemsValue) ? (itemsValue as T[]) : [];
    const meta = (data as Record<string, unknown>).meta as ListMeta | undefined;
    return { items, meta };
  }

  if (typeof (data as Record<string, unknown>).data !== "undefined") {
    const dataValue = (data as Record<string, unknown>).data;
    const items = Array.isArray(dataValue) ? (dataValue as T[]) : [];
    return { items };
  }

  return { items: [] };
}

export function safeIso(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export function clampPage(page: number, totalPages: number) {
  return Math.max(1, Math.min(page, Math.max(1, totalPages)));
}

// Very defensive pickers since your types are flexible
export function pickStepTitle(step: Record<string, unknown>) {
  return (step?.title ?? step?.name ?? step?.key ?? step?.code ?? "Untitled step") as string;
}

export function pickInstanceStatus(instance: Record<string, unknown>) {
  return (instance?.status ?? "UNKNOWN") as string;
}

export function pickStepInstanceStatus(si: Record<string, unknown>) {
  return (si?.status ?? "UNKNOWN") as string;
}

export function pickStepInstanceTitle(si: Record<string, unknown>) {
  return (
    (si?.step as Record<string, unknown> | undefined)?.title ??
    (si?.onboardingStep as Record<string, unknown> | undefined)?.title ??
    (si?.onboardingStep as Record<string, unknown> | undefined)?.name ??
    (si?.step as Record<string, unknown> | undefined)?.name ??
    (si)?.title ??
    (si)?.name ??
    "Step"
  ) as string;
}