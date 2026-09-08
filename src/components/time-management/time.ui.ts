"use client";

import type { ApiResponse, ListData, ListMeta } from "@/logaxp/lib/time-management/timeManagement.types";

type MaybeWrapped<T> = ApiResponse<T> | T | null | undefined;

export function unwrapApi<T>(res?: MaybeWrapped<T>): T | undefined {
  if (res == null) return undefined;

  if (typeof res === "object" && res !== null && "data" in (res as any)) {
    return (res as any).data ?? undefined;
  }

  return res as T;
}

export function normalizeTimeList<T>(
  res?: MaybeWrapped<
    | ListData<T>
    | T[]
    | {
        items?: T[];
        meta?: ListMeta;
        page?: number;
        pageSize?: number;
        total?: number;
      }
  >
): { items: T[]; meta?: ListMeta } {
  const raw = unwrapApi(res as any);

  if (!raw) return { items: [] };

  if (Array.isArray(raw)) {
    return { items: raw };
  }

  if (typeof raw === "object" && Array.isArray((raw as any).items)) {
    const items = (raw as any).items as T[];

    const meta =
      (raw as any).meta ??
      (((raw as any).page ?? (raw as any).pageSize ?? (raw as any).total) !== undefined
        ? {
            page: Number((raw as any).page ?? 1),
            pageSize: Number((raw as any).pageSize ?? items.length ?? 0),
            total: Number((raw as any).total ?? items.length ?? 0),
          }
        : undefined);

    return { items, meta };
  }

  return { items: [] };
}

export function formatMinutes(min?: number | null): string {
  const m = Number(min ?? 0);
  if (!Number.isFinite(m) || m <= 0) return "0h";
  const hours = m / 60;
  if (hours < 1) return `${Math.round(m)}m`;
  if (hours < 10) return `${hours.toFixed(1)}h`;
  return `${Math.round(hours)}h`;
}

export function formatDuration(start?: string | null, end?: string | null): string {
  if (!start) return "—";
  const s = new Date(start);
  if (Number.isNaN(s.getTime())) return "—";
  if (!end) return "—";
  const e = new Date(end);
  if (Number.isNaN(e.getTime())) return "—";
  const diff = (e.getTime() - s.getTime()) / 1000 / 60; // minutes
  return formatMinutes(diff);
}

export function formatIsoDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export function shortId(id?: string | null, keep = 6): string {
  if (!id) return "—";
  const s = String(id);
  if (s.length <= keep * 2) return s;
  return `${s.slice(0, keep)}…${s.slice(-keep)}`;
}

export function toIsoStart(v?: string | null): string | undefined {
  const s = String(v ?? "").trim();
  if (!s) return undefined;
  if (s.includes("T")) return s;
  return new Date(`${s}T00:00:00.000`).toISOString();
}

export function toIsoEnd(v?: string | null): string | undefined {
  const s = String(v ?? "").trim();
  if (!s) return undefined;
  if (s.includes("T")) return s;
  return new Date(`${s}T23:59:59.999`).toISOString();
}