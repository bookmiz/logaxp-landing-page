"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2, MailCheck } from "lucide-react";
import { useAuth } from "@/logaxp/hooks/useAuth";
import AuthChrome, { AuthAlert } from "../../_components/AuthChrome";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const { verifyEmail, error } = useAuth();
  const [done, setDone] = useState(false);
  const [checking, setChecking] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;

    let mounted = true;

    (async () => {
      try {
        await verifyEmail({ token });
        if (mounted) setDone(true);
      } catch {
        // useAuth exposes the message below.
      } finally {
        if (mounted) setChecking(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token, verifyEmail]);

  return (
    <AuthChrome
      eyebrow="Email verification"
      title="Verify your account."
      subtitle="We are confirming the secure email link for your LogaXP account."
      secondaryAction={{ href: "/admin/login", label: "Sign in" }}
      footer={
        <>
          Wrong page?{" "}
          <Link href="/admin/login" className="font-semibold text-[#5f8700] hover:underline">
            Return to sign in
          </Link>
          .
        </>
      }
    >
      {!token ? (
        <AuthAlert tone="error" title="Verification link missing">
          Open the verification link from your email to activate the account.
        </AuthAlert>
      ) : done ? (
        <div className="space-y-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#a3d900]/20 text-[#5f8700]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <AuthAlert tone="success" title="Email verified">
            Your account is active. You can now sign in and continue to your workspace.
          </AuthAlert>
          <button
            type="button"
            onClick={() => router.replace("/admin/login")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#a3d900] px-6 py-3.5 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:brightness-95"
          >
            Continue to sign in
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : error ? (
        <AuthAlert tone="error" title="Verification failed">
          {error}
        </AuthAlert>
      ) : (
        <div className="space-y-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-700">
            {checking ? <Loader2 className="h-6 w-6 animate-spin" /> : <MailCheck className="h-6 w-6" />}
          </div>
          <AuthAlert tone="neutral" title="Checking verification link">
            Please keep this page open while we activate your account.
          </AuthAlert>
        </div>
      )}
    </AuthChrome>
  );
}
