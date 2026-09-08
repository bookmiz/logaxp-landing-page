// src/components/billings/billing.utils.ts

import type {
  ApiResponse,
  BillingPlan,
  TenantSubscription,
  ListData,
} from "@/logaxp/lib/billing/billing.types";

export function unwrapApi<T>(res: ApiResponse<T> | T): T {
  if (
    res &&
    typeof res === "object" &&
    "data" in (res as Record<string, unknown>) &&
    "statusCode" in (res as Record<string, unknown>)
  ) {
    return (res as ApiResponse<T>).data;
  }
  return res as T;
}

export function unwrapList<T>(data: ListData<T> | unknown): { items: T[] } {
  if (!data) return { items: [] };

  if (Array.isArray(data)) return { items: data as T[] };

  if (
    typeof data === "object" &&
    data !== null &&
    "items" in (data as Record<string, unknown>) &&
    Array.isArray((data as { items?: unknown[] }).items)
  ) {
    return { items: ((data as { items?: unknown[] }).items ?? []) as T[] };
  }

  return { items: [] };
}

export function formatMoney(amountCents?: number | null, currency = "USD") {
  const value = Number(amountCents ?? 0) / 100;

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export function billingIntervalLabel(interval?: string | null) {
  if (!interval) return "—";
  if (interval === "month") return "Monthly";
  if (interval === "year") return "Yearly";
  return interval;
}

export function billingStatusTone(status?: string | null) {
  switch (String(status ?? "").toUpperCase()) {
    case "ACTIVE":
      return "success";
    case "TRIALING":
      return "secondary";
    case "PAST_DUE":
      return "warning";
    case "UNPAID":
    case "CANCELED":
      return "destructive";
    case "INCOMPLETE":
    default:
      return "outline";
  }
}

export function getPlanDisplayName(plan?: BillingPlan | null) {
  return plan?.name || plan?.key || "Unknown plan";
}

export function hasStripe(plan?: BillingPlan | null) {
  return Boolean(plan?.stripePriceId);
}

export function hasPaystack(plan?: BillingPlan | null) {
  return Boolean(plan?.paystackPlanId);
}

export function getSubscriptionPlan(subscription?: TenantSubscription | null) {
  return subscription?.plan ?? null;
}

export function safeDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export function makeIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `idem_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}