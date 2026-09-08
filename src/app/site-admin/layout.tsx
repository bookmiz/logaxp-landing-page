"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/logaxp/stores/useAuthStore";
import SiteAdminShell from "@/logaxp/components/site-admin/SiteAdminShell";

function hasSiteAdminRole(user: unknown): boolean {
  if (!user || typeof user !== "object") return false;

  const u = user as Record<string, unknown>;

  // ✅ primary backend boolean
  if (u.isSiteAdmin === true) return true;

  // fallback shapes
  const role = typeof u.role === "string" ? u.role.toLowerCase() : "";
  const roleKey = typeof u.roleKey === "string" ? u.roleKey.toLowerCase() : "";
  const userType = typeof u.userType === "string" ? u.userType.toLowerCase() : "";

  const rolesArray = Array.isArray(u.roles) ? u.roles : [];
  const normalizedRoles = rolesArray
    .map((r) => (typeof r === "string" ? r.toLowerCase() : ""))
    .filter(Boolean);

  return (
    role === "siteadmin" ||
    role === "site_admin" ||
    roleKey === "siteadmin" ||
    roleKey === "site_admin" ||
    userType === "siteadmin" ||
    userType === "site_admin" ||
    normalizedRoles.includes("siteadmin") ||
    normalizedRoles.includes("site_admin")
  );
}

function getSiteAdminActiveLink(pathname: string): string {
  if (pathname.startsWith("/site-admin/security")) return "Security";
  if (pathname.startsWith("/site-admin/users")) return "Users";
  if (pathname.startsWith("/site-admin/tenants")) return "Tenants";
  if (pathname.startsWith("/site-admin/settings")) return "Settings";
  return "Overview";
}

export default function SiteAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [activeLink, setActiveLink] = useState("Overview");

  const accessToken = useAuthStore((s) => s.accessToken);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const user = useAuthStore((s) => s.user);

  const isSiteAdmin = useMemo(() => hasSiteAdminRole(user), [user]);

  useEffect(() => {
    setActiveLink(getSiteAdminActiveLink(pathname));
  }, [pathname]);

  useEffect(() => {
    if (!isHydrated) return;

    if (!accessToken) {
      router.replace("/admin/login");
      return;
    }

    if (!isSiteAdmin) {
      router.replace("/portal");
      return;
    }
  }, [isHydrated, accessToken, isSiteAdmin, router]);

  if (!isHydrated) return null;
  if (!accessToken) return null;
  if (!isSiteAdmin) return null;

  return (
    <SiteAdminShell activeLink={activeLink} setActiveLink={setActiveLink}>
      {children}
    </SiteAdminShell>
  );
}