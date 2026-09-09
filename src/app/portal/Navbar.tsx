"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import {
  BadgeDollarSign,
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock3,
  FileText,
  FlaskConical,
  Globe2,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";
import { PORTAL_NAV_CONFIG, type PortalNavConfig, type PortalChildNavConfig, type PortalNavIconKey } from "@/logaxp/config/portal";
import { useAuth } from "@/logaxp/hooks/useAuth";
import { getMembershipLabel, hasAnyCapability, hasAnyRole } from "@/logaxp/lib/auth/portalAuthz";
import type { AuthMembership } from "@/logaxp/lib/auth/auth.types";
import { useAuthStore } from "@/logaxp/stores/useAuthStore";

type NavbarProps = {
  activeLink: string;
  setActiveLink: (link: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onNavigate?: () => void;
};

type VisibleChild = PortalChildNavConfig;
type VisibleNavItem = Omit<PortalNavConfig, "children"> & {
  children: VisibleChild[];
};

type IconComponent = React.ComponentType<{ className?: string }>;

const KNOWN_PORTAL_ROUTES = new Set([
  "/portal",
  "/portal/analytics",
  "/portal/api-keys",
  "/portal/backlog",
  "/portal/billings",
  "/portal/boards",
  "/portal/create-user",
  "/portal/domains",
  "/portal/employees",
  "/portal/employees/new",
  "/portal/employees/table",
  "/portal/leave",
  "/portal/leave/calendar",
  "/portal/leave/me",
  "/portal/leave/pending",
  "/portal/manager",
  "/portal/manager/leave-requests",
  "/portal/manager/my-team",
  "/portal/manager/time-clocks",
  "/portal/manager/timesheets",
  "/portal/members",
  "/portal/onboarding",
  "/portal/onboarding/instances",
  "/portal/onboarding/templates",
  "/portal/org-structure",
  "/portal/org-structure/cost-centers",
  "/portal/org-structure/locations",
  "/portal/org-structure/org-units",
  "/portal/org-structure/org-units/tree",
  "/portal/org-structure/positions",
  "/portal/projects",
  "/portal/rbac",
  "/portal/reports",
  "/portal/schedule",
  "/portal/schedule/assignments",
  "/portal/schedule/availability",
  "/portal/schedule/availability/me",
  "/portal/schedule/me",
  "/portal/schedule/shifts",
  "/portal/schedule/templates",
  "/portal/settings",
  "/portal/settings/security/change-password",
  "/portal/settings/team",
  "/portal/sprints",
  "/portal/templates",
  "/portal/testing",
  "/portal/testing/cases",
  "/portal/testing/docs",
  "/portal/testing/plans",
  "/portal/testing/runs",
  "/portal/testing/suites",
  "/portal/time-attendance",
  "/portal/time-attendance/clocks",
  "/portal/time-attendance/entries",
  "/portal/time-attendance/timers",
  "/portal/time/payroll",
  "/portal/time/payroll/approvals",
  "/portal/time/payroll/overtime",
  "/portal/time/payroll/pay-periods",
  "/portal/time/payroll/run",
  "/portal/time/payroll/settings",
  "/portal/time/payroll/timesheets",
  "/portal/usersList",
  "/portal/work",
  "/portal/work-items",
  "/portal/workflows",
]);

const ICONS: Record<PortalNavIconKey, IconComponent> = {
  Dashboard: LayoutDashboard,
  Employees: Users,
  Time: Clock3,
  Leave: CalendarDays,
  Settings,
  Users,
  UserCog,
  UserPlus,
  Calendar: CalendarDays,
  Clock: Clock3,
  Dollar: BadgeDollarSign,
  FileText,
  TrendingUp: BarChart3,
  Shield: ShieldCheck,
  Globe: Globe2,
  Flask: FlaskConical,
  DollarSign: BadgeDollarSign,
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function routeExists(path: string) {
  return KNOWN_PORTAL_ROUTES.has(path);
}

function isActivePath(pathname: string, path: string) {
  if (path === "/portal") return pathname === "/portal";
  return pathname === path || pathname.startsWith(`${path}/`);
}

function canSeeNavItem(item: PortalNavConfig | PortalChildNavConfig, membership: AuthMembership | null) {
  if (!membership) return false;
  if (item.ownerOnly && !membership.isOwner) return false;
  if (!hasAnyRole(membership, item.requiredAnyRoles)) return false;
  return hasAnyCapability(membership, item.requiredAnyCapabilities);
}

function iconFor(iconKey?: PortalNavIconKey, className = "h-4 w-4") {
  const Icon = iconKey ? ICONS[iconKey] : FileText;
  return <Icon className={className} strokeWidth={2.1} />;
}

function buildVisibleNav(membership: AuthMembership | null): VisibleNavItem[] {
  return PORTAL_NAV_CONFIG.map((item) => {
    const children = (item.children ?? []).filter((child) => canSeeNavItem(child, membership) && routeExists(child.path));
    return { ...item, children };
  }).filter((item) => {
    const itemVisible = canSeeNavItem(item, membership) && routeExists(item.path);
    return itemVisible || item.children.length > 0;
  });
}

function findActiveLabel(pathname: string, items: VisibleNavItem[]) {
  const allItems = items.flatMap((item) => [item, ...item.children]);
  const match = allItems
    .filter((item) => isActivePath(pathname, item.path))
    .sort((a, b) => b.path.length - a.path.length)[0];

  return match?.name ?? "Dashboard";
}

function getActiveGroupNames(pathname: string, items: VisibleNavItem[]) {
  return items.filter((item) => isActivePath(pathname, item.path) || item.children.some((child) => isActivePath(pathname, child.path))).map((item) => item.name);
}

function TopNavButton({
  item,
  active,
  collapsed,
  open,
  onClick,
}: {
  item: VisibleNavItem;
  active: boolean;
  collapsed?: boolean;
  open: boolean;
  onClick: () => void;
}) {
  const hasChildren = item.children.length > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "portal-nav-parent group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9bd80f]/35",
        active ? "is-active" : "text-white/72 hover:bg-white/[0.06] hover:text-white"
      )}
      aria-label={collapsed ? item.name : undefined}
      aria-expanded={hasChildren && !collapsed ? open : undefined}
      title={collapsed ? item.name : undefined}
    >
      <span
        className={cx(
          "portal-nav-icon grid h-5 w-5 shrink-0 place-items-center",
          active ? "text-[#25422f]" : "text-[#a2b8ad]"
        )}
      >
        {iconFor(item.iconKey)}
      </span>

      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 text-[13px] font-medium">{item.name}</span>
          {hasChildren ? (
            <ChevronDown className={cx("h-4 w-4 shrink-0 transition", open ? "rotate-180" : "rotate-0")} />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 opacity-35 transition group-hover:translate-x-0.5 group-hover:opacity-80" />
          )}
        </>
      )}
    </button>
  );
}

function ChildNavButton({
  child,
  active,
  onClick,
}: {
  child: VisibleChild;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "portal-nav-child group ml-[22px] flex w-[calc(100%-22px)] items-center gap-3 rounded-md px-3 py-2 text-left transition",
        active ? "is-active" : "text-[#a8bcb0] hover:bg-white/[0.06] hover:text-white"
      )}
    >
      <span className={cx("h-1.5 w-1.5 shrink-0 rounded-full", active ? "bg-[#9bd80f]" : "bg-white/24 group-hover:bg-[#9bd80f]")} />
      <span className="min-w-0 flex-1 truncate text-[12px] font-normal">{child.name}</span>
      {child.iconKey ? <span className="opacity-55">{iconFor(child.iconKey, "h-3.5 w-3.5")}</span> : null}
    </button>
  );
}

function SidebarShell({ children, collapsed }: { children: React.ReactNode; collapsed?: boolean }) {
 return <div className={"portal-sidebar " + (collapsed ? "is-collapsed" : "")}>{children}</div>;
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
  const user = useAuthStore((state) => state.user);
  const membership = useAuthStore((state) => state.membership);
  const { logout: signOut } = useAuth();
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const isMobileDrawer = mobileOpen !== undefined;

  const items = useMemo(() => buildVisibleNav(membership), [membership]);

  useEffect(() => {
    const next = findActiveLabel(pathname, items);
    if (next !== activeLink) setActiveLink(next);

    const activeGroups = getActiveGroupNames(pathname, items);
    if (activeGroups.length) {
      setOpenGroups((current) => Array.from(new Set([...current, ...activeGroups])));
    }
  }, [activeLink, items, pathname, setActiveLink]);

  useEffect(() => {
    if (!openGroups.length && items.length) {
      setOpenGroups(getActiveGroupNames(pathname, items));
    }
  }, [items, openGroups.length, pathname]);

  const go = (path: string, name: string) => {
    setActiveLink(name);
    router.push(path);
    onNavigate?.();
    onMobileClose?.();
  };

  const toggleGroupAndNavigate = (item: VisibleNavItem) => {
    setOpenGroups((current) =>
      current.includes(item.name) ? current.filter((name) => name !== item.name) : [...current, item.name]
    );
    go(item.path, item.name);
  };

  const logout = () => {
    void signOut().catch(() => undefined);
    onMobileClose?.();
    router.replace("/admin/login");
  };

  const displayName = user?.email?.split("@")[0] || "Admin";
  const initials =
    displayName
      .split(/[.\s_-]+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "LX";
  const memberLabel = getMembershipLabel(membership);

  const SidebarContent = (
    <SidebarShell collapsed={collapsed}>
      <div className={cx("portal-sidebar-brand", collapsed && "is-collapsed")}>
        <div className={cx("flex items-center gap-2", collapsed && "flex-col")}>
          <div className="portal-brand-avatar">
            <span className="text-base font-semibold">L</span>
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-lg font-black leading-tight text-white">LogaXP</div>
              <div className="truncate text-[11px] font-medium leading-tight text-white/55">{memberLabel}</div>
            </div>
          )}

          {onToggleCollapse && !isMobileDrawer ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              className={cx(
                "ml-auto grid h-7 w-7 place-items-center rounded-md text-white/70 transition hover:bg-white/[0.08] hover:text-white",
                collapsed && "ml-0"
              )}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
            </button>
          ) : null}
        </div>

        <div className="mt-4 h-px w-full bg-white/10" />
      </div>

      <div className="portal-nav-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        <div className="space-y-1.5">
          {items.map((item) => {
            const groupOpen = openGroups.includes(item.name);
            const groupActive = isActivePath(pathname, item.path) || item.children.some((child) => isActivePath(pathname, child.path));

            return (
              <div key={item.name}>
                <TopNavButton
                  item={item}
                  active={groupActive}
                  collapsed={collapsed}
                  open={groupOpen}
                  onClick={() => toggleGroupAndNavigate(item)}
                />

                <AnimatePresence initial={false}>
                  {!collapsed && groupOpen && item.children.length > 0 ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1 pb-1.5 pt-1.5">
                        {item.children.map((child) => (
                          <ChildNavButton
                            key={`${item.name}-${child.path}`}
                            child={child}
                            active={isActivePath(pathname, child.path)}
                            onClick={() => go(child.path, child.name)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      <div className={cx("portal-sidebar-account", collapsed && "is-collapsed")}>
        <div className={cx("flex items-center gap-2", collapsed && "flex-col")}>
          <div className="portal-user-avatar">
            {initials}
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-white">{displayName}</div>
              <div className="truncate text-[11px] text-white/55">{memberLabel}</div>
            </div>
          )}

          <button
            type="button"
            onClick={logout}
            className="grid h-8 w-8 place-items-center rounded-md text-white/70 hover:bg-white/10"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </SidebarShell>
  );

  if (mobileOpen === undefined) {
    return <aside className={cx("h-full", collapsed ? "w-[72px]" : "w-[224px]")}>{SidebarContent}</aside>;
  }

 return <Dialog.Root open={mobileOpen} onOpenChange={open => {if(!open) onMobileClose?.();}}><Dialog.Portal><Dialog.Overlay className="portal-drawer-overlay"/><Dialog.Content className="portal-mobile-drawer" aria-describedby={undefined} onCloseAutoFocus={event=>{event.preventDefault();document.getElementById("portal-menu-trigger")?.focus();}}><Dialog.Title className="sr-only">Workspace navigation</Dialog.Title><Dialog.Close className="portal-drawer-close" aria-label="Close sidebar">×</Dialog.Close>{SidebarContent}</Dialog.Content></Dialog.Portal></Dialog.Root>;
}
