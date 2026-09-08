"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useAuth } from "@/logaxp/hooks/useAuth";
import AuthChrome, { AuthAlert, AuthField, authInputWithIconClassName } from "../../_components/AuthChrome";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const { resetPassword, loading, error, clearError } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const confirmError = confirm && confirm !== password ? "Passwords do not match." : "";
  const passwordError = password && password.length < 8 ? "Use at least 8 characters." : "";

  const canSubmit = useMemo(() => Boolean(token && password.length >= 8 && password === confirm), [token, password, confirm]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || loading) return;

    try {
      await resetPassword({ token, password });
      setDone(true);
    } catch {
      // useAuth exposes the message below.
    }
  };

  return (
    <AuthChrome
      eyebrow="Password reset"
      title="Create a new password."
      subtitle="Choose a secure password for your LogaXP account."
      secondaryAction={{ href: "/admin/login", label: "Sign in" }}
      footer={
        <>
          Need a new link?{" "}
          <Link href="/admin/password/forgot" className="font-semibold text-[#5f8700] hover:underline">
            Request one here
          </Link>
          .
        </>
      }
    >
      {!token ? (
        <AuthAlert tone="error" title="Reset link missing">
          Open the password reset link from your email, or request a new reset link.
        </AuthAlert>
      ) : done ? (
        <div className="space-y-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#a3d900]/20 text-[#5f8700]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <AuthAlert tone="success" title="Password updated">
            Sign in with your new password to continue.
          </AuthAlert>
          <button
            type="button"
            onClick={() => router.replace("/admin/login")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#a3d900] px-6 py-3.5 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:brightness-95"
          >
            Go to sign in
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <AuthField label="New password" error={passwordError}>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) clearError();
                }}
                placeholder="Minimum 8 characters"
                className={`${authInputWithIconClassName} pr-12`}
                required
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
          </AuthField>

          <AuthField label="Confirm password" error={confirmError}>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(event) => {
                  setConfirm(event.target.value);
                  if (error) clearError();
                }}
                placeholder="Re-enter password"
                className={`${authInputWithIconClassName} pr-12`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((value) => !value)}
                className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                aria-label={showConfirm ? "Hide confirmation password" : "Show confirmation password"}
              >
                {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </AuthField>

          {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#a3d900] px-6 py-3.5 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:brightness-95 disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Reset password
            {!loading ? <ArrowRight className="h-4 w-4" /> : null}
          </button>
        </form>
      )}
    </AuthChrome>
  );
}
