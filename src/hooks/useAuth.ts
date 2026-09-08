// src/hooks/useAuth.ts
"use client";

import { useCallback, useMemo, useState } from "react";
import { tokenStorage } from "@/logaxp/lib/auth/tokenStorage";
import { authService } from "@/logaxp/lib/auth/authService";
import { mapMeResponseToIdentity } from "@/logaxp/lib/auth/sessionMapper";
import { toast } from "@/logaxp/components/ui/toast";
import type {
  LoginInput,
  SignupTenantInput,
  RegisterInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
  AcceptInviteInput,
  LoginOk,
  LoginResponse,
  RefreshResponse,
  ResendVerifyEmailInput,
  ResendVerifyEmailWithPasswordInput,
} from "@/logaxp/lib/auth/auth.types";
import { useAuthStore } from "@/logaxp/stores/useAuthStore";

type ApiErrorShape = {
  response?: {
    data?: {
      message?: unknown;
    };
  };
  message?: unknown;
};

function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;

  if (err && typeof err === "object") {
    const e = err as ApiErrorShape;

    const apiMsg = e.response?.data?.message;
    if (typeof apiMsg === "string" && apiMsg.trim()) return apiMsg;

    const msg = e.message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }

  return "Something went wrong";
}

type TenantSelectionResponse = {
  requiresTenantSelection: true;
  tenants: Array<{ tenantId: string; tenantSlug: string; tenantName: string }>;
};

function isTenantSelectionResponse(v: LoginResponse): v is TenantSelectionResponse {
  return (
    typeof v === "object" &&
    v !== null &&
    "requiresTenantSelection" in v &&
    (v as { requiresTenantSelection?: unknown }).requiresTenantSelection === true &&
    "tenants" in v &&
    Array.isArray((v as { tenants?: unknown }).tenants)
  );
}

function isRefreshTenantSelectionResponse(v: RefreshResponse): v is TenantSelectionResponse {
  return (
    typeof v === "object" &&
    v !== null &&
    "requiresTenantSelection" in v &&
    (v as { requiresTenantSelection?: unknown }).requiresTenantSelection === true &&
    "tenants" in v &&
    Array.isArray((v as { tenants?: unknown }).tenants)
  );
}

type WrapOptions<T> = {
  successMessage?: string | ((result: T) => string | undefined);
  errorMessage?: string | ((error: unknown, resolvedMessage: string) => string | undefined);
  suppressErrorToast?: boolean;
};

export function useAuth() {
  const store = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const wrap = useCallback(
    async <T,>(fn: () => Promise<T>, options?: WrapOptions<T>) => {
      setLoading(true);
      setError(null);

      try {
        const result = await fn();

        const successMessage =
          typeof options?.successMessage === "function"
            ? options.successMessage(result)
            : options?.successMessage;

        if (successMessage) toast.success(successMessage);

        return result;
      } catch (e: unknown) {
        const resolved = getErrorMessage(e);
        setError(resolved);

        const toastMessage =
          typeof options?.errorMessage === "function"
            ? options.errorMessage(e, resolved)
            : options?.errorMessage ?? resolved;

        if (!options?.suppressErrorToast && toastMessage) {
          toast.error(toastMessage);
        }

        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * ✅ HYDRATE (cookie refresh system)
   * Only hydrate access token from storage.
   * Refresh cookie is HttpOnly and NOT readable in JS, so we do NOT hydrate refreshToken.
   */
  const hydrate = useCallback(() => {
    const access = tokenStorage.getAccessToken();

    if (access) {
      store.setTokens(access, null);
    }

    store.markHydrated();
  }, [store]);

  const register = useCallback(
    (input: RegisterInput) =>
      wrap(() => authService.register(input), {
        successMessage: "Account created successfully.",
      }),
    [wrap]
  );

  const signupTenant = useCallback(
    (input: SignupTenantInput) =>
      wrap(() => authService.signupTenant(input), {
        errorMessage: (e, msg) => msg || "Failed to create tenant workspace.",
      }),
    [wrap]
  );

  /**
   * ✅ LOGIN
   * authService.login MUST use authClient(withCredentials:true) so cookie is stored.
   * Store ONLY accessToken locally; refresh token lives in HttpOnly cookie.
   */
  const login = useCallback(
    async (input: LoginInput) =>
      wrap(
        async () => {
          try {
            await authService.logout();
          } catch {
            // Clear any previous HttpOnly refresh cookie when switching accounts.
          }

          tokenStorage.clear();
          store.clearSession();

          const res = await authService.login(input);

          if (isTenantSelectionResponse(res)) {
            tokenStorage.clear();
            store.setTenantSelection(res.tenants);
            toast.info("Select a tenant workspace to continue.");
            return res;
          }

          const ok = res as LoginOk;

          // ✅ store ONLY access token (refresh is cookie)
          tokenStorage.setTokens(ok.accessToken, undefined);
          store.setSession({
            accessToken: ok.accessToken,
            refreshToken: undefined,
            user: ok.user,
            tenant: ok.tenant ?? null,
            membership: ok.membership ?? null,
            employee: ok.employee ?? null, // ✅ ADD
          });

          toast.success("Signed in successfully.");
          return ok;
        },
        {
          errorMessage: "Unable to sign in. Please check your credentials and try again.",
        }
      ),
    [wrap, store]
  );

  /**
   * ✅ REFRESH (COOKIE-BASED)
   * No refresh token in body. Backend reads cookie.
   */
  const refresh = useCallback(
    async () =>
      wrap(
        async () => {
          const res = await authService.refresh(); // ✅ cookie-based

          if (isRefreshTenantSelectionResponse(res)) {
            tokenStorage.clear();
            store.clearSession();
            store.setTenantSelection(res.tenants);
            return res;
          }

          // ✅ keep only access token (cookie holds refresh)
          tokenStorage.setTokens(res.accessToken, undefined);
          store.setTokens(res.accessToken, undefined);

          return res;
        },
        {
          suppressErrorToast: true,
        }
      ),
    [wrap, store]
  );

  const me = useCallback(
    async () =>
      wrap(
        async () => {
          const data = await authService.me();
          store.setIdentity(mapMeResponseToIdentity(data));

          return data;
        },
        { suppressErrorToast: true }
      ),
    [wrap, store]
  );

  /**
   * ✅ LOGOUT (COOKIE-BASED)
   * No refresh token body. Backend clears cookie.
   */
  const logout = useCallback(
    async () =>
      wrap(
        async () => {
          try {
            await authService.logout(); // ✅ cookie-based
          } catch {
            // ignore backend logout failure, still clear local session
          }

          tokenStorage.clear();
          store.clearSession();
          return { ok: true };
        },
        { successMessage: "Signed out successfully." }
      ),
    [wrap, store]
  );

  const verifyEmail = useCallback(
    (input: VerifyEmailInput) =>
      wrap(() => authService.verifyEmail(input), {
        successMessage: "Email verified successfully.",
      }),
    [wrap]
  );

  const forgotPassword = useCallback(
    (input: ForgotPasswordInput) =>
      wrap(() => authService.forgotPassword(input), {
        successMessage: "Password reset instructions sent.",
      }),
    [wrap]
  );

  const resetPassword = useCallback(
    (input: ResetPasswordInput) =>
      wrap(() => authService.resetPassword(input), {
        successMessage: "Password reset successfully.",
      }),
    [wrap]
  );

  const changePassword = useCallback(
    (input: ChangePasswordInput) =>
      wrap(() => authService.changePassword(input), {
        successMessage: "Password changed successfully.",
      }),
    [wrap]
  );

  const resendVerifyEmail = useCallback(
    (input: ResendVerifyEmailInput) =>
      wrap(() => authService.resendVerifyEmail(input), {
        successMessage: "Verification email sent.",
      }),
    [wrap]
  );

  const resendVerifyEmailWithPassword = useCallback(
    (input: ResendVerifyEmailWithPasswordInput) =>
      wrap(() => authService.resendVerifyEmailWithPassword(input), {
        successMessage: "Verification email sent.",
      }),
    [wrap]
  );

  const acceptInvitation = useCallback(
    (input: AcceptInviteInput) =>
      wrap(() => authService.acceptInvitation(input), {
        // successMessage intentionally omitted so page can render contextual success UI
      }),
    [wrap]
  );

    const session = useMemo(
    () => ({
      accessToken: store.accessToken,
      refreshToken: store.refreshToken,
      user: store.user,
      tenant: store.tenant,
      membership: store.membership,
      employee: store.employee,
      requiresTenantSelection: store.requiresTenantSelection,
      tenantChoices: store.tenantChoices,
      isHydrated: store.isHydrated,
    }),
    [
      store.accessToken,
      store.refreshToken,
      store.user,
      store.tenant,
      store.membership,
      store.employee,
      store.requiresTenantSelection,
      store.tenantChoices,
      store.isHydrated,
    ]
  );

  return {
    ...session,
    loading,
    error,
    clearError,

    wrap,
    hydrate,

    register,
    signupTenant,
    login,
    refresh,
    me,
    logout,

    verifyEmail,
    forgotPassword,
    resetPassword,
    changePassword,
    acceptInvitation,
    resendVerifyEmail,
    resendVerifyEmailWithPassword,
  };
}
