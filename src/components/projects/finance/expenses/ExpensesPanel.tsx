"use client";

import * as React from "react";
import { Plus, RefreshCcw, Search } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";

import type { ProjectExpense, ProjectExpensesQuery } from "@/logaxp/lib/project-finance/projectFinance.types";

import { useProjectExpenses } from "@/logaxp/hooks/finance/useProjectExpenses";
import {
  useAddExpenseAttachment,
  useApproveProjectExpense,
  useCreateProjectExpense,
  useDeleteProjectExpense,
  useRejectProjectExpense,
  useRemoveExpenseAttachment,
  useRestoreProjectExpense,
  useSubmitProjectExpense,
  useUpdateProjectExpense,
} from "@/logaxp/hooks/finance/useProjectExpenseMutations";

import { ExpensesTable } from "./ExpensesTable";
import { ExpenseCreateEditDialog } from "./ExpenseCreateEditDialog";
import { ExpenseDecideDialog } from "./ExpenseDecideDialog";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export function ExpensesPanel({ projectId }: { projectId: string }) {
  const [q, setQ] = React.useState("");
  const deferredQ = React.useDeferredValue(q);

  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [includeDeleted, setIncludeDeleted] = React.useState(false);

  const query: ProjectExpensesQuery = {
    q: deferredQ.trim() || undefined,
    from: from || undefined,
    to: to || undefined,
    includeDeleted,
    page: 1,
    pageSize: 50,
  };

  const expensesQuery = useProjectExpenses(projectId, query);

  const create = useCreateProjectExpense(projectId);
  const update = useUpdateProjectExpense(projectId);
  const submit = useSubmitProjectExpense(projectId);
  const approve = useApproveProjectExpense(projectId);
  const reject = useRejectProjectExpense(projectId);
  const del = useDeleteProjectExpense(projectId);
  const restore = useRestoreProjectExpense(projectId);

  const addAttachment = useAddExpenseAttachment(projectId);
  const removeAttachment = useRemoveExpenseAttachment(projectId);

  const busy =
    expensesQuery.isFetching ||
    create.isPending ||
    update.isPending ||
    submit.isPending ||
    approve.isPending ||
    reject.isPending ||
    del.isPending ||
    restore.isPending ||
    addAttachment.isPending ||
    removeAttachment.isPending;

  const raw = expensesQuery.data?.data as any;

  const rows = React.useMemo(() => {
    const items: ProjectExpense[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
    return [...items].sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")));
  }, [raw]);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editRow, setEditRow] = React.useState<ProjectExpense | null>(null);

  const [decideOpen, setDecideOpen] = React.useState(false);
  const [decideMode, setDecideMode] = React.useState<"approve" | "reject">("approve");
  const [decideRow, setDecideRow] = React.useState<ProjectExpense | null>(null);

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-base">Expenses</CardTitle>
            <CardDescription>Record expenses and attach receipts.</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted" className="rounded-full">
              Total: {rows.length}
            </Badge>

            <Button variant="outline" onClick={() => expensesQuery.refetch()} disabled={expensesQuery.isFetching}>
              <RefreshCcw className={cn("h-4 w-4", expensesQuery.isFetching && "animate-spin")} />
              Refresh
            </Button>

            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New expense
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Search className="h-4 w-4" />
            <span>Search expenses</span>
          </div>

          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
            <input
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 md:w-[260px]"
              placeholder="Search title..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <input
              type="date"
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 md:w-[160px]"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              title="From"
            />

            <input
              type="date"
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 md:w-[160px]"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              title="To"
            />

            <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(e) => setIncludeDeleted(e.target.checked)}
              />
              Include deleted
            </label>
          </div>
        </div>

        {/* Content */}
        {expensesQuery.isLoading ? (
          <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
            Loading expenses...
          </div>
        ) : expensesQuery.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300">
            Failed to load expenses.
          </div>
        ) : rows.length ? (
          <ExpensesTable
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
          <div className="rounded-xl border border-slate-200 p-6 dark:border-slate-800">
            <EmptyState
              title="No expenses yet"
              description="Create an expense to track project spending."
              action={
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Create expense
                </Button>
              }
            />
          </div>
        )}

        {/* Create */}
        <ExpenseCreateEditDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          mode="create"
          busy={create.isPending}
          onSubmit={async (dto) => {
            await create.mutateAsync(dto as any);
          }}
        />

        {/* Edit + attachments */}
        <ExpenseCreateEditDialog
          open={editOpen}
          onOpenChange={(v) => {
            setEditOpen(v);
            if (!v) setEditRow(null);
          }}
          mode="edit"
          expense={editRow}
          busy={busy}
          onSubmit={async (dto) => {
            if (!editRow) return;
            await update.mutateAsync({ expenseId: editRow.id, dto: dto as any });
          }}
          onAddFileId={async (fileId) => {
            if (!editRow) return;
            await addAttachment.mutateAsync({ expenseId: editRow.id, dto: { fileId } });
          }}
          onRemoveAttachment={async (attachmentId) => {
            await removeAttachment.mutateAsync(attachmentId);
          }}
        />

        {/* Decide */}
        <ExpenseDecideDialog
          open={decideOpen}
          onOpenChange={(v) => {
            setDecideOpen(v);
            if (!v) setDecideRow(null);
          }}
          mode={decideMode}
          expense={decideRow}
          busy={approve.isPending || reject.isPending}
          onSubmit={async (dto) => {
            if (!decideRow) return;
            if (decideMode === "approve") {
              await approve.mutateAsync({ expenseId: decideRow.id, dto });
            } else {
              await reject.mutateAsync({ expenseId: decideRow.id, dto });
            }
          }}
        />
      </CardContent>
    </Card>
  );
}