"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store/useAuthStore";

/* icons (keep yours) */
const Icon = {
  Dashboard: ({ className = "h-5 w-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 13h7V4H4v9zM13 20h7V11h-7v9zM13 4h7v5h-7V4zM4 16h7v4H4v-4z" />
    </svg>
  ),
  Employees: ({ className = "h-5 w-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 11a4 4 0 10-8 0 4 4 0 008 0z" />
      <path d="M4 20a8 8 0 0116 0" />
    </svg>
  ),
  Recruitment: ({ className = "h-5 w-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 12l2 2 4-4" />
      <path d="M7 20h10a2 2 0 002-2V7l-5-5H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  Time: ({ className = "h-5 w-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </svg>
  ),
  Payroll: ({ className = "h-5 w-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 7h10v10H7V7z" />
      <path d="M9 3h6M9 21h6" />
      <path d="M12 10v4" />
      <path d="M10.5 12h3" />
    </svg>
  ),
  Leave: ({ className = "h-5 w-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 3h10v6H7V3z" />
      <path d="M6 9h12v12H6V9z" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </svg>
  ),
  Performance: ({ className = "h-5 w-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19h16" />
      <path d="M7 15l3-3 3 2 4-6" />
    </svg>
  ),
  Reports: ({ className = "h-5 w-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 17v-2m3 2v-4m3 4v-6" />
      <path d="M7 21h10a2 2 0 002-2V7l-5-5H7a2 2 0 00-2 2v15a2 2 0 002 2z" />
    </svg>
  ),
  Settings: ({ className = "h-5 w-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" />
      <path d="M19.4 15a7.8 7.8 0 00.1-1l2-1.2-2-3.4-2.3.6a8 8 0 00-1.7-1l-.3-2.4H11l-.3 2.4a8 8 0 00-1.7 1l-2.3-.6-2 3.4L6.7 14a7.8 7.8 0 00.1 1 7.8 7.8 0 00-.1 1l-2 1.2 2 3.4 2.3-.6a8 8 0 001.7 1l.3 2.4h4l.3-2.4a8 8 0 001.7-1l2.3.6 2-3.4-2-1.2a7.8 7.8 0 00-.1-1z" />
    </svg>
  ),
  Logout: ({ className = "h-5 w-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 21V3" />
    </svg>
  ),
  Collapse: ({ className = "h-5 w-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
  Expand: ({ className = "h-5 w-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18l6-6-6-6" />
    </svg>
  ),
};

type NavbarProps = {
  activeLink: string;
  setActiveLink: (link: string) => void;

  /** desktop collapse */
  collapsed?: boolean;
  onToggleCollapse?: () => void;

  /** mobile drawer */
  mobileOpen?: boolean;
  onMobileClose?: () => void;

  /** optional: close drawer after nav */
  onNavigate?: () => void;
};

type NavItem = { name: string; path: string; icon: React.ReactNode };

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function NavButton({
  collapsed,
  active,
  icon,
  label,
  onClick,
}: {
  collapsed?: boolean;
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "group w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a3d900]/35",
        active
          ? "bg-[#a3d900] text-black shadow-[0_12px_28px_rgba(163,217,0,0.25)]"
          : "text-white/70 hover:bg-white/5 hover:text-white"
      )}
    >
      <span
        className={cx(
          "grid place-items-center h-10 w-10 rounded-2xl border transition",
          active ? "bg-black/10 border-black/10" : "bg-white/[0.04] border-white/10 group-hover:bg-white/[0.07]"
        )}
      >
        {icon}
      </span>

      {!collapsed && (
        <span className="text-[13px] font-semibold tracking-wide">{label}</span>
      )}
    </button>
  );
}

function SidebarShell({
  children,
  collapsed,
}: {
  children: React.ReactNode;
  collapsed?: boolean;
}) {
  return (
    <div
      className={cx(
        "h-full rounded-[28px] overflow-hidden relative",
        "border border-white/10 bg-gradient-to-b from-[#070D16] via-[#060C14] to-[#050A12]",
        "shadow-[0_24px_70px_rgba(0,0,0,0.45)]",
        collapsed ? "w-[96px]" : "w-[292px]"
      )}
    >
      {/* soft orbs, subtle */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#a3d900]/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#a3d900]/6 blur-3xl" />
      <div className="relative h-full flex flex-col">{children}</div>
    </div>
  );
}

export default function Navbar({
  activeLink,
  setActiveLink,
  collapsed = false,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
  onNavigate,
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { clearAuth, user } = useAuthStore();

  const items = useMemo<NavItem[]>(
    () => [
      { name: "Dashboard", path: "/portal", icon: <Icon.Dashboard /> },
      { name: "Employees", path: "/portal/usersList", icon: <Icon.Employees /> },
      { name: "Recruitment", path: "/portal/create-user", icon: <Icon.Recruitment /> },
      { name: "Time & Attendance", path: "/portal/time-attendance", icon: <Icon.Time /> },
      { name: "Payroll", path: "/portal/payroll", icon: <Icon.Payroll /> },
      { name: "Leave Requests", path: "/portal/leave-requests", icon: <Icon.Leave /> },
      { name: "Performance", path: "/portal/performance", icon: <Icon.Performance /> },
      { name: "Reports", path: "/portal/reports", icon: <Icon.Reports /> },
      { name: "Settings", path: "/portal/settings", icon: <Icon.Settings /> },
    ],
    []
  );

  // keep activeLink in sync with route (optional)
  useEffect(() => {
    const seg = pathname.split("/")[2] ?? ""; // /portal/<seg>
    const map: Record<string, string> = {
      "": "Dashboard",
      employees: "Employees",
      recruitment: "Recruitment",
      "time-attendance": "Time & Attendance",
      payroll: "Payroll",
      "leave-requests": "Leave Requests",
      performance: "Performance",
      reports: "Reports",
      settings: "Settings",
    };
    const next = map[seg] ?? "Dashboard";
    if (next && next !== activeLink) setActiveLink(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const go = (path: string, name: string) => {
    setActiveLink(name);
    router.push(path);
    onNavigate?.();
    onMobileClose?.();
  };

  const logout = () => {
    clearAuth();
    onMobileClose?.();
    router.push("/admin/login");
  };

  const initials =
    user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "LX";

  const SidebarContent = (
    <SidebarShell collapsed={collapsed}>
      {/* Top brand row + collapse */}
      <div className={cx("px-4 pt-5 pb-4", collapsed ? "px-3" : "px-5")}>
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-[#a3d900] text-black grid place-items-center shadow-[0_14px_34px_rgba(163,217,0,0.22)]">
            <span className="font-black text-lg">L</span>
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <div className="text-white font-bold leading-tight text-lg">LogaXP</div>
              <div className="text-[11px] text-white/55 leading-tight">HR Suite • Admin</div>
            </div>
          )}

          {/* Collapse toggle (desktop) */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className={cx(
                "ml-auto h-10 w-10 rounded-2xl border border-white/10 bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.07] transition grid place-items-center",
                collapsed && "ml-0"
              )}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? <Icon.Expand /> : <Icon.Collapse />}
            </button>
          )}
        </div>

        <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Nav (scrollable inside sidebar) */}
      <div className="flex-1 px-3 pb-3 overflow-y-auto no-scrollbar">
        <div className="space-y-2">
          {items.map((it) => (
            <NavButton
              key={it.name}
              collapsed={collapsed}
              label={it.name}
              icon={it.icon}
              active={activeLink === it.name}
              onClick={() => go(it.path, it.name)}
            />
          ))}
        </div>
      </div>

      {/* Bottom user card */}
      <div className={cx("p-4", collapsed ? "p-3" : "p-4")}>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-3 flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#a3d900]/20 to-transparent border border-white/10 grid place-items-center text-white font-bold">
            {initials}
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-white truncate">{user?.name || "Admin"}</div>
              <div className="text-[11px] text-white/55 truncate">Administrator</div>
            </div>
          )}

          <button
            type="button"
            onClick={logout}
            className="h-11 w-11 rounded-2xl grid place-items-center border border-white/10 bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] transition"
            aria-label="Logout"
            title="Logout"
          >
            <Icon.Logout />
          </button>
        </div>
      </div>
    </SidebarShell>
  );

  // Desktop render (when used in md:block wrapper)
  if (mobileOpen === undefined) {
    return <aside className={cx("h-full p-4", collapsed ? "w-[120px]" : "w-[324px]")}>{SidebarContent}</aside>;
  }

  // Mobile drawer render
  return (
    <AnimatePresence>
      {mobileOpen ? (
        <>
          {/* Overlay */}
          <motion.button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-[60] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed left-0 top-0 z-[70] h-dvh p-4"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            {SidebarContent}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}