"use client";

import React, { useState } from "react";
import SiteAdminHeader from "./SiteAdminHeader";
import SiteAdminSidebar from "./SiteAdminSidebar";

type SiteAdminShellProps = {
  activeLink: string;
  setActiveLink: (value: string) => void;
  children: React.ReactNode;
};

export default function SiteAdminShell({
  activeLink,
  setActiveLink,
  children,
}: SiteAdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 dark:bg-[#070b08] dark:text-white">
      {/* IMPORTANT: items-stretch ensures sidebar stretches with main content */}
      <div className="flex min-h-dvh items-stretch">
        {/* Desktop sidebar */}
        <div className="hidden md:block shrink-0 self-stretch">
          {/* ✅ Remove h-screen so it can grow with content height */}
          <SiteAdminSidebar
            activeLink={activeLink}
            setActiveLink={setActiveLink}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((v) => !v)}
          />
        </div>

        {/* Mobile sidebar drawer */}
        <div className="md:hidden">
          <SiteAdminSidebar
            activeLink={activeLink}
            setActiveLink={setActiveLink}
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
            onNavigate={() => setMobileOpen(false)}
          />
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0 flex flex-col">
          <SiteAdminHeader onOpenSidebar={() => setMobileOpen(true)} />

          <main className="flex-1 p-4 sm:p-6">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
              <div className="p-4 sm:p-6">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}