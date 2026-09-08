"use client";

// C:\Users\kriss\logaxp-landing-page\src\components\scheduling\pickers\schedulePickers.ts
import { timeManagementService } from "@/logaxp/lib/time-management/timeManagementService";

// NOTE: This assumes your API already has these endpoints (Batch 1 BE).
// If your endpoint names differ, only adjust the URL inside your service (not the UI).
type PickerItem = { id: string; label: string };

function asItems(rows: any[], label: (r: any) => string): PickerItem[] {
  return (rows ?? []).map((r) => ({ id: String(r.id), label: label(r) }));
}

/** Templates */
export async function fetchScheduleTemplates(q: string): Promise<PickerItem[]> {
  const res = await timeManagementService.schedule.templates.list({ q, page: 1, pageSize: 20 } as any);
  const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];
  return asItems(items, (t) => `${t.name ?? "Template"} (${String(t.type ?? "WEEKLY")})`);
}

/** Employees */
export async function fetchEmployees(q: string): Promise<PickerItem[]> {
  const res = await timeManagementService.employees.list({ q, page: 1, pageSize: 20 } as any);
  const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];
  return asItems(items, (e) => `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim() || `Employee ${e.id}`);
}

/** Org Units */
export async function fetchOrgUnits(q: string): Promise<PickerItem[]> {
  const res = await timeManagementService.orgUnits.list({ q, page: 1, pageSize: 20 } as any);
  const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];
  return asItems(items, (u) => `${u.name ?? "Org Unit"}${u.code ? ` (${u.code})` : ""}`);
}

/** Locations */
export async function fetchLocations(q: string): Promise<PickerItem[]> {
  const res = await timeManagementService.locations.list({ q, page: 1, pageSize: 20 } as any);
  const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];
  return asItems(items, (l) => `${l.name ?? "Location"}${l.code ? ` (${l.code})` : ""}`);
}