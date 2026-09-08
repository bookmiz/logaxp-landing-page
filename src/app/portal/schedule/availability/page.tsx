"use client";

import * as React from "react";
import { RefreshCcw, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Badge } from "@/logaxp/components/ui/badge";

import { TimeShell } from "@/logaxp/components/time-management/TimeShell";
import { TimeHeroCard } from "@/logaxp/components/time-management/TimeHeroCard";

import {
  EmployeePicker,
  OrgUnitPicker,
  LocationPicker,
  type PickerItem,
} from "@/logaxp/components/scheduling/SchedulePickers";

import { useAvailability } from "@/logaxp/hooks/scheduling/useAvailability";
import {
  useCreateAvailabilityRule,
  useDeleteAvailabilityRule,
} from "@/logaxp/hooks/scheduling/useAvailabilityMutations";

import type {
  AvailabilityRule,
  AvailabilityKind,
} from "@/logaxp/lib/scheduling/availability.types";

import { useAuthStore } from "@/logaxp/stores/useAuthStore";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pillFor(kind?: AvailabilityKind) {
  if (kind === "AVAILABLE") {
    return {
      label: "Available",
      cls: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200",
    };
  }

  if (kind === "UNAVAILABLE") {
    return {
      label: "Unavailable",
      cls: "border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200",
    };
  }

  if (kind === "PREFERRED") {
    return {
      label: "Preferred",
      cls: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/25 dark:text-sky-200",
    };
  }

  return { label: String(kind ?? "—"), cls: "" };
}

function authEmployeeLabel(employee: unknown): string {
  if (!employee || typeof employee !== "object") return "My employee profile";

  const e = employee as {
    firstName?: string | null;
    lastName?: string | null;
    employeeNumber?: string | null;
    id?: string | null;
  };

  const full = `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim();
  if (full) return full;
  if (e.employeeNumber) return `Employee #${e.employeeNumber}`;
  if (e.id) return e.id;
  return "My employee profile";
}

export default function PortalAvailabilityAdminPage() {
  const qc = useQueryClient();

  const authEmployee = useAuthStore((s) => s.employee);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [selectedEmployee, setSelectedEmployee] = React.useState<PickerItem | null>(null);
  const [selectedOrgUnit, setSelectedOrgUnit] = React.useState<PickerItem | null>(null);
  const [selectedLocation, setSelectedLocation] = React.useState<PickerItem | null>(null);
  const [includeInactive, setIncludeInactive] = React.useState(false);

  React.useEffect(() => {
    if (!isHydrated) return;
    if (!authEmployee?.id) return;

    setSelectedEmployee((prev) => {
      if (prev?.id) return prev;

      return {
        id: authEmployee.id,
        label: authEmployeeLabel(authEmployee),
      };
    });
  }, [isHydrated, authEmployee]);

  const employeeId = selectedEmployee?.id ?? "";

  const listQ = useAvailability(
    {
      employeeId: employeeId || undefined,
      includeInactive,
      page: 1,
      pageSize: 200,
    },
    true
  );

  const createM = useCreateAvailabilityRule();
  const delM = useDeleteAvailabilityRule();

  const busy = listQ.isFetching || createM.isPending || delM.isPending;

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["schedule", "availability"] as never });
  };

  const items = (listQ.data?.data?.items ?? []) as AvailabilityRule[];

  const quickCreate = async () => {
    if (!employeeId) return;

    await createM.mutateAsync({
      employeeId,
      orgUnitId: selectedOrgUnit?.id ?? undefined,
      locationId: selectedLocation?.id ?? undefined,
      dayOfWeek: 1,
      kind: "AVAILABLE",
      startTime: "09:00",
      endTime: "17:00",
      notes: "Created from admin quick-add",
    });

    await refresh();
  };

  return (
    <TimeShell
      title="Availability"
      subtitle="Define availability rules used by scheduling and auto-assignment."
      pill="Scheduling • Availability"
      actions={
        <>
          <Button variant="outline" onClick={refresh} disabled={busy}>
            <RefreshCcw className={cn("h-4 w-4", busy && "animate-spin")} />
            Refresh
          </Button>

          <Button onClick={quickCreate} disabled={busy || !employeeId}>
            <Plus className="h-4 w-4" />
            Quick add
          </Button>
        </>
      }
      requiredAnyCapabilities={["portal.time"]}
    >
      <div className="space-y-5">
        <TimeHeroCard
          title="Availability Rules"
          description="Rules drive schedule generation, validation, and staffing decisions."
          right={
            <div className="flex w-full flex-col gap-3 xl:min-w-[760px]">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Employee
                  </div>
                  <EmployeePicker
                    valueId={selectedEmployee?.id ?? null}
                    valueLabel={selectedEmployee?.label ?? null}
                    onSelect={setSelectedEmployee}
                    allowClear
                  />
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Org Unit
                  </div>
                  <OrgUnitPicker
                    valueId={selectedOrgUnit?.id ?? null}
                    valueLabel={selectedOrgUnit?.label ?? null}
                    onSelect={setSelectedOrgUnit}
                    allowClear
                  />
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Location
                  </div>
                  <LocationPicker
                    valueId={selectedLocation?.id ?? null}
                    valueLabel={selectedLocation?.label ?? null}
                    onSelect={setSelectedLocation}
                    allowClear
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={includeInactive}
                    onChange={(e) => setIncludeInactive(e.target.checked)}
                  />
                  include inactive
                </label>

                <Badge variant="muted" className="rounded-full">
                  Employee: {selectedEmployee?.label ?? "Not selected"}
                </Badge>

                <Badge variant="muted" className="rounded-full">
                  Total: {items.length}
                </Badge>
              </div>
            </div>
          }
        />

        {listQ.isLoading ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-slate-600 dark:text-slate-300">
              Loading availability…
            </CardContent>
          </Card>
        ) : listQ.isError ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-red-600 dark:text-red-300">
              Failed to load availability.
            </CardContent>
          </Card>
        ) : items.length ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="border-b border-slate-100 p-3 dark:border-slate-800">
              <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                Rules
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Managed per employee with optional org unit and location scope.
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-600 dark:bg-slate-900/30 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Employee</th>
                    <th className="px-4 py-3 text-left font-medium">Day</th>
                    <th className="px-4 py-3 text-left font-medium">Kind</th>
                    <th className="px-4 py-3 text-left font-medium">Window</th>
                    <th className="px-4 py-3 text-left font-medium">Scope</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((r) => {
                    const k = pillFor(r.kind as AvailabilityKind);

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/20">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900 dark:text-slate-50">
                            {String(r.employeeId).slice(0, 10)}
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            {String(r.id).slice(0, 10)}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                          {DOW[r.dayOfWeek] ?? `D${r.dayOfWeek}`}
                        </td>

                        <td className="px-4 py-3">
                          <Badge className={cn("rounded-full", k.cls)}>{k.label}</Badge>
                        </td>

                        <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                          {r.startTime} → {r.endTime}
                        </td>

                        <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                          {r.locationId ? `Loc ${String(r.locationId).slice(0, 6)}` : "—"}
                          {r.orgUnitId ? ` • Org ${String(r.orgUnitId).slice(0, 6)}` : ""}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="outline"
                            disabled={busy}
                            onClick={async () => {
                              await delM.mutateAsync(String(r.id));
                              await refresh();
                            }}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6">
              <EmptyState
                title="No availability rules"
                description={
                  employeeId
                    ? "No rules exist yet for the selected employee. Use Quick add to create one."
                    : "Select an employee to create or review availability rules."
                }
                action={null}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </TimeShell>
  );
}