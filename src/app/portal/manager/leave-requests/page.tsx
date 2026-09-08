"use client";

import * as React from "react";
import { RefreshCcw, FileClock } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Input } from "@/logaxp/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/logaxp/components/ui/card";
import { Skeleton } from "@/logaxp/components/ui/skeleton";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { SelectField } from "@/logaxp/components/orgStructure/shared/SelectField";
import { useDebouncedValue } from "@/logaxp/components/orgStructure/shared/useDebouncedValue";
import { toast } from "@/logaxp/components/ui/toast";
import { useManager } from "@/logaxp/hooks/useManager";
import type {
  LeaveStatus,
  LeaveType,
  ManagerLeaveRequest,
  ManagerLeaveRequestsQueryDto,
} from "@/logaxp/lib/manager/manager.types";

function unwrapData<T>(value: unknown): T {
  return ((value as { data?: T })?.data ?? value) as T;
}

function fullName(v?: {
  firstName?: string;
  lastName?: string;
  preferredName?: string | null;
} | null) {
  if (!v) return "—";
  return v.preferredName || `${v.firstName ?? ""} ${v.lastName ?? ""}`.trim() || "—";
}

const STATUS_OPTIONS: Array<{ value: LeaveStatus; label: string }> = [
  { value: "REQUESTED", label: "Requested" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELED", label: "Canceled" },
];

const TYPE_OPTIONS: Array<{ value: LeaveType; label: string }> = [
  { value: "VACATION", label: "Vacation" },
  { value: "SICK", label: "Sick" },
  { value: "PERSONAL", label: "Personal" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "OTHER", label: "Other" },
];

export default function ManagerLeaveRequestsPage() {
  const { me, loading } = useManager();

  const [items, setItems] = React.useState<ManagerLeaveRequest[]>([]);
  const [fetching, setFetching] = React.useState(false);

  const [filter, setFilter] = React.useState<ManagerLeaveRequestsQueryDto>({
    search: "",
    page: 1,
    pageSize: 20,
  });

  const debouncedSearch = useDebouncedValue(filter.search ?? "", 250);

  const effectiveFilter = React.useMemo(
    () => ({
      ...filter,
      search: debouncedSearch || undefined,
    }),
    [filter, debouncedSearch]
  );

  const [meta, setMeta] = React.useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  });

  const load = React.useCallback(async () => {
    setFetching(true);
    try {
      const res = await me.leaveRequests(effectiveFilter);
      const data = unwrapData<{
        page?: number;
        pageSize?: number;
        total?: number;
        totalPages?: number;
        items?: ManagerLeaveRequest[];
      }>(res);

      setItems(Array.isArray(data?.items) ? data.items : []);
      setMeta({
        page: Number(data?.page ?? 1),
        pageSize: Number(data?.pageSize ?? 20),
        total: Number(data?.total ?? 0),
        totalPages: Number(data?.totalPages ?? 1),
      });
    } catch {
      toast.error("Failed to load leave requests");
      setItems([]);
      setMeta({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
    } finally {
      setFetching(false);
    }
  }, [effectiveFilter, me]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="rounded-2xl border bg-slate-50 p-2 text-slate-700">
              <FileClock className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Manager Leave Requests</h1>
          </div>
          <p className="text-sm text-slate-600">
            Review leave requests submitted across employees in your management scope.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            {fetching ? "Loading..." : `${meta.total} request${meta.total === 1 ? "" : "s"}`}
          </Badge>

          <Button variant="outline" onClick={() => void load()} disabled={fetching || loading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="rounded-3xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>Search and narrow leave requests.</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input
            label="Search"
            value={filter.search ?? ""}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, search: e.target.value, page: 1 }))
            }
            placeholder="Search employee or reason..."
          />

          <SelectField
            label="Status"
            value={filter.status ?? ""}
            onChange={(v) =>
              setFilter((prev) => ({
                ...prev,
                status: (v || undefined) as LeaveStatus | undefined,
                page: 1,
              }))
            }
            options={STATUS_OPTIONS}
            placeholder="All statuses"
          />

          <SelectField
            label="Type"
            value={filter.type ?? ""}
            onChange={(v) =>
              setFilter((prev) => ({
                ...prev,
                type: (v || undefined) as LeaveType | undefined,
                page: 1,
              }))
            }
            options={TYPE_OPTIONS}
            placeholder="All leave types"
          />

          <div className="flex flex-col justify-end gap-2 pb-1">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(filter.includeInactive)}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    includeInactive: e.target.checked,
                    page: 1,
                  }))
                }
              />
              Include inactive
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(filter.includeDeleted)}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    includeDeleted: e.target.checked,
                    page: 1,
                  }))
                }
              />
              Include deleted
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Leave Requests</CardTitle>
          <CardDescription>
            Requests currently visible in your manager scope.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {fetching && items.length === 0 ? (
            <div className="space-y-3">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              title="No leave requests found"
              description="No leave requests matched the selected filters."
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Start</th>
                    <th className="px-4 py-3">End</th>
                    <th className="px-4 py-3">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {fullName(item.employee)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.employee?.employeeNumber
                            ? `#${item.employee.employeeNumber}`
                            : "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3">{item.type ?? "—"}</td>
                      <td className="px-4 py-3">{item.status ?? "—"}</td>
                      <td className="px-4 py-3">{item.startDate ?? "—"}</td>
                      <td className="px-4 py-3">{item.endDate ?? "—"}</td>
                      <td className="px-4 py-3 max-w-[420px] truncate">
                        {item.reason ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Showing {items.length} of {meta.total}
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={meta.page <= 1 || loading}
                onClick={() =>
                  setFilter((prev) => ({ ...prev, page: Math.max(1, meta.page - 1) }))
                }
              >
                Prev
              </Button>

              <Badge variant="outline" className="rounded-full">
                Page {meta.page} / {meta.totalPages}
              </Badge>

              <Button
                size="sm"
                variant="outline"
                disabled={meta.page >= meta.totalPages || loading}
                onClick={() =>
                  setFilter((prev) => ({
                    ...prev,
                    page: Math.min(meta.totalPages, meta.page + 1),
                  }))
                }
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
