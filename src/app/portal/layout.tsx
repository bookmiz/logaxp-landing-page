"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/logaxp/stores/useAuthStore";
import PortalShell from "./PortalShell";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeLink, setActiveLink] = useState("Dashboard");
  const router = useRouter();

  const accessToken = useAuthStore((state) => state.accessToken);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const user = useAuthStore((state) => state.user);
  const tenant = useAuthStore((state) => state.tenant);
  const membership = useAuthStore((state) => state.membership);
  const requiresTenantSelection = useAuthStore((state) => state.requiresTenantSelection);

  useEffect(() => {
    if (!isHydrated) return;

    if (!accessToken) {
      router.replace("/admin/login");
      return;
    }

    if (!tenant && user?.isSiteAdmin) {
      router.replace("/site-admin");
      return;
    }

    if (requiresTenantSelection || !tenant || !membership) {
      router.replace(requiresTenantSelection ? "/admin/login" : "/auth/no-workspace");
    }
  }, [accessToken, isHydrated, membership, requiresTenantSelection, router, tenant, user?.isSiteAdmin]);

  if (!isHydrated) return null;
  if (!accessToken) return null;
  if (!tenant && user?.isSiteAdmin) return null;
  if (requiresTenantSelection || !tenant || !membership) return null;

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <PortalShell
        theme={theme}
        toggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
        activeLink={activeLink}
        setActiveLink={setActiveLink}
      >
        {children}
      </PortalShell>
    </div>
  );
}
