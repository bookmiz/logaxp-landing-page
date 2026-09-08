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
  Location,
  LocationEmployeeListItem,
  ListLocationEmployeesQueryDto,
} from "@/logaxp/lib/orgStructure/orgStructure.types";

function fullName(v?: {
  firstName?: string;
  lastName?: string;
  preferredName?: string | null;
}) {
  if (!v) return "—";
  return v.preferredName || `${v.firstName ?? ""} ${v.lastName ?? ""}`.trim() || "—";
}

export function LocationDetailManager({
  locationId,
}: {
  locationId: string;
}) {
  const router = useRouter();
  const { locations } = useOrgStructure();

  const [location, setLocation] = React.useState<Location | null>(null);
  const [employees, setEmployees] = React.useState<LocationEmployeeListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingEmployees, setLoadingEmployees] = React.useState(false);

  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 250);

  const [primaryOnly, setPrimaryOnly] = React.useState(false);
  const [includeInactive, setIncludeInactive] = React.useState(false);
  const [page, setPage] = React.useState(1);

  const [meta, setMeta] = React.useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  });

  const loadLocation = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await locations.get(locationId);
      const data = (res as any)?.data ?? res;
      setLocation(data);
    } finally {
      setLoading(false);
    }
  }, [locationId, locations]);

  const loadEmployees = React.useCallback(async () => {
    setLoadingEmployees(true);
    try {
      const query: ListLocationEmployeesQueryDto = {
        search: debouncedSearch || undefined,
        primaryOnly,
        includeInactive,
        page,
        pageSize: 20,
      };

      const res = await locations.listEmployees(locationId, query);
      const data = (res as any)?.data ?? res;

      setEmployees(Array.isArray(data?.items) ? data.items : []);
      setMeta({
        page: Number(data?.page ?? 1),
        pageSize: Number(data?.pageSize ?? 20),
        total: Number(data?.total ?? 0),
        totalPages: Number(data?.totalPages ?? 1),
      });
    } finally {
      setLoadingEmployees(false);
    }
  }, [debouncedSearch, includeInactive, primaryOnly, page, locationId, locations]);

  React.useEffect(() => {
    void loadLocation();
  }, [loadLocation]);

  React.useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, primaryOnly, includeInactive]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            void loadLocation();
            void loadEmployees();
          }}
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{loading ? "Loading..." : location?.name ?? "Location"}</CardTitle>
          <CardDescription>
            View location information and employees assigned here.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!loading && location ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InfoCard label="Type" value={String(location.type ?? "—")} />
              <InfoCard label="Code" value={String(location.code ?? "—")} />
              <InfoCard
                label="Manager"
                value={fullName(location.managerEmployee as any)}
              />
              <InfoCard
                label="City / State"
                value={`${location.city ?? "—"}${location.state ? `, ${location.state}` : ""}`}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
          <CardDescription>
            Employees assigned to this location.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees..."
            />

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
                    <th className="px-4 py-3">Org Unit</th>
                    <th className="px-4 py-3">Position</th>
                    <th className="px-4 py-3">Cost Center</th>
                    <th className="px-4 py-3">Supervisor</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-t">
                      <td className="px-4 py-3">
                        <div className="font-medium">{fullName(emp)}</div>
                        <div className="text-xs text-slate-500">
                          {emp.employeeNumber ? `#${emp.employeeNumber}` : "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3">{emp.status ?? "—"}</td>
                      <td className="px-4 py-3">
                        {emp.primaryAssignment?.orgUnit?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {emp.primaryAssignment?.position?.title ??
                          emp.primaryAssignment?.position?.name ??
                          "—"}
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
                Page {meta.page} / {meta.totalPages}
              </Badge>

              <Button
                size="sm"
                variant="outline"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
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