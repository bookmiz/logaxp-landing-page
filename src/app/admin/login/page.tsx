"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Home,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/logaxp/hooks/useAuth";

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pl-11 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    accessToken,
    user,
    tenant,
    membership,
    requiresTenantSelection,
    tenantChoices,
    isHydrated,
    loading,
    error,
    clearError,
    login,
  } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    if (!accessToken) return;

    if (!tenant && user?.isSiteAdmin) {
      router.replace("/site-admin");
      return;
    }

    if (tenant && membership) {
      router.replace("/portal");
      return;
    }

    if (!requiresTenantSelection) {
      router.replace("/auth/no-workspace");
    }
  }, [accessToken, isHydrated, membership, requiresTenantSelection, router, tenant, user?.isSiteAdmin]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    clearError();
    void login({ email, password }).catch(() => undefined);
  };

  const handleTenantSelect = (tenantSlug: string) => {
    clearError();
    void login({ email, password, tenantSlug }).catch(() => undefined);
  };

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
          <Link href="/admin/signup" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50">
            Create workspace
          </Link>
        </div>
      </header>

      <section className="mx-auto flex max-w-6xl justify-center px-5 pb-16 pt-6 md:px-8 md:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="w-full max-w-[460px]"
        >
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#5f8700]">Secure access</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">Welcome back.</h1>
            <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-slate-600">
              Sign in to continue to your LogaXP workspace.
            </p>
          </div>

          <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-5 md:p-7">
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <Field label="Email address">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="admin@company.com"
                      required
                      className={inputClassName}
                    />
                  </div>
                </Field>

                <Field label="Password">
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      required
                      className={`${inputClassName} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </Field>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                <Link href="/admin/password/forgot" className="font-semibold text-[#5f8700] transition hover:text-[#4d7100]">
                  Forgot password?
                </Link>
                <Link href="/admin/signup" className="font-semibold text-slate-500 transition hover:text-slate-950">
                  Need access?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading || requiresTenantSelection}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#a3d900] px-6 py-3.5 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:brightness-95 disabled:pointer-events-none disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {requiresTenantSelection ? "Choose a workspace below" : "Sign in"}
                {!loading ? <ArrowRight className="h-4 w-4" /> : null}
              </button>

              {requiresTenantSelection && tenantChoices.length > 0 ? (
                <WorkspacePicker
                  choices={tenantChoices}
                  loading={loading}
                  onSelect={handleTenantSelect}
                />
              ) : null}

              {error ? (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  <div className="flex gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                </div>
              ) : null}
            </form>
          </div>

          <div className="mt-5 flex flex-col items-center justify-center gap-2 text-center text-xs text-slate-500 sm:flex-row">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#5f8700]" />
              Secure session
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
            <span>
              By continuing, you agree to our{" "}
              <Link href="/terms" className="font-semibold text-[#5f8700] hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-semibold text-[#5f8700] hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function WorkspacePicker({
  choices,
  loading,
  onSelect,
}: {
  choices: Array<{ tenantId: string; tenantSlug: string; tenantName: string }>;
  loading: boolean;
  onSelect: (tenantSlug: string) => void;
}) {
  return (
    <div className="mt-6 rounded-3xl border border-slate-200 p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#a3d900]/20 text-[#5f8700]">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-950">Choose your workspace</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            This account belongs to more than one workspace.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {choices.map((choice) => (
          <button
            key={choice.tenantId}
            type="button"
            disabled={loading}
            onClick={() => onSelect(choice.tenantSlug)}
            className="group flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-60"
          >
            <span>
              <span className="block text-sm font-semibold text-slate-950">{choice.tenantName}</span>
              <span className="mt-0.5 block text-xs text-slate-500">
                {choice.tenantSlug === "__platform__" ? "Site administration" : `/${choice.tenantSlug}`}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 text-[#5f8700] transition group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
}
