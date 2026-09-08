"use client";

import type { AsyncSelectItem } from "./AsyncSelect";
import { employeeManagementService } from "@/logaxp/lib/employee-management/employeeManagementService";

// soft normalize for unknown list shapes
function extractItems<T>(payload: any): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as T[];
  if (Array.isArray(payload?.items)) return payload.items as T[];
  if (Array.isArray(payload?.data?.items)) return payload.data.items as T[];
  return [];
}

export async function fetchEmployees(q: string): Promise<AsyncSelectItem[]> {
  const res = await employeeManagementService.listEmployees({
    q: q || undefined,
    page: 1,
    pageSize: 12,
    includeDeleted: false,
  } as any);

  // ✅ support both service styles: returns res OR returns res.data
  const payload = (res as any)?.data ?? res;

  const items = extractItems<any>(payload);

  return items.map((e) => {
    const name = `${String(e.firstName ?? "").trim()} ${String(e.lastName ?? "").trim()}`.trim();
    const preferred = String(e.preferredName ?? "").trim();
    const label = preferred ? `${name} (${preferred})` : (name || String(e.workEmail ?? e.employeeNumber ?? "Employee"));

    const metaParts = [
      e.employeeNumber ? `#${e.employeeNumber}` : null,
      e.status ? String(e.status) : null,
      e.employmentType ? String(e.employmentType) : null,
    ].filter(Boolean);

    return {
      id: String(e.id),
      label,
      meta: metaParts.length ? metaParts.join(" • ") : undefined,
    };
  });
}