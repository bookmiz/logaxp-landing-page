"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Shield, KeyRound, FileText, Clock3, Lock } from "lucide-react";

type TabKey =
  | "change-password"
  | "security-policy"
  | "sessions-info"
  | "audit-info";

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("change-password");

  const tabs = useMemo(
    () => [
      {
        key: "change-password" as TabKey,
        label: "Change Password",
        icon: <KeyRound className="h-4 w-4" />,
      },
      {
        key: "security-policy" as TabKey,
        label: "Security Policy",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        key: "sessions-info" as TabKey,
        label: "Sessions",
        icon: <Clock3 className="h-4 w-4" />,
      },
      {
        key: "audit-info" as TabKey,
        label: "Audit & Tips",
        icon: <Shield className="h-4 w-4" />,
      },
    ],
    []
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-white via-neutral-50 to-lime-50/40 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="admin-page-heading">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-[#a3d900]/15 p-2.5">
              <Lock className="h-5 w-5 text-[#88b800]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                Security Settings
              </h1>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                Manage password, review security guidance, and keep your admin account protected.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur shadow-sm overflow-hidden">
          <div className="border-b border-black/10 dark:border-white/10 p-3">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={[
                      "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition",
                      isActive
                        ? "bg-[#a3d900] text-black shadow-sm"
                        : "bg-white dark:bg-white/5 text-neutral-700 dark:text-neutral-200 border border-black/10 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-white/10",
                    ].join(" ")}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {activeTab === "change-password" && <ChangePasswordTab />}
            {activeTab === "security-policy" && <SecurityPolicyTab />}
            {activeTab === "sessions-info" && <SessionsInfoTab />}
            {activeTab === "audit-info" && <AuditInfoTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChangePasswordTab() {
  // Replace this with your real password-change logic/hook/API call.
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const canSubmit =
    currentPassword.trim().length >= 6 &&
    newPassword.trim().length >= 8 &&
    confirmPassword.trim().length >= 8;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("New password and confirm password do not match.");
      return;
    }

    // TODO: connect to your change-password endpoint/hook
    setMessage("Password form submitted (connect API next).");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-4 sm:p-5">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          Change Password
        </h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
          Update your site admin password. Use a strong password you don’t reuse anywhere else.
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#a3d900]/40"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#a3d900]/40"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#a3d900]/40"
            />
          </div>

          {message && (
            <div className="rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200">
              {message}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl bg-[#a3d900] px-4 py-2.5 text-sm font-bold text-black disabled:opacity-50"
            >
              Update Password
            </button>

            {/* Optional link to your existing nested page */}
            <Link
              href="/site-admin/security/change-password"
              className="text-sm font-semibold text-[#88b800] hover:underline"
            >
              Open dedicated page
            </Link>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-4 sm:p-5">
        <h3 className="text-base font-bold text-neutral-900 dark:text-white">
          Password Tips
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-300 list-disc pl-5">
          <li>Use at least 12 characters if possible.</li>
          <li>Mix uppercase, lowercase, numbers, and symbols.</li>
          <li>Avoid names, birthdays, and reused passwords.</li>
          <li>Change immediately if you suspect compromise.</li>
        </ul>
      </div>
    </div>
  );
}

function SecurityPolicyTab() {
  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-5">
      <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
        Security Policy
      </h2>
      <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
        This tab can contain your organization’s security rules for site admins:
        password requirements, MFA expectations, login restrictions, and escalation
        procedures for suspicious account activity.
      </p>
      <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
        For now, this is a text tab placeholder. You can later load policy content
        from your backend or CMS.
      </p>
    </div>
  );
}

function SessionsInfoTab() {
  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-5">
      <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
        Sessions
      </h2>
      <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
        This tab can show active sessions, device info, login timestamps, IP
        locations (if tracked), and a “sign out all other sessions” action.
      </p>
      <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
        Right now it is a text-only tab as requested, ready for future integration.
      </p>
    </div>
  );
}

function AuditInfoTab() {
  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-5">
      <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
        Audit & Tips
      </h2>
      <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
        Add admin security activity here later: password changes, failed logins,
        role changes, token refresh anomalies, and account recovery events.
      </p>
      <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
        You can also show recommended actions like enabling MFA, rotating passwords,
        and reviewing recent login attempts.
      </p>
    </div>
  );
}