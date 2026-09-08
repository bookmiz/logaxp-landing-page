"use client";

import type { ApiResponse, ListData } from "@/logaxp/lib/orgStructure/orgStructure.types";
import type { EmployeeDetail } from "@/logaxp/lib/employee-management/employee-management.types";


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

export function unwrapList<T>(data: ListData<T> | T[]): { items: T[] } {
  if (!data) return { items: [] };
  if (Array.isArray(data)) return { items: data as T[] };
  if (typeof data === "object" && "items" in data && Array.isArray((data as any).items)) {
    return { items: (data as any).items };
  }
  return { items: [] };
}

export function human(s?: string | null) {
  if (!s) return "—";
  return String(s).replaceAll("_", " ");
}

export function fullName(e?: EmployeeDetail | null) {
  if (!e) return "—";
  const n = `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim();
  return n || "—";
}

export function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export function isDeleted(e?: EmployeeDetail | null) {
  return Boolean(e?.deletedAt);
}

export function primaryAssignmentOf(employee?: EmployeeDetail | null) {
  if (!employee?.assignments?.length) return null;
  return employee.assignments.find((a) => a.isPrimary) ?? employee.assignments[0] ?? null;
}

export type TabKey =
  | "profile"
  | "assignments"
  | "addresses"
  | "emergency"
  | "dependents"
  | "payroll-profile"
  | "compensations"
  | "payment-methods"
  | "payment-splits"
  | "documents";

export const EMPLOYEE_DETAIL_TABS: Array<{ key: TabKey; label: string }> = [
  { key: "profile", label: "Profile" },
  { key: "assignments", label: "Assignments" },
  { key: "addresses", label: "Addresses" },
  { key: "emergency", label: "Emergency" },
  { key: "dependents", label: "Dependents" },
  { key: "documents", label: "Documents" },
  { key: "payroll-profile", label: "Payroll Profile" },
  { key: "compensations", label: "Compensations" },
  { key: "payment-methods", label: "Payment Methods" },
  { key: "payment-splits", label: "Payment Splits" },
];

export type BusyAction = "refresh" | "delete" | "restore" | "status" | "panel" | null;