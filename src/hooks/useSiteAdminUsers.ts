import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { siteAdminUsersService } from "@/logaxp/lib/site-admin/site-admin-users.service";
import type {
  IssuePasswordResetDto,
  RevokeSessionDto,
  ResolvePasswordIssueDto,
  SiteAdminListUsersDto,
  SiteAdminListVerificationTokensDto,
  SiteAdminLoggedInUsersDto,
  SiteAdminUserSecurityDto,
  SiteAdminUserSessionsDto,
  UpdateUserStatusDto,
} from "@/logaxp/lib/site-admin/site-admin-users.types";

export const siteAdminUsersKeys = {
  all: ["site-admin", "users"] as const,

  lists: () => [...siteAdminUsersKeys.all, "list"] as const,
  list: (params?: SiteAdminListUsersDto) =>
    [...siteAdminUsersKeys.lists(), params ?? {}] as const,

  loggedInLists: () => [...siteAdminUsersKeys.all, "logged-in"] as const,
  loggedInList: (params?: SiteAdminLoggedInUsersDto) =>
    [...siteAdminUsersKeys.loggedInLists(), params ?? {}] as const,

  details: () => [...siteAdminUsersKeys.all, "detail"] as const,
  detail: (userId: string) =>
    [...siteAdminUsersKeys.details(), userId] as const,

  sessions: (userId: string) =>
    [...siteAdminUsersKeys.detail(userId), "sessions"] as const,
  sessionList: (userId: string, params?: SiteAdminUserSessionsDto) =>
    [...siteAdminUsersKeys.sessions(userId), params ?? {}] as const,

  security: (userId: string, params?: SiteAdminUserSecurityDto) =>
    [...siteAdminUsersKeys.detail(userId), "security", params ?? {}] as const,

  verificationTokens: (
    userId: string,
    params?: SiteAdminListVerificationTokensDto,
  ) =>
    [
      ...siteAdminUsersKeys.detail(userId),
      "verification-tokens",
      params ?? {},
    ] as const,
};

export function useSiteAdminUsers(params?: SiteAdminListUsersDto) {
  return useQuery({
    queryKey: siteAdminUsersKeys.list(params),
    queryFn: () => siteAdminUsersService.listUsers(params),
  });
}

export function useSiteAdminLoggedInUsers(
  params?: SiteAdminLoggedInUsersDto,
) {
  return useQuery({
    queryKey: siteAdminUsersKeys.loggedInList(params),
    queryFn: () => siteAdminUsersService.listLoggedInUsers(params),
  });
}

export function useSiteAdminUser(userId?: string) {
  return useQuery({
    queryKey: siteAdminUsersKeys.detail(userId ?? ""),
    queryFn: () => siteAdminUsersService.getUser(userId as string),
    enabled: Boolean(userId),
  });
}

export function useSiteAdminUserSessions(
  userId?: string,
  params?: SiteAdminUserSessionsDto,
) {
  return useQuery({
    queryKey: siteAdminUsersKeys.sessionList(userId ?? "", params),
    queryFn: () =>
      siteAdminUsersService.listUserSessions(userId as string, params),
    enabled: Boolean(userId),
  });
}

export function useSiteAdminUserSecurity(
  userId?: string,
  params?: SiteAdminUserSecurityDto,
) {
  return useQuery({
    queryKey: siteAdminUsersKeys.security(userId ?? "", params),
    queryFn: () =>
      siteAdminUsersService.getUserSecurity(userId as string, params),
    enabled: Boolean(userId),
  });
}

export function useSiteAdminUserVerificationTokens(
  userId?: string,
  params?: SiteAdminListVerificationTokensDto,
) {
  return useQuery({
    queryKey: siteAdminUsersKeys.verificationTokens(userId ?? "", params),
    queryFn: () =>
      siteAdminUsersService.listVerificationTokens(userId as string, params),
    enabled: Boolean(userId),
  });
}

function invalidateUserQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  userId?: string,
) {
  queryClient.invalidateQueries({ queryKey: siteAdminUsersKeys.all });

  if (userId) {
    queryClient.invalidateQueries({
      queryKey: siteAdminUsersKeys.detail(userId),
    });
    queryClient.invalidateQueries({
      queryKey: siteAdminUsersKeys.sessions(userId),
    });
  }
}

export function useActivateSiteAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload?: UpdateUserStatusDto;
    }) => siteAdminUsersService.activateUser(userId, payload),
    onSuccess: (_, variables) => {
      invalidateUserQueries(queryClient, variables.userId);
    },
  });
}

export function useSuspendSiteAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload?: UpdateUserStatusDto;
    }) => siteAdminUsersService.suspendUser(userId, payload),
    onSuccess: (_, variables) => {
      invalidateUserQueries(queryClient, variables.userId);
    },
  });
}

export function useDisableSiteAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload?: UpdateUserStatusDto;
    }) => siteAdminUsersService.disableUser(userId, payload),
    onSuccess: (_, variables) => {
      invalidateUserQueries(queryClient, variables.userId);
    },
  });
}

export function useRestoreSiteAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload?: UpdateUserStatusDto;
    }) => siteAdminUsersService.restoreUser(userId, payload),
    onSuccess: (_, variables) => {
      invalidateUserQueries(queryClient, variables.userId);
    },
  });
}

export function useDeleteSiteAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload?: UpdateUserStatusDto;
    }) => siteAdminUsersService.softDeleteUser(userId, payload),
    onSuccess: (_, variables) => {
      invalidateUserQueries(queryClient, variables.userId);
    },
  });
}

export function useVerifySiteAdminUserEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload?: UpdateUserStatusDto;
    }) => siteAdminUsersService.verifyEmail(userId, payload),
    onSuccess: (_, variables) => {
      invalidateUserQueries(queryClient, variables.userId);
    },
  });
}

export function useIssueSiteAdminPasswordReset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload?: IssuePasswordResetDto;
    }) => siteAdminUsersService.issuePasswordReset(userId, payload),
    onSuccess: (_, variables) => {
      invalidateUserQueries(queryClient, variables.userId);
    },
  });
}

export function useResolveSiteAdminPasswordIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload?: ResolvePasswordIssueDto;
    }) => siteAdminUsersService.resolvePasswordIssue(userId, payload),
    onSuccess: (_, variables) => {
      invalidateUserQueries(queryClient, variables.userId);
    },
  });
}

export function useRevokeSiteAdminSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      sessionId,
      payload,
    }: {
      userId: string;
      sessionId: string;
      payload?: RevokeSessionDto;
    }) => siteAdminUsersService.revokeSession(userId, sessionId, payload),
    onSuccess: (_, variables) => {
      invalidateUserQueries(queryClient, variables.userId);
    },
  });
}

export function useRevokeAllSiteAdminSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload?: RevokeSessionDto;
    }) => siteAdminUsersService.revokeAllSessions(userId, payload),
    onSuccess: (_, variables) => {
      invalidateUserQueries(queryClient, variables.userId);
    },
  });
}