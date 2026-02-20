// components/Header.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

type HeaderProps = {
  title?: string;
  subtitle?: string;
  onOpenSidebar?: () => void;
};

export default function Header({
  title = "Dashboard",
  subtitle = "Admin Console",
  onOpenSidebar,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-black/10 dark:border-white/10 bg-white/90 backdrop-blur-xl">
        <div className="w-full px-3 sm:px-5">
          {/* Use wrap so it never breaks on small screens */}
          <div className="flex flex-wrap items-center gap-2 py-2">
            {/* LEFT: hamburger + brand */}
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={onOpenSidebar}
                aria-label="Open sidebar"
                className="md:hidden h-10 w-10 rounded-2xl border border-black/10 bg-white shadow-sm grid place-items-center hover:bg-black/[0.02] transition"
              >
                <HamburgerIcon />
              </button>
              <div className="flex items-center gap-2 min-w-0">
                <div className="min-w-0">
                  <div className="font-black text-[14px] leading-tight text-neutral-900 truncate">
                    Loga<span className="text-[#7fb400]">XP</span>
                  </div>
                  <div className="text-[11px] leading-tight text-neutral-600 truncate">
                    Admin Portal
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE: page context (hidden on very small screens) */}
            <div className="hidden sm:flex items-center min-w-0 flex-1">
              <div className="ml-2 pl-3 border-l border-black/10 min-w-0">
                <div className="font-black text-[13px] text-neutral-900 truncate">
                  {title}
                </div>
                <div className="text-[11px] text-neutral-600 truncate">
                  {subtitle}
                </div>
              </div>
            </div>

            {/* RIGHT: actions */}
            <div className="ml-auto flex items-center gap-2">
              {/* Mobile: search as icon (optional) */}
              <button
                type="button"
                aria-label="Search"
                className="md:hidden h-10 w-10 rounded-2xl border border-black/10 bg-white shadow-sm grid place-items-center hover:bg-black/[0.02] transition"
              >
                <SearchIcon className="h-5 w-5" />
              </button>

              {/* Desktop: full search input */}
              <div className="hidden md:block w-[340px] lg:w-[420px]">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/40">
                    <SearchIcon className="h-[18px] w-[18px]" />
                  </span>
                  <input
                    className="
                      h-10 w-full rounded-2xl
                      border border-black/10
                      bg-white
                      pl-10 pr-3
                      text-sm text-neutral-900
                      placeholder:text-black/35
                      shadow-sm outline-none
                      focus:ring-2 focus:ring-[#a3d900]/35 focus:border-[#a3d900]/40
                      transition
                    "
                    placeholder="Search employees, payroll, reports..."
                  />
                </div>
              </div>

              <IconButton ariaLabel="Notifications">
                <div className="relative">
                  <BellIcon className="h-5 w-5" />
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                </div>
              </IconButton>

              {/* Avatar */}
              <button
                type="button"
                aria-label="User menu"
                className="h-10 w-10 rounded-2xl overflow-hidden border border-black/10 bg-white shadow-sm grid place-items-center hover:opacity-95 transition"
              >
                <div className="h-full w-full grid place-items-center bg-neutral-100 text-neutral-700 font-black">
                  SJ
                </div>
              </button>
            </div>

            {/* Optional: small-screen title row (shows only on xs) */}
            <div className="sm:hidden w-full px-1 pt-1">
              <div className="font-black text-[13px] text-neutral-900 truncate">
                {title}
              </div>
              <div className="text-[11px] text-neutral-600 truncate">
                {subtitle}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------- helpers ---------- */

function IconButton({
  children,
  ariaLabel,
  onClick,
}: {
  children: React.ReactNode;
  ariaLabel: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="h-10 w-10 rounded-2xl border border-black/10 bg-white shadow-sm grid place-items-center hover:bg-black/[0.02] transition"
    >
      {children}
    </button>
  );
}

/* ---------- icons ---------- */

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