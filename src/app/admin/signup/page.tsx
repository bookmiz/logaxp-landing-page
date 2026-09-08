"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Home, Loader2 } from "lucide-react";
import { useAuth } from "@/logaxp/hooks/useAuth";
import { toast } from "@/logaxp/components/ui/toast";

function slugify(v: string) {
  return v
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function getPasswordScore(password: string) {
  return [
    password.length >= 8,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
}

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const steps = ["Workspace", "Owner", "Review"];
const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5";

export default function SignupTenantPage() {
  const router = useRouter();
  const { signupTenant, loading, error } = useAuth();

  const [step, setStep] = useState(0);
  const [tenantName, setTenantName] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState<null | { organizationSlug?: string }>(null);

  useEffect(() => {
    if (!slugTouched) setTenantSlug(slugify(tenantName));
  }, [tenantName, slugTouched]);

  const normalizedSlug = useMemo(() => slugify(tenantSlug), [tenantSlug]);
  const passwordScore = useMemo(() => getPasswordScore(ownerPassword), [ownerPassword]);

  const slugError = useMemo(() => {
    if (!tenantSlug) return "";
    if (tenantSlug !== normalizedSlug) return "Use lowercase letters, numbers, and hyphens.";
    if (!slugRegex.test(tenantSlug)) return "Use lowercase letters, numbers, and hyphens.";
    if (tenantSlug.length < 2) return "Slug is too short.";
    return "";
  }, [tenantSlug, normalizedSlug]);

  const workspaceReady = Boolean(tenantName.trim() && tenantSlug.trim() && !slugError);
  const ownerReady = Boolean(
    ownerEmail.trim() &&
      isValidEmail(ownerEmail) &&
      ownerPassword.length >= 8 &&
      ownerPassword === confirm
  );
  const canSubmit = workspaceReady && ownerReady;

  const goNext = () => {
    if (step === 0 && !workspaceReady) return;
    if (step === 1 && !ownerReady) return;
    setStep((value) => Math.min(value + 1, steps.length - 1));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;

    try {
      const res = await signupTenant({
        tenantName: tenantName.trim(),
        tenantSlug: tenantSlug.trim(),
        ownerEmail: ownerEmail.trim(),
        ownerPassword,
      });

      setSuccess({
        organizationSlug: res.tenant?.slug ?? tenantSlug.trim(),
      });

      toast.success("Workspace created. Check your email to verify your account.");
    } catch {
      // useAuth handles the error state and toast.
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 md:px-8">
        <Link href="/" className="inline-flex items-center gap-3" aria-label="LogaXP home">
          <Image src="/logo-light.png" alt="LogaXP" width={126} height={36} priority className="h-auto w-[126px]" />
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/" className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950 sm:inline-flex">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link href="/admin/login" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50">
            Sign in
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-5 pb-16 pt-4 md:px-8 md:pt-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#5f8700]">Workspace setup</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
            Create your organization.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
            Set up the workspace, add the owner account, and continue after email verification.
          </p>
        </motion.div>

        <div className="mt-8">
          <div className="flex items-center justify-center gap-2">
            {steps.map((label, index) => {
              const active = index === step;
              const complete = index < step || Boolean(success);

              return (
                <React.Fragment key={label}>
                  <button
                    type="button"
                    onClick={() => !success && index <= step && setStep(index)}
                    className={[
                      "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition",
                      active
                        ? "bg-slate-950 text-white"
                        : complete
                        ? "bg-[#a3d900]/20 text-[#5f8700]"
                        : "bg-slate-100 text-slate-500",
                    ].join(" ")}
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-white/80 text-[11px] font-black text-slate-950">
                      {complete ? <Check className="h-3.5 w-3.5" /> : index + 1}
                    </span>
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                  {index < steps.length - 1 ? <div className="h-px w-8 bg-slate-200 sm:w-14" /> : null}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <motion.div
          key={success ? "success" : step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-5 md:p-7"
        >
          {success ? (
            <SuccessState
              slug={success.organizationSlug || tenantSlug}
              onLogin={() => router.replace("/admin/login")}
              onCreateAnother={() => {
                setSuccess(null);
                setStep(0);
                setTenantName("");
                setTenantSlug("");
                setSlugTouched(false);
                setOwnerEmail("");
                setOwnerPassword("");
                setConfirm("");
              }}
            />
          ) : (
            <form onSubmit={onSubmit}>
              {step === 0 ? (
                <WorkspaceStep
                  tenantName={tenantName}
                  tenantSlug={tenantSlug}
                  slugError={slugError}
                  onTenantNameChange={setTenantName}
                  onTenantSlugChange={(value) => {
                    setSlugTouched(true);
                    setTenantSlug(slugify(value));
                  }}
                />
              ) : null}

              {step === 1 ? (
                <OwnerStep
                  ownerEmail={ownerEmail}
                  ownerPassword={ownerPassword}
                  confirm={confirm}
                  passwordScore={passwordScore}
                  onOwnerEmailChange={setOwnerEmail}
                  onOwnerPasswordChange={setOwnerPassword}
                  onConfirmChange={setConfirm}
                />
              ) : null}

              {step === 2 ? (
                <ReviewStep
                  tenantName={tenantName}
                  tenantSlug={tenantSlug}
                  ownerEmail={ownerEmail}
                  error={error}
                />
              ) : null}

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setStep((value) => Math.max(value - 1, 0))}
                  disabled={step === 0 || loading}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-950 disabled:pointer-events-none disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>

                {step < 2 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={(step === 0 && !workspaceReady) || (step === 1 && !ownerReady)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black disabled:pointer-events-none disabled:opacity-40"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!canSubmit || loading}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#a3d900] px-6 py-3 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:brightness-95 disabled:pointer-events-none disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Create workspace
                  </button>
                )}
              </div>
            </form>
          )}
        </motion.div>
      </section>
    </main>
  );
}

function WorkspaceStep({
  tenantName,
  tenantSlug,
  slugError,
  onTenantNameChange,
  onTenantSlugChange,
}: {
  tenantName: string;
  tenantSlug: string;
  slugError: string;
  onTenantNameChange: (value: string) => void;
  onTenantSlugChange: (value: string) => void;
}) {
  return (
    <div>
      <StepHeading
        title="Workspace details"
        text="Choose the organization name and the URL-friendly workspace slug."
      />

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field label="Organization name">
          <input
            value={tenantName}
            onChange={(event) => onTenantNameChange(event.target.value)}
            placeholder="Acme Corporation"
            className={inputClassName}
          />
        </Field>

        <Field label="Workspace slug" error={slugError}>
          <input
            value={tenantSlug}
            onChange={(event) => onTenantSlugChange(event.target.value)}
            placeholder="acme"
            className={inputClassName}
          />
        </Field>
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Workspace URL preview:{" "}
        <span className="font-mono font-semibold text-slate-950">
          {tenantSlug ? `/t/${tenantSlug}` : "/t/your-workspace"}
        </span>
      </div>
    </div>
  );
}

function OwnerStep({
  ownerEmail,
  ownerPassword,
  confirm,
  passwordScore,
  onOwnerEmailChange,
  onOwnerPasswordChange,
  onConfirmChange,
}: {
  ownerEmail: string;
  ownerPassword: string;
  confirm: string;
  passwordScore: number;
  onOwnerEmailChange: (value: string) => void;
  onOwnerPasswordChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
}) {
  const emailError = ownerEmail && !isValidEmail(ownerEmail) ? "Enter a valid email address." : "";
  const confirmError = confirm && confirm !== ownerPassword ? "Passwords do not match." : "";

  return (
    <div>
      <StepHeading
        title="Owner account"
        text="This user becomes the first administrator for the workspace."
      />

      <div className="mt-6 space-y-5">
        <Field label="Owner email" error={emailError}>
          <input
            type="email"
            value={ownerEmail}
            onChange={(event) => onOwnerEmailChange(event.target.value)}
            placeholder="admin@company.com"
            className={inputClassName}
          />
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Password">
            <input
              type="password"
              value={ownerPassword}
              onChange={(event) => onOwnerPasswordChange(event.target.value)}
              placeholder="Minimum 8 characters"
              className={inputClassName}
            />
          </Field>

          <Field label="Confirm password" error={confirmError}>
            <input
              type="password"
              value={confirm}
              onChange={(event) => onConfirmChange(event.target.value)}
              placeholder="Re-enter password"
              className={inputClassName}
            />
          </Field>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Password strength</span>
          <span>{passwordScore >= 5 ? "Strong" : passwordScore >= 3 ? "Good" : ownerPassword ? "Weak" : "Not set"}</span>
        </div>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className={index < passwordScore ? "h-1.5 rounded-full bg-[#a3d900]" : "h-1.5 rounded-full bg-slate-200"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewStep({
  tenantName,
  tenantSlug,
  ownerEmail,
  error,
}: {
  tenantName: string;
  tenantSlug: string;
  ownerEmail: string;
  error: string | null;
}) {
  return (
    <div>
      <StepHeading
        title="Review and create"
        text="Confirm the workspace details before provisioning the owner account."
      />

      <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200">
        <ReviewRow label="Organization" value={tenantName} />
        <ReviewRow label="Workspace slug" value={`/${tenantSlug}`} />
        <ReviewRow label="Owner email" value={ownerEmail} />
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}

function SuccessState({
  slug,
  onLogin,
  onCreateAnother,
}: {
  slug: string;
  onLogin: () => void;
  onCreateAnother: () => void;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#a3d900]/20 text-[#5f8700]">
        <CheckCircle2 className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">Workspace created</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
        Check your email to verify the owner account, then sign in to continue.
      </p>

      <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-slate-50 px-4 py-3 text-sm">
        <span className="text-slate-500">Workspace:</span>{" "}
        <span className="font-mono font-semibold text-slate-950">/{slug}</span>
      </div>

      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onLogin}
          className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
        >
          Continue to login
        </button>
        <button
          type="button"
          onClick={onCreateAnother}
          className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Create another
        </button>
      </div>
    </div>
  );
}

function StepHeading({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-[-0.035em]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <span className="mt-2 block">{children}</span>
      {error ? <span className="mt-1.5 block text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-5 px-4 py-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-950">{value}</span>
    </div>
  );
}
