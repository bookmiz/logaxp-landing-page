// src/logaxp/components/orgStructure/orgUnits/detail/OrgUnitDetailManager.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCcw } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/logaxp/components/ui/card";
import { Badge } from "@/logaxp/components/ui/badge";
import { Input } from "@/logaxp/components/ui/input";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { useDebouncedValue } from "@/logaxp/components/orgStructure/shared/useDebouncedValue";
import { useOrgStructure } from "@/logaxp/hooks/useOrgStructure";
import type {
  OrgUnit,
  OrgUnitEmployeeListItem,
  ListOrgUnitEmployeesQuery,
} from "@/logaxp/lib/orgStructure/orgStructure.types";

function safeDate(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

function fullName(e?: {
  firstName?: string;
  lastName?: string;
  preferredName?: string | null;
}) {
  if (!e) return "—";
  return (
    e.preferredName ||
    `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim() ||
    "—"
  );
}

export function OrgUnitDetailManager({ orgUnitId }: { orgUnitId: string }) {
  const router = useRouter();
  const { orgUnits } = useOrgStructure();

  const [unit, setUnit] = React.useState<OrgUnit | null>(null);
  const [tree, setTree] = React.useState<OrgUnit | null>(null);
  const [employees, setEmployees] = React.useState<OrgUnitEmployeeListItem[]>([]);
  const [meta, setMeta] = React.useState({ page: 1, pageSize: 20, total: 0 });

  const [loading, setLoading] = React.useState(true);
  const [loadingEmployees, setLoadingEmployees] = React.useState(false);

  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 250);
  const [includeChildren, setIncludeChildren] = React.useState(false);
  const [primaryOnly, setPrimaryOnly] = React.useState(false);
  const [includeInactive, setIncludeInactive] = React.useState(false);
  const [page, setPage] = React.useState(1);

  const loadUnit = React.useCallback(async () => {
    setLoading(true);
    try {
      const [unitRes, treeRes] = await Promise.all([
        orgUnits.get(orgUnitId),
        orgUnits.tree(orgUnitId),
      ]);

      const unitData = (unitRes as any)?.data ?? unitRes;
      const treeData = (treeRes as any)?.data ?? treeRes;

      setUnit(unitData);
      setTree(treeData);
    } finally {
      setLoading(false);
    }
  }, [orgUnitId, orgUnits]);

  const loadEmployees = React.useCallback(async () => {
    setLoadingEmployees(true);
    try {
      const query: ListOrgUnitEmployeesQuery = {
        search: debouncedSearch || undefined,
        includeChildren,
        primaryOnly,
        includeInactive,
        page,
        pageSize: 20,
      };

      const res = await orgUnits.listEmployees(orgUnitId, query);
      const payload = (res as any)?.data ?? res;

      setEmployees(payload?.items ?? []);
      setMeta({
        page: payload?.page ?? 1,
        pageSize: payload?.pageSize ?? 20,
        total: payload?.total ?? 0,
      });
    } finally {
      setLoadingEmployees(false);
    }
  }, [
    debouncedSearch,
    includeChildren,
    primaryOnly,
    includeInactive,
    page,
    orgUnitId,
    orgUnits,
  ]);

  React.useEffect(() => {
    loadUnit();
  }, [loadUnit]);

  React.useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, includeChildren, primaryOnly, includeInactive]);

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.pageSize));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Button variant="outline" onClick={() => {
          void loadUnit();
          void loadEmployees();
        }}>
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{loading ? "Loading..." : unit?.name ?? "Org Unit"}</CardTitle>
          <CardDescription>
            View org unit information, hierarchy, and assigned employees.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!loading && unit ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <InfoCard label="Type" value={String(unit.type ?? "—")} />
                <InfoCard label="Code" value={String(unit.code ?? "—")} />
                <InfoCard
                  label="Manager"
                  value={fullName(unit.managerEmployee as any)}
                />
                <InfoCard
                  label="Parent"
                  value={String((unit.parent as any)?.name ?? "—")}
                />
              </div>

              <div className="rounded-xl border p-4">
                <div className="text-sm font-semibold">Children</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(unit.children ?? []).length ? (
                    (unit.children ?? []).map((child: any) => (
                      <Badge key={child.id} variant="outline" className="rounded-full">
                        {child.name ?? "—"}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No child units</span>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
          <CardDescription>
            Employees assigned to this org unit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees..."
            />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeChildren}
                onChange={(e) => setIncludeChildren(e.target.checked)}
              />
              Include child units
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={primaryOnly}
                onChange={(e) => setPrimaryOnly(e.target.checked)}
              />
              Primary only
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
              />
              Include inactive
            </label>
          </div>

          {loadingEmployees ? (
            <div className="rounded-xl border p-6 text-sm text-slate-500">
              Loading employees...
            </div>
          ) : employees.length === 0 ? (
            <EmptyState
              title="No employees found"
              description="No employees matched the selected filters."
            />
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Position</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Cost Center</th>
                    <th className="px-4 py-3">Supervisor</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-t">
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {fullName(emp)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {emp.employeeNumber ? `#${emp.employeeNumber}` : "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3">{emp.status ?? "—"}</td>
                      <td className="px-4 py-3">
                        {emp.primaryAssignment?.position?.title ??
                          emp.primaryAssignment?.position?.name ??
                          "—"}
                      </td>
                      <td className="px-4 py-3">
                        {emp.primaryAssignment?.location?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {emp.primaryAssignment?.costCenter?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {emp.primaryAssignment?.manager
                          ? fullName(emp.primaryAssignment.manager)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Showing {employees.length} of {meta.total}
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <Badge variant="outline">
                Page {page} / {totalPages}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value || "—"}</div>
    </div>
  );
}
