"use client";

import * as React from "react";
import { Plus, RefreshCcw, Table2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/logaxp/components/ui/badge";
import { Button } from "@/logaxp/components/ui/button";
import { PermissionGate } from "@/logaxp/components/auth/PermissionGate";

export function EmployeesPageHeader({
  total,
  loading,
  includeDeleted,
  busyAny,
  onRefresh,
}: {
  total: number;
  loading: boolean;
  includeDeleted: boolean;
  busyAny: boolean;
  onRefresh: () => void | Promise<void>;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Employees</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Search, filter, and manage employees across your organization.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            {loading ? "Loading…" : `${total} employee${total === 1 ? "" : "s"}`}
          </Badge>

          {includeDeleted ? (
            <Badge variant="outline" className="rounded-full">
              Including deleted
            </Badge>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void onRefresh()} disabled={busyAny}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push("/portal/employees/table")}
            disabled={busyAny}
          >
            <Table2 className="h-4 w-4" />
            Full table
          </Button>

          <PermissionGate permission="employee.write">
            <Button
              onClick={() => router.push("/portal/employees/new")}
              disabled={busyAny}
              className="gap-2"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Add employee
            </Button>
          </PermissionGate>
        </div>
      </div>
    </div>
  );
}