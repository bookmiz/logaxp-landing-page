"use client";

import * as React from "react";
import { Users, Building2, MapPin, Wallet, FileClock, ClipboardList, TimerReset } from "lucide-react";
import { Card, CardContent } from "@/logaxp/components/ui/card";
import type { ManagedScopeSummary } from "@/logaxp/lib/manager/manager.types";

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

export function ManagerSummaryCards({
  summary,
}: {
  summary: ManagedScopeSummary | null;
}) {
  const safe = summary ?? {
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
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Total Team"
        value={safe.totalManagedDistinctEmployees}
        icon={<Users className="h-5 w-5" />}
      />
      <SummaryCard
        label="Active Employees"
        value={safe.activeManagedEmployees}
        icon={<Users className="h-5 w-5" />}
      />
      <SummaryCard
        label="Managed Org Units"
        value={safe.managedOrgUnits}
        icon={<Building2 className="h-5 w-5" />}
      />
      <SummaryCard
        label="Managed Locations"
        value={safe.managedLocations}
        icon={<MapPin className="h-5 w-5" />}
      />
      <SummaryCard
        label="Owned Cost Centers"
        value={safe.ownedCostCenters}
        icon={<Wallet className="h-5 w-5" />}
      />
      <SummaryCard
        label="Pending Leave Requests"
        value={safe.pendingLeaveRequests}
        icon={<FileClock className="h-5 w-5" />}
      />
      <SummaryCard
        label="Pending Timesheets"
        value={safe.pendingTimesheets}
        icon={<ClipboardList className="h-5 w-5" />}
      />
      <SummaryCard
        label="Open Time Clocks"
        value={safe.openTimeClocks}
        icon={<TimerReset className="h-5 w-5" />}
      />
    </div>
  );
}