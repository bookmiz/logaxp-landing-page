"use client";

import React, { useMemo, useState } from "react";
import Navbar from "./Navbar";
import Header from "./Header";

type LayoutProps = {
  children?: React.ReactNode;
  theme: "light" | "dark";
  toggleTheme: () => void;
  activeLink: string;
  setActiveLink: (link: string) => void;
};

export default function Layout({
  children,
  theme,
  toggleTheme,
  activeLink,
  setActiveLink,
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);       // mobile drawer
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop collapse

  const headerTitle = useMemo(() => activeLink || "Dashboard", [activeLink]);

  return (
    <div className="relative h-dvh bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50">
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          title={headerTitle}
          subtitle="Admin Console"
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      </div>

      {/* Body */}
      <div className="flex min-h-0 h-[calc(100dvh-64px)]">
        {/* Desktop sidebar */}
        <div className="hidden md:block h-full shrink-0">
          <Navbar
            activeLink={activeLink}
            setActiveLink={setActiveLink}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
            onNavigate={() => setSidebarOpen(false)}
          />
        </div>

        {/* Main scroll container */}
      <main className="flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar">
          {children}
        </main>
      </div>

      {/* Mobile drawer sidebar */}
      <Navbar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        activeLink={activeLink}
        setActiveLink={setActiveLink}
        collapsed={false}
        onToggleCollapse={() => {}}
        onNavigate={() => setSidebarOpen(false)}
      />
    </div>
  );
}