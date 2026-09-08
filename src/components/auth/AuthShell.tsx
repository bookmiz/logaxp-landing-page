"use client";

import React from "react";
import Link from "next/link";
import { motion, easeOut } from "framer-motion";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: easeOut } },
};

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Background */}
     

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
        <div className="grid w-full items-stretch gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Mobile brand strip */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden rounded-2xl border border-black/10 bg-white/80 p-4 shadow-[0_16px_50px_-30px_rgba(0,0,0,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#a3d900] text-lg font-black text-black shadow-sm">
                  L
                </div>
                <div>
                  <div className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                    Loga<span className="text-[#7fb400]">XP</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    Enterprise Admin Platform
                  </div>
                </div>
              </div>

              <Link
                href="/"
                className="rounded-lg border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              >
                Home
              </Link>
            </div>
          </motion.div>

          {/* Left: enterprise / trust panel */}
          <motion.aside
            variants={container}
            initial="hidden"
            animate="show"
            className="hidden lg:flex flex-col rounded-3xl border border-black/10 bg-white/75 p-7 shadow-[0_26px_80px_-38px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
          >
            <motion.div variants={item} className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#a3d900] text-xl font-black text-black shadow-sm">
                  L
                </div>
                <div>
                  <div className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    Loga<span className="text-[#7fb400]">XP</span>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    Enterprise Admin Platform
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Secure Provisioning
              </div>
            </motion.div>

            <motion.div variants={item} className="mt-7">
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                Enterprise-grade access for multi-tenant operations
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Launch and manage tenant workspaces with secure onboarding, isolated access context,
                and scalable admin workflows designed for production systems.
              </p>
            </motion.div>

            <motion.div variants={item} className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-black/5 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Access Control
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                  JWT + refresh rotation
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                  Session lifecycle patterns ready for RBAC and secure auth flows.
                </p>
              </div>

              <div className="rounded-2xl border border-black/5 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Tenant Isolation
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                  Scoped organization context
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                  Clean separation across memberships, permissions, and tenant data boundaries.
                </p>
              </div>

              <div className="rounded-2xl border border-black/5 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Onboarding
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                  Owner-first setup flow
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                  Provision tenant, create owner, verify email, and continue to admin access.
                </p>
              </div>

              <div className="rounded-2xl border border-black/5 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Governance
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                  Audit-ready defaults
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                  Ideal foundation for activity logs, policy enforcement, and admin oversight.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={item}
              className="mt-6 rounded-2xl border border-black/5 bg-slate-900 p-5 text-white dark:border-white/10"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-white/70">
                    Provisioning sequence
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    Tenant → Owner → Verification → Access
                  </p>
                </div>
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold">
                  Standard Flow
                </span>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
                {["Tenant", "Owner", "Email", "Access"].map((step, i) => (
                  <div
                    key={step}
                    className="rounded-lg border border-white/10 bg-white/5 p-2 text-center"
                  >
                    <div className="mx-auto mb-1 grid h-5 w-5 place-items-center rounded-full bg-white/10 text-[10px] font-bold">
                      {i + 1}
                    </div>
                    <span className="truncate">{step}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={item} className="mt-auto pt-6">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                {["Protected", "Audited", "Tenant-Isolated", "Scalable"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-black/10 bg-white/60 px-2.5 py-1 dark:border-white/10 dark:bg-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.aside>

          {/* Right: form card */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.04 }}
            className="relative rounded-3xl border border-black/10 bg-white/85 p-5 shadow-[0_26px_80px_-38px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-7 dark:border-white/10 dark:bg-white/5"
          >
            {/* subtle top accent */}
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#a3d900]/45 to-transparent" />

            {/* desktop top-right nav */}
            <div className="hidden lg:flex items-center justify-end">
              <Link
                href="/"
                className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                Home
              </Link>
            </div>

            <div className="mt-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full bg-[#a3d900]" />
                Enterprise Console Access
              </div>

              <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                {title}
              </h1>

              {subtitle ? (
                <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {subtitle}
                </p>
              ) : null}
            </div>

            <div className="mt-5">{children}</div>

            {footer ? (
              <div className="mt-5 border-t border-black/5 pt-4 dark:border-white/10">
                {footer}
              </div>
            ) : null}
          </motion.section>
        </div>
      </div>
    </div>
  );
}