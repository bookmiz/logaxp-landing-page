"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  MailCheck,
  Phone,
  User,
} from "lucide-react";
import { useAuth } from "@/logaxp/hooks/useAuth";
import type { AcceptInviteResponse } from "@/logaxp/lib/auth/auth.types";
import AuthChrome, {
  AuthAlert,
  AuthField,
  authInputClassName,
  authInputWithIconClassName,
} from "../../_components/AuthChrome";

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const { acceptInvitation, loading, error, clearError } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [done, setDone] = useState(false);
  const [acceptResult, setAcceptResult] = useState<AcceptInviteResponse | null>(null);

  const passwordTouched = password.length > 0 || confirm.length > 0;
  const passwordTooShort = password.length > 0 && password.length < 8;
  const passwordMismatch = confirm.length > 0 && confirm !== password;

  const canSubmit = useMemo(() => {
    if (!token) return false;
    if (!firstName.trim() || !lastName.trim()) return false;
    if (passwordTouched) {
      if (password.length < 8) return false;
      if (password !== confirm) return false;
    }
    return true;
  }, [token, firstName, lastName, passwordTouched, password, confirm]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || loading) return;

    try {
      const result = await acceptInvitation({
        token,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: displayName.trim() || undefined,
        phone: phone.trim() || undefined,
        password: password.trim() ? password : undefined,
      });

      setAcceptResult(result);
      setDone(true);
    } catch {
      // useAuth exposes the message below.
    }
  };

  const verificationRequired = Boolean(acceptResult?.requiresEmailVerification);

  return (
    <AuthChrome
      eyebrow="Invitation setup"
      title="Complete your profile."
      subtitle="Confirm your name and finish the account setup for the workspace you were invited to join."
      maxWidth="lg"
      secondaryAction={{ href: "/admin/login", label: "Sign in" }}
      footer={
        <>
          Already have access?{" "}
          <Link href="/admin/login" className="font-semibold text-[#5f8700] hover:underline">
            Sign in here
          </Link>
          .
        </>
      }
    >
      {!token ? (
        <AuthAlert tone="error" title="Invitation link missing">
          Open the invitation link from your email to activate workspace access.
        </AuthAlert>
      ) : done ? (
        <div className="space-y-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#a3d900]/20 text-[#5f8700]">
            {verificationRequired ? <MailCheck className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
          </div>
          <AuthAlert tone="success" title={verificationRequired ? "Check your email" : "Invitation accepted"}>
            {verificationRequired
              ? "Your profile is ready. Verify your email before signing in to the workspace."
              : "Your access is active. You can now sign in to your workspace."}
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
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-950">Profile details</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              This information is used for your employee profile and workspace identity.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <AuthField label="First name">
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={firstName}
                  onChange={(event) => {
                    setFirstName(event.target.value);
                    if (error) clearError();
                  }}
                  placeholder="First name"
                  className={authInputWithIconClassName}
                  required
                />
              </div>
            </AuthField>

            <AuthField label="Last name">
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={lastName}
                  onChange={(event) => {
                    setLastName(event.target.value);
                    if (error) clearError();
                  }}
                  placeholder="Last name"
                  className={authInputWithIconClassName}
                  required
                />
              </div>
            </AuthField>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <AuthField label="Display name">
              <input
                value={displayName}
                onChange={(event) => {
                  setDisplayName(event.target.value);
                  if (error) clearError();
                }}
                placeholder="Optional"
                className={authInputClassName}
              />
            </AuthField>

            <AuthField label="Phone">
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    if (error) clearError();
                  }}
                  placeholder="Optional"
                  className={authInputWithIconClassName}
                />
              </div>
            </AuthField>
          </div>

          <div className="rounded-3xl border border-slate-200 p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-700">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-950">Password setup</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Add a password if this is your first LogaXP account. Leave it blank if you already sign in with this email.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <AuthField label="New password" error={passwordTooShort ? "Use at least 8 characters." : undefined}>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (error) clearError();
                    }}
                    placeholder="Optional"
                    className={`${authInputWithIconClassName} pr-12`}
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

              <AuthField label="Confirm password" error={passwordMismatch ? "Passwords do not match." : undefined}>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(event) => {
                      setConfirm(event.target.value);
                      if (error) clearError();
                    }}
                    placeholder="Optional"
                    className={`${authInputWithIconClassName} pr-12`}
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
            </div>
          </div>

          {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#a3d900] px-6 py-3.5 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:brightness-95 disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Accept invitation
            {!loading ? <ArrowRight className="h-4 w-4" /> : null}
          </button>
        </form>
      )}
    </AuthChrome>
  );
}
