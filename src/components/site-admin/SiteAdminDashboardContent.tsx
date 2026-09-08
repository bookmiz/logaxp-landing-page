"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  Layers3,
  Mail,
  RefreshCw,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

import {
  useSiteAdminAuditList,
  useSiteAdminGrowth,
  useSiteAdminOverview,
  useSiteAdminRecentActivity,
  useSiteAdminTenantHealth,
} from "@/logaxp/hooks/useSiteAdminAnalytics";

import type {
  AuditAction,
  CountBucket,
  SiteAdminAuditItem,
  TenantStatus,
  TenantHealthItem,
} from "@/logaxp/lib/site-admin/site-admin-analytics.types";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatNumber(value?: number | null) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
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

function formatDateOnly(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function titleCase(input?: string | null) {
  if (!input) return "—";
  return input
    .toLowerCase()
    .split("_")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function badgeTone(
  value?: string | null,
): "emerald" | "amber" | "rose" | "slate" | "blue" {
  const normalized = (value ?? "").toUpperCase();

  if (
    normalized.includes("ACTIVE") ||
    normalized.includes("ACCEPTED") ||
    normalized.includes("PUBLISHED")
  ) {
    return "emerald";
  }

  if (
    normalized.includes("PENDING") ||
    normalized.includes("INVITED") ||
    normalized.includes("WARNING")
  ) {
    return "amber";
  }

  if (
    normalized.includes("SUSPENDED") ||
    normalized.includes("DELETED") ||
    normalized.includes("REVOKED") ||
    normalized.includes("EXPIRED") ||
    normalized.includes("DISABLED")
  ) {
    return "rose";
  }

  if (normalized.includes("CREATE") || normalized.includes("UPDATE")) {
    return "blue";
  }

  return "slate";
}

function Badge({
  label,
  tone = "slate",
}: {
  label: string;
  tone?: "emerald" | "amber" | "rose" | "slate" | "blue";
}) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : tone === "amber"
      ? "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
      : tone === "rose"
      ? "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300"
      : tone === "blue"
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

function Panel({
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
    <div
      className={cx(
        "rounded-xl border",
        "border-black/10 dark:border-white/10",
        "bg-white/80 dark:bg-white/[0.04]",
        "shadow-[0_14px_45px_-20px_rgba(0,0,0,0.20)] dark:shadow-[0_16px_50px_-18px_rgba(0,0,0,0.45)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
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
    </div>
  );
}

function StatCard({
  label,
  value,
  meta,
  icon,
}: {
  label: string;
  value: string;
  meta?: string;
  icon: React.ReactNode;
}) {
  return <div className="admin-metric">
    <div className="flex items-center justify-between gap-2"><span className="admin-metric-label">{label}</span><span className="admin-metric-icon">{icon}</span></div>
    <div className="admin-metric-value">{value}</div>
    {meta && <p className="admin-metric-meta">{meta}</p>}
  </div>;
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      aria-label={placeholder || (type === "date" ? "Date filter" : "Filter")}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cx(
        "h-9 w-full rounded-2xl border px-3 text-sm outline-none transition",
        "border-black/10 bg-white/80 text-neutral-900 placeholder:text-neutral-400",
        "focus:border-black/20 focus:ring-2 focus:ring-black/5",
        "dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35 dark:focus:border-white/20 dark:focus:ring-white/5",
        className,
      )}
    />
  );
}

function Select({
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
      aria-label="Filter selection"
      onChange={(e) => onChange(e.target.value)}
      className={cx(
        "h-9 w-full rounded-2xl border px-3 text-sm outline-none transition",
        "border-black/10 bg-white/80 text-neutral-900",
        "focus:border-black/20 focus:ring-2 focus:ring-black/5",
        "dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:border-white/20 dark:focus:ring-white/5",
        className,
      )}
    >
      {options.map((option) => (
        <option key={option.value || "__empty"} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
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
    <div className="rounded-3xl border border-dashed border-black/10 px-4 py-6 text-center dark:border-white/10">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-black/10 bg-black/[0.03] text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70">
        <Sparkles className="h-5 w-5" />
      </div>
      <div className="mt-4 text-sm font-semibold text-neutral-900 dark:text-white">
        {title}
      </div>
      {subtitle ? (
        <div className="mt-1 text-[12px] text-neutral-500 dark:text-white/50">
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}

function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-12 animate-pulse rounded-2xl border border-black/10 bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.04]"
        />
      ))}
    </div>
  );
}

function MiniBars({
  data,
  emptyLabel,
}: {
  data?: CountBucket[];
  emptyLabel?: string;
}) {
  const max = Math.max(...(data?.map((item) => item.count) ?? [0]), 1);

  if (!data?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 px-4 py-8 text-center text-[12px] text-neutral-500 dark:border-white/10 dark:text-white/45">
        {emptyLabel ?? "No data in this date range."}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item) => {
        const width = Math.max(6, (item.count / max) * 100);

        return (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <div className="truncate text-[12px] font-medium text-neutral-700 dark:text-white/70">
                {item.label}
              </div>
              <div className="text-[12px] font-bold text-neutral-900 dark:text-white">
                {formatNumber(item.count)}
              </div>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-neutral-900 dark:bg-white"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TablePagination({
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
    <div className="flex items-center justify-between gap-3 pt-4">
      <div className="text-[12px] text-neutral-500 dark:text-white/50">
        Page {page} of {totalPages}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={page <= 1}
          className="inline-flex h-10 items-center gap-2 rounded-2xl border border-black/10 bg-white/80 px-3 text-sm font-semibold text-neutral-800 transition disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={page >= totalPages}
          className="inline-flex h-10 items-center gap-2 rounded-2xl border border-black/10 bg-white/80 px-3 text-sm font-semibold text-neutral-800 transition disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function SiteAdminDashboardContent() {
  const today = useMemo(() => new Date(), []);
  const defaultFrom = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 29);
    return toDateInputValue(d);
  }, [today]);
  const defaultTo = useMemo(() => toDateInputValue(today), [today]);

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");

  const [tenantPage, setTenantPage] = useState(1);
  const [tenantSearch, setTenantSearch] = useState("");
  const [tenantStatus, setTenantStatus] = useState<TenantStatus | "">("");

  const [auditPage, setAuditPage] = useState(1);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditAction, setAuditAction] = useState("");

  const baseRange = useMemo(
    () => ({
      from,
      to,
    }),
    [from, to],
  );

  const growthParams = useMemo(
    () => ({
      from,
      to,
      groupBy,
    }),
    [from, to, groupBy],
  );

  const tenantParams = useMemo(
    () => ({
      from,
      to,
      page: tenantPage,
      pageSize: 8,
      q: tenantSearch || undefined,
      status: tenantStatus || undefined,
    }),
    [from, to, tenantPage, tenantSearch, tenantStatus],
  );

  const auditParams = useMemo(
    () => ({
      from,
      to,
      page: auditPage,
      pageSize: 8,
      q: auditSearch || undefined,
      action: (auditAction || undefined) as AuditAction | undefined,
    }),
    [from, to, auditPage, auditSearch, auditAction],
  );

  const overviewQuery = useSiteAdminOverview(baseRange);
  const growthQuery = useSiteAdminGrowth(growthParams);
  const tenantHealthQuery = useSiteAdminTenantHealth(tenantParams);
  const recentActivityQuery = useSiteAdminRecentActivity(baseRange);
  const auditQuery = useSiteAdminAuditList(auditParams);

  const overview = overviewQuery.data;
  const growth = growthQuery.data;
  const tenantHealth = tenantHealthQuery.data;
  const recentActivity = recentActivityQuery.data;
  const auditList = auditQuery.data;

  const isRefreshing =
    overviewQuery.isFetching ||
    growthQuery.isFetching ||
    tenantHealthQuery.isFetching ||
    recentActivityQuery.isFetching ||
    auditQuery.isFetching;

  const refreshAll = async () => {
    await Promise.all([
      overviewQuery.refetch(),
      growthQuery.refetch(),
      tenantHealthQuery.refetch(),
      recentActivityQuery.refetch(),
      auditQuery.refetch(),
    ]);
  };

  const feedItems = useMemo(() => {
    const audits =
      recentActivity?.audits.map((item) => ({
        id: `audit-${item.id}`,
        createdAt: item.createdAt,
        title: `${titleCase(item.action)} • ${item.entityType}`,
        subtitle: item.route
          ? `${item.method ?? "REQUEST"} ${item.route}`
          : item.entityId || item.tenantId || "Audit log event",
        badge: "Audit",
        tone: "blue" as const,
      })) ?? [];

    const invitations =
      recentActivity?.invitations.map((item) => ({
        id: `invite-${item.id}`,
        createdAt: item.createdAt,
        title: `Invitation ${titleCase(item.status)}`,
        subtitle: `${item.email} • tenant ${item.tenantId}`,
        badge: "Invite",
        tone: badgeTone(item.status),
      })) ?? [];

    const tenants =
      recentActivity?.tenants.map((item) => ({
        id: `tenant-${item.id}`,
        createdAt: item.createdAt,
        title: `Tenant ${item.name}`,
        subtitle: `${item.slug} • ${titleCase(item.status)}`,
        badge: "Tenant",
        tone: badgeTone(item.status),
      })) ?? [];

    const users =
      recentActivity?.users.map((item) => ({
        id: `user-${item.id}`,
        createdAt: item.createdAt,
        title: `User ${item.email}`,
        subtitle: titleCase(item.status),
        badge: "User",
        tone: badgeTone(item.status),
      })) ?? [];

    return [...audits, ...invitations, ...tenants, ...users]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 12);
  }, [recentActivity]);

  const tenantMeta = tenantHealth?.meta;
  const auditMeta = auditList?.meta;

  return (
    <div className="space-y-5">
      {[overviewQuery, growthQuery, tenantHealthQuery, recentActivityQuery, auditQuery].some(query => query.isError) && <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Some platform data could not be loaded. Refresh to try again; previously loaded data may still be shown.</p>}
      <div className="admin-page-heading">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="admin-kicker">Your platform at a glance</div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
              Overview
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-600 dark:text-white/55">
              Keep track of your tenants, people and daily operations.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:max-w-[540px]">
            <Input type="date" value={from} onChange={setFrom} />
            <Input type="date" value={to} onChange={setTo} />
            <Select
              value={groupBy}
              onChange={(value) =>
                setGroupBy(value as "day" | "week" | "month")
              }
              options={[
                { label: "Daily", value: "day" },
                { label: "Weekly", value: "week" },
                { label: "Monthly", value: "month" },
              ]}
            />
            <button
              type="button"
              onClick={refreshAll}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-2xl border border-black/10 bg-neutral-900 px-4 text-sm font-semibold text-white transition hover:opacity-90 dark:border-white/10 dark:bg-white dark:text-neutral-900"
            >
              <RefreshCw
                className={cx("h-4 w-4", isRefreshing && "animate-spin")}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {overviewQuery.isPending ? <div role="status"><SkeletonRows rows={2} /><span className="sr-only">Loading platform metrics</span></div> : overviewQuery.isError && !overview ? <p className="text-sm text-slate-500">Platform metrics are unavailable.</p> : <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Active Tenants"
          value={formatNumber(overview?.tenants.active)}
          meta={`${formatNumber(overview?.tenants.total)} total`}
          icon={<Building2 className="h-5 w-5" />}
        />
        <StatCard
          label="Platform Users"
          value={formatNumber(overview?.users.total)}
          meta={`${formatNumber(overview?.users.active)} active`}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Employees"
          value={formatNumber(overview?.employees.total)}
          meta={`${formatNumber(overview?.employees.active)} active`}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Invitations"
          value={formatNumber(overview?.invitations.total)}
          meta={`${formatNumber(overview?.invitations.pending)} pending`}
          icon={<Mail className="h-5 w-5" />}
        />
        <StatCard
          label="Audit Logs"
          value={formatNumber(overview?.activity.auditLogs)}
          meta={`${formatDateOnly(overview?.range.from)} → ${formatDateOnly(
            overview?.range.to,
          )}`}
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard
          label="Published Showcases"
          value={formatNumber(overview?.showcases.published)}
          meta={`${formatNumber(overview?.showcases.total)} total`}
          icon={<Layers3 className="h-5 w-5" />}
        />
      </div>

      }
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-8">
          <Panel
            title="Growth Trends"
            subtitle={`Grouped by ${groupBy}`}
            right={
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-[11px] font-semibold text-neutral-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60">
                <BarChart3 className="h-3.5 w-3.5" />
                Growth over time
              </div>
            }
          >
            {growthQuery.isLoading ? (
              <SkeletonRows rows={6} />
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="mb-4 text-sm font-bold text-neutral-900 dark:text-white">
                    Tenant Growth
                  </div>
                  <MiniBars data={growth?.tenants} />
                </div>

                <div className="rounded-3xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="mb-4 text-sm font-bold text-neutral-900 dark:text-white">
                    User Growth
                  </div>
                  <MiniBars data={growth?.users} />
                </div>

                <div className="rounded-3xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="mb-4 text-sm font-bold text-neutral-900 dark:text-white">
                    Employee Growth
                  </div>
                  <MiniBars data={growth?.employees} />
                </div>

                <div className="rounded-3xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="mb-4 text-sm font-bold text-neutral-900 dark:text-white">
                    Invitation Flow
                  </div>
                  <MiniBars data={growth?.invitations} />
                </div>
              </div>
            )}
          </Panel>

          <Panel
            title="Tenant Health"
            subtitle="Per-tenant operational footprint and recent activity"
            right={
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-white/35" />
                  <Input
                    value={tenantSearch}
                    onChange={(value) => {
                      setTenantPage(1);
                      setTenantSearch(value);
                    }}
                    placeholder="Search tenant name or slug"
                    className="pl-10"
                  />
                </div>

                <Select
                  value={tenantStatus}
                  onChange={(value) => {
                    setTenantPage(1);
                    setTenantStatus((value as TenantStatus) || "");
                  }}
                  className="min-w-[170px]"
                  options={[
                    { label: "All statuses", value: "" },
                    { label: "Active", value: "ACTIVE" },
                    { label: "Suspended", value: "SUSPENDED" },
                    { label: "Deleted", value: "DELETED" },
                  ]}
                />
              </div>
            }
          >
            {tenantHealthQuery.isLoading ? (
              <SkeletonRows rows={8} />
            ) : !tenantHealth?.items.length ? (
              <EmptyState
                title="No tenants found"
                subtitle="Try a different search term, status filter, or date range."
              />
            ) : (
              <>
                <div className="overflow-hidden rounded-3xl border border-black/10 dark:border-white/10">
                  <div className="hidden grid-cols-12 gap-3 border-b border-black/10 bg-black/[0.03] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/45 lg:grid">
                    <div className="col-span-3">Tenant</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1">Members</div>
                    <div className="col-span-1">Employees</div>
                    <div className="col-span-1">Projects</div>
                    <div className="col-span-1">Invites</div>
                    <div className="col-span-1">Audits</div>
                    <div className="col-span-2">Meta</div>
                  </div>

                  <div className="divide-y divide-black/10 dark:divide-white/10">
                    {tenantHealth.items.map((tenant: TenantHealthItem) => (
                      <div
                        key={tenant.id}
                        className="grid grid-cols-1 gap-3 px-4 py-4 lg:grid-cols-12 lg:items-center"
                      >
                        <div className="lg:col-span-3">
                          <div className="font-semibold text-neutral-900 dark:text-white">
                            {tenant.name}
                          </div>
                          <div className="mt-1 text-[12px] text-neutral-500 dark:text-white/50">
                            {tenant.slug}
                          </div>
                        </div>

                        <div className="lg:col-span-2">
                          <Badge
                            label={titleCase(tenant.status)}
                            tone={badgeTone(tenant.status)}
                          />
                        </div>

                        <div className="lg:col-span-1 text-sm font-semibold text-neutral-900 dark:text-white">
                          {formatNumber(tenant._count.memberships)}
                        </div>

                        <div className="lg:col-span-1 text-sm font-semibold text-neutral-900 dark:text-white">
                          {formatNumber(tenant._count.employees)}
                        </div>

                        <div className="lg:col-span-1 text-sm font-semibold text-neutral-900 dark:text-white">
                          {formatNumber(tenant._count.projects)}
                        </div>

                        <div className="lg:col-span-1 text-sm font-semibold text-neutral-900 dark:text-white">
                          {formatNumber(tenant.recentInvitations)}
                        </div>

                        <div className="lg:col-span-1 text-sm font-semibold text-neutral-900 dark:text-white">
                          {formatNumber(tenant.recentAudits)}
                        </div>

                        <div className="lg:col-span-2">
                          <div className="text-[12px] text-neutral-600 dark:text-white/55">
                            {tenant.currency} • {tenant.locale}
                          </div>
                          <div className="mt-1 text-[11px] text-neutral-500 dark:text-white/40">
                            {tenant.timezone}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <TablePagination
                  page={tenantMeta?.page ?? 1}
                  totalPages={tenantMeta?.totalPages ?? 1}
                  onPrev={() => setTenantPage((page) => Math.max(1, page - 1))}
                  onNext={() =>
                    setTenantPage((page) =>
                      Math.min(tenantMeta?.totalPages ?? page, page + 1),
                    )
                  }
                />
              </>
            )}
          </Panel>

          <Panel
            title="Audit Console"
            subtitle="Review recent changes and administrative actions"
            right={
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-white/35" />
                  <Input
                    value={auditSearch}
                    onChange={(value) => {
                      setAuditPage(1);
                      setAuditSearch(value);
                    }}
                    placeholder="Search entity, route, request id"
                    className="pl-10"
                  />
                </div>

                <Select
                  value={auditAction}
                  onChange={(value) => {
                    setAuditPage(1);
                    setAuditAction(value);
                  }}
                  className="min-w-[180px]"
                  options={[
                    { label: "All actions", value: "" },
                    { label: "Create", value: "CREATE" },
                    { label: "Update", value: "UPDATE" },
                    { label: "Delete", value: "DELETE" },
                    { label: "Restore", value: "RESTORE" },
                    { label: "Login", value: "LOGIN" },
                    { label: "Logout", value: "LOGOUT" },
                    { label: "Invite Sent", value: "INVITE_SENT" },
                    { label: "Invite Accepted", value: "INVITE_ACCEPTED" },
                    { label: "Role Granted", value: "ROLE_GRANTED" },
                    { label: "Role Revoked", value: "ROLE_REVOKED" },
                    { label: "Status Changed", value: "STATUS_CHANGED" },
                  ]}
                />
              </div>
            }
          >
            {auditQuery.isLoading ? (
              <SkeletonRows rows={8} />
            ) : !auditList?.items.length ? (
              <EmptyState
                title="No audit records found"
                subtitle="Adjust the filters or widen the date range."
              />
            ) : (
              <>
                <div className="space-y-3">
                  {auditList.items.map((item: SiteAdminAuditItem) => (
                    <div
                      key={item.id}
                      className="rounded-3xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              label={titleCase(item.action)}
                              tone={badgeTone(item.action)}
                            />
                            <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                              {item.entityType}
                            </span>
                            {item.entityId ? (
                              <span className="truncate text-[12px] text-neutral-500 dark:text-white/45">
                                #{item.entityId}
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-2 grid grid-cols-1 gap-2 text-[12px] text-neutral-600 dark:text-white/55 md:grid-cols-2 xl:grid-cols-3">
                            <div>
                              <span className="font-semibold text-neutral-800 dark:text-white/75">
                                Tenant:
                              </span>{" "}
                              {item.tenant?.name ?? item.tenantId ?? "—"}
                            </div>
                            <div>
                              <span className="font-semibold text-neutral-800 dark:text-white/75">
                                Actor:
                              </span>{" "}
                              {item.actorUser?.email ??
                                item.actorMembership?.title ??
                                item.actorUserId ??
                                "—"}
                            </div>
                            <div>
                              <span className="font-semibold text-neutral-800 dark:text-white/75">
                                Route:
                              </span>{" "}
                              {item.method && item.route
                                ? `${item.method} ${item.route}`
                                : item.route || "—"}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-[12px] text-neutral-500 dark:text-white/45">
                          {formatDateTime(item.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <TablePagination
                  page={auditMeta?.page ?? 1}
                  totalPages={auditMeta?.totalPages ?? 1}
                  onPrev={() => setAuditPage((page) => Math.max(1, page - 1))}
                  onNext={() =>
                    setAuditPage((page) =>
                      Math.min(auditMeta?.totalPages ?? page, page + 1),
                    )
                  }
                />
              </>
            )}
          </Panel>
        </div>

        <div className="space-y-5 xl:col-span-4">
          <Panel
            title="Live Activity Feed"
            subtitle="Latest changes across your platform"
            right={
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-[11px] font-semibold text-neutral-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60">
                <CalendarDays className="h-3.5 w-3.5" />
                Recent
              </div>
            }
          >
            {recentActivityQuery.isLoading ? (
              <SkeletonRows rows={7} />
            ) : !feedItems.length ? (
              <EmptyState
                title="No recent activity yet"
                subtitle="New account and workspace activity will appear here."
              />
            ) : (
              <div className="space-y-3">
                {feedItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge label={item.badge} tone={item.tone} />
                          <div className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                            {item.title}
                          </div>
                        </div>
                        <div className="mt-1 text-[12px] text-neutral-600 dark:text-white/55">
                          {item.subtitle}
                        </div>
                      </div>
                      <div className="shrink-0 text-[11px] text-neutral-500 dark:text-white/40">
                        {formatDateTime(item.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel
            title="Platform Snapshot"
            subtitle="A closer look at your platform"
          >
            <div className="space-y-3">
              <div className="rounded-3xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.12em] text-neutral-500 dark:text-white/45">
                      Pending Invitations
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-white">
                      {formatNumber(overview?.invitations.pending)}
                    </div>
                  </div>
                  <Mail className="h-5 w-5 text-neutral-700 dark:text-white/75" />
                </div>
              </div>

              <div className="rounded-3xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.12em] text-neutral-500 dark:text-white/45">
                      Suspended Tenants
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-white">
                      {formatNumber(overview?.tenants.suspended)}
                    </div>
                  </div>
                  <Building2 className="h-5 w-5 text-neutral-700 dark:text-white/75" />
                </div>
              </div>

              <div className="rounded-3xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.12em] text-neutral-500 dark:text-white/45">
                      Disabled Users
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-white">
                      {formatNumber(overview?.users.disabled)}
                    </div>
                  </div>
                  <Users className="h-5 w-5 text-neutral-700 dark:text-white/75" />
                </div>
              </div>

              <div className="rounded-3xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.12em] text-neutral-500 dark:text-white/45">
                      Onboarding Employees
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-white">
                      {formatNumber(overview?.employees.onboarding)}
                    </div>
                  </div>
                  <Activity className="h-5 w-5 text-neutral-700 dark:text-white/75" />
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Quick Access" subtitle="Shortcuts to your everyday work">
            <div className="grid grid-cols-1 gap-2">
              {[
                {
                  href: "/site-admin/tenants",
                  label: "Manage tenants",
                  icon: <Building2 className="h-4 w-4" />,
                },
                {
                  href: "/site-admin/audit",
                  label: "Open audit console",
                  icon: <FileSearch className="h-4 w-4" />,
                },
                {
                  href: "/site-admin/showcases",
                  label: "Review showcases",
                  icon: <Layers3 className="h-4 w-4" />,
                },
                {
                  href: "/site-admin/users",
                  label: "Inspect users",
                  icon: <Users className="h-4 w-4" />,
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center justify-between rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm font-semibold text-neutral-800 transition hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.06]"
                >
                  <span className="inline-flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
