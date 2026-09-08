"use client";

import React, { useMemo, useState } from "react";
import Header from "./Header";
import Navbar from "./Navbar";

type PortalShellProps = {
  children?: React.ReactNode;
  theme: "light" | "dark";
  toggleTheme: () => void;
  activeLink: string;
  setActiveLink: (link: string) => void;
};

export default function PortalShell({ children, activeLink, setActiveLink }: PortalShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const headerTitle = useMemo(() => activeLink || "Dashboard", [activeLink]);

  return (
    <div className="relative h-dvh bg-gray-100 dark:bg-gray-900">
      <div className="sticky top-0 z-50">
        <Header title={headerTitle} subtitle="Admin Console" onOpenSidebar={() => setSidebarOpen(true)} />
      </div>

      <div className="flex h-[calc(100dvh-64px)] min-h-0">
        <div className="hidden h-full shrink-0 md:block">
          <Navbar
            activeLink={activeLink}
            setActiveLink={setActiveLink}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
            onNavigate={() => setSidebarOpen(false)}
          />
        </div>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
          {children}
        </main>
      </div>

      <Navbar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        activeLink={activeLink}
        setActiveLink={setActiveLink}
        collapsed={false}
        onNavigate={() => setSidebarOpen(false)}
      />
    </div>
  );
}
