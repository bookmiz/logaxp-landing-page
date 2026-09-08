"use client";

import * as React from "react";
import {
  ArrowLeft,
  RefreshCcw,
  Pencil,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Briefcase,
  Mail,
  Phone,
  CalendarDays,
  Building2,
  Users,
  Clock3,
  BadgeCheck,
  MapPin,
} from "lucide-react";

import type { EmployeeDetail } from "@/logaxp/lib/employee-management/employee-management.types";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { fullName, human, isDeleted, primaryAssignmentOf, safeDate, safeIso } from "./employee-detail.utils";
import { StatusBadge } from "./EmployeeSharedDialogs";

function StatCard({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  tone?: "default" | "emerald" | "blue" | "amber";
}) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/30 dark:bg-emerald-950/20"
      : tone === "blue"
      ? "border-sky-200 bg-sky-50/70 dark:border-sky-900/30 dark:bg-sky-950/20"
      : tone === "amber"
      ? "border-amber-200 bg-amber-50/70 dark:border-amber-900/30 dark:bg-amber-950/20"
      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950";

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">{value}</div>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {icon}
        </div>
      </div>
    </div>
  );
}

function MiniInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
      <div className="mt-0.5 text-slate-500 dark:text-slate-400">{icon}</div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </div>
        <div className="mt-1 truncate text-sm font-medium text-slate-900 dark:text-slate-50">{value}</div>
      </div>
    </div>
  );
}

export function EmployeeDetailHeader({
  employee,
  initialLoading,
  busyAny,
  onBack,
  onRefresh,
  onEdit,
  onStatus,
  onDelete,
  onRestore,
}: {
  employee: EmployeeDetail | null;
  initialLoading: boolean;
  busyAny: boolean;
  onBack: () => void;
  onRefresh: () => void;
  onEdit: () => void;
  onStatus: () => void;
  onDelete: () => void;
  onRestore: () => void;
}) {
  const deleted = isDeleted(employee);
  const primaryAssignment = primaryAssignmentOf(employee);

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-5 py-5 dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <Briefcase className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    {employee ? fullName(employee) : initialLoading ? "Loading employee…" : "Employee"}
                  </h1>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {employee ? (
                      <>
                        <span>{human(employee.employmentType ?? "—")}</span>
                        <span className="mx-2">•</span>
                        <span>{employee.employeeNumber ? `#${employee.employeeNumber}` : "No employee #"}</span>
                        <span className="mx-2">•</span>
                        <span>{employee.workEmail ?? employee.personalEmail ?? "No email on file"}</span>
                      </>
                    ) : initialLoading ? (
                      "Loading employee record…"
                    ) : (
                      "Employee record not found or access restricted."
                    )}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {employee ? <StatusBadge status={employee.status} deleted={deleted} /> : null}
                    {employee?.workEmail ? <Badge variant="muted" className="rounded-full">{employee.workEmail}</Badge> : null}
                    {employee?.personalPhone ? <Badge variant="muted" className="rounded-full">{employee.personalPhone}</Badge> : null}
                  </div>
                </div>
              </div>

              {!initialLoading && employee ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard label="Status" value={human(employee.status)} icon={<BadgeCheck className="h-4 w-4" />} tone="emerald" />
                  <StatCard label="Hire date" value={safeDate(employee.hireDate)} icon={<CalendarDays className="h-4 w-4" />} tone="blue" />
                  <StatCard label="Primary position" value={primaryAssignment?.position?.title ?? "—"} icon={<Building2 className="h-4 w-4" />} tone="amber" />
                  <StatCard label="Assignments" value={employee.assignments?.length ?? 0} icon={<Users className="h-4 w-4" />} />
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button variant="outline" onClick={onBack} disabled={busyAny}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              <Button variant="outline" onClick={onRefresh} disabled={busyAny}>
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>

              <Button variant="outline" onClick={onEdit} disabled={busyAny || !employee}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>

              <Button variant="outline" onClick={onStatus} disabled={busyAny || !employee || deleted}>
                <ShieldCheck className="h-4 w-4" />
                Status
              </Button>

              {deleted ? (
                <Button onClick={onRestore} disabled={busyAny || !employee}>
                  <RotateCcw className="h-4 w-4" />
                  Restore
                </Button>
              ) : (
                <Button variant="destructive" onClick={onDelete} disabled={busyAny || !employee}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>

        {employee && !initialLoading ? (
          <div className="grid gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 md:grid-cols-2 xl:grid-cols-4">
            <MiniInfo icon={<Mail className="h-4 w-4" />} label="Email" value={employee.workEmail ?? employee.personalEmail ?? "—"} />
            <MiniInfo icon={<Phone className="h-4 w-4" />} label="Phone" value={employee.workPhone ?? employee.personalPhone ?? "—"} />
            <MiniInfo icon={<MapPin className="h-4 w-4" />} label="Primary location" value={primaryAssignment?.location?.name ?? "—"} />
            <MiniInfo icon={<Clock3 className="h-4 w-4" />} label="Updated" value={safeIso(employee.updatedAt)} />
          </div>
        ) : null}
      </div>
    </div>
  );
}