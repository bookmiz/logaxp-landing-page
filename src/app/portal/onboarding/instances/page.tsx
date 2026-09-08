"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, RefreshCcw, Search, Sparkles, Shield, ArrowRight, Users, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";

import { useOnboarding } from "@/logaxp/hooks/useOnboarding";
import { useTenants } from "@/logaxp/hooks/useTenants";

import type { OnboardingInstance, OnboardingTemplate } from "@/logaxp/lib/onboarding/onboarding.types";
import { unwrapApi, unwrapList, clampPage } from "@/logaxp/components/onboarding/onboarding.utils";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import { Pagination } from "@/logaxp/components/ui/pagination";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { toast } from "@/logaxp/components/ui/toast";
import { Badge } from "@/logaxp/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectSeparator,
} from "@/logaxp/components/ui/select";

import { OnboardingInstancesTable } from "@/logaxp/components/onboarding/templates/instances/OnboardingInstancesTable";
import { OnboardingInstanceCreateDialog } from "@/logaxp/components/onboarding/templates/instances/OnboardingInstanceCreateDialog";

type StatusFilter = "ALL" | "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELED" | "CANCELLED";

/** Membership list is not typed in your snippet, so keep it defensive */
type TenantMembership = {
  id: string;
  userId: string;
  status?: string;
  isOwner?: boolean;
  title?: string | null;
  roleKeys?: string[];
  permissions?: string[];
  user?: { id: string; email?: string | null };
};

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function Shell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
            Onboarding
          </div>

          <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            {title}
          </h1>

          {subtitle ? (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
          ) : null}
        </div>

        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>

      {children}
    </div>
  );
}

function unwrapMembershipItems(res: any): TenantMembership[] {
  if (Array.isArray(res)) return res as TenantMembership[];
  if (Array.isArray(res?.items)) return res.items as TenantMembership[];
  if (Array.isArray(res?.data?.items)) return res.data.items as TenantMembership[];
  if (Array.isArray(res?.data)) return res.data as TenantMembership[];
  return [];
}

function membershipLabel(m: TenantMembership) {
  const email = m.user?.email ?? "";
  const title = m.title ?? "";
  const roles = Array.isArray(m.roleKeys) ? m.roleKeys.join(", ") : "";
  const main = title || email || m.userId;
  const sub = [email && title ? email : "", roles].filter(Boolean).join(" • ");
  return { main, sub };
}

export default function OnboardingInstancesPage() {
  const router = useRouter();
  const { instances, templates, loading } = useOnboarding();
  const { listMemberships } = useTenants();

  const [rows, setRows] = React.useState<OnboardingInstance[]>([]);
  const [tpls, setTpls] = React.useState<OnboardingTemplate[]>([]);
  const [members, setMembers] = React.useState<TenantMembership[]>([]);
  const [membersLoading, setMembersLoading] = React.useState(false);

  const [initialLoading, setInitialLoading] = React.useState(true);

  // employeeId in your API = membership.userId for now
  const [employeeId, setEmployeeId] = React.useState<string>("");
  const [status, setStatus] = React.useState<StatusFilter>("ALL");
  const [q, setQ] = React.useState("");

  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [createOpen, setCreateOpen] = React.useState(false);

  const loadMembers = React.useCallback(async () => {
    try {
      setMembersLoading(true);
      const res = await listMemberships(); // uses activeTenantId inside hook
      const items = unwrapMembershipItems(res)
        .filter((m) => String(m.status ?? "").toUpperCase() === "ACTIVE")
        .sort((a, b) => membershipLabel(a).main.toLowerCase().localeCompare(membershipLabel(b).main.toLowerCase()));

      setMembers(items);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load tenant members");
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }, [listMemberships]);

  const loadTemplates = React.useCallback(async () => {
    try {
      const res = await templates.list({ includeInactive: false });
      const data = unwrapApi(res);
      const { items } = unwrapList(data);
      setTpls(
        [...(items as OnboardingTemplate[])].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")))
      );
    } catch (e) {
      console.error(e);
      toast.error("Failed to load templates");
      setTpls([]);
    }
  }, [templates]);

  const load = React.useCallback(
    async (opts?: { silent?: boolean }) => {
      try {
        const res = await instances.list({
          employeeId: employeeId.trim() || undefined,
          status: status === "ALL" ? undefined : status,
        });

        const data = unwrapApi(res);
        const { items } = unwrapList(data);

        const needle = q.trim().toLowerCase();
        const filtered = !needle
          ? items
          : items.filter((i: any) => {
              const id = String(i.id ?? "").toLowerCase();
              const eid = String(i.employeeId ?? "").toLowerCase();
              const tid = String(i.templateId ?? "").toLowerCase();
              const st = String(i.status ?? "").toLowerCase();
              return id.includes(needle) || eid.includes(needle) || tid.includes(needle) || st.includes(needle);
            });

        const sorted = [...filtered].sort((a: any, b: any) => {
          const bd = new Date(b.createdAt ?? 0).getTime();
          const ad = new Date(a.createdAt ?? 0).getTime();
          if (!Number.isNaN(bd) && !Number.isNaN(ad) && bd !== ad) return bd - ad;
          return String(a.id).localeCompare(String(b.id));
        });

        setRows(sorted as OnboardingInstance[]);
      } catch (e) {
        console.error(e);
        if (!opts?.silent) toast.error("Failed to load instances");
      } finally {
        setInitialLoading(false);
      }
    },
    [instances, employeeId, status, q]
  );

  React.useEffect(() => {
    void load({ silent: true });
    void loadTemplates();
    void loadMembers();
  }, [load, loadTemplates, loadMembers]);

  React.useEffect(() => setPage(1), [employeeId, status, q]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = clampPage(page, totalPages);

  const paged = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, safePage]);

  const employeeSelectValue = employeeId ? employeeId : "ALL";

  return (
    <Shell
      title="Instances"
      subtitle="Run onboarding for employees based on templates (start, progress, complete)."
      actions={
        <Link
          href="/portal/onboarding/templates"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          <ClipboardList className="h-3.5 w-3.5" />
          Templates
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {/* Hero */}
      <Card className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-200/60 blur-3xl dark:bg-emerald-500/15" />
        <div className="pointer-events-none absolute -left-10 -bottom-16 h-52 w-52 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/10" />

        <CardHeader className="relative pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Onboarding Instances
          </CardTitle>
          <CardDescription>
            Showing <span className="font-medium">{rows.length}</span> result{rows.length === 1 ? "" : "s"}.
          </CardDescription>
        </CardHeader>

        <CardContent className="relative pt-0 space-y-3">
          {/* Filters */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[320px_240px_1fr_auto_auto] lg:items-end">
            {/* Members */}
            <div className="space-y-1">
              <Select value={employeeSelectValue} onValueChange={(v) => setEmployeeId(v === "ALL" ? "" : v)}>
                <SelectTrigger label="Employee (Tenant member)" error={undefined}>
                  <SelectValue placeholder={membersLoading ? "Loading members..." : "All members"} />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Filter</SelectLabel>
                    <SelectItem value="ALL">All members</SelectItem>
                    <SelectSeparator />

                    {members.length === 0 ? (
                      <SelectItem value="__empty" disabled>
                        {membersLoading ? "Loading..." : "No active members"}
                      </SelectItem>
                    ) : (
                      members.map((m) => {
                        const { main, sub } = membershipLabel(m);
                        return (
                          <SelectItem key={m.id} value={m.userId}>
                            <div className="flex flex-col">
                              <span className="font-medium">{main}</span>
                              {sub ? <span className="text-xs text-slate-500">{sub}</span> : null}
                            </div>
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
                <SelectTrigger label="Status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="NOT_STARTED">NOT_STARTED</SelectItem>
                    <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                    <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                    <SelectItem value="CANCELED">CANCELED</SelectItem>
                    <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <Input
              label="Search"
              placeholder="Search by id, employeeId, templateId, status..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />

            <Button variant="outline" onClick={() => void load()} disabled={loading}>
              <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </Button>

            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New instance
            </Button>
          </div>

          {/* quick context pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="muted" className="rounded-full">
              {employeeId ? "Filtered by employee" : "All employees"}
            </Badge>
            <Badge variant="muted" className="rounded-full">
              {status === "ALL" ? "All statuses" : status}
            </Badge>
            <Badge variant="muted" className="rounded-full">
              Templates loaded: {tpls.length}
            </Badge>
            <Badge variant="muted" className="rounded-full">
              <Shield className="mr-1 h-3.5 w-3.5" />
              RBAC ready
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Table card */}
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <CardContent className="space-y-4 p-4">
          {initialLoading ? (
            <div className="text-sm text-slate-500">Loading instances...</div>
          ) : rows.length === 0 ? (
            <EmptyState
              title="No instances"
              description="Create an onboarding instance to begin tracking an employee's onboarding steps."
              action={<Button onClick={() => setCreateOpen(true)}>Create instance</Button>}
            />
          ) : (
            <>
              <OnboardingInstancesTable
                rows={paged}
                busy={loading}
                onView={(i) => router.push(`/portal/onboarding/instances/${i.id}`)}
                onStart={async (i) => {
                  try {
                    await instances.start(i.id, {});
                    toast.success("Instance started");
                    await load({ silent: true });
                  } catch (e) {
                    console.error(e);
                    toast.error("Failed to start instance");
                  }
                }}
                onComplete={async (i) => {
                  try {
                    await instances.complete(i.id, {});
                    toast.success("Instance completed");
                    await load({ silent: true });
                  } catch (e) {
                    console.error(e);
                    toast.error("Failed to complete instance");
                  }
                }}
                onCancel={async (i) => {
                  try {
                    await instances.cancel(i.id, {});
                    toast.success("Instance cancelled");
                    await load({ silent: true });
                  } catch (e) {
                    console.error(e);
                    toast.error("Failed to cancel instance");
                  }
                }}
              />

              {rows.length > pageSize ? (
                <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} disabled={loading} />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <OnboardingInstanceCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        templates={tpls}
        members={members}
        onCreated={async (id) => {
          setCreateOpen(false);
          await load({ silent: true });
          router.push(`/portal/onboarding/instances/${id}`);
        }}
      />
    </Shell>
  );
}