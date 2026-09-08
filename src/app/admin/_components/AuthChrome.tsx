"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ShieldCheck } from "lucide-react";

export const authInputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

export const authInputWithIconClassName = `${authInputClassName} pl-11`;

type AuthChromeProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
  secondaryAction?: {
    href: string;
    label: string;
  };
};

const widths = {
  sm: "max-w-[460px]",
  md: "max-w-2xl",
  lg: "max-w-3xl",
};

export default function AuthChrome({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "sm",
  secondaryAction = { href: "/admin/login", label: "Sign in" },
}: AuthChromeProps) {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 md:px-8">
        <Link href="/" aria-label="LogaXP home">
          <Image src="/logo-light.png" alt="LogaXP" width={126} height={36} priority className="h-auto w-[126px]" />
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/" className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950 sm:inline-flex">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link href={secondaryAction.href} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50">
            {secondaryAction.label}
          </Link>
        </div>
      </header>

      <section className="mx-auto flex max-w-6xl justify-center px-5 pb-16 pt-4 md:px-8 md:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className={`w-full ${widths[maxWidth]}`}
        >
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#5f8700]">{eyebrow}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">{title}</h1>
            {subtitle ? (
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">{subtitle}</p>
            ) : null}
          </div>

          <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-5 md:p-7">
            {children}
          </div>

          {footer ? (
            <div className="mt-5 flex flex-col items-center justify-center gap-2 text-center text-xs text-slate-500 sm:flex-row">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#5f8700]" />
                Secure session
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
              <span>{footer}</span>
            </div>
          ) : null}
        </motion.div>
      </section>
    </main>
  );
}

export function AuthField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <span className="mt-2 block">{children}</span>
      {error ? <span className="mt-2 block text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}

export function AuthAlert({ tone, title, children }: { tone: "success" | "error" | "neutral"; title?: string; children: React.ReactNode }) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-700",
    neutral: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${styles[tone]}`}>
      {title ? <div className="font-bold">{title}</div> : null}
      <div className={title ? "mt-1 leading-6" : "leading-6"}>{children}</div>
    </div>
  );
}
