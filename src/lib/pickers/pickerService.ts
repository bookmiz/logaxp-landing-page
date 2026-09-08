"use client";

// src/logaxp/lib/pickers/pickerService.ts
import { employeeManagementService } from "@/logaxp/lib/employee-management/employeeManagementService";
import { orgStructureService } from "@/logaxp/lib/orgStructure/orgStructureService";
import { scheduleManagementService } from "@/logaxp/lib/scheduling/scheduleManagementService";

export type PickerItem = { id: string; label: string };
export type PickerListDto = { q?: string; page?: number; pageSize?: number };

/**
 * Unwraps common response shapes:
 * - ApiResponse<Paged<T>> => { data: { items: T[] } }
 * - ApiResponse<T[]>      => { data: T[] }
 * - Paged<T>              => { items: T[] }
 * - T[]                   => T[]
 */
function unwrapRows<T = any>(res: any): T[] {
  const data = res?.data ?? res;
  const items = data?.items ?? data;
  return Array.isArray(items) ? items : [];
}

export const pickerService = {
  /** Employees (employee-management domain) */
  async employees(filter?: PickerListDto): Promise<PickerItem[]> {
    const res = await employeeManagementService.listEmployees({
      q: filter?.q,
      page: filter?.page ?? 1,
      pageSize: filter?.pageSize ?? 20,
      includeDeleted: false,
    } as any);

    const rows = unwrapRows<any>(res);
    return rows.map((e) => ({
      id: String(e.id),
      label: `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim() || `Employee ${e.id}`,
    }));
  },

  /** Org Units (org-structure domain) */
  async orgUnits(filter?: PickerListDto): Promise<PickerItem[]> {
    const res = await orgStructureService.listOrgUnits({
      search: filter?.q, // map q -> search (per your BE)
      page: filter?.page ?? 1,
      pageSize: filter?.pageSize ?? 20,
      includeDeleted: false,
    } as any);

    const rows = unwrapRows<any>(res);
    return rows.map((u) => ({
      id: String(u.id),
      label: `${u.name ?? "Org Unit"}${u.code ? ` (${u.code})` : ""}`,
    }));
  },

  /** Locations (org-structure domain) */
  async locations(filter?: PickerListDto): Promise<PickerItem[]> {
    const res = await orgStructureService.listLocations({
      search: filter?.q, // map q -> search (per your BE)
      page: filter?.page ?? 1,
      pageSize: filter?.pageSize ?? 20,
      includeDeleted: false,
    } as any);

    const rows = unwrapRows<any>(res);
    return rows.map((l) => ({
      id: String(l.id),
      label: `${l.name ?? "Location"}${l.code ? ` (${l.code})` : ""}`,
    }));
  },

  /** Positions (org-structure domain) */
  async positions(filter?: PickerListDto): Promise<PickerItem[]> {
    const res = await orgStructureService.listPositions({
      // If your PositionsListFilterDto uses "q" instead of "search", switch this mapping.
      search: filter?.q,
      page: filter?.page ?? 1,
      pageSize: filter?.pageSize ?? 20,
      includeDeleted: false,
    } as any);

    const rows = unwrapRows<any>(res);
    return rows.map((p) => ({
      id: String(p.id),
      label: `${p.title ?? p.name ?? "Position"}${p.code ? ` (${p.code})` : ""}`,
    }));
  },

  /** Cost Centers (org-structure domain) */
  async costCenters(filter?: PickerListDto): Promise<PickerItem[]> {
    const res = await orgStructureService.listCostCenters({
      // If your CostCentersListFilterDto uses "q" instead of "search", switch this mapping.
      search: filter?.q,
      page: filter?.page ?? 1,
      pageSize: filter?.pageSize ?? 20,
      includeDeleted: false,
    } as any);

    const rows = unwrapRows<any>(res);
    return rows.map((c) => ({
      id: String(c.id),
      label: `${c.name ?? "Cost Center"}${c.code ? ` (${c.code})` : ""}`,
    }));
  },

  /** Schedule Templates (scheduling domain) */
  async scheduleTemplates(filter?: PickerListDto): Promise<PickerItem[]> {
    // Your current scheduleManagementService.templates.list() has no params.
    // If you later add q/page/pageSize to the BE, update scheduleManagementService accordingly.
    const res = await scheduleManagementService.templates.list();
    const rows = unwrapRows<any>(res);

    // Optional client-side filter for now (since BE list() doesn't accept q yet)
    const q = (filter?.q ?? "").trim().toLowerCase();
    const filtered = q
      ? rows.filter((t) => String(t.name ?? "").toLowerCase().includes(q))
      : rows;

    // Optional client-side paging for now
    const page = filter?.page ?? 1;
    const pageSize = filter?.pageSize ?? 20;
    const start = (page - 1) * pageSize;
    const pageRows = filtered.slice(start, start + pageSize);

    return pageRows.map((t) => ({
      id: String(t.id),
      label: `${t.name ?? "Template"} (${String(t.type ?? "WEEKLY")})`,
    }));
  },
};