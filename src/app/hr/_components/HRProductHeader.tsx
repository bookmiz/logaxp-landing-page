"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, CircleUserRound, Menu, X } from "lucide-react";

const navGroups = [
  {
    label: "Products",
    items: [
      {
        label: "Overview",
        href: "#overview",
        text: "HR, payroll, approvals, and employee operations in one suite.",
      },
      {
        label: "Lifecycle workflows",
        href: "#workflows",
        text: "Recruiting, records, training, leave, attendance, and handoffs.",
      },
      {
        label: "Coverage",
        href: "#coverage",
        text: "See the core modules your team can start with.",
      },
    ],
  },
  {
    label: "Solutions",
    items: [
      {
        label: "People operations",
        href: "#workflows",
        text: "Maintain employee records, documents, and role context.",
      },
      {
        label: "Approval control",
        href: "#governance",
        text: "Route HR actions through accountable approval workflows.",
      },
      {
        label: "Multi-team rollout",
        href: "#pricing",
        text: "Choose a plan for your team size and implementation path.",
      },
    ],
  },
  {
    label: "Resources",
    items: [
      {
        label: "Customer teams",
        href: "#customers",
        text: "See the kind of growing teams LogaXP is built for.",
      },
      {
        label: "Implementation call",
        href: "#demo",
        text: "Map LogaXP to your current HR workflows with sales.",
      },
      {
        label: "Contact sales",
        href: "/contact",
        text: "Ask about pricing, rollout, and deployment support.",
      },
    ],
  },
];

const mobileLinks = [
  { label: "Overview", href: "#overview" },
  { label: "Workflows", href: "#workflows" },
  { label: "Governance", href: "#governance" },
  { label: "Coverage", href: "#coverage" },
  { label: "Customers", href: "#customers" },
  { label: "Pricing", href: "#pricing" },
];

export default function HRProductHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-[120] border-b border-zinc-100 bg-white/95 backdrop-blur-xl">
      <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-5 md:px-10 lg:px-16">
        <Link href="/" className="flex shrink-0 items-center" aria-label="LogaXP home">
          <Image src="/logo-light.png" alt="LogaXP" width={136} height={40} priority className="h-auto w-[136px]" />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navGroups.map((group) => (
            <div key={group.label} className="group relative">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-2 text-[15px] font-bold text-zinc-950 transition hover:text-[#5f8700]"
              >
                {group.label}
                <ChevronDown className="h-4 w-4 transition group-hover:rotate-180" />
              </button>

              <div className="invisible absolute left-1/2 top-full z-50 w-[340px] -translate-x-1/2 pt-4 opacity-0 transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="rounded-[1.35rem] border border-zinc-200 bg-white p-2 shadow-[0_22px_70px_-42px_rgba(15,23,42,0.45)]">
                  {group.items.map((item) => (
                    <Link key={item.label} href={item.href} className="group/item block rounded-2xl px-4 py-3 transition hover:bg-zinc-50">
                      <span className="flex items-center justify-between gap-4">
                        <span className="text-sm font-bold text-zinc-950">{item.label}</span>
                        <span className="text-[#5f8700] opacity-0 transition group-hover/item:translate-x-0.5 group-hover/item:opacity-100">→</span>
                      </span>
                      <span className="mt-1 block text-sm leading-5 text-zinc-500">{item.text}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <Link href="#pricing" className="rounded-full px-2 py-2 text-[15px] font-bold text-zinc-950 transition hover:text-[#5f8700]">
            Pricing
          </Link>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3">
          <Link href="/admin/login" className="hidden items-center gap-1.5 rounded-full px-2 py-2 text-[15px] font-bold text-zinc-950 transition hover:text-[#5f8700] sm:inline-flex">
            <CircleUserRound className="h-5 w-5 stroke-[1.8]" />
            Login
          </Link>

          <Link href="/contact" className="hidden rounded-full bg-zinc-950 px-6 py-3 text-[15px] font-bold text-white shadow-[0_14px_28px_-18px_rgba(0,0,0,0.8)] transition hover:-translate-y-0.5 hover:bg-black md:inline-flex">
            Book demo
          </Link>

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-950 transition hover:bg-zinc-50 lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen ? (
        <div className="border-t border-zinc-100 bg-white px-5 py-4 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {mobileLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-2xl px-4 py-3 text-base font-bold text-zinc-950 transition hover:bg-zinc-50"
              >
                {link.label}
                <span className="text-[#5f8700]">→</span>
              </Link>
            ))}

            <div className="mt-3 grid gap-2 border-t border-zinc-100 pt-4 sm:grid-cols-2">
              <Link href="/admin/login" onClick={() => setMobileOpen(false)} className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-5 py-3 text-sm font-bold text-zinc-950">
                Login
              </Link>
              <Link href="/contact" onClick={() => setMobileOpen(false)} className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-bold text-white">
                Book demo
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
