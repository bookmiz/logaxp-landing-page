// src/logaxp/lib/time-management/leave.types.ts
"use client";


export type MaybeApi<T> = ApiResponse<T> | T;


/** ----------------------------------------
 * Enums (FE mirrors)
 * --------------------------------------- */
export const LEAVE_STATUS_VALUES = ["REQUESTED", "APPROVED", "REJECTED", "CANCELED"] as const;

export const LEAVE_TYPE_VALUES = ["VACATION", "SICK", "PERSONAL", "UNPAID", "BEREAVEMENT", "OTHER"] as const;


/** ----------------------------------------
 * Light refs
 * --------------------------------------- */
export type BasicEmployeeRef = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  employeeNumber?: string | null;
  status?: string | null;
  [key: string]: unknown;
};

export type BasicUserRef = {
  id: string;
  email?: string | null;
  [key: string]: unknown;
};

/** ----------------------------------------
 * Result shapes (what your service returns)
 * --------------------------------------- */
export type LeaveListResult = {
  items: LeaveRequest[];
  total: number;
  page: number;
  pageSize: number;
  nextCursor: string | null;
};

export type LeaveOverlapResult = {
  overlaps: boolean;
  conflictingId: string | null;
};

export type AuditLogRow = {
  id: string;
  tenantId: string;
  entityType: string;
  entityId: string;
  action: string;
  actorUserId?: string | null;
  before?: unknown;
  after?: unknown;
  metadata?: unknown;
  createdAt: string;
  [key: string]: unknown;
};

/** ----------------------------------------
 * Normalizers (tolerant of ApiResponse or raw)
 * --------------------------------------- */
export function normalizeLeaveList(
  res: MaybeApi<LeaveListResult | LeaveRequest[]> | null | undefined
): {
  items: LeaveRequest[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
  nextCursor: string | null;
} {
  const maybeWrapped = res as any;
  const data: any =
    maybeWrapped && typeof maybeWrapped === "object" && "data" in maybeWrapped
      ? maybeWrapped.data
      : maybeWrapped;

  // if backend returns array
  if (Array.isArray(data)) {
    const items = data as LeaveRequest[];
    return {
      items,
      meta: {
        page: 1,
        pageSize: items.length || 30,
        total: items.length || 0,
        totalPages: 1,
      },
      nextCursor: null,
    };
  }

  const items: LeaveRequest[] = Array.isArray(data?.items) ? data.items : [];
  const page = Number(data?.page ?? 1);
  const pageSize = Number(data?.pageSize ?? 30);
  const total = Number(data?.total ?? items.length ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const nextCursor = (data?.nextCursor ?? null) as string | null;

  return {
    items,
    meta: { page, pageSize, total, totalPages },
    nextCursor,
  };
}
// ----------------------------
// Batch 3: shared envelope + helpers (safe)
// ----------------------------
export type ApiResponse<T = unknown> = {
  statusCode: number;
  message: string;
  data: T;
};

export interface ListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;        // optional — can be computed if missing
  nextCursor?: string | null; // cursor-based pagination
  prevCursor?: string | null; // if bidirectional
  // add any custom fields your API returns (e.g. hasMore, filtersApplied, etc.)
  [key: string]: unknown;
}

// Preferred shape for paginated responses (what your API returns)
export interface PaginatedList<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;        // optional
  nextCursor?: string | null;
  // any other API-specific fields
  [key: string]: unknown;
}

export type ListData<T> =
  | T[]
  | {
      items: T[];
      total?: number;
      page?: number;
      pageSize?: number;
      totalPages?: number;
      nextCursor?: string | null;
      meta?: ListMeta;
      [key: string]: unknown;
    };

export function unwrapApi<T>(res: MaybeApi<T> | null | undefined): T | null {
  if (res == null) return null;
  const raw: any = res;
  if (raw && typeof raw === "object" && "data" in raw) return raw.data as T;
  return raw as T;
}

export function normalizeList<T>(
  res: MaybeApi<ListData<T>> | null | undefined
): {
  items: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number; nextCursor?: string | null };
} {
  const maybeWrapped = res as any;
  const data: any =
    maybeWrapped && typeof maybeWrapped === "object" && "data" in maybeWrapped
      ? maybeWrapped.data
      : maybeWrapped;

  if (!data) {
    return { items: [], meta: { page: 1, pageSize: 30, total: 0, totalPages: 1 } };
  }

  if (Array.isArray(data)) {
    return {
      items: data as T[],
      meta: {
        page: 1,
        pageSize: (data as T[]).length || 30,
        total: (data as T[]).length,
        totalPages: 1,
      },
    };
  }

  const items: T[] = Array.isArray(data.items) ? data.items : [];
  const page = Number(data.page ?? data.meta?.page ?? 1) || 1;
  const pageSize = Number(data.pageSize ?? data.meta?.pageSize ?? 30) || 30;
  const total = Number(data.total ?? data.meta?.total ?? items.length) || 0;
  const totalPages =
    Number(data.totalPages ?? data.meta?.totalPages ?? (total ? Math.ceil(total / pageSize) : 1)) || 1;

  return {
    items,
    meta: {
      page,
      pageSize,
      total,
      totalPages,
      nextCursor: data.nextCursor ?? data.meta?.nextCursor ?? null,
    },
  };
}
// ----------------------------
// Batch 3: DTOs + response types
// ----------------------------
export type LeaveStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "CANCELED" | (string & {});
export type LeaveType = string;

export type LeaveListFilterDto = Partial<{
  employeeId: string;
  status: LeaveStatus;
  type: LeaveType;
  from: string; // ISO date or datetime
  to: string;
  page: number;
  pageSize: number;
  cursor: string;
}>;

export type LeaveCalendarDto = { from: string; to: string; employeeId?: string };
export type LeaveSummaryDto = { from?: string; to?: string; employeeId?: string };

export type CreateLeaveRequestDto = {
  employeeId: string;
  type: LeaveType;
  startDate: string; // ISO / date
  endDate: string;   // ISO / date
  reason?: string | null;
};

export type UpdateLeaveRequestDto = Partial<{
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string | null;
}>;

export type CancelLeaveRequestDto = { reason?: string | null };

export type DecideLeaveRequestDto = {
  approved: boolean;
  reason?: string | null;
};

export type BulkDecideLeaveRequestDto = {
  ids: string[];
  approved: boolean;
  reason?: string | null;
};

export type CheckLeaveOverlapDto = {
  employeeId: string;
  startDate: string;
  endDate: string;
  excludeId?: string;
};

export type LeaveSummaryResult = {
  byStatus: Record<string, number>;
  approvedDays: number;
};

export type LeaveHistoryRow = {
  id: string;
  tenantId?: string;
  actorUserId?: string | null;
  action?: string;
  entityType?: string;
  entityId?: string;
  metadata?: any;
  createdAt?: string;
  [key: string]: unknown;
};

// Minimal employee ref (backend includes employee: true)
export type BasicEmployee = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  employeeNumber?: string | null;
  [key: string]: unknown;
};

export type LeaveRequest = {
  id: string;
  tenantId: string;

  employeeId: string;
  employee?: BasicEmployee | null;

  type: LeaveType;
  status: LeaveStatus;

  startDate: string;
  endDate: string;

  reason?: string | null;

  requestedAt?: string | null;
  decidedAt?: string | null;
  decidedByUserId?: string | null;

  canceledAt?: string | null;

  [key: string]: unknown;
};

export type ListLeaveRequestsResponse = LeaveListResult;
export type GetLeaveRequestResponse = LeaveRequest;
export type LeaveHistoryResponse = LeaveHistoryRow[];
export type LeaveCalendarResponse = LeaveRequest[];
export type LeaveSummaryResponse = LeaveSummaryResult;
export type CheckLeaveOverlapResponse = ApiResponse<{ overlaps: boolean; conflictingId: string | null }>;
export type BulkDecideLeaveResponse = ApiResponse<{ ok: true; updatedCount: number }>;

// ----------------------------
// UI helpers
// ----------------------------
export function shortId(id: string, len = 6) {
  return String(id || "").slice(0, len);
}

export function formatIsoDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

export function leaveEmployeeLabel(e?: BasicEmployee | null) {
  if (!e) return "—";
  const fn = String(e.firstName ?? "").trim();
  const ln = String(e.lastName ?? "").trim();
  const name = `${fn} ${ln}`.trim();
  return name || (e.employeeNumber ? `#${e.employeeNumber}` : shortId(e.id));
}

export function isRequested(status?: string) {
  return String(status || "").toUpperCase() === "REQUESTED";
}
export function isCancelable(status?: string) {
  return String(status || "").toUpperCase() === "REQUESTED";
}
export function isDecidable(status?: string) {
  return String(status || "").toUpperCase() === "REQUESTED";
}
export function isRestorable(status?: string) {
  const s = String(status || "").toUpperCase();
  return s === "CANCELED" || s === "REJECTED";
}

export function leaveCalendarDate(value: string): Date | null {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}
