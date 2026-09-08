// src/logaxp/components/time-management/payroll/payroll.ui.ts
"use client";

import type { PayPeriod, PayPeriodStatus, Timesheet } from "@/logaxp/lib/time-management/timePayroll.types";
import { formatIsoDateTime } from "@/logaxp/components/time-management/time.ui";

/** Works with your backend envelope style */
export type ApiResponse<T = unknown> = {
  statusCode: number;
  message: string;
  data: T;
};

export function payPeriodLabel(pp: PayPeriod | null | undefined) {
  if (!pp) return "—";
  return (pp as any).label || `${String(pp.startAt ?? "—")} → ${String(pp.endAt ?? "—")}`;
}

export function payPeriodRange(pp: PayPeriod | null | undefined) {
  if (!pp) return "—";
  const start = formatIsoDateTime((pp as any).startAt ?? null);
  const end = formatIsoDateTime((pp as any).endAt ?? null);
  return `${start} → ${end}`;
}

export function statusTone(
  status: PayPeriodStatus | string | null | undefined
): "muted" | "emerald" | "amber" | "red" {
  const s = String(status ?? "").toUpperCase();
  if (s === "OPEN") return "emerald";
  if (s === "LOCKED") return "amber";
  if (s === "PAID") return "muted";
  if (s === "CANCELED") return "red";
  return "muted";
}

export function isLockedLike(status: PayPeriodStatus | string | null | undefined) {
  const s = String(status ?? "").toUpperCase();
  return s === "LOCKED" || s === "PAID";
}

/**
 * Normalize list responses:
 * Accepts either:
 *  - ApiResponse<{ items, page, pageSize, total }>
 *  - { items, page, pageSize, total }
 *  - ApiResponse<PayPeriod[]>
 *  - PayPeriod[]
 */
export function normalizePayPeriodsList(input: any): {
  items: PayPeriod[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
} {
  const data = input?.data ?? input ?? null;

  // common shapes
  const items: PayPeriod[] = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data)
      ? data
      : [];

  const page = Number(data?.page ?? 1);
  const pageSize = Number((data?.pageSize ?? items.length) || 20);
  const total = Number(data?.total ?? items.length);
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));

  return { items, meta: { page, pageSize, total, totalPages } };
}

/**
 * Normalize timesheets list responses:
 * Accepts same envelope patterns as above.
 */
export function normalizeTimesheetsList(input: any): {
  items: Timesheet[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
} {
  const data = input?.data ?? input ?? null;

  const items: Timesheet[] = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data)
      ? data
      : [];

  const page = Number(data?.page ?? 1);
  const pageSize = Number((data?.pageSize ?? items.length) || 20);
  const total = Number(data?.total ?? items.length);
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));

  return { items, meta: { page, pageSize, total, totalPages } };
}