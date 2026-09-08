"use client";

import type { AsyncSelectItem } from "./AsyncSelect";
import { projectManagementService } from "@/logaxp/lib/project-management/projectManagementService";

// Normalize list shapes from either:
// - { items: [...] }
// - { data: { items: [...] } }  (ApiResponse-like)
// - AxiosResponse-style: { data: ... } (if any service returns raw axios res)
function extractItems<T>(res: any): T[] {
  if (!res) return [];

  // if this is an AxiosResponse, unwrap once
  const a = res?.data ?? res;

  // if this is ApiResponse, unwrap again
  const b = a?.data ?? a;

  if (Array.isArray(b)) return b as T[];
  if (Array.isArray(b?.items)) return b.items as T[];
  if (Array.isArray(b?.data?.items)) return b.data.items as T[];
  if (Array.isArray(b?.data?.data?.items)) return b.data.data.items as T[];

  return [];
}

export async function fetchProjects(q: string): Promise<AsyncSelectItem[]> {
  const res = await projectManagementService.projects.list({
    q: q || undefined,
    page: 1,
    pageSize: 12,
  } as any);

  const items = extractItems<any>(res);

  return items.map((p) => ({
    id: String(p.id),
    label: String(p.name ?? p.title ?? "Project"),
    meta: p.status ? String(p.status) : undefined,
  }));
}

export async function fetchWorkItems(opts: { q: string; projectId?: string | null }): Promise<AsyncSelectItem[]> {
  const res = await projectManagementService.workItems.list({
    q: opts.q || undefined,
    projectId: opts.projectId || undefined,
    page: 1,
    pageSize: 12,
  } as any);

  const items = extractItems<any>(res);

  return items.map((w) => ({
    id: String(w.id),
    label: String(w.title ?? w.name ?? "Work Item"),
    meta: w.type ? String(w.type) : w.status ? String(w.status) : undefined,
  }));
}