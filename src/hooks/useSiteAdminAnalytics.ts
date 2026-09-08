import { useQuery } from "@tanstack/react-query";
import { siteAdminAnalyticsService } from "@/logaxp/lib/site-admin/site-admin-analytics.service";
import type {
  SiteAdminAnalyticsDto,
  SiteAdminAuditListDto,
  SiteAdminTenantListDto,
} from "@/logaxp/lib/site-admin/site-admin-analytics.types";

export const siteAdminAnalyticsKeys = {
  all: ["site-admin", "analytics"] as const,

  overview: (params?: SiteAdminAnalyticsDto) =>
    [...siteAdminAnalyticsKeys.all, "overview", params ?? {}] as const,

  growth: (params?: SiteAdminAnalyticsDto) =>
    [...siteAdminAnalyticsKeys.all, "growth", params ?? {}] as const,

  tenantHealth: (params?: SiteAdminTenantListDto) =>
    [...siteAdminAnalyticsKeys.all, "tenant-health", params ?? {}] as const,

  recentActivity: (params?: SiteAdminAnalyticsDto) =>
    [...siteAdminAnalyticsKeys.all, "recent-activity", params ?? {}] as const,

  audit: (params?: SiteAdminAuditListDto) =>
    [...siteAdminAnalyticsKeys.all, "audit", params ?? {}] as const,
};

export function useSiteAdminOverview(params?: SiteAdminAnalyticsDto) {
  return useQuery({
    queryKey: siteAdminAnalyticsKeys.overview(params),
    queryFn: () => siteAdminAnalyticsService.overview(params),
  });
}

export function useSiteAdminGrowth(params?: SiteAdminAnalyticsDto) {
  return useQuery({
    queryKey: siteAdminAnalyticsKeys.growth(params),
    queryFn: () => siteAdminAnalyticsService.growth(params),
  });
}

export function useSiteAdminTenantHealth(params?: SiteAdminTenantListDto) {
  return useQuery({
    queryKey: siteAdminAnalyticsKeys.tenantHealth(params),
    queryFn: () => siteAdminAnalyticsService.tenantHealth(params),
  });
}

export function useSiteAdminRecentActivity(params?: SiteAdminAnalyticsDto) {
  return useQuery({
    queryKey: siteAdminAnalyticsKeys.recentActivity(params),
    queryFn: () => siteAdminAnalyticsService.recentActivity(params),
  });
}

export function useSiteAdminAuditList(params?: SiteAdminAuditListDto) {
  return useQuery({
    queryKey: siteAdminAnalyticsKeys.audit(params),
    queryFn: () => siteAdminAnalyticsService.audit(params),
  });
}