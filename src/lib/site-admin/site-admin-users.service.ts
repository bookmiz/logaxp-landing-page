import { api } from "@/logaxp/lib/api/apiClient";
import type {
  IssuePasswordResetDto,
  IssuePasswordResetResponse,
  PaginatedSessionsResponse,
  PaginatedUsersResponse,
  PaginatedVerificationTokensResponse,
  ResolvePasswordIssueDto,
  ResolvePasswordIssueResponse,
  RevokeAllSessionsResponse,
  RevokeSessionDto,
  RevokeSingleSessionResponse,
  SiteAdminListUsersDto,
  SiteAdminListVerificationTokensDto,
  SiteAdminLoggedInUsersDto,
  SiteAdminUserDetails,
  SiteAdminUserSecurityDto,
  SiteAdminUserSessionsDto,
  UpdateUserStatusDto,
  UserSecurityResponse,
} from "./site-admin-users.types";

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

export const siteAdminUsersService = {
  async listUsers(params?: SiteAdminListUsersDto): Promise<PaginatedUsersResponse> {
    const { data } = await api.get("/site-admin/users", {
      params: cleanParams(params as Record<string, unknown>),
    });
    return data;
  },

  async listLoggedInUsers(
    params?: SiteAdminLoggedInUsersDto,
  ): Promise<PaginatedUsersResponse> {
    const { data } = await api.get("/site-admin/users/logged-in", {
      params: cleanParams(params as Record<string, unknown>),
    });
    return data;
  },

  async getUser(userId: string): Promise<SiteAdminUserDetails> {
    const { data } = await api.get(`/site-admin/users/${userId}`);
    return data;
  },

  async listUserSessions(
    userId: string,
    params?: SiteAdminUserSessionsDto,
  ): Promise<PaginatedSessionsResponse> {
    const { data } = await api.get(`/site-admin/users/${userId}/sessions`, {
      params: cleanParams(params as Record<string, unknown>),
    });
    return data;
  },

  async revokeAllSessions(
    userId: string,
    payload?: RevokeSessionDto,
  ): Promise<RevokeAllSessionsResponse> {
    const { data } = await api.delete(`/site-admin/users/${userId}/sessions`, {
      data: payload ?? {},
    });
    return data;
  },

  async revokeSession(
    userId: string,
    sessionId: string,
    payload?: RevokeSessionDto,
  ): Promise<RevokeSingleSessionResponse> {
    const { data } = await api.delete(
      `/site-admin/users/${userId}/sessions/${sessionId}`,
      {
        data: payload ?? {},
      },
    );
    return data;
  },

  async getUserSecurity(
    userId: string,
    params?: SiteAdminUserSecurityDto,
  ): Promise<UserSecurityResponse> {
    const { data } = await api.get(`/site-admin/users/${userId}/security`, {
      params: cleanParams(params as Record<string, unknown>),
    });
    return data;
  },

  async listVerificationTokens(
    userId: string,
    params?: SiteAdminListVerificationTokensDto,
  ): Promise<PaginatedVerificationTokensResponse> {
    const { data } = await api.get(
      `/site-admin/users/${userId}/verification-tokens`,
      {
        params: cleanParams(params as Record<string, unknown>),
      },
    );
    return data;
  },

  async activateUser(
    userId: string,
    payload?: UpdateUserStatusDto,
  ): Promise<SiteAdminUserDetails> {
    const { data } = await api.patch(
      `/site-admin/users/${userId}/activate`,
      payload ?? {},
    );
    return data;
  },

  async suspendUser(
    userId: string,
    payload?: UpdateUserStatusDto,
  ): Promise<SiteAdminUserDetails> {
    const { data } = await api.patch(
      `/site-admin/users/${userId}/suspend`,
      payload ?? {},
    );
    return data;
  },

  async disableUser(
    userId: string,
    payload?: UpdateUserStatusDto,
  ): Promise<SiteAdminUserDetails> {
    const { data } = await api.patch(
      `/site-admin/users/${userId}/disable`,
      payload ?? {},
    );
    return data;
  },

  async restoreUser(
    userId: string,
    payload?: UpdateUserStatusDto,
  ): Promise<SiteAdminUserDetails> {
    const { data } = await api.patch(
      `/site-admin/users/${userId}/restore`,
      payload ?? {},
    );
    return data;
  },

  async softDeleteUser(
    userId: string,
    payload?: UpdateUserStatusDto,
  ): Promise<SiteAdminUserDetails> {
    const { data } = await api.delete(`/site-admin/users/${userId}`, {
      data: payload ?? {},
    });
    return data;
  },

  async verifyEmail(
    userId: string,
    payload?: UpdateUserStatusDto,
  ): Promise<SiteAdminUserDetails> {
    const { data } = await api.patch(
      `/site-admin/users/${userId}/verify-email`,
      payload ?? {},
    );
    return data;
  },

  async issuePasswordReset(
    userId: string,
    payload?: IssuePasswordResetDto,
  ): Promise<IssuePasswordResetResponse> {
    const { data } = await api.post(
      `/site-admin/users/${userId}/password-reset`,
      payload ?? {},
    );
    return data;
  },

  async resolvePasswordIssue(
    userId: string,
    payload?: ResolvePasswordIssueDto,
  ): Promise<ResolvePasswordIssueResponse> {
    const { data } = await api.post(
      `/site-admin/users/${userId}/resolve-password-issue`,
      payload ?? {},
    );
    return data;
  },
};