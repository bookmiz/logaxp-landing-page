"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileKey2,
  Filter,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  RefreshCcw,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserCog,
  UserRound,
  UserX,
  Users,
  X,
} from "lucide-react";

import {
  useActivateSiteAdminUser,
  useDeleteSiteAdminUser,
  useDisableSiteAdminUser,
  useIssueSiteAdminPasswordReset,
  useResolveSiteAdminPasswordIssue,
  useRestoreSiteAdminUser,
  useRevokeAllSiteAdminSessions,
  useRevokeSiteAdminSession,
  useSiteAdminLoggedInUsers,
  useSiteAdminUser,
  useSiteAdminUserSecurity,
  useSiteAdminUsers,
  useSiteAdminUserSessions,
  useSiteAdminUserVerificationTokens,
  useSuspendSiteAdminUser,
  useVerifySiteAdminUserEmail,
} from "@/logaxp/hooks/useSiteAdminUsers";

import type {
  MembershipLite,
  RefreshTokenLite,
  ResolvePasswordIssueDto,
  SiteAdminUserDetails,
  SiteAdminUserListItem,
  TokenKind,
  UserStatus,
  VerificationTokenLite,
} from "@/logaxp/lib/site-admin/site-admin-users.types";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function titleCase(value?: string | null) {
  if (!value) return "—";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => (part ? part[0]!.toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function getUserName(user?: {
  email?: string;
  profile?: {
    displayName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
}) {
  const displayName = user?.profile?.displayName?.trim();
  if (displayName) return displayName;

  const fullName = `${user?.profile?.firstName ?? ""} ${user?.profile?.lastName ?? ""}`.trim();
  if (fullName) return fullName;

  return user?.email ?? "Unknown User";
}

function getStatusTone(status?: string | null) {
  const v = (status ?? "").toUpperCase();

  if (v === "ACTIVE" || v === "ACCEPTED") {
    return "emerald";
  }
  if (v === "PENDING_VERIFICATION" || v === "INVITED") {
    return "amber";
  }
  if (v === "SUSPENDED" || v === "DISABLED" || v === "REVOKED" || v === "EXPIRED") {
    return "rose";
  }
  if (v === "REMOVED" || v === "DELETED") {
    return "slate";
  }

  return "sky";
}

function Badge({
  label,
  tone = "slate",
}: {
  label: string;
  tone?: "emerald" | "amber" | "rose" | "slate" | "sky";
}) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : tone === "amber"
      ? "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
      : tone === "rose"
      ? "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300"
      : tone === "sky"
      ? "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300"
      : "border-black/10 bg-black/[0.04] text-neutral-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/70";

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
        toneClass,
      )}
    >
      {label}
    </span>
  );
}

function SectionCard({
  title,
  subtitle,
  right,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "rounded-[28px] border border-black/10 bg-white/80 shadow-[0_16px_50px_-22px_rgba(0,0,0,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_16px_50px_-22px_rgba(0,0,0,0.45)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/10 px-4 py-4 dark:border-white/10 sm:px-5">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-1 text-[12px] text-neutral-500 dark:text-white/50">
              {subtitle}
            </p>
          ) : null}
        </div>
        {right}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon,
  meta,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  meta?: string;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-gradient-to-b from-white to-neutral-50/80 p-4 shadow-[0_14px_35px_-20px_rgba(0,0,0,0.18)] dark:border-white/10 dark:from-white/[0.05] dark:to-white/[0.02] dark:shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-neutral-500 dark:text-white/45">
            {label}
          </div>
          <div className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-white">
            {value}
          </div>
          {meta ? (
            <div className="mt-2 text-[12px] text-neutral-500 dark:text-white/45">
              {meta}
            </div>
          ) : null}
        </div>
        <div className="grid h-9 w-11 place-items-center rounded-2xl border border-black/10 bg-black/[0.04] text-neutral-800 dark:border-white/10 dark:bg-white/[0.05] dark:text-white">
          {icon}
        </div>
      </div>
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cx(
        "h-9 w-full rounded-2xl border border-black/10 bg-white px-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-black/20 focus:ring-2 focus:ring-black/5 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/20 dark:focus:ring-white/5",
        className,
      )}
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cx(
        "h-9 w-full rounded-2xl border border-black/10 bg-white px-3 text-sm outline-none transition focus:border-black/20 focus:ring-2 focus:ring-black/5 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:border-white/20 dark:focus:ring-white/5",
        className,
      )}
    >
      {options.map((item) => (
        <option key={`${item.label}-${item.value}`} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-black/20 focus:ring-2 focus:ring-black/5 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/20 dark:focus:ring-white/5"
    />
  );
}

function CheckboxField({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-black/10 bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.03]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-black/20"
      />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-neutral-900 dark:text-white">
          {label}
        </span>
        {hint ? (
          <span className="mt-1 block text-[12px] text-neutral-500 dark:text-white/45">
            {hint}
          </span>
        ) : null}
      </span>
    </label>
  );
}

function EmptyState({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-black/10 px-4 py-10 text-center dark:border-white/10">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-black/10 bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.05]">
        <Users className="h-5 w-5 text-neutral-700 dark:text-white/65" />
      </div>
      <h4 className="mt-4 text-sm font-bold text-neutral-900 dark:text-white">
        {title}
      </h4>
      {subtitle ? (
        <p className="mt-1 text-[12px] text-neutral-500 dark:text-white/45">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  widthClass = "max-w-3xl",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  widthClass?: string;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close drawer overlay"
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.35 }}
            className={cx(
              "fixed right-0 top-0 z-[101] h-full w-full border-l border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-[#09090b]",
              widthClass,
            )}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3 border-b border-black/10 px-5 py-4 dark:border-white/10">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {title}
                  </h2>
                  {subtitle ? (
                    <p className="mt-1 text-[12px] text-neutral-500 dark:text-white/45">
                      {subtitle}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="grid h-10 w-10 place-items-center rounded-2xl border border-black/10 bg-white text-neutral-800 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close modal overlay"
            className="fixed inset-0 z-[110] bg-black/55 backdrop-blur-[2px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="fixed left-1/2 top-1/2 z-[111] w-[min(96vw,760px)] -translate-x-1/2 -translate-y-1/2 rounded-[30px] border border-black/10 bg-white shadow-[0_30px_120px_-24px_rgba(0,0,0,0.45)] dark:border-white/10 dark:bg-[#0b0b10]"
          >
            <div className="flex items-start justify-between gap-3 border-b border-black/10 px-5 py-4 dark:border-white/10">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {title}
                </h3>
                {subtitle ? (
                  <p className="mt-1 text-[12px] text-neutral-500 dark:text-white/45">
                    {subtitle}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-black/10 bg-white text-neutral-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[78vh] overflow-y-auto p-5">{children}</div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function LoadingBlock({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-black/[0.02] px-4 py-10 text-sm text-neutral-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/60">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
      <div className="text-[12px] text-neutral-500 dark:text-white/45">
        Page {page} of {Math.max(totalPages, 1)}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={page <= 1}
          className="inline-flex h-10 items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 text-sm font-semibold text-neutral-800 transition disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={page >= totalPages}
          className="inline-flex h-10 items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 text-sm font-semibold text-neutral-800 transition disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function MembershipMiniCard({ membership }: { membership: MembershipLite }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/80 p-3 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-sm font-semibold text-neutral-900 dark:text-white">
          {membership.tenant?.name ?? membership.tenantId}
        </div>
        <Badge
          label={titleCase(membership.status)}
          tone={getStatusTone(membership.status)}
        />
        {membership.isOwner ? <Badge label="Owner" tone="sky" /> : null}
      </div>

      <div className="mt-2 text-[12px] text-neutral-500 dark:text-white/45">
        {membership.tenant?.slug ?? "—"} • {membership.title ?? "No title"}
      </div>

      {membership.roles?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {membership.roles.map((role) => (
            <Badge key={role.id} label={role.role.name} tone="slate" />
          ))}
        </div>
      ) : null}
    </div>
  );
}

type FeedbackState =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

export default function SiteAdminUsersWorkspace({
  initialSelectedUserId,
}: {
  initialSelectedUserId?: string;
}) {
  const [tab, setTab] = useState<"all" | "logged-in">("all");

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [siteAdminFilter, setSiteAdminFilter] = useState("");
  const [membershipStatusFilter, setMembershipStatusFilter] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [tenantIdFilter, setTenantIdFilter] = useState("");

  const [page, setPage] = useState(1);

  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(
    initialSelectedUserId,
  );
  const [detailsOpen, setDetailsOpen] = useState(Boolean(initialSelectedUserId));
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const [sessionPage, setSessionPage] = useState(1);
  const [activeSessionsOnly, setActiveSessionsOnly] = useState(true);

  const [verificationPage, setVerificationPage] = useState(1);
  const [verificationActiveOnly, setVerificationActiveOnly] = useState(true);
  const [verificationKind, setVerificationKind] = useState<TokenKind | "">("");

  const [securityLimit, setSecurityLimit] = useState(20);

  const [actionReason, setActionReason] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const [resolvePayload, setResolvePayload] = useState<ResolvePasswordIssueDto>({
    revokeAllSessions: true,
    clearPasswordResetTokens: true,
    issueNewPasswordResetToken: true,
    markEmailVerified: false,
    activateUser: false,
    reason: "",
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (initialSelectedUserId) {
      setSelectedUserId(initialSelectedUserId);
      setDetailsOpen(true);
    }
  }, [initialSelectedUserId]);

  useEffect(() => {
    setSessionPage(1);
  }, [selectedUserId, activeSessionsOnly]);

  useEffect(() => {
    setVerificationPage(1);
  }, [selectedUserId, verificationActiveOnly, verificationKind]);

  const listParams = useMemo(
    () => ({
      q: debouncedSearch || undefined,
      status: (statusFilter || undefined) as UserStatus | undefined,
      isSiteAdmin:
        siteAdminFilter === ""
          ? undefined
          : siteAdminFilter === "true"
          ? true
          : false,
      includeDeleted,
      membershipStatus: (membershipStatusFilter || undefined) as
        | "INVITED"
        | "ACTIVE"
        | "SUSPENDED"
        | "REMOVED"
        | undefined,
      tenantId: tenantIdFilter || undefined,
      sortBy: sortBy as
        | "createdAt"
        | "email"
        | "status"
        | "lastLoginAt"
        | "updatedAt",
      sortOrder: sortOrder as "asc" | "desc",
      page,
      pageSize: 12,
    }),
    [
      debouncedSearch,
      statusFilter,
      siteAdminFilter,
      includeDeleted,
      membershipStatusFilter,
      tenantIdFilter,
      sortBy,
      sortOrder,
      page,
    ],
  );

  const loggedInParams = useMemo(
    () => ({
      q: debouncedSearch || undefined,
      tenantId: tenantIdFilter || undefined,
      page,
      pageSize: 12,
    }),
    [debouncedSearch, tenantIdFilter, page],
  );

  const usersQuery = useSiteAdminUsers(listParams);
  const loggedInUsersQuery = useSiteAdminLoggedInUsers(loggedInParams);

  const selectedUserQuery = useSiteAdminUser(selectedUserId);
  const selectedUserSessionsQuery = useSiteAdminUserSessions(selectedUserId, {
    activeOnly: activeSessionsOnly,
    page: sessionPage,
    pageSize: 10,
  });
  const selectedUserSecurityQuery = useSiteAdminUserSecurity(selectedUserId, {
    limit: securityLimit,
  });
  const selectedUserVerificationTokensQuery = useSiteAdminUserVerificationTokens(
    selectedUserId,
    {
      activeOnly: verificationActiveOnly,
      kind: verificationKind || undefined,
      page: verificationPage,
      pageSize: 10,
    },
  );

  const activateMutation = useActivateSiteAdminUser();
  const suspendMutation = useSuspendSiteAdminUser();
  const disableMutation = useDisableSiteAdminUser();
  const restoreMutation = useRestoreSiteAdminUser();
  const deleteMutation = useDeleteSiteAdminUser();
  const verifyEmailMutation = useVerifySiteAdminUserEmail();
  const issueResetMutation = useIssueSiteAdminPasswordReset();
  const resolvePasswordMutation = useResolveSiteAdminPasswordIssue();
  const revokeSessionMutation = useRevokeSiteAdminSession();
  const revokeAllSessionsMutation = useRevokeAllSiteAdminSessions();

  const activeListQuery = tab === "all" ? usersQuery : loggedInUsersQuery;
  const activeList = activeListQuery.data;

  const topStats = useMemo(() => {
    const items = activeList?.items ?? [];
    return {
      total: activeList?.meta.total ?? 0,
      active: items.filter((u) => u.status === "ACTIVE").length,
      suspended: items.filter((u) => u.status === "SUSPENDED").length,
      siteAdmins: items.filter((u) => u.isSiteAdmin).length,
      verified: items.filter((u) => Boolean(u.emailVerifiedAt)).length,
      sessions: items.reduce((acc, item) => acc + (item.activeSessionsCount ?? 0), 0),
    };
  }, [activeList]);

  async function runAction(
    action: () => Promise<unknown>,
    successMessage: string,
  ) {
    try {
      setFeedback(null);
      await action();
      setFeedback({ type: "success", message: successMessage });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      setFeedback({ type: "error", message });
    }
  }

  function openUser(userId: string) {
    setSelectedUserId(userId);
    setDetailsOpen(true);
    setFeedback(null);
  }

  function closeUserDetails() {
    setDetailsOpen(false);
  }

  const selectedUser = selectedUserQuery.data;

  const busy =
    activateMutation.isPending ||
    suspendMutation.isPending ||
    disableMutation.isPending ||
    restoreMutation.isPending ||
    deleteMutation.isPending ||
    verifyEmailMutation.isPending ||
    issueResetMutation.isPending ||
    resolvePasswordMutation.isPending ||
    revokeSessionMutation.isPending ||
    revokeAllSessionsMutation.isPending;

  return (
    <div className="space-y-5">
      <section className="admin-page-heading">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/55">
              <Shield className="h-3.5 w-3.5" />
              Accounts & access
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
              People
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-600 dark:text-white/55">
              Manage accounts, access and recovery across your platform.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                void activeListQuery.refetch();
                if (selectedUserId) {
                  void selectedUserQuery.refetch();
                  void selectedUserSecurityQuery.refetch();
                  void selectedUserSessionsQuery.refetch();
                  void selectedUserVerificationTokensQuery.refetch();
                }
              }}
              className="inline-flex h-9 items-center gap-2 rounded-2xl border border-black/10 bg-neutral-900 px-4 text-sm font-semibold text-white transition hover:opacity-90 dark:border-white/10 dark:bg-white dark:text-neutral-900"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {feedback ? (
        <div
          className={cx(
            "rounded-xl border px-4 py-3 text-sm",
            feedback.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
              : "border-rose-500/20 bg-rose-500/10 text-rose-800 dark:text-rose-300",
          )}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard
          label="Total in View"
          value={String(topStats.total)}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Active"
          value={String(topStats.active)}
          icon={<UserCheck className="h-5 w-5" />}
        />
        <StatCard
          label="Suspended"
          value={String(topStats.suspended)}
          icon={<ShieldAlert className="h-5 w-5" />}
        />
        <StatCard
          label="Site Admins"
          value={String(topStats.siteAdmins)}
          icon={<Shield className="h-5 w-5" />}
        />
        <StatCard
          label="Verified Emails"
          value={String(topStats.verified)}
          icon={<BadgeCheck className="h-5 w-5" />}
        />
        <StatCard
          label="Active Sessions"
          value={String(topStats.sessions)}
          icon={<Clock3 className="h-5 w-5" />}
        />
      </div>

      <SectionCard
        title="User Directory"
        subtitle="Live user management across the platform"
        right={
          <div className="inline-flex rounded-2xl border border-black/10 bg-black/[0.03] p-1 dark:border-white/10 dark:bg-white/[0.04]">
            <button
              type="button"
              onClick={() => {
                setTab("all");
                setPage(1);
              }}
              className={cx(
                "rounded-[14px] px-3 py-2 text-sm font-semibold transition",
                tab === "all"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "text-neutral-600 dark:text-white/60",
              )}
            >
              All Users
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("logged-in");
                setPage(1);
              }}
              className={cx(
                "rounded-[14px] px-3 py-2 text-sm font-semibold transition",
                tab === "logged-in"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "text-neutral-600 dark:text-white/60",
              )}
            >
              Logged In Users
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-6">
          <div className="xl:col-span-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-white/35" />
              <TextInput
                value={searchInput}
                onChange={setSearchInput}
                placeholder="Search email or name"
                className="pl-10"
              />
            </div>
          </div>

          <SelectInput
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            options={[
              { label: "All statuses", value: "" },
              { label: "Active", value: "ACTIVE" },
              { label: "Pending verification", value: "PENDING_VERIFICATION" },
              { label: "Suspended", value: "SUSPENDED" },
              { label: "Disabled", value: "DISABLED" },
            ]}
          />

          <SelectInput
            value={siteAdminFilter}
            onChange={(value) => {
              setSiteAdminFilter(value);
              setPage(1);
            }}
            options={[
              { label: "All roles", value: "" },
              { label: "Site admins only", value: "true" },
              { label: "Non-site-admin only", value: "false" },
            ]}
          />

          <SelectInput
            value={membershipStatusFilter}
            onChange={(value) => {
              setMembershipStatusFilter(value);
              setPage(1);
            }}
            options={[
              { label: "All membership states", value: "" },
              { label: "Invited", value: "INVITED" },
              { label: "Active", value: "ACTIVE" },
              { label: "Suspended", value: "SUSPENDED" },
              { label: "Removed", value: "REMOVED" },
            ]}
          />

          <TextInput
            value={tenantIdFilter}
            onChange={(value) => {
              setTenantIdFilter(value);
              setPage(1);
            }}
            placeholder="Filter by tenantId"
          />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-5">
          <SelectInput
            value={sortBy}
            onChange={(value) => {
              setSortBy(value);
              setPage(1);
            }}
            options={[
              { label: "Sort by created date", value: "createdAt" },
              { label: "Sort by email", value: "email" },
              { label: "Sort by status", value: "status" },
              { label: "Sort by last login", value: "lastLoginAt" },
              { label: "Sort by updated date", value: "updatedAt" },
            ]}
          />

          <SelectInput
            value={sortOrder}
            onChange={(value) => {
              setSortOrder(value);
              setPage(1);
            }}
            options={[
              { label: "Descending", value: "desc" },
              { label: "Ascending", value: "asc" },
            ]}
          />

          <label className="inline-flex h-9 items-center gap-3 rounded-2xl border border-black/10 bg-white px-3 text-sm font-medium text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => {
                setIncludeDeleted(e.target.checked);
                setPage(1);
              }}
              className="h-4 w-4 rounded border-black/20"
            />
            Include deleted users
          </label>

          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setDebouncedSearch("");
              setStatusFilter("");
              setSiteAdminFilter("");
              setMembershipStatusFilter("");
              setIncludeDeleted(false);
              setSortBy("createdAt");
              setSortOrder("desc");
              setTenantIdFilter("");
              setPage(1);
            }}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-neutral-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
          >
            <Filter className="h-4 w-4" />
            Reset Filters
          </button>

          <div className="flex items-center justify-end text-[12px] text-neutral-500 dark:text-white/45">
            {activeListQuery.isFetching ? "Refreshing live data..." : "Live endpoint"}
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[28px] border border-black/10 dark:border-white/10">
          <div className="hidden grid-cols-12 gap-3 border-b border-black/10 bg-black/[0.03] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/40 lg:grid">
            <div className="col-span-3">User</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Site Admin</div>
            <div className="col-span-1">Memberships</div>
            <div className="col-span-1">Sessions</div>
            <div className="col-span-2">Last Login</div>
            <div className="col-span-2">Actions</div>
          </div>

          {activeListQuery.isLoading ? (
            <LoadingBlock label="Loading users..." />
          ) : !activeList?.items?.length ? (
            <div className="p-5">
              <EmptyState
                title="No users found"
                subtitle="Try adjusting your search or filters."
              />
            </div>
          ) : (
            <div className="divide-y divide-black/10 dark:divide-white/10">
              {activeList.items.map((user: SiteAdminUserListItem) => (
                <div
                  key={user.id}
                  className="grid grid-cols-1 gap-3 px-4 py-4 lg:grid-cols-12 lg:items-center"
                >
                  <div className="lg:col-span-3">
                    <button
                      type="button"
                      onClick={() => openUser(user.id)}
                      className="text-left"
                    >
                      <div className="font-semibold text-neutral-900 transition hover:text-neutral-600 dark:text-white dark:hover:text-white/70">
                        {getUserName(user)}
                      </div>
                      <div className="mt-1 text-[12px] text-neutral-500 dark:text-white/45">
                        {user.email}
                      </div>
                    </button>
                  </div>

                  <div className="lg:col-span-2 flex flex-wrap items-center gap-2">
                    <Badge
                      label={titleCase(user.status)}
                      tone={getStatusTone(user.status)}
                    />
                    {user.deletedAt ? <Badge label="Deleted" tone="slate" /> : null}
                    {!user.emailVerifiedAt ? (
                      <Badge label="Unverified" tone="amber" />
                    ) : null}
                  </div>

                  <div className="lg:col-span-1">
                    {user.isSiteAdmin ? (
                      <Badge label="Yes" tone="sky" />
                    ) : (
                      <span className="text-sm text-neutral-500 dark:text-white/45">
                        No
                      </span>
                    )}
                  </div>

                  <div className="lg:col-span-1 text-sm font-semibold text-neutral-900 dark:text-white">
                    {user._count.memberships}
                  </div>

                  <div className="lg:col-span-1 text-sm font-semibold text-neutral-900 dark:text-white">
                    {user.activeSessionsCount}
                  </div>

                  <div className="lg:col-span-2 text-[12px] text-neutral-600 dark:text-white/55">
                    {formatDateTime(user.lastLoginAt)}
                  </div>

                  <div className="lg:col-span-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openUser(user.id)}
                        className="inline-flex h-9 items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 text-[12px] font-semibold text-neutral-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>

                      <Link
                        href={`/site-admin/users/${user.id}`}
                        className="inline-flex h-9 items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 text-[12px] font-semibold text-neutral-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                        Page
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Pagination
          page={activeList?.meta.page ?? 1}
          totalPages={activeList?.meta.totalPages ?? 1}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() =>
            setPage((p) =>
              Math.min(activeList?.meta.totalPages ?? p, p + 1),
            )
          }
        />
      </SectionCard>

      <Drawer
        open={detailsOpen}
        onClose={closeUserDetails}
        title={selectedUser ? getUserName(selectedUser) : "User Details"}
        subtitle={selectedUser?.email ?? "Inspect account, sessions, security, and recovery operations"}
        widthClass="max-w-[1200px]"
      >
        {!selectedUserId || selectedUserQuery.isLoading ? (
          <LoadingBlock label="Loading user details..." />
        ) : !selectedUser ? (
          <EmptyState title="User not found" />
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
              <div className="xl:col-span-3 space-y-4">
                <SectionCard
                  title="Identity Overview"
                  subtitle="Primary account state and profile"
                  className="shadow-none"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <StatCard
                      label="Status"
                      value={titleCase(selectedUser.status)}
                      icon={<UserRound className="h-5 w-5" />}
                      meta={selectedUser.deletedAt ? "Deleted user record" : undefined}
                    />
                    <StatCard
                      label="Memberships"
                      value={String(selectedUser._count.memberships)}
                      icon={<Building2 className="h-5 w-5" />}
                    />
                    <StatCard
                      label="Active Sessions"
                      value={String(selectedUser.activeSessionsCount)}
                      icon={<Clock3 className="h-5 w-5" />}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]">
                      <div className="text-[11px] uppercase tracking-[0.12em] text-neutral-500 dark:text-white/45">
                        Email
                      </div>
                      <div className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
                        {selectedUser.email}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge
                          label={
                            selectedUser.emailVerifiedAt
                              ? "Verified"
                              : "Not Verified"
                          }
                          tone={
                            selectedUser.emailVerifiedAt ? "emerald" : "amber"
                          }
                        />
                        {selectedUser.isSiteAdmin ? (
                          <Badge label="Site Admin" tone="sky" />
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]">
                      <div className="text-[11px] uppercase tracking-[0.12em] text-neutral-500 dark:text-white/45">
                        Activity
                      </div>
                      <div className="mt-1 text-sm text-neutral-700 dark:text-white/65">
                        Last login: <strong>{formatDateTime(selectedUser.lastLoginAt)}</strong>
                      </div>
                      <div className="mt-1 text-sm text-neutral-700 dark:text-white/65">
                        Created: <strong>{formatDateTime(selectedUser.createdAt)}</strong>
                      </div>
                      <div className="mt-1 text-sm text-neutral-700 dark:text-white/65">
                        Updated: <strong>{formatDateTime(selectedUser.updatedAt)}</strong>
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Memberships and Access"
                  subtitle="Tenant access, role grants, and linked employee records"
                  className="shadow-none"
                >
                  {selectedUser.memberships?.length ? (
                    <div className="grid grid-cols-1 gap-3">
                      {selectedUser.memberships.map((membership) => (
                        <MembershipMiniCard
                          key={membership.id}
                          membership={membership}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No memberships found"
                      subtitle="This user currently has no tenant memberships."
                    />
                  )}
                </SectionCard>
              </div>

              <div className="xl:col-span-2 space-y-4">
                <SectionCard
                  title="Administrative Actions"
                  subtitle="Live mutations against the user endpoints"
                  className="shadow-none"
                >
                  <div className="space-y-6">
                    <TextArea
                      value={actionReason}
                      onChange={setActionReason}
                      placeholder="Optional admin reason for status changes, revocations, or verification actions..."
                      rows={3}
                    />

                    {/* Account Status Section */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        Account Status
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            runAction(
                              () =>
                                activateMutation.mutateAsync({
                                  userId: selectedUser.id,
                                  payload: { reason: actionReason || undefined },
                                }),
                              "User activated successfully.",
                            )
                          }
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-sm font-medium text-emerald-700 dark:text-emerald-300"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          Activate
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            runAction(
                              () =>
                                suspendMutation.mutateAsync({
                                  userId: selectedUser.id,
                                  payload: { reason: actionReason || undefined },
                                }),
                              "User suspended successfully.",
                            )
                          }
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 text-sm font-medium text-amber-700 dark:text-amber-300"
                        >
                          <ShieldAlert className="h-3.5 w-3.5" />
                          Suspend
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            runAction(
                              () =>
                                disableMutation.mutateAsync({
                                  userId: selectedUser.id,
                                  payload: { reason: actionReason || undefined },
                                }),
                              "User disabled successfully.",
                            )
                          }
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 text-sm font-medium text-rose-700 dark:text-rose-300"
                        >
                          <UserX className="h-3.5 w-3.5" />
                          Disable
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            runAction(
                              () =>
                                restoreMutation.mutateAsync({
                                  userId: selectedUser.id,
                                  payload: { reason: actionReason || undefined },
                                }),
                              "User restored successfully.",
                            )
                          }
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-sky-500/20 bg-sky-500/10 text-sm font-medium text-sky-700 dark:text-sky-300"
                        >
                          <RefreshCcw className="h-3.5 w-3.5" />
                          Restore
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            runAction(
                              () =>
                                deleteMutation.mutateAsync({
                                  userId: selectedUser.id,
                                  payload: { reason: actionReason || undefined },
                                }),
                              "User soft-deleted successfully.",
                            )
                          }
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 text-sm font-medium text-rose-700 dark:text-rose-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Soft Delete
                        </button>
                      </div>
                    </div>

                    {/* Account Management Section */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        Account Management
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            runAction(
                              () =>
                                verifyEmailMutation.mutateAsync({
                                  userId: selectedUser.id,
                                  payload: { reason: actionReason || undefined },
                                }),
                              "Email marked as verified.",
                            )
                          }
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white text-sm font-medium text-neutral-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Verify Email
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            runAction(
                              () =>
                                issueResetMutation.mutateAsync({
                                  userId: selectedUser.id,
                                  payload: { ttlMinutes: 60 },
                                }),
                              "Password reset issued successfully.",
                            )
                          }
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white text-sm font-medium text-neutral-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          Issue Reset
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setPasswordModalOpen(true)}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-black/10 bg-neutral-900 text-sm font-medium text-white dark:border-white/10 dark:bg-white dark:text-neutral-900"
                        >
                          <Lock className="h-3.5 w-3.5" />
                          Resolve Password
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setSessionsOpen(true)}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white text-sm font-medium text-neutral-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                        >
                          <Clock3 className="h-3.5 w-3.5" />
                          View Sessions
                        </button>
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Security Activity"
                  subtitle="Events, audits, and support-session trail"
                  className="shadow-none"
                  right={
                    <SelectInput
                      value={String(securityLimit)}
                      onChange={(value) => setSecurityLimit(Number(value))}
                      options={[
                        { label: "20 items", value: "20" },
                        { label: "40 items", value: "40" },
                        { label: "60 items", value: "60" },
                      ]}
                      className="min-w-[120px]"
                    />
                  }
                >
                  {selectedUserSecurityQuery.isLoading ? (
                    <LoadingBlock label="Loading security activity..." />
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-white/45">
                          Security Events
                        </div>
                        <div className="space-y-2">
                          {selectedUserSecurityQuery.data?.securityEvents?.length ? (
                            selectedUserSecurityQuery.data.securityEvents.map((item) => (
                              <div
                                key={item.id}
                                className="rounded-2xl border border-black/10 bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.03]"
                              >
                                <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                                  {item.type}
                                </div>
                                <div className="mt-1 text-[12px] text-neutral-500 dark:text-white/45">
                                  {formatDateTime(item.createdAt)}
                                </div>
                              </div>
                            ))
                          ) : (
                            <EmptyState title="No security events found" />
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-white/45">
                          Recent Audit Logs
                        </div>
                        <div className="space-y-2">
                          {selectedUserSecurityQuery.data?.recentAuditLogs?.length ? (
                            selectedUserSecurityQuery.data.recentAuditLogs.map((item) => (
                              <div
                                key={item.id}
                                className="rounded-2xl border border-black/10 bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.03]"
                              >
                                <div className="flex items-center gap-2">
                                  <Badge
                                    label={titleCase(item.action)}
                                    tone={getStatusTone(item.action)}
                                  />
                                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    {item.entityType}
                                  </span>
                                </div>
                                <div className="mt-1 text-[12px] text-neutral-500 dark:text-white/45">
                                  {formatDateTime(item.createdAt)}
                                </div>
                              </div>
                            ))
                          ) : (
                            <EmptyState title="No audit logs found" />
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-white/45">
                          Support Sessions
                        </div>
                        <div className="space-y-2">
                          {selectedUserSecurityQuery.data?.supportSessions?.length ? (
                            selectedUserSecurityQuery.data.supportSessions.map((item) => (
                              <div
                                key={item.id}
                                className="rounded-2xl border border-black/10 bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.03]"
                              >
                                <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                                  {item.reason || "Support session"}
                                </div>
                                <div className="mt-1 text-[12px] text-neutral-500 dark:text-white/45">
                                  Started {formatDateTime(item.startedAt)} • Expires{" "}
                                  {formatDateTime(item.expiresAt)}
                                </div>
                              </div>
                            ))
                          ) : (
                            <EmptyState title="No support sessions found" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </SectionCard>
              </div>
            </div>

            <SectionCard
              title="Verification Tokens"
              subtitle="Password reset, email verification, and magic-link history"
              className="shadow-none"
              right={
                <div className="flex flex-wrap gap-2">
                  <SelectInput
                    value={verificationKind}
                    onChange={(value) => setVerificationKind((value as TokenKind) || "")}
                    options={[
                      { label: "All token kinds", value: "" },
                      { label: "Password reset", value: "PASSWORD_RESET" },
                      { label: "Email verification", value: "EMAIL_VERIFICATION" },
                      { label: "Magic link", value: "MAGIC_LINK" },
                    ]}
                    className="min-w-[180px]"
                  />
                  <label className="inline-flex h-9 items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 text-sm font-medium text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70">
                    <input
                      type="checkbox"
                      checked={verificationActiveOnly}
                      onChange={(e) => setVerificationActiveOnly(e.target.checked)}
                      className="h-4 w-4 rounded border-black/20"
                    />
                    Active only
                  </label>
                </div>
              }
            >
              {selectedUserVerificationTokensQuery.isLoading ? (
                <LoadingBlock label="Loading verification tokens..." />
              ) : !selectedUserVerificationTokensQuery.data?.items?.length ? (
                <EmptyState
                  title="No verification tokens found"
                  subtitle="This user has no matching token records."
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedUserVerificationTokensQuery.data.items.map(
                      (token: VerificationTokenLite) => (
                        <div
                          key={token.id}
                          className="rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              label={titleCase(token.kind)}
                              tone={token.isActive ? "emerald" : "slate"}
                            />
                            {token.isActive ? (
                              <Badge label="Active" tone="emerald" />
                            ) : token.consumedAt ? (
                              <Badge label="Consumed" tone="slate" />
                            ) : (
                              <Badge label="Expired" tone="rose" />
                            )}
                          </div>

                          <div className="mt-2 text-[12px] text-neutral-500 dark:text-white/45">
                            Created {formatDateTime(token.createdAt)} • Expires{" "}
                            {formatDateTime(token.expiresAt)}
                          </div>
                        </div>
                      ),
                    )}
                  </div>

                  <Pagination
                    page={selectedUserVerificationTokensQuery.data.meta.page}
                    totalPages={
                      selectedUserVerificationTokensQuery.data.meta.totalPages
                    }
                    onPrev={() =>
                      setVerificationPage((p) => Math.max(1, p - 1))
                    }
                    onNext={() =>
                      setVerificationPage((p) =>
                        Math.min(
                          selectedUserVerificationTokensQuery.data?.meta
                            .totalPages ?? p,
                          p + 1,
                        ),
                      )
                    }
                  />
                </>
              )}
            </SectionCard>
          </div>
        )}
      </Drawer>

      <Drawer
        open={sessionsOpen}
        onClose={() => setSessionsOpen(false)}
        title="User Sessions"
        subtitle={
          selectedUser ? `Manage active and historical sessions for ${selectedUser.email}` : ""
        }
        widthClass="max-w-[920px]"
      >
        {!selectedUserId ? (
          <EmptyState title="No user selected" />
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <label className="inline-flex h-9 items-center gap-3 rounded-2xl border border-black/10 bg-white px-3 text-sm font-medium text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70">
                <input
                  type="checkbox"
                  checked={activeSessionsOnly}
                  onChange={(e) => setActiveSessionsOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-black/20"
                />
                Active sessions only
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy || !selectedUserId}
                  onClick={() =>
                    runAction(
                      () =>
                        revokeAllSessionsMutation.mutateAsync({
                          userId: selectedUserId,
                          payload: { reason: actionReason || undefined },
                        }),
                      "All user sessions revoked successfully.",
                    )
                  }
                  className="inline-flex h-9 items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 text-sm font-semibold text-rose-700 dark:text-rose-300"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Revoke All Sessions
                </button>
              </div>
            </div>

            {selectedUserSessionsQuery.isLoading ? (
              <LoadingBlock label="Loading sessions..." />
            ) : !selectedUserSessionsQuery.data?.items?.length ? (
              <EmptyState
                title="No sessions found"
                subtitle="No session records match the current filter."
              />
            ) : (
              <>
                <div className="space-y-3">
                  {selectedUserSessionsQuery.data.items.map((session: RefreshTokenLite) => (
                    <div
                      key={session.id}
                      className="rounded-xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              label={session.isActive ? "Active" : "Inactive"}
                              tone={session.isActive ? "emerald" : "slate"}
                            />
                            {session.tenantId ? (
                              <Badge label="Tenant scoped" tone="sky" />
                            ) : null}
                          </div>

                          <div className="mt-3 grid grid-cols-1 gap-2 text-[12px] text-neutral-600 dark:text-white/55 md:grid-cols-2">
                            <div>
                              Issued: <strong>{formatDateTime(session.issuedAt)}</strong>
                            </div>
                            <div>
                              Expires: <strong>{formatDateTime(session.expiresAt)}</strong>
                            </div>
                            <div>
                              Last used:{" "}
                              <strong>{formatDateTime(session.lastUsedAt)}</strong>
                            </div>
                            <div>
                              Revoked:{" "}
                              <strong>{formatDateTime(session.revokedAt)}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              runAction(
                                () =>
                                  revokeSessionMutation.mutateAsync({
                                    userId: selectedUserId!,
                                    sessionId: session.id,
                                    payload: {
                                      reason: actionReason || undefined,
                                    },
                                  }),
                                "Session revoked successfully.",
                              )
                            }
                            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-3 text-sm font-semibold text-rose-700 dark:text-rose-300"
                          >
                            <X className="h-4 w-4" />
                            Revoke
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Pagination
                  page={selectedUserSessionsQuery.data.meta.page}
                  totalPages={selectedUserSessionsQuery.data.meta.totalPages}
                  onPrev={() => setSessionPage((p) => Math.max(1, p - 1))}
                  onNext={() =>
                    setSessionPage((p) =>
                      Math.min(
                        selectedUserSessionsQuery.data?.meta.totalPages ?? p,
                        p + 1,
                      ),
                    )
                  }
                />
              </>
            )}
          </div>
        )}
      </Drawer>

      <Modal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Resolve Password Issue"
        subtitle="Run a controlled recovery flow for the selected user"
      >
        {!selectedUser ? (
          <EmptyState title="No user selected" />
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                Target user
              </div>
              <div className="mt-1 text-[12px] text-neutral-500 dark:text-white/45">
                {getUserName(selectedUser)} • {selectedUser.email}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <CheckboxField
                checked={Boolean(resolvePayload.revokeAllSessions)}
                onChange={(checked) =>
                  setResolvePayload((prev) => ({
                    ...prev,
                    revokeAllSessions: checked,
                  }))
                }
                label="Revoke all active sessions"
                hint="Force immediate sign-out across devices."
              />
              <CheckboxField
                checked={Boolean(resolvePayload.clearPasswordResetTokens)}
                onChange={(checked) =>
                  setResolvePayload((prev) => ({
                    ...prev,
                    clearPasswordResetTokens: checked,
                  }))
                }
                label="Clear existing reset tokens"
                hint="Invalidate older password-recovery links."
              />
              <CheckboxField
                checked={Boolean(resolvePayload.issueNewPasswordResetToken)}
                onChange={(checked) =>
                  setResolvePayload((prev) => ({
                    ...prev,
                    issueNewPasswordResetToken: checked,
                  }))
                }
                label="Issue fresh reset token"
                hint="Create a new valid password-reset flow."
              />
              <CheckboxField
                checked={Boolean(resolvePayload.markEmailVerified)}
                onChange={(checked) =>
                  setResolvePayload((prev) => ({
                    ...prev,
                    markEmailVerified: checked,
                  }))
                }
                label="Mark email verified"
                hint="Useful when verification is blocking recovery."
              />
              <CheckboxField
                checked={Boolean(resolvePayload.activateUser)}
                onChange={(checked) =>
                  setResolvePayload((prev) => ({
                    ...prev,
                    activateUser: checked,
                  }))
                }
                label="Activate user"
                hint="Restore the account to active state during resolution."
              />
            </div>

            <TextArea
              value={resolvePayload.reason ?? ""}
              onChange={(value) =>
                setResolvePayload((prev) => ({ ...prev, reason: value }))
              }
              placeholder="Document why this recovery operation is being performed..."
              rows={4}
            />

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPasswordModalOpen(false)}
                className="inline-flex h-9 items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-neutral-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={busy || !selectedUserId}
                onClick={() =>
                  runAction(
                    async () => {
                      const result = await resolvePasswordMutation.mutateAsync({
                        userId: selectedUserId!,
                        payload: resolvePayload,
                      });

                      if (result?.passwordReset?.resetToken) {
                        setFeedback({
                          type: "success",
                          message: `Password issue resolved. Dev reset token: ${result.passwordReset.resetToken}`,
                        });
                      }

                      setPasswordModalOpen(false);
                    },
                    "Password issue resolved successfully.",
                  )
                }
                className="inline-flex h-9 items-center gap-2 rounded-2xl border border-black/10 bg-neutral-900 px-4 text-sm font-semibold text-white dark:border-white/10 dark:bg-white dark:text-neutral-900"
              >
                {resolvePasswordMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                Execute Resolution
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
