import { api } from "@/logaxp/lib/api/apiClient";
import type {
  SiteAdminAnalyticsDto,
  SiteAdminAuditListDto,
  SiteAdminAuditListResponse,
  SiteAdminGrowthResponse,
  SiteAdminOverviewResponse,
  SiteAdminRecentActivityResponse,
  SiteAdminTenantHealthResponse,
  SiteAdminTenantListDto,
} from "./site-admin-analytics.types";

function cleanParams<T extends Record<string, unknown>>(
  params?: T,
): Record<string, unknown> | undefined {
  if (!params) return undefined;

  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      out[key] = value;
    }
  }

  return Object.keys(out).length ? out : undefined;
}

export const siteAdminAnalyticsService = {
  async overview(
    params?: SiteAdminAnalyticsDto,
  ): Promise<SiteAdminOverviewResponse> {
    const { data } = await api.get("/site-admin/analytics/overview", {
      params: cleanParams(params as Record<string, unknown>),
    });

    return data;
  },

  async growth(
    params?: SiteAdminAnalyticsDto,
  ): Promise<SiteAdminGrowthResponse> {
    const { data } = await api.get("/site-admin/analytics/growth", {
      params: cleanParams(params as Record<string, unknown>),
    });

    return data;
  },

  async tenantHealth(
    params?: SiteAdminTenantListDto,
  ): Promise<SiteAdminTenantHealthResponse> {
    const { data } = await api.get("/site-admin/analytics/tenant-health", {
      params: cleanParams(params as Record<string, unknown>),
    });

    return data;
  },

  async recentActivity(
    params?: SiteAdminAnalyticsDto,
  ): Promise<SiteAdminRecentActivityResponse> {
    const { data } = await api.get("/site-admin/analytics/recent-activity", {
      params: cleanParams(params as Record<string, unknown>),
    });

    return data;
  },

  async audit(
    params?: SiteAdminAuditListDto,
  ): Promise<SiteAdminAuditListResponse> {
    const { data } = await api.get("/site-admin/analytics/audit", {
      params: cleanParams(params as Record<string, unknown>),
    });

    return data;
  },
};