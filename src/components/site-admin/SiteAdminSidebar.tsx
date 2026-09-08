"use client";

import React, { useEffect, useMemo, useState, useRef, } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  AppWindow,
  LifeBuoy,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronRight,
  Check,
} from "lucide-react";
import { useAuth } from "@/logaxp/hooks/useAuth";
import { useAuthStore } from "@/logaxp/stores/useAuthStore";

type SidebarProps = {
  activeLink: string;
  setActiveLink: (link: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onNavigate?: () => void;
};

type Badge = {
  text: string;
  variant?: "success" | "warning" | "info" | "danger" | "beta";
};

type NavChild = {
  name: string;
  path: string;
  matchPrefixes?: string[];
  badge?: Badge;
};

type NavItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: Badge;
  matchPrefixes?: string[];
  children?: NavChild[];
};

const cx = (...classes: (string | boolean | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

const badgeVariants = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
  beta: "bg-violet-50 text-violet-700 border-violet-200",
};

function SectionLabel({
  collapsed,
  children,
}: {
  collapsed?: boolean;
  children: React.ReactNode;
}) {
  if (collapsed) return null;
  return (
    <div className="px-3 pt-4 pb-2">
      <p className="text-[11px] font-semibold tracking-widest text-slate-700 uppercase">
        {children}
      </p>
    </div>
  );
}

function NavButton({
  collapsed,
  active,
  icon,
  label,
  badge,
  rightSlot,
  onClick,
}: {
  collapsed?: boolean;
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  badge?: Badge;
  rightSlot?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cx(
        "w-full relative flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
        "text-slate-700 hover:bg-slate-100",
        active && "bg-slate-200 text-slate-900",
        collapsed && "justify-center px-0"
      )}
    >
      <span
        className={cx(
          "grid h-8 w-8 place-items-center rounded-md",
          active ? "text-slate-900" : "text-slate-600"
        )}
      >
        {icon}
      </span>

      {!collapsed && (
        <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
          <span className="truncate">{label}</span>

          <div className="flex items-center gap-2">
            {badge && (
              <span
                className={cx(
                  "shrink-0 rounded-full border px-2 py-[2px] text-[10px] font-semibold",
                  badgeVariants[badge.variant || "info"]
                )}
              >
                {badge.text}
              </span>
            )}
            {rightSlot}
          </div>
        </div>
      )}

      {collapsed && badge && (
        <span
          className={cx(
            "absolute right-1 top-1 h-2 w-2 rounded-full",
            badge.variant === "success"
              ? "bg-emerald-500"
              : badge.variant === "warning"
              ? "bg-amber-500"
              : badge.variant === "danger"
              ? "bg-rose-500"
              : badge.variant === "beta"
              ? "bg-violet-500"
              : "bg-blue-500"
          )}
        />
      )}
    </button>
  );
}

function isMatch(
  pathname: string,
  item: { path: string; matchPrefixes?: string[] }
) {
  const prefixes = item.matchPrefixes ?? [item.path];
  return prefixes.some((prefix) => {
    if (prefix === "/site-admin") return pathname === "/site-admin";
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

export default function SiteAdminSidebar({
  activeLink,
  setActiveLink,
  collapsed = false,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
  onNavigate,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, loading: authLoading } = useAuth();
  const user = useAuthStore((s) => s.user);

  // ✅ dropdown open state per parent item
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const items = useMemo<NavItem[]>(
    () => [
      {
        name: "Overview",
        path: "/site-admin",
        icon: <LayoutDashboard className="h-4 w-4" />,
        matchPrefixes: ["/site-admin"],
      },
      {
        name: "Tenants",
        path: "/site-admin/tenants",
        icon: <Building2 className="h-4 w-4" />,
        matchPrefixes: ["/site-admin/tenants"],
      },
      {
        name: "Platform Users",
        path: "/site-admin/users",
        icon: <Users className="h-4 w-4" />,
        matchPrefixes: ["/site-admin/users"],
      },
      {
        name: "Billing & Payouts",
        path: "/site-admin/billings",
        icon: <CreditCard className="h-4 w-4" />,
        matchPrefixes: ["/site-admin/billings"],
        badge: { text: "NEW", variant: "success" },
      },

      // ✅ Dropdown
      {
        name: "Security",
        path: "/site-admin/security",
        icon: <AppWindow className="h-4 w-4" />,
        matchPrefixes: ["/site-admin/apps"],
        children: [
          {
            name: "Security",
            path: "/site-admin/security",
            matchPrefixes: ["/site-admin/security"],
          },
          {
            name: "Audit Logs",
            path: "/site-admin/audit",
            matchPrefixes: ["/site-admin/audit"],
            badge: { text: "LIVE", variant: "info" },
          },
          {
            name: "Projects",
            path: "/site-admin/showcases",
            matchPrefixes: ["/site-admin/system-health"],
          },
          {name: "Articles", path: "/site-admin/articles"},
          {name: "Sales enquiries", path: "/site-admin/enquiries"},
        ],
      },

      // ✅ Dropdown
      {
        name: "System",
        path: "/site-admin/system",
        icon: <AppWindow className="h-4 w-4" />,
        matchPrefixes: ["/site-admin/system"],
        children: [
          {
            name: "Moderation",
            path: "/site-admin/moderation",
            matchPrefixes: ["/site-admin/moderation"],
          },
          {
            name: "Storage",
            path: "/site-admin/storage",
            matchPrefixes: ["/site-admin/storage"],
            badge: { text: "LIVE", variant: "info" },
          },
          {
            name: "Violations",
            path: "/site-admin/violations",
            matchPrefixes: ["/site-admin/violations"],
          },
        ],
      },

      {
        name: "Support",
        path: "/site-admin/support",
        icon: <LifeBuoy className="h-4 w-4" />,
        matchPrefixes: ["/site-admin/support"],
      },
      {
        name: "Settings",
        path: "/site-admin/settings",
        icon: <Settings className="h-4 w-4" />,
        matchPrefixes: ["/site-admin/settings"],
      },
    ],
    []
  );

  const sections = useMemo(() => {
    const byName = (n: string) => items.find((x) => x.name === n);
    return [
      {
        title: "PROJECT",
        items: [
          byName("Overview"),
          byName("Tenants"),
          byName("Platform Users"),
          byName("Billing & Payouts"),
        ].filter(Boolean) as NavItem[],
      },
      {
        title: "Security",
        items: [byName("Security")].filter(Boolean) as NavItem[],
      },
      {
        title: "SYSTEM",
        items: [byName("System")].filter(Boolean) as NavItem[],
      },
      {
        title: "SUPPORT",
        items: [byName("Support"), byName("Settings")].filter(Boolean) as NavItem[],
      },
    ];
  }, [items]);

  // ✅ Enhanced pathname sync: matches parent OR child
  useEffect(() => {
    if (!pathname.startsWith("/site-admin")) return;

    let matchedName: string | null = null;
    let matchedParent: string | null = null;

    for (const item of items) {
      if (isMatch(pathname, item)) {
        matchedName = item.name;
        break;
      }

      if (item.children?.length) {
        const child = item.children.find((c) => isMatch(pathname, c));
        if (child) {
          matchedName = child.name;
          matchedParent = item.name;
          break;
        }
      }
    }

    if (!matchedName) matchedName = items[0]?.name ?? "Overview";

    if (matchedName !== activeLink) setActiveLink(matchedName);

    // auto-open dropdown if child route is active
    if (matchedParent) {
      setOpenGroups((prev) => ({ ...prev, [matchedParent]: true }));
    }
  }, [pathname, items, activeLink, setActiveLink]);

  const handleNavigate = (path: string, name: string) => {
    if (name !== activeLink) setActiveLink(name);
    router.push(path);
    onNavigate?.();
    onMobileClose?.();
  };

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/admin/login");
    } finally {
      onMobileClose?.();
    }
  };

  const tenantOptions = useMemo(
  () => [
    { id: "t1", name: "LogaXP" },
    { id: "t2", name: "Christopher" },
    { id: "t3", name: "Production" },
    { id: "t4", name: "Staging" },
  ],
  []
);

const [tenantOpen, setTenantOpen] = useState(false);
const [selectedTenantId, setSelectedTenantId] = useState<string>(tenantOptions[0]?.id ?? "t1");

const selectedTenant = tenantOptions.find((t) => t.id === selectedTenantId) ?? tenantOptions[0];

const tenantRef = useRef<HTMLDivElement | null>(null);

// close on outside click + Escape
useEffect(() => {
  const onDown = (e: MouseEvent) => {
    if (!tenantRef.current) return;
    if (!tenantRef.current.contains(e.target as Node)) setTenantOpen(false);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") setTenantOpen(false);
  };
  document.addEventListener("mousedown", onDown);
  document.addEventListener("keydown", onKey);
  return () => {
    document.removeEventListener("mousedown", onDown);
    document.removeEventListener("keydown", onKey);
  };
}, []);

  const displayName = user?.email?.split("@")[0] || "Site Admin";

  const sidebarContent = (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 264 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className={cx("relative h-full flex flex-col bg-gray-50 border-r border-slate-200")}
    >
    {/* Header */}
<div className={cx("px-3 pt-3", collapsed ? "pb-2" : "pb-3")}>
  <div className={cx("flex items-center gap-2", collapsed && "justify-center")}>
    <div className="grid h-9 w-9 place-items-center rounded-md bg-emerald-50 border border-emerald-200">
      <Image
        src="/svg/icon.svg"
        alt="LogaXP"
        width={18}
        height={18}
        className="opacity-90"
      />
    </div>

    {/* Tenant switcher */}
    {!collapsed && (
      <div ref={tenantRef} className="relative flex-1">
        <button
          type="button"
          onClick={() => setTenantOpen((v) => !v)}
          className={cx(
            "w-full flex items-center justify-between",
            "rounded-md border border-slate-200 bg-white px-2 py-2",
            "text-sm text-slate-800 hover:bg-slate-50",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          )}
          aria-haspopup="menu"
          aria-expanded={tenantOpen}
        >
          <span className="min-w-0 flex flex-col text-left">
            <span className="truncate font-medium">{selectedTenant?.name ?? "Select tenant"}</span>
            <span className="truncate text-[11px] font-bold uppercase text-gray-200">Workspace</span>
          </span>

          <motion.span
            animate={{ rotate: tenantOpen ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="ml-2 inline-flex text-slate-500"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </button>

        <AnimatePresence>
          {tenantOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.14 }}
              className={cx(
                "absolute left-0 right-0 z-50 mt-2",
                "rounded-md border border-slate-200 bg-white shadow-lg"
              )}
              role="menu"
            >
              <div className="p-1">
                {tenantOptions.map((t) => {
                  const active = t.id === selectedTenantId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTenantId(t.id);
                        setTenantOpen(false);

                        // OPTIONAL hook point:
                        // - router.push(`/site-admin?tenant=${t.id}`)
                        // - or call your setActiveTenant(t.id) from store
                      }}
                      className={cx(
                        "w-full flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm",
                        "text-slate-700 hover:bg-slate-50",
                        active && "bg-slate-100 text-slate-900"
                      )}
                      role="menuitem"
                    >
                      <span className="truncate">{t.name}</span>
                      {active && <Check className="h-4 w-4 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )}
  </div>
</div>

      {/* ✅ Scroll container (hide scrollbar, keep scroll) + footer pushed down */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="min-h-full flex flex-col">
          {/* Nav */}
          <div className="pb-3">
            {sections.map((sec) => (
              <div key={sec.title}>
                <SectionLabel collapsed={collapsed}>{sec.title}</SectionLabel>

                <div className="px-2 space-y-1">
                  {sec.items.map((item) => {
                    const hasChildren = !!item.children?.length;
                    const isAnyChildActive =
                      hasChildren &&
                      item.children!.some(
                        (c) => c.name === activeLink || isMatch(pathname, c)
                      );

                    const isParentActive =
                      activeLink === item.name || isMatch(pathname, item);

                    const expanded = !!openGroups[item.name];

                    return (
                      <div key={item.name} className="space-y-1">
                        <NavButton
                          collapsed={collapsed}
                          active={isParentActive || isAnyChildActive}
                          icon={item.icon}
                          label={item.name}
                          badge={item.badge}
                          onClick={() => handleNavigate(item.path, item.name)}
                          rightSlot={
                            !collapsed &&
                            hasChildren && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation(); // don’t navigate, only expand/collapse
                                  toggleGroup(item.name);
                                }}
                                aria-expanded={expanded}
                                className="grid h-7 w-7 place-items-center rounded-md hover:bg-slate-100 text-slate-600"
                                title={expanded ? "Collapse" : "Expand"}
                              >
                                <motion.span
                                  animate={{ rotate: expanded ? 90 : 0 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 30,
                                  }}
                                  className="inline-flex"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </motion.span>
                              </button>
                            )
                          }
                        />

                        {/* Dropdown children (push down) */}
                        <AnimatePresence initial={false}>
                          {!collapsed && hasChildren && expanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.18 }}
                              className="overflow-hidden"
                            >
                              <div className="ml-10 mr-1 space-y-1 border-l border-slate-200 pl-3 py-1">
                                {item.children!.map((child) => {
                                  const childActive =
                                    activeLink === child.name ||
                                    isMatch(pathname, child);

                                  return (
                                    <button
                                      key={child.name}
                                      onClick={() =>
                                        handleNavigate(child.path, child.name)
                                      }
                                      className={cx(
                                        "w-full flex items-center justify-between gap-2 rounded-md px-2 py-2 text-[13px]",
                                        "text-slate-700 hover:bg-slate-100",
                                        childActive &&
                                          "bg-slate-200 text-slate-900"
                                      )}
                                    >
                                      <span className="truncate flex items-center gap-2">
                                        <span
                                          className={cx(
                                            "h-1.5 w-1.5 rounded-full",
                                            childActive
                                              ? "bg-slate-900"
                                              : "bg-slate-400"
                                          )}
                                        />
                                        {child.name}
                                      </span>

                                      {child.badge && (
                                        <span
                                          className={cx(
                                            "shrink-0 rounded-full border px-2 py-[2px] text-[10px] font-semibold",
                                            badgeVariants[
                                              child.badge.variant || "info"
                                            ]
                                          )}
                                        >
                                          {child.badge.text}
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer (sticks to bottom when nav is short; pushed down when dropdown expands) */}
          <div className="mt-auto border-t border-slate-200 px-2 py-2">
            <div className="px-1 pb-1">
              <button
                className={cx(
                  "w-full flex items-center gap-2 rounded-md px-2 py-2 text-sm",
                  "text-slate-700 hover:bg-slate-100",
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? "Logout" : undefined}
                onClick={handleLogout}
                disabled={authLoading}
              >
                <span className="grid h-8 w-8 place-items-center rounded-md text-slate-600">
                  <LogOut className="h-4 w-4" />
                </span>

                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="truncate">Logout</p>
                    <p className="truncate text-[11px] text-slate-500">
                      Signed in as {displayName}
                    </p>
                  </div>
                )}
              </button>
            </div>

            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className={cx(
                  "w-full flex items-center gap-2 rounded-md px-2 py-2 text-sm",
                  "text-slate-700 hover:bg-slate-100",
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? "Expand menu" : "Collapse menu"}
              >
                <span className="grid h-8 w-8 place-items-center rounded-md text-slate-600">
                  {collapsed ? (
                    <ChevronsRight className="h-4 w-4" />
                  ) : (
                    <ChevronsLeft className="h-4 w-4" />
                  )}
                </span>
                {!collapsed && <span>Collapse menu</span>}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.aside>
  );

  // Desktop
  if (mobileOpen === undefined) return <aside className="h-full">{sidebarContent}</aside>;

  // Mobile drawer
  return (
    <AnimatePresence>
      {mobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
            className="fixed inset-0 z-50 bg-black/40"
          />

          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed left-0 top-0 z-50 h-full"
          >
            {sidebarContent}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}