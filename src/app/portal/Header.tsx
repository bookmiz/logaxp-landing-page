// components/Header.tsx
"use client";

import React from "react";

/** Icons you already have */
export const SunIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

export const MoonIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

type HeaderProps = {
  theme: "light" | "dark";
  toggleTheme: () => void;
  /** optional: show current page title/breadcrumb like a real app */
  title?: string;
  subtitle?: string;
  /** optional: if you have a mobile sidebar, pass a toggle */
  onOpenSidebar?: () => void;
};

export default function Header({
  theme,
  toggleTheme,
  title = "Dashboard",
  subtitle = "Overview",
  onOpenSidebar,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50">
      {/* Glass rail */}
      <div className="relative border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#a3d900]/35 to-transparent" />

        {/* FULL WIDTH APP BAR (not centered) */}
        <div className="w-full px-4 sm:px-6">
          <div className="flex h-16 items-center gap-3">
            {/* LEFT: menu (mobile) + brand + page context */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile sidebar button */}
              <button
                type="button"
                onClick={onOpenSidebar}
                aria-label="Open sidebar"
                className="md:hidden h-11 w-11 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur shadow-sm grid place-items-center hover:bg-white/90 dark:hover:bg-white/10 transition"
              >
                <HamburgerIcon />
              </button>

              {/* Brand mark */}
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-2xl bg-[#a3d900]/15 grid place-items-center border border-black/10 dark:border-white/10">
                  <span className="mango font-black text-sm text-[#a3d900]">LX</span>
                </div>

                <div className="hidden sm:block leading-tight">
                  <div className="mango font-black text-base text-neutral-900 dark:text-white">
                    Loga<span className="text-[#a3d900]">XP</span>
                  </div>
                  <div className="geist text-[11px] opacity-70">Admin Portal</div>
                </div>
              </div>

              {/* Page title / breadcrumb (real app feel) */}
              <div className="hidden lg:flex items-center gap-3 ml-2 min-w-0">
                <div className="h-8 w-px bg-black/10 dark:bg-white/10" />
                <div className="min-w-0">
                  <div className="mango font-black text-sm text-neutral-900 dark:text-white truncate">
                    {title}
                  </div>
                  <div className="geist text-[11px] opacity-70 truncate">{subtitle}</div>
                </div>
              </div>
            </div>

            {/* CENTER: search (balanced, not dominant) */}
            <div className="flex-1 min-w-0 flex justify-center">
              <div className="relative w-full max-w-[520px]">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40">
                  <SearchIcon className="h-[18px] w-[18px]" />
                </span>

                <input
                  className="
                    h-11 w-full rounded-2xl
                    border border-black/10 dark:border-white/10
                    bg-white/80 dark:bg-white/5 backdrop-blur
                    pl-10 pr-3
                    geist text-sm text-neutral-900 dark:text-white
                    placeholder:text-black/35 dark:placeholder:text-white/35
                    shadow-sm outline-none
                    focus:ring-2 focus:ring-[#a3d900]/35 focus:border-[#a3d900]/40
                    transition
                  "
                  placeholder="Search..."
                />
              </div>
            </div>

            {/* RIGHT: actions grouped (app-like) */}
            <div className="flex items-center gap-2 sm:gap-3">
              <IconButton ariaLabel="Notifications">
                <div className="relative">
                  <BellIcon className="h-5 w-5" />
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white/80 dark:ring-black/60" />
                </div>
              </IconButton>

              <IconButton ariaLabel="Quick actions">
                <BriefcaseIcon className="h-5 w-5" />
              </IconButton>

              <IconButton ariaLabel="Toggle theme" onClick={toggleTheme}>
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </IconButton>

              {/* Tenant switcher (kept, but tighter) */}
              <button
                type="button"
                className="
                  hidden md:flex items-center gap-2 h-11 rounded-2xl
                  border border-black/10 dark:border-white/10
                  bg-white/70 dark:bg-white/5 backdrop-blur
                  px-3 geist text-sm text-neutral-900 dark:text-white
                  shadow-sm hover:bg-white/90 dark:hover:bg-white/10
                  focus:outline-none focus:ring-2 focus:ring-[#a3d900]/30
                  transition
                "
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-[#a3d900] text-black text-xs font-black mango">
                  L
                </span>
                <span className="font-semibold">LogaXP</span>
                <ChevronDown className="h-4 w-4 text-black/40 dark:text-white/40" />
              </button>

              {/* User avatar */}
              <button
                type="button"
                className="
                  h-11 w-11 rounded-2xl overflow-hidden
                  border border-black/10 dark:border-white/10
                  bg-white/70 dark:bg-white/5 backdrop-blur
                  shadow-sm hover:opacity-95
                  focus:outline-none focus:ring-2 focus:ring-[#a3d900]/30
                  transition
                "
                aria-label="User menu"
              >
                <div className="h-full w-full grid place-items-center bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 text-neutral-700 dark:text-neutral-200 font-black mango">
                  SJ
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* optional subtle bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-b from-transparent to-black/0 dark:to-white/0" />
      </div>
    </header>
  );
}

/* -----------------------------
 * UI helpers
 * ----------------------------- */

function IconButton({
  children,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="
        h-11 w-11 rounded-2xl
        border border-black/10 dark:border-white/10
        bg-white/70 dark:bg-white/5 backdrop-blur
        shadow-sm grid place-items-center
        text-neutral-700 dark:text-neutral-200
        hover:bg-white/90 dark:hover:bg-white/10
        focus:outline-none focus:ring-2 focus:ring-[#a3d900]/30
        transition
      "
    >
      {children}
    </button>
  );
}

/* -----------------------------
 * Inline icons
 * ----------------------------- */

function HamburgerIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function SearchIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 21l-6-6" />
      <circle cx="11" cy="11" r="7" />
    </svg>
  );
}

function BellIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

function BriefcaseIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 6h4a2 2 0 012 2v1H8V8a2 2 0 012-2z" />
      <path d="M3 10h18v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8z" />
      <path d="M3 14h18" />
    </svg>
  );
}

function ChevronDown({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}