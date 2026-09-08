"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Check,
} from "lucide-react";
import { useAuth } from "@/logaxp/hooks/useAuth";

type ChangePasswordPageProps = {
  backHref: string;
  cancelHref?: string;
  successRedirectHref?: string;
  title?: string;
  subtitle?: string;
  areaLabel?: string; // e.g. "Portal", "Site Admin"
  cardClassName?: string;
};

type FieldErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  form?: string;
};

export default function ChangePasswordPage({
  backHref,
  cancelHref,
  successRedirectHref,
  title = "Change Password",
  subtitle = "Update your password to keep your account secure.",
  areaLabel = "Workspace",
  cardClassName = "",
}: ChangePasswordPageProps) {
  const router = useRouter();
  const { changePassword, loading, error } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState<string | null>(null);

  const passwordStrength = useMemo(() => {
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[a-z]/.test(newPassword)) score++;
    if (/\d/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;

    const label =
      score <= 1
        ? "Weak"
        : score <= 3
        ? "Medium"
        : score === 4
        ? "Strong"
        : "Very strong";

    return { score, label };
  }, [newPassword]);

  const strengthBarWidth = useMemo(
    () => `${(passwordStrength.score / 5) * 100}%`,
    [passwordStrength.score]
  );

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};

    if (!currentPassword.trim())
      next.currentPassword = "Current password is required.";
    if (!newPassword.trim()) next.newPassword = "New password is required.";
    if (!confirmPassword.trim())
      next.confirmPassword = "Please confirm your new password.";

    if (newPassword && newPassword.length < 8) {
      next.newPassword = "New password must be at least 8 characters.";
    }

    if (newPassword && currentPassword && newPassword === currentPassword) {
      next.newPassword =
        "New password must be different from your current password.";
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      next.confirmPassword = "Passwords do not match.";
    }

    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);

    const nextErrors = validate();
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    try {
      await changePassword({
        currentPassword,
        newPassword,
      });

      setSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      if (successRedirectHref) {
        setTimeout(() => router.push(successRedirectHref), 900);
      }
    } catch {
      // handled in useAuth
    }
  };

  const effectiveCancelHref = cancelHref ?? backHref;

  const checks = [
    {
      label: "At least 8 characters",
      ok: newPassword.length >= 8,
    },
    {
      label: "Uppercase and lowercase letters",
      ok: /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword),
    },
    {
      label: "At least one number",
      ok: /\d/.test(newPassword),
    },
    {
      label: "At least one symbol",
      ok: /[^A-Za-z0-9]/.test(newPassword),
    },
    {
      label: "Passwords match",
      ok: !!confirmPassword && newPassword === confirmPassword,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f5f1] dark:bg-neutral-950">
      {/* Background glow accents */}
      

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={[
            "overflow-hidden rounded-3xl border border-black/10 dark:border-white/10",
            "bg-white/90 dark:bg-white/5 backdrop-blur-xl",
            "shadow-[0_25px_80px_-35px_rgba(0,0,0,0.25)]",
            cardClassName,
          ].join(" ")}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* LEFT: FORM PANEL */}
            <div className="lg:col-span-7 xl:col-span-8">
              <div className="p-5 sm:p-8 lg:p-10">
                {/* Top bar */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href={backHref}
                    className="inline-flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3.5 py-2 text-sm font-medium text-neutral-800 dark:text-white/90 hover:bg-white transition"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Link>

                  <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-1.5">
                    <ShieldCheck className="h-4 w-4 text-[#a3d900]" />
                    <span className="text-xs font-semibold tracking-wide text-neutral-700 dark:text-white/80">
                      {areaLabel}
                    </span>
                  </div>
                </div>

                {/* Header */}
                <div className="mb-7">
                  <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-1.5">
                    <KeyRound className="h-4 w-4 text-[#a3d900]" />
                    <span className="text-xs font-bold tracking-[0.12em] uppercase text-neutral-700 dark:text-white/75">
                      Security
                    </span>
                  </div>

                  <h1 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
                    {title}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-white/65">
                    {subtitle}
                  </p>
                </div>

                {/* Success message */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3.5"
                  >
                    <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" />
                      {success}
                    </p>
                  </motion.div>
                )}

                {/* Backend error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3.5"
                  >
                    <p className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-300">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Current password */}
                  <PasswordField
                    label="Current password"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    show={showCurrent}
                    setShow={setShowCurrent}
                    error={fieldErrors.currentPassword}
                    placeholder="Enter current password"
                  />

                  {/* New password */}
                  <div className="space-y-3">
                    <PasswordField
                      label="New password"
                      value={newPassword}
                      onChange={setNewPassword}
                      show={showNew}
                      setShow={setShowNew}
                      error={fieldErrors.newPassword}
                      placeholder="Create new password"
                    />

                    {/* Strength meter */}
                    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-3">
                      <div className="mb-2 flex items-center justify-between text-xs font-medium text-neutral-600 dark:text-white/65">
                        <span>Password strength</span>
                        <span>{newPassword ? passwordStrength.label : "—"}</span>
                      </div>

                      <div className="h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-[#a3d900] transition-all duration-300"
                          style={{ width: newPassword ? strengthBarWidth : "0%" }}
                        />
                      </div>

                      <p className="mt-2 text-[11px] leading-relaxed text-neutral-500 dark:text-white/50">
                        Use at least 8 characters with uppercase, lowercase,
                        number, and symbol.
                      </p>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <PasswordField
                    label="Confirm new password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    show={showConfirm}
                    setShow={setShowConfirm}
                    error={fieldErrors.confirmPassword}
                    placeholder="Re-enter new password"
                  />

                  {/* Actions */}
                  <div className="pt-2 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                    <Link
                      href={effectiveCancelHref}
                      className="inline-flex items-center justify-center rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-4 py-3 text-sm font-semibold text-neutral-800 dark:text-white/90 hover:bg-white dark:hover:bg-white/10 transition"
                    >
                      Cancel
                    </Link>

                    <motion.button
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#a3d900] px-5 py-3 text-sm font-black text-black shadow-lg shadow-[#a3d900]/25 hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          Update Password
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>

            {/* RIGHT: SECURITY INFO PANEL */}
            <div className="hidden lg:block lg:col-span-5 xl:col-span-4 border-l border-black/10 dark:border-white/10 bg-gradient-to-b from-white/70 to-white/40 dark:from-white/5 dark:to-white/[0.03]">
              <div className="h-full p-8 xl:p-10 flex flex-col">
                <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-2xl bg-[#a3d900]/20">
                      <ShieldCheck className="h-5 w-5 text-[#7fb100]" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                        Password Security
                      </h2>
                      <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-white/65">
                        Create a strong password that is unique to this account.
                        Avoid reusing passwords across services.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 p-5">
                  <h3 className="text-sm font-bold tracking-wide text-neutral-800 dark:text-white/90">
                    Requirements checklist
                  </h3>

                  <div className="mt-4 space-y-3">
                    {checks.map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div
                          className={[
                            "grid h-5 w-5 place-items-center rounded-full border",
                            item.ok
                              ? "border-[#a3d900]/50 bg-[#a3d900]/20 text-[#6f9900]"
                              : "border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/5 text-neutral-400 dark:text-white/35",
                          ].join(" ")}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <p
                          className={[
                            "text-sm leading-snug",
                            item.ok
                              ? "text-neutral-800 dark:text-white"
                              : "text-neutral-500 dark:text-white/55",
                          ].join(" ")}
                        >
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 p-5">
                  <h3 className="text-sm font-bold tracking-wide text-neutral-800 dark:text-white/90">
                    Best practices
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-neutral-600 dark:text-white/65">
                    <li>• Use a password manager to generate/store passwords.</li>
                    <li>• Avoid names, birthdays, or predictable words.</li>
                    <li>• Change passwords immediately if compromised.</li>
                  </ul>
                </div>

                <div className="mt-auto pt-6 text-xs text-neutral-500 dark:text-white/45">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#a3d900]" />
                    <span>Protected security workflow</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer strip */}
          <div className="border-t border-black/10 dark:border-white/10 px-5 sm:px-8 lg:px-10 py-4 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-neutral-500 dark:text-white/45">
              Security settings
            </span>
            <span className="inline-flex items-center gap-1.5 text-neutral-600 dark:text-white/60">
              <ShieldCheck className="h-3.5 w-3.5 text-[#a3d900]" />
              Protected
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  error?: string;
  placeholder?: string;
};

function PasswordField({
  label,
  value,
  onChange,
  show,
  setShow,
  error,
  placeholder,
}: PasswordFieldProps) {
  return (
    <div className="space-y-2.5">
      <label className="flex items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-white/85">
        <Lock className="h-4 w-4 text-neutral-500 dark:text-white/55" />
        {label}
      </label>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={[
            "w-full rounded-2xl border bg-white/85 dark:bg-white/5 backdrop-blur",
            "px-4 py-3.5 pl-11 pr-12 text-sm sm:text-base outline-none transition",
            "text-neutral-900 dark:text-white placeholder:text-black/35 dark:placeholder:text-white/35",
            error
              ? "border-red-500/30 focus:ring-2 focus:ring-red-500/25 focus:border-red-500/30"
              : "border-black/10 dark:border-white/10 focus:ring-2 focus:ring-[#a3d900]/35 focus:border-[#a3d900]/35",
          ].join(" ")}
        />

        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/35 dark:text-white/35" />

        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-xl p-2 text-black/45 hover:text-black/70 hover:bg-black/5 dark:text-white/45 dark:hover:text-white/80 dark:hover:bg-white/5 transition"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? (
            <EyeOff className="h-4.5 w-4.5" />
          ) : (
            <Eye className="h-4.5 w-4.5" />
          )}
        </button>
      </div>

      {error ? (
        <p className="text-xs font-medium text-red-600 dark:text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}