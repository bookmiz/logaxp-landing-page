import { api } from "@/logaxp/lib/api/apiClient";
import type { AuditListDto, AuditLog, AuditSummary, PaginatedAuditLogs } from "./audit.types";

function cleanParams<T extends Record<string, unknown>>(params?: T): Record<string, unknown> | undefined {
  if (!params) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") out[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

export const auditAdminService = {
  async list(params?: AuditListDto): Promise<PaginatedAuditLogs> {
    const { data } = await api.get("/admin/audit-logs", {
      params: cleanParams(params as Record<string, unknown>),
    });
    return data;
  },

  async getById(id: string): Promise<AuditLog> {
    const { data } = await api.get(`/admin/audit-logs/${encodeURIComponent(id)}`);
    return data;
  },

  async summary(params?: AuditListDto): Promise<AuditSummary> {
    const { data } = await api.get("/admin/audit-logs/summary", {
      params: cleanParams(params as Record<string, unknown>),
    });
    return data;
  },
};