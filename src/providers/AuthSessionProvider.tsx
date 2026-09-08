"use client";

import * as React from "react";

import { authService } from "@/logaxp/lib/auth/authService";
import { tokenStorage } from "@/logaxp/lib/auth/tokenStorage";
import { mapMeResponseToIdentity } from "@/logaxp/lib/auth/sessionMapper";
import { useAuthStore } from "@/logaxp/stores/useAuthStore";

function isTenantSelectionResponse(value: unknown): value is {
  requiresTenantSelection: true;
  tenants: Array<{ tenantId: string; tenantSlug: string; tenantName: string }>;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { requiresTenantSelection?: unknown }).requiresTenantSelection === true &&
    Array.isArray((value as { tenants?: unknown }).tenants)
  );
}

export default function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const didRun = React.useRef(false);

  React.useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    async function hydrateSession() {
      const store = useAuthStore.getState();

      try {
        let accessToken = tokenStorage.getAccessToken();

        if (accessToken) {
          store.setTokens(accessToken, null);
        } else {
          const refreshed = await authService.refresh();

          if (isTenantSelectionResponse(refreshed)) {
            tokenStorage.clear();
            store.clearSession();
            store.setTenantSelection(refreshed.tenants);
            return;
          }

          accessToken = refreshed.accessToken ?? null;

          if (accessToken) {
            tokenStorage.setTokens(accessToken, undefined);
            store.setTokens(accessToken, null);
          }
        }

        if (accessToken) {
          const me = await authService.me();
          store.setIdentity(mapMeResponseToIdentity(me));
        }
      } catch {
        tokenStorage.clear();
        useAuthStore.getState().clearSession();
      } finally {
        // Hydration updates the shared store, so it must finish even when
        // Strict Mode runs effect cleanup before the request completes.
        useAuthStore.getState().markHydrated();
      }
    }

    void hydrateSession();

  }, []);

  return <>{children}</>;
}
