"use client";

import type {
  EmployeeAssignment,
  EmployeeListItem,
} from "@/logaxp/lib/employee-management/employee-management.types";
import type { ApiResponse, ListData } from "@/logaxp/lib/orgStructure/orgStructure.types";

export type BusyAction = "refresh" | "delete" | "restore" | "status" | null;

export type EmployeeListQuery = {
  q?: string;
  status?: string;
  employmentType?: string;
  orgUnitId?: string;
  locationId?: string;
  positionId?: string;
  costCenterId?: string;
  includeDeleted?: boolean;
  page?: number;
  pageSize?: number;
};

export function safeIso(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString();
}

export function safeDate(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString();
}

export function unwrapApi<T>(res: ApiResponse<T> | T): T {
  if (
    res &&
    typeof res === "object" &&
    "data" in (res as any) &&
    "statusCode" in (res as any)
  ) {
    return (res as ApiResponse<T>).data;
  }
  return res as T;
}

export function unwrapList<T>(data: ListData<T> | any): { items: T[] } {
  if (!data) return { items: [] };
  if (Array.isArray(data)) return { items: data as T[] };
  if (typeof data === "object" && Array.isArray((data as any).items)) {
    return { items: (data as any).items as T[] };
  }
  return { items: [] };
}

export function getPrimaryAssignmentLabel(a?: EmployeeAssignment | null) {
  if (!a) return "—";
  const parts = [
    a.orgUnit?.name || null,
    a.position?.title || null,
    a.location?.name || null,
    a.costCenter?.name || null,
  ].filter(Boolean);
  return parts.length ? parts.join(" • ") : "—";
}

export function getPrimaryAssignment(employee?: EmployeeListItem | null) {
  const assignments = (employee as any)?.assignments;
  if (Array.isArray(assignments) && assignments.length) {
    return assignments.find((a: EmployeeAssignment) => a.isPrimary) ?? assignments[0] ?? null;
  }
  return (employee as any)?.primaryAssignment ?? null;
}

export function humanStatus(s?: string | null) {
  if (!s) return "—";
  return String(s).replaceAll("_", " ");
}

export function fullName(emp?: EmployeeListItem | null) {
  if (!emp) return "—";
  return `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() || "—";
}

export function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export function getEmployeeAccessStatus(employee?: EmployeeListItem | null) {
  const explicit = (employee as EmployeeListItem & { accessStatus?: string | null } | null | undefined)?.accessStatus;
  if (explicit) return explicit;
  if ((employee as EmployeeListItem & { userId?: string | null } | null | undefined)?.userId) return "ACTIVE";
  return "NONE";
}