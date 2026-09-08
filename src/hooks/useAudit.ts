import { useQuery } from "@tanstack/react-query";
import { auditAdminService } from "@/logaxp/lib/audit/audit.service";
import type { AuditListDto } from "@/logaxp/lib/audit/audit.types";

export const auditKeys = {
  all: ["audit"] as const,
  admin: () => [...auditKeys.all, "admin"] as const,
  list: (params?: AuditListDto) => [...auditKeys.admin(), "list", params ?? {}] as const,
  summary: (params?: AuditListDto) => [...auditKeys.admin(), "summary", params ?? {}] as const,
  detail: (id?: string) => [...auditKeys.admin(), "detail", id] as const,
};

export function useAuditLogs(params?: AuditListDto) {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: () => auditAdminService.list(params),
  });
}

export function useAuditSummary(params?: AuditListDto) {
  return useQuery({
    queryKey: auditKeys.summary(params),
    queryFn: () => auditAdminService.summary(params),
  });
}

export function useAuditLog(id?: string) {
  return useQuery({
    queryKey: auditKeys.detail(id),
    queryFn: () => auditAdminService.getById(id as string),
    enabled: !!id,
  });
}