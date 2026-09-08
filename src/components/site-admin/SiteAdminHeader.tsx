"use client";

import React from "react";
import {
  Bell,
  Search,
  Menu,
  ShieldCheck,
  Building2,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/logaxp/stores/useAuthStore";

type SiteAdminHeaderProps = {
  title?: string;
  subtitle?: string;
  onOpenSidebar?: () => void;

  /**
   * Optional right-side actions (e.g. Connect / Import data / Share)
   * This is what gives you the “Project dashboard + buttons on the right” look.
   */
  actions?: React.ReactNode;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function SiteAdminHeader({
  title = "Platform Command Center",
  subtitle = "Multi-tenant oversight, governance, and operations",
  onOpenSidebar,
  actions,
}: SiteAdminHeaderProps) {
  const user = useAuthStore((s) => s.user);
  const email = user?.email ?? "site-admin@logaxp.com";

  const initials =
    (email.split("@")[0] || "SA")
      .split(/[.\s_-]+/)
      .filter(Boolean)
      .map((p) => p[0]?.toUpperCase())
      .join("")
      .slice(0, 2) || "SA";

  return (
    <header className="sticky top-0 z-40">
      <div
        className={cx(
          "border-b",
          "bg-white text-neutral-900",
          "border-zinc-200/80",
          "dark:bg-[#0b0f14] dark:text-white dark:border-white/10"
        )}
      >
        <div className="mx-auto w-full max-w-[1400px] px-3 sm:px-5">
          {/* Row 1: slim toolbar (brand + search + status + user) */}
          <div className="flex h-14 items-center gap-3">
            {/* Left */}
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={onOpenSidebar}
                aria-label="Open sidebar"
                className={cx(
                  "md:hidden grid h-9 w-9 place-items-center rounded-md border",
                  "border-zinc-200 bg-white hover:bg-zinc-50",
                  "dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                )}
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={cx(
                    "grid h-9 w-9 place-items-center rounded-md border",
                    "border-zinc-200 bg-white",
                    "dark:border-white/10 dark:bg-white/5"
                  )}
                >
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-semibold min-w-0">
                    <span className="truncate">
                      Loga<span className="text-[#78b700] dark:text-[#a3d900]">XP</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-zinc-400 dark:text-white/35" />
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-white/70">
                      <Building2 className="h-4 w-4" />
                      Site Admin
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-white/50 truncate">
                    Global control panel
                  </div>
                </div>
              </div>
            </div>

            {/* Middle (search) */}
            <div className="hidden md:flex flex-1 justify-center px-2">
              <div className="w-full max-w-2xl">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-white/40" />
                  <input
                    className={cx(
                      "h-9 w-full rounded-md border pl-9 pr-3 text-sm outline-none",
                      "border-zinc-200 bg-zinc-50/70 placeholder:text-zinc-400",
                      "focus:bg-white focus:border-[#a3d900]/40 focus:ring-2 focus:ring-[#a3d900]/15",
                      "dark:border-white/10 dark:bg-white/5 dark:focus:bg-white/5 dark:placeholder:text-white/35"
                    )}
                    placeholder="Search tenants, users, invoices, logs..."
                  />
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="ml-auto flex items-center gap-2">
              {/* Status pill (like “All OK”) */}
              <div
                className={cx(
                  "hidden lg:inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                  "border-zinc-200 bg-white",
                  "dark:border-white/10 dark:bg-white/5"
                )}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                <span className="text-zinc-700 dark:text-white/80">All OK</span>
              </div>

              <button
                type="button"
                aria-label="Notifications"
                className={cx(
                  "relative grid h-9 w-9 place-items-center rounded-md border",
                  "border-zinc-200 bg-white hover:bg-zinc-50",
                  "dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                )}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#0b0f14]" />
              </button>

              <div
                className={cx(
                  "hidden sm:flex items-center gap-2 rounded-md border px-2 py-1.5",
                  "border-zinc-200 bg-white",
                  "dark:border-white/10 dark:bg-white/5"
                )}
              >
                <div className="min-w-0">
                  <div className="max-w-[240px] truncate text-xs font-semibold text-zinc-900 dark:text-white">
                    {email}
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-white/50">
                    Platform Administrator
                  </div>
                </div>

                <div
                  className={cx(
                    "grid h-8 w-8 place-items-center rounded-md border font-bold",
                    "border-zinc-200 bg-zinc-100 text-zinc-900",
                    "dark:border-white/10 dark:bg-white/10 dark:text-white"
                  )}
                >
                  {initials}
                </div>
              </div>

              <button
                type="button"
                aria-label="User menu"
                className={cx(
                  "sm:hidden grid h-9 w-9 place-items-center rounded-md border font-bold",
                  "border-zinc-200 bg-white",
                  "dark:border-white/10 dark:bg-white/5"
                )}
              >
                {initials}
              </button>
            </div>
          </div>

          {/* Row 2: page title (left) + actions (right) — like the screenshot */}
          <div className="flex items-start justify-between gap-3 pb-3">
            <div className="min-w-0">
              
            </div>

            {actions ? (
              <div className="flex shrink-0 items-center gap-2">{actions}</div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}