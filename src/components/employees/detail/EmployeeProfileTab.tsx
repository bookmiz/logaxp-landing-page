"use client";

import * as React from "react";
import type { EmployeeDetail } from "@/logaxp/lib/employee-management/employee-management.types";
import { FileText } from "lucide-react";
import { isDeleted, human, primaryAssignmentOf, safeDate, safeIso } from "./employee-detail.utils";
import { RowKV } from "./EmployeeSharedDialogs";

export function EmployeeProfileTab({ employee }: { employee: EmployeeDetail }) {
  const deleted = isDeleted(employee);
  const primary = primaryAssignmentOf(employee);

  const left = [
    { k: "Employee #", v: employee.employeeNumber ?? "—" },
    { k: "Status", v: deleted ? "DELETED" : human(employee.status ?? "—") },
    { k: "Employment Type", v: human(employee.employmentType ?? "—") },
    { k: "Work Email", v: employee.workEmail ?? "—" },
    { k: "Personal Email", v: employee.personalEmail ?? "—" },
    { k: "Work Phone", v: employee.workPhone ?? "—" },
    { k: "Personal Phone", v: employee.personalPhone ?? "—" },
  ];

  const right = [
    { k: "Gender", v: human(employee.gender ?? "—") },
    { k: "Marital Status", v: human(employee.maritalStatus ?? "—") },
    { k: "DOB", v: safeDate(employee.dob) },
    { k: "Hire Date", v: safeDate(employee.hireDate) },
    { k: "Start Date", v: safeDate(employee.startDate) },
    { k: "Probation End", v: safeDate(employee.probationEndDate) },
    { k: "Updated", v: safeIso(employee.updatedAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Overview</div>
          <div className="mt-3 space-y-2">
            {left.map((x) => (
              <RowKV key={x.k} k={x.k} v={x.v} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Details</div>
          <div className="mt-3 space-y-2">
            {right.map((x) => (
              <RowKV key={x.k} k={x.k} v={x.v} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Primary Assignment Snapshot</div>
          <div className="mt-3 space-y-2">
            <RowKV k="Org Unit" v={primary?.orgUnit?.name ?? "—"} />
            <RowKV k="Position" v={primary?.position?.title ?? "—"} />
            <RowKV k="Location" v={primary?.location?.name ?? "—"} />
            <RowKV k="Cost Center" v={primary?.costCenter?.name ?? "—"} />
            <RowKV k="Manager ID" v={primary?.managerId ?? "—"} />
            <RowKV k="Effective From" v={safeDate(primary?.effectiveFrom)} />
            <RowKV k="Effective To" v={safeDate(primary?.effectiveTo)} />
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
          <FileText className="h-4 w-4" />
          Metadata
        </div>
        <pre className="max-h-[260px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
          {JSON.stringify(employee.metadata ?? {}, null, 2)}
        </pre>
      </section>
    </div>
  );
}