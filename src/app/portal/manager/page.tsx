"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  MapPin,
  Wallet,
  ClipboardList,
  FileClock,
  TimerReset,
  ArrowRight,
  RefreshCcw,
  UserCheck,
  Briefcase,
  Activity,
} from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Skeleton } from "@/logaxp/components/ui/skeleton";
import { toast } from "@/logaxp/components/ui/toast";
import { useManager } from "@/logaxp/hooks/useManager";
import type {
  ManagedScopeSummary,
  ManagerEmployeeMini,
  ManagerOrgUnit,
  ManagerLocation,
  ManagerCostCenter,
  ManagerTeamListItem,
} from "@/logaxp/lib/manager/manager.types";

function unwrapData<T>(value: unknown): T {
  return ((value as { data?: T })?.data ?? value) as T;
}

function fullName(v?: {
  firstName?: string;
  lastName?: string;
  preferredName?: string | null;
}) {
  if (!v) return "—";
  return v.preferredName || `${v.firstName ?? ""} ${v.lastName ?? ""}`.trim() || "—";
}

function SummaryCard({
  title,
  value,
  icon,
  tone = "default",
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  tone?: "default" | "success" | "warning";
}) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
      : tone === "warning"
      ? "bg-amber-50 border-amber-200 text-amber-700"
      : "bg-slate-50 border-slate-200 text-slate-700";

  return (
    <Card className="rounded-3xl border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              {title}
            </div>
            <div className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              {value}
            </div>
          </div>
          <div className={`rounded-2xl border p-3 ${toneClass}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScopeListCard({
  title,
  description,
  items,
  emptyText,
}: {
  title: string;
  description: string;
  items: Array<{ id: string; name?: string; code?: string | null }>;
  emptyText: string;
}) {
  return (
    <Card className="rounded-3xl border shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed px-4 py-6 text-sm text-slate-500">
            {emptyText}
          </div>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl border px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-slate-900">
                    {item.name ?? "—"}
                  </div>
                  <div className="text-xs text-slate-500">
                    {item.code ? `Code: ${item.code}` : "No code"}
                  </div>
                </div>
              </div>
            ))}
            {items.length > 6 ? (
              <div className="text-xs text-slate-500">
                + {items.length - 6} more
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TeamSnapshotCard({
  items,
}: {
  items: ManagerTeamListItem[];
}) {
  return (
    <Card className="rounded-3xl border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Recent Team Snapshot</CardTitle>
          <CardDescription>
            Quick view of employees currently under your supervision.
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/portal/manager/my-team">
            View team
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            title="No managed employees"
            description="There are no employees in your current management scope."
          />
        ) : (
          <div className="space-y-3">
            {items.slice(0, 6).map((emp) => (
              <div
                key={emp.id}
                className="flex items-center justify-between gap-4 rounded-2xl border px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-slate-900">
                    {fullName(emp)}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {emp.primaryAssignment?.position?.title ??
                      emp.primaryAssignment?.position?.name ??
                      "No position"}{" "}
                    • {emp.primaryAssignment?.orgUnit?.name ?? "No org unit"}
                  </div>
                </div>

                <Badge variant="outline" className="rounded-full">
                  {emp.status ?? "—"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ManagerHomePage() {
  const { me, loading } = useManager();

  const [profile, setProfile] = React.useState<ManagerEmployeeMini | null>(null);
  const [summary, setSummary] = React.useState<ManagedScopeSummary | null>(null);
  const [orgUnits, setOrgUnits] = React.useState<ManagerOrgUnit[]>([]);
  const [locations, setLocations] = React.useState<ManagerLocation[]>([]);
  const [costCenters, setCostCenters] = React.useState<ManagerCostCenter[]>([]);
  const [team, setTeam] = React.useState<ManagerTeamListItem[]>([]);
  const [fetching, setFetching] = React.useState(true);

  const load = React.useCallback(async () => {
    setFetching(true);
    try {
      const [
        profileRes,
        summaryRes,
        orgUnitsRes,
        locationsRes,
        costCentersRes,
        teamRes,
      ] = await Promise.all([
        me.profile(),
        me.summary(),
        me.managedOrgUnits(),
        me.managedLocations(),
        me.ownedCostCenters(),
        me.team({ page: 1, pageSize: 8 }),
      ]);

      setProfile(unwrapData<ManagerEmployeeMini>(profileRes));
      setSummary(unwrapData<ManagedScopeSummary>(summaryRes));
      setOrgUnits(unwrapData<ManagerOrgUnit[]>(orgUnitsRes) ?? []);
      setLocations(unwrapData<ManagerLocation[]>(locationsRes) ?? []);
      setCostCenters(unwrapData<ManagerCostCenter[]>(costCentersRes) ?? []);
      setTeam((unwrapData<{ items: ManagerTeamListItem[] }>(teamRes)?.items ?? []) as ManagerTeamListItem[]);
    } catch {
      toast.error("Failed to load manager dashboard");
      setProfile(null);
      setSummary(null);
      setOrgUnits([]);
      setLocations([]);
      setCostCenters([]);
      setTeam([]);
    } finally {
      setFetching(false);
    }
  }, [me]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const cards = summary ?? {
    directReports: 0,
    assignmentReports: 0,
    orgUnitScoped: 0,
    locationScoped: 0,
    costCenterScoped: 0,
    totalManagedDistinctEmployees: 0,
    activeManagedEmployees: 0,
    inactiveManagedEmployees: 0,
    onLeaveManagedEmployees: 0,
    onboardingManagedEmployees: 0,
    suspendedManagedEmployees: 0,
    terminatedManagedEmployees: 0,
    managedOrgUnits: 0,
    managedLocations: 0,
    ownedCostCenters: 0,
    pendingLeaveRequests: 0,
    pendingTimesheets: 0,
    openTimeClocks: 0,
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[28px] border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-7 text-white shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_30%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/10">
              Manager Workspace
            </Badge>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back{profile ? `, ${fullName(profile)}` : ""}
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-200">
                Monitor your managed employees, pending approvals, scope ownership,
                and daily operational activity from a single enterprise dashboard.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href="/portal/manager/my-team">
                My Team
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              onClick={() => void load()}
              disabled={fetching || loading}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {fetching ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <Skeleton key={idx} className="h-28 rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Managed"
            value={cards.totalManagedDistinctEmployees}
            icon={<Users className="h-5 w-5" />}
          />
          <SummaryCard
            title="Active Employees"
            value={cards.activeManagedEmployees}
            icon={<UserCheck className="h-5 w-5" />}
            tone="success"
          />
          <SummaryCard
            title="Pending Leave"
            value={cards.pendingLeaveRequests}
            icon={<FileClock className="h-5 w-5" />}
            tone="warning"
          />
          <SummaryCard
            title="Pending Timesheets"
            value={cards.pendingTimesheets}
            icon={<ClipboardList className="h-5 w-5" />}
            tone="warning"
          />
          <SummaryCard
            title="Open Time Clocks"
            value={cards.openTimeClocks}
            icon={<TimerReset className="h-5 w-5" />}
          />
          <SummaryCard
            title="Managed Org Units"
            value={cards.managedOrgUnits}
            icon={<Building2 className="h-5 w-5" />}
          />
          <SummaryCard
            title="Managed Locations"
            value={cards.managedLocations}
            icon={<MapPin className="h-5 w-5" />}
          />
          <SummaryCard
            title="Owned Cost Centers"
            value={cards.ownedCostCenters}
            icon={<Wallet className="h-5 w-5" />}
          />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <Card className="rounded-3xl border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Manager Operations</CardTitle>
              <CardDescription>
                Fast access to common managerial workflows and review queues.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Link
                href="/portal/manager/my-team"
                className="rounded-2xl border p-4 transition hover:bg-slate-50"
              >
                <Users className="h-5 w-5 text-slate-700" />
                <div className="mt-3 font-semibold text-slate-900">My Team</div>
                <div className="mt-1 text-xs text-slate-500">
                  View all employees under your supervision.
                </div>
              </Link>

              <Link
                href="/portal/manager/leave-requests"
                className="rounded-2xl border p-4 transition hover:bg-slate-50"
              >
                <FileClock className="h-5 w-5 text-slate-700" />
                <div className="mt-3 font-semibold text-slate-900">Leave Requests</div>
                <div className="mt-1 text-xs text-slate-500">
                  Review leave across your managed scope.
                </div>
              </Link>

              <Link
                href="/portal/manager/timesheets"
                className="rounded-2xl border p-4 transition hover:bg-slate-50"
              >
                <Briefcase className="h-5 w-5 text-slate-700" />
                <div className="mt-3 font-semibold text-slate-900">Timesheets</div>
                <div className="mt-1 text-xs text-slate-500">
                  Track timesheet submissions and approval flow.
                </div>
              </Link>

              <Link
                href="/portal/manager/time-clocks"
                className="rounded-2xl border p-4 transition hover:bg-slate-50"
              >
                <Activity className="h-5 w-5 text-slate-700" />
                <div className="mt-3 font-semibold text-slate-900">Time Clocks</div>
                <div className="mt-1 text-xs text-slate-500">
                  Monitor attendance and open clock sessions.
                </div>
              </Link>
            </CardContent>
          </Card>

          <TeamSnapshotCard items={team} />
        </div>

        <div className="space-y-4 xl:col-span-4">
          <ScopeListCard
            title="Managed Org Units"
            description="Units where you are assigned as head or manager."
            items={orgUnits.map((x) => ({ id: x.id, name: x.name, code: x.code }))}
            emptyText="No managed org units."
          />

          <ScopeListCard
            title="Managed Locations"
            description="Operational locations under your direct responsibility."
            items={locations.map((x) => ({ id: x.id, name: x.name, code: x.code }))}
            emptyText="No managed locations."
          />

          <ScopeListCard
            title="Owned Cost Centers"
            description="Cost centers where you are accountable as owner."
            items={costCenters.map((x) => ({ id: x.id, name: x.name, code: x.code }))}
            emptyText="No owned cost centers."
          />
        </div>
      </div>
    </div>
  );
}