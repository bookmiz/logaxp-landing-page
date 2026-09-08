"use client";

import * as React from "react";
import { RefreshCcw, Users } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Skeleton } from "@/logaxp/components/ui/skeleton";
import { toast } from "@/logaxp/components/ui/toast";
import { useDebouncedValue } from "@/logaxp/components/orgStructure/shared/useDebouncedValue";
import { useManager } from "@/logaxp/hooks/useManager";
import type {
  ManagedScopeSummary,
  ManagerTeamListItem,
  ManagerTeamQueryDto,
} from "@/logaxp/lib/manager/manager.types";
import { ManagerSummaryCards } from "@/logaxp/components/manager/ManagerSummaryCards";
import { ManagerTeamFiltersBar } from "@/logaxp/components/manager/ManagerTeamFiltersBar";
import { ManagerTeamTable } from "@/logaxp/components/manager/ManagerTeamTable";

export default function ManagerMyTeamPage() {
  const { me, loading } = useManager();

  const [summary, setSummary] = React.useState<ManagedScopeSummary | null>(null);
  const [items, setItems] = React.useState<ManagerTeamListItem[]>([]);
  const [fetching, setFetching] = React.useState(false);

  const [filter, setFilter] = React.useState<ManagerTeamQueryDto>({
    search: "",
    includeInactive: false,
    includeDeleted: false,
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
      const [summaryRes, teamRes] = await Promise.all([
        me.summary(),
        me.team(effectiveFilter),
      ]);

      const summaryData = (summaryRes as any)?.data ?? summaryRes;
      const teamData = (teamRes as any)?.data ?? teamRes;

      setSummary(summaryData ?? null);
      setItems(Array.isArray(teamData?.items) ? teamData.items : []);
      setMeta({
        page: Number(teamData?.page ?? 1),
        pageSize: Number(teamData?.pageSize ?? 20),
        total: Number(teamData?.total ?? 0),
        totalPages: Number(teamData?.totalPages ?? 1),
      });
    } catch {
      toast.error("Failed to load manager dashboard");
      setSummary(null);
      setItems([]);
      setMeta({
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 1,
      });
    } finally {
      setFetching(false);
    }
  }, [effectiveFilter, me]);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    setFilter((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 text-slate-700">
              <Users className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Team</h1>
          </div>
          <p className="text-sm text-slate-600">
            View the employees you supervise across reporting lines, assignments, org units, locations, and cost centers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            {fetching ? "Loading..." : `${meta.total} employee${meta.total === 1 ? "" : "s"}`}
          </Badge>

          <Button variant="outline" onClick={() => void load()} disabled={fetching}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {fetching && !summary ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : (
        <ManagerSummaryCards summary={summary} />
      )}

      <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-gradient-to-b from-slate-50 to-white">
          <CardTitle className="text-base">Team Directory</CardTitle>
          <CardDescription>
            Search, filter, and review employees under your supervision.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 p-4 md:p-6">
          <div className="rounded-2xl border bg-white p-4">
            <ManagerTeamFiltersBar value={filter} onChange={setFilter} />
          </div>

          {fetching && items.length === 0 ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border bg-white p-6">
              <EmptyState
                title="No team members found"
                description="No employees matched your current manager filters."
              />
            </div>
          ) : (
            <div className="rounded-2xl border bg-white">
              <ManagerTeamTable items={items} />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Showing {items.length} of {meta.total}
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={meta.page <= 1 || loading}
                onClick={() =>
                  setFilter((prev) => ({
                    ...prev,
                    page: Math.max(1, Number(prev.page ?? 1) - 1),
                  }))
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
                    page: Math.min(meta.totalPages, Number(prev.page ?? 1) + 1),
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