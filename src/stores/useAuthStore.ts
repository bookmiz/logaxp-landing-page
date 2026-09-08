// src/stores/useAuthStore.ts
"use client";

import { create } from "zustand";
import type { AuthMembership, AuthTenant, AuthUser, AuthEmployee } from "@/logaxp/lib/auth/auth.types";

export type TenantChoice = {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
};

type SessionPayload = {
  user: AuthUser;
  tenant: AuthTenant | null;          // ✅ can be null (platform site-admin)
  membership: AuthMembership | null;  // ✅ can be null (platform site-admin)
  employee?: AuthEmployee | null;     // ✅ add
  accessToken: string;
  refreshToken?: string | null;       // ✅ optional; null for cookie-based refresh
};

type AuthState = {
  // tokens
  accessToken: string | null;
  refreshToken: string | null; // keep for compatibility; in cookie-refresh: always null

  // identity
  user: AuthUser | null;
  tenant: AuthTenant | null;
  membership: AuthMembership | null;
  employee: AuthEmployee | null; // ✅ add

  // tenant selection flow
  requiresTenantSelection: boolean;
  tenantChoices: TenantChoice[];

  // hydration flag (your UI guards)
  isHydrated: boolean;

  // actions
  setTokens: (accessToken: string | null, refreshToken?: string | null) => void;
  setAccessToken: (accessToken: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setUser: (user: AuthUser | null) => void;

  setIdentity: (p: {
    user: AuthUser | null;
    tenant: AuthTenant | null;
    membership: AuthMembership | null;
    employee: AuthEmployee | null; // ✅ add
  }) => void;

  setSession: (s: SessionPayload) => void;

  setTenantSelection: (choices: TenantChoice[]) => void;
  clearTenantSelection: () => void;

  clearSession: () => void;
  clearAuth: () => void;
  markHydrated: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,

  user: null,
  tenant: null,
  membership: null,
  employee: null, // ✅ add

  requiresTenantSelection: false,
  tenantChoices: [],

  isHydrated: false,

  setTokens: (accessToken, refreshToken) =>
    set((s) => ({
      accessToken,
      refreshToken: typeof refreshToken === "undefined" ? s.refreshToken : refreshToken,
    })),

  setAccessToken: (accessToken) => set({ accessToken }),
  setRefreshToken: (refreshToken) => set({ refreshToken }),
  setUser: (user) => set({ user }),

  setIdentity: ({ user, tenant, membership, employee }) =>
    set({
      user,
      tenant,
      membership,
      employee, // ✅ add
    }),

  setSession: (session) =>
    set({
      accessToken: session.accessToken,
      refreshToken:
        typeof session.refreshToken === "undefined" ? get().refreshToken : session.refreshToken,

      user: session.user,
      tenant: session.tenant,
      membership: session.membership,
      employee: session.employee ?? null, // ✅ add

      requiresTenantSelection: false,
      tenantChoices: [],
    }),

  setTenantSelection: (choices) =>
    set({
      requiresTenantSelection: true,
      tenantChoices: choices,

      // reset current session until user chooses
      accessToken: null,
      refreshToken: null,
      user: null,
      tenant: null,
      membership: null,
      employee: null, // ✅ add
    }),

  clearTenantSelection: () =>
    set({
      requiresTenantSelection: false,
      tenantChoices: [],
    }),

  clearSession: () =>
    set({
      accessToken: null,
      refreshToken: null,

      user: null,
      tenant: null,
      membership: null,
      employee: null, // ✅ add

      requiresTenantSelection: false,
      tenantChoices: [],
    }),

  clearAuth: () => get().clearSession(),

  markHydrated: () => set({ isHydrated: true }),
}));
