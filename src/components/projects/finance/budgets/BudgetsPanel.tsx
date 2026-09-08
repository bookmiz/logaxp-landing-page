"use client";

import * as React from "react";
import { 
  Plus, 
  RefreshCcw, 
  Search, 
  Filter,
  FolderOpen,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp
} from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Input } from "@/logaxp/components/ui/input";
import { Checkbox } from "@/logaxp/components/ui/checkbox";
import { Skeleton } from "@/logaxp/components/ui/skeleton";

import type { ProjectBudget, ProjectBudgetsQuery } from "@/logaxp/lib/project-finance/projectFinance.types";

import { useProjectBudgets } from "@/logaxp/hooks/finance/useProjectBudgets";
import {
  useApproveProjectBudget,
  useCreateProjectBudget,
  useDeleteProjectBudget,
  useRejectProjectBudget,
  useRestoreProjectBudget,
  useSubmitProjectBudget,
  useUpdateProjectBudget,
} from "@/logaxp/hooks/finance/useProjectBudgetMutations";

import { BudgetsTable } from "./BudgetsTable";
import { BudgetCreateEditDialog } from "./BudgetCreateEditDialog";
import { BudgetDecideDialog } from "./BudgetDecideDialog";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

// Quick stats component
function BudgetStats({ total, approved, pending }: { total: number; approved: number; pending: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
        <FolderOpen className="h-3.5 w-3.5 text-slate-500" />
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{total} total</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 dark:bg-emerald-950/30">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{approved} approved</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 dark:bg-amber-950/30">
        <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        <span className="text-xs font-medium text-amber-700 dark:text-amber-400">{pending} pending</span>
      </div>
    </div>
  );
}

export function BudgetsPanel({ projectId }: { projectId: string }) {
  const [q, setQ] = React.useState("");
  const deferredQ = React.useDeferredValue(q);

  const [includeDeleted, setIncludeDeleted] = React.useState(false);

  const query: ProjectBudgetsQuery = {
    q: deferredQ.trim() || undefined,
    includeDeleted,
    page: 1,
    pageSize: 50,
  };

  const budgetsQuery = useProjectBudgets(projectId, query);

  const create = useCreateProjectBudget(projectId);
  const update = useUpdateProjectBudget(projectId);
  const submit = useSubmitProjectBudget(projectId);
  const approve = useApproveProjectBudget(projectId);
  const reject = useRejectProjectBudget(projectId);
  const del = useDeleteProjectBudget(projectId);
  const restore = useRestoreProjectBudget(projectId);

  const busy =
    budgetsQuery.isFetching ||
    create.isPending ||
    update.isPending ||
    submit.isPending ||
    approve.isPending ||
    reject.isPending ||
    del.isPending ||
    restore.isPending;

  const raw = budgetsQuery.data?.data as any;
  const items: ProjectBudget[] = Array.isArray(raw) ? raw : (raw?.items ?? []);

  const rows = React.useMemo(() => {
    return [...items].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));
  }, [items]);

  // Calculate stats
  const stats = React.useMemo(() => {
    const approved = rows.filter(r => r.status === 'APPROVED').length;
    const pending = rows.filter(r => r.status === 'SUBMITTED').length;
    return { approved, pending };
  }, [rows]);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editRow, setEditRow] = React.useState<ProjectBudget | null>(null);

  const [decideOpen, setDecideOpen] = React.useState(false);
  const [decideMode, setDecideMode] = React.useState<"approve" | "reject">("approve");
  const [decideRow, setDecideRow] = React.useState<ProjectBudget | null>(null);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Project Budgets
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Plan, track, and manage budget allocations for this project
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => budgetsQuery.refetch()}
            disabled={budgetsQuery.isFetching}
            className="gap-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-300"
          >
            <RefreshCcw className={cn("h-3.5 w-3.5", budgetsQuery.isFetching && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm hover:from-emerald-500 hover:to-emerald-400"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Budget</span>
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      {rows.length > 0 && !budgetsQuery.isLoading && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <BudgetStats 
            total={rows.length} 
            approved={stats.approved} 
            pending={stats.pending} 
          />
          
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Last updated {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* Main Card */}
      <Card className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {/* Search and Filter Bar */}
        <div className="border-b border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Filter className="h-4 w-4" />
              <span>Filter budgets</span>
            </div>

            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by name or description..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="h-9 pl-9 pr-4 text-sm bg-white dark:bg-slate-950"
                />
              </div>

              <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900">
                <Checkbox
                  checked={includeDeleted}
                  onCheckedChange={(checked) => setIncludeDeleted(checked as boolean)}
                  className="h-4 w-4"
                />
                <span>Show deleted items</span>
              </label>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {/* Content Section */}
          {budgetsQuery.isLoading ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : budgetsQuery.isError ? (
            <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-red-800 dark:text-red-300">Failed to load budgets</h4>
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  There was an error loading the budget data.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => budgetsQuery.refetch()}
                className="mt-2 border-red-200 bg-white text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/50"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          ) : rows.length > 0 ? (
            <BudgetsTable
              rows={rows}
              busy={busy}
              onEdit={(row) => {
                setEditRow(row);
                setEditOpen(true);
              }}
              onSubmit={(row) => submit.mutateAsync(row.id)}
              onApprove={(row) => {
                setDecideMode("approve");
                setDecideRow(row);
                setDecideOpen(true);
              }}
              onReject={(row) => {
                setDecideMode("reject");
                setDecideRow(row);
                setDecideOpen(true);
              }}
              onDelete={(row) => del.mutateAsync(row.id)}
              onRestore={(row) => restore.mutateAsync(row.id)}
            />
          ) : (
            <div className="p-12">
              <EmptyState
                title="No budgets yet"
                description="Get started by creating your first budget for this project."
                icon={<FolderOpen className="h-8 w-8 text-slate-400" />}
                action={
                  <Button 
                    onClick={() => setCreateOpen(true)}
                    className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400"
                  >
                    <Plus className="h-4 w-4" />
                    Create Budget
                  </Button>
                }
              />
            </div>
          )}
        </CardContent>

        {/* Footer with summary (if needed) */}
        {rows.length > 0 && !budgetsQuery.isLoading && (
          <div className="border-t border-slate-200 bg-slate-50/50 px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/20 dark:text-slate-400">
            <div className="flex items-center justify-between">
              <span>
                Showing {rows.length} of {rows.length} budgets
              </span>
              {q && (
                <span className="text-emerald-600 dark:text-emerald-400">
                  Filtered by: &quot;{q}&quot;
                </span>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Dialogs */}
      <BudgetCreateEditDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        busy={create.isPending}
        onSubmit={async (dto) => {
          await create.mutateAsync(dto as any);
        }}
      />

      <BudgetCreateEditDialog
        open={editOpen}
        onOpenChange={(v) => {
          setEditOpen(v);
          if (!v) setEditRow(null);
        }}
        mode="edit"
        budget={editRow}
        busy={update.isPending}
        onSubmit={async (dto) => {
          if (!editRow) return;
          await update.mutateAsync({ budgetId: editRow.id, dto: dto as any });
        }}
      />

      <BudgetDecideDialog
        open={decideOpen}
        onOpenChange={(v) => {
          setDecideOpen(v);
          if (!v) setDecideRow(null);
        }}
        mode={decideMode}
        budget={decideRow}
        busy={approve.isPending || reject.isPending}
        onSubmit={async (dto) => {
          if (!decideRow) return;
          if (decideMode === "approve") {
            await approve.mutateAsync({ budgetId: decideRow.id, dto });
          } else {
            await reject.mutateAsync({ budgetId: decideRow.id, dto });
          }
        }}
      />
    </div>
  );
}