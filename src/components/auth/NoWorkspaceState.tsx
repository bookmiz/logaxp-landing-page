"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Link2, LogOut, Mail, Users } from "lucide-react";
import { useAuthStore } from "@/logaxp/stores/useAuthStore";

type Props = {
  appName?: string;
  suiteName?: string;
  onCreateWorkspace?: () => void;
  onRequestAccess?: () => void;
  onJoinWithCode?: (code: string) => Promise<void> | void;
  onSignOut?: () => Promise<void> | void;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function NoWorkspaceState({
  appName = "LogaXP",
  suiteName = "HR Suite",
  onCreateWorkspace,
  onRequestAccess,
  onJoinWithCode,
  onSignOut,
}: Props) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const email = user?.email ?? "you@example.com";

  const initials = useMemo(() => {
    const base = (email.split("@")[0] || "U")
      .split(/[.\s_-]+/)
      .filter(Boolean)
      .map((p) => p[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
    return base || "U";
  }, [email]);

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function join() {
    setError(null);
    const trimmed = code.trim();
    if (!trimmed) return setError("Enter your invite token.");

    try {
      setBusy(true);
      if (onJoinWithCode) await onJoinWithCode(trimmed);
      else router.push(`/auth/invitations/accept?token=${encodeURIComponent(trimmed)}`);
    } catch (e: any) {
      setError(e?.message ?? "Invite token failed. Check it and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    try {
      if (onSignOut) await onSignOut();
    } finally {
      useAuthStore.getState().clearSession();
      router.replace("/auth/login");
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-zinc-900 dark:text-white">
              No workspace access yet
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-white/60">
              You’re signed in as <span className="font-semibold">{email}</span>, but this account isn’t
              assigned to any workspace for <span className="font-semibold">{suiteName}</span>.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-sm font-black border border-zinc-200 dark:bg-white/10 dark:border-white/10 dark:text-white">
              {initials}
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1 text-xs text-zinc-600 dark:text-white/60">
                <Mail className="h-3.5 w-3.5" />
                {email}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-white/45">App: {appName}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            disabled={busy}
            onClick={() => (onCreateWorkspace ? onCreateWorkspace() : router.push("/auth/create-workspace"))}
            className={cx(
              "rounded-2xl border px-4 py-4 text-left transition",
              "border-zinc-200 hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/10",
              busy && "opacity-60 cursor-not-allowed"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#a3d900]/15 text-[#4a6b00] dark:text-[#d4ff47]">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-black text-zinc-900 dark:text-white">Create workspace</div>
                <div className="text-xs text-zinc-600 dark:text-white/60">
                  If you’re the owner/admin, start a new workspace.
                </div>
              </div>
            </div>
          </button>

          <button
            disabled={busy}
            onClick={() => (onRequestAccess ? onRequestAccess() : router.push("/auth/request-access"))}
            className={cx(
              "rounded-2xl border px-4 py-4 text-left transition",
              "border-zinc-200 hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/10",
              busy && "opacity-60 cursor-not-allowed"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-white/80">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-black text-zinc-900 dark:text-white">Request access</div>
                <div className="text-xs text-zinc-600 dark:text-white/60">
                  Ask a workspace admin to invite this email.
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-2 text-sm font-black text-zinc-900 dark:text-white">
            <Link2 className="h-4 w-4" /> Join with invite token
          </div>

          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste invite token from email"
              className={cx(
                "h-11 w-full rounded-xl border px-3 text-sm outline-none",
                "border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400",
                "focus:border-[#a3d900]/40 focus:ring-2 focus:ring-[#a3d900]/15",
                "dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/35"
              )}
            />
            <button
              onClick={join}
              disabled={busy}
              className={cx(
                "h-11 rounded-xl px-4 text-sm font-bold transition",
                "bg-zinc-900 text-white hover:bg-zinc-800",
                "dark:bg-white dark:text-black dark:hover:bg-white/90",
                busy && "opacity-60 cursor-not-allowed"
              )}
            >
              Join
            </button>
          </div>

          {error ? (
            <div className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-300">{error}</div>
          ) : null}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={signOut}
            disabled={busy}
            className={cx(
              "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition",
              "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900",
              "dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white",
              busy && "opacity-60 cursor-not-allowed"
            )}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-xs font-bold text-zinc-900 hover:underline dark:text-white"
          >
            Go home
          </button>
        </div>
      </div>
    </main>
  );
}