"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/logaxp/hooks/useAuth";
import AuthChrome, { AuthAlert, AuthField, authInputWithIconClassName } from "../../_components/AuthChrome";

export default function ForgotPasswordPage() {
  const { forgotPassword, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const canSubmit = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || loading) return;

    try {
      await forgotPassword({ email: email.trim() });
      setSent(true);
    } catch {
      // useAuth exposes the message below.
    }
  };

  return (
    <AuthChrome
      eyebrow="Account recovery"
      title="Reset your password."
      subtitle="Enter your work email and we will send a secure reset link if the account exists."
      secondaryAction={{ href: "/admin/login", label: "Sign in" }}
      footer={
        <>
          Remembered it?{" "}
          <Link href="/admin/login" className="font-semibold text-[#5f8700] hover:underline">
            Back to login
          </Link>
          .
        </>
      }
    >
      {sent ? (
        <div className="space-y-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#a3d900]/20 text-[#5f8700]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <AuthAlert tone="success" title="Check your inbox">
            If an account exists for {email.trim()}, a password reset link will arrive shortly.
          </AuthAlert>
          <Link
            href="/admin/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#a3d900] px-6 py-3.5 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:brightness-95"
          >
            Return to sign in
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <AuthField label="Email address">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) clearError();
                }}
                placeholder="admin@company.com"
                className={authInputWithIconClassName}
                required
              />
            </div>
          </AuthField>

          {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#a3d900] px-6 py-3.5 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:brightness-95 disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Send reset link
            {!loading ? <ArrowRight className="h-4 w-4" /> : null}
          </button>
        </form>
      )}
    </AuthChrome>
  );
}
