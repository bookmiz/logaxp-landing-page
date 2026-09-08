"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Plus, RefreshCcw, Search } from "lucide-react";

import { TestingShell } from "@/logaxp/components/testing/TestingShell";
import { normalizeList } from "@/logaxp/components/testing/testing.ui";
import { toast } from "@/logaxp/components/ui/toast";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { ProjectRequiredState } from "@/logaxp/components/projects/ProjectRequiredState";
import { normalizeProjectId } from "@/logaxp/lib/project-management/projectContext";

import type { TestPlan, TestCase, TestSuite } from "@/logaxp/lib/testing/testing.types";

import {
  useTestingPlans,
  useTestingSuites,
  useTestingCases,
  useCreateTestingPlan,
  useUpdateTestingPlan,
  useDeleteTestingPlan,
  useRestoreTestingPlan,
  useAddPlanCases,
  useRemovePlanCase,
} from "@/logaxp/hooks/useTesting";

import { TestPlansTable } from "@/logaxp/components/testing/plans/TestPlansTable";
import { TestPlanCreateEditDialog } from "@/logaxp/components/testing/plans/TestPlanCreateEditDialog";
import { TestPlanCasesDialog } from "@/logaxp/components/testing/plans/TestPlanCasesDialog";

export default function TestingPlansPage() {
  const sp = useSearchParams();
  const projectId = normalizeProjectId(sp.get("projectId"));

  const [q, setQ] = React.useState("");
  const [includeDeleted, setIncludeDeleted] = React.useState(false);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editRow, setEditRow] = React.useState<TestPlan | null>(null);
  const [manageRow, setManageRow] = React.useState<TestPlan | null>(null);

  // Plans list
  const plansQ = useTestingPlans({ projectId, includeDeleted, q: q.trim() || undefined });

  // For manage-cases dialog we also need suites + cases
  const suitesQ = useTestingSuites({ projectId, includeDeleted: false, q: undefined });
  const casesQ = useTestingCases({ projectId, includeDeleted: false });

  // mutations
  const createM = useCreateTestingPlan();
  const updateM = useUpdateTestingPlan();
  const deleteM = useDeleteTestingPlan();
  const restoreM = useRestoreTestingPlan();
  const addCasesM = useAddPlanCases();
  const rmCaseM = useRemovePlanCase();

  const busy =
    plansQ.isFetching ||
    suitesQ.isFetching ||
    casesQ.isFetching ||
    createM.isPending ||
    updateM.isPending ||
    deleteM.isPending ||
    restoreM.isPending ||
    addCasesM.isPending ||
    rmCaseM.isPending;

  const plans = normalizeList<TestPlan>(plansQ.data).items;

  // belt+suspenders sort/filter
  const rows = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return [...plans]
      .filter((p) => (includeDeleted ? true : !p.deletedAt))
      .filter((p) => {
        if (!needle) return true;
        const name = String(p.name ?? "").toLowerCase();
        const desc = String(p.description ?? "").toLowerCase();
        const id = String(p.id ?? "").toLowerCase();
        return name.includes(needle) || desc.includes(needle) || id.includes(needle);
      })
      .sort((a, b) => {
        const da = Boolean(a.deletedAt);
        const db = Boolean(b.deletedAt);
        if (da !== db) return da ? 1 : -1;

        const bd = new Date((b as any).createdAt ?? 0).getTime();
        const ad = new Date((a as any).createdAt ?? 0).getTime();
        if (!Number.isNaN(bd) && !Number.isNaN(ad) && bd !== ad) return bd - ad;

        return String(a.name ?? "").localeCompare(String(b.name ?? ""));
      });
  }, [plans, q, includeDeleted]);

  const suites = normalizeList<TestSuite>(suitesQ.data).items;
  const cases = normalizeList<TestCase>(casesQ.data).items;

  if (!projectId) {
    return (
      <TestingShell title="Test Plans" subtitle="Build curated sets of test cases." pill="Testing • Plans">
        <ProjectRequiredState targetPath="/portal/testing/plans" targetLabel="Open plans" />
      </TestingShell>
    );
  }

  return (
    <TestingShell
      title="Test Plans"
      subtitle="Build curated sets of test cases that become executable runs (smoke, regression, release)."
      pill="Testing • Plans"
      projectId={projectId}
      actions={
        <>
          <Button variant="outline" onClick={() => plansQ.refetch()} disabled={plansQ.isFetching}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New plan
          </Button>
        </>
      }
    >
      {/* Filters */}
      <Card className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-200/60 blur-3xl dark:bg-emerald-500/15" />
        <div className="pointer-events-none absolute -left-10 -bottom-16 h-52 w-52 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/10" />

        <CardHeader className="relative pb-3">
          <CardTitle className="text-xl">Test Plans</CardTitle>
          <CardDescription>Create plans, attach cases, and execute them as runs.</CardDescription>
        </CardHeader>

        <CardContent className="relative space-y-3 pt-0">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <Input
              label="Search"
              placeholder="Search plans by name, description, id..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />

            <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-800">
              <input
                type="checkbox"
                className="h-4 w-4 rounded"
                checked={includeDeleted}
                onChange={(e) => setIncludeDeleted(e.target.checked)}
              />
              Include deleted
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Plans</CardTitle>
          <CardDescription>
            Showing {rows.length} result{rows.length === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {plansQ.isLoading ? (
            <div className="text-sm text-slate-500">Loading plans...</div>
          ) : rows.length === 0 ? (
            <EmptyState
              title="No plans"
              description="Create a plan and attach cases for a clean execution workflow."
              action={<Button onClick={() => setCreateOpen(true)}>Create plan</Button>}
            />
          ) : (
            <TestPlansTable
              rows={rows}
              busy={busy}
              onEdit={(r) => setEditRow(r)}
              onManageCases={(r) => setManageRow(r)}
              onDelete={(r) => deleteM.mutate(r.id)}
              onRestore={(r) => restoreM.mutate(r.id)}
            />
          )}
        </CardContent>
      </Card>

      {/* Create */}
      <TestPlanCreateEditDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        projectId={projectId}
        busy={createM.isPending}
        onSubmit={async (dto) => {
          try {
            await createM.mutateAsync(dto as any);
            toast.success("Test plan created");
            setCreateOpen(false);
          } catch (e) {
            console.error(e);
            toast.error("Failed to create test plan");
          }
        }}
      />

      {/* Edit */}
      <TestPlanCreateEditDialog
        open={Boolean(editRow)}
        onOpenChange={(o) => !o && setEditRow(null)}
        mode="edit"
        projectId={projectId}
        plan={editRow}
        busy={updateM.isPending}
        onSubmit={async (dto) => {
          if (!editRow) return;
          try {
            await updateM.mutateAsync({ id: editRow.id, dto: dto as any });
            toast.success("Test plan updated");
            setEditRow(null);
          } catch (e) {
            console.error(e);
            toast.error("Failed to update test plan");
          }
        }}
      />

      {/* Manage Cases */}
      <TestPlanCasesDialog
        open={Boolean(manageRow)}
        onOpenChange={(o) => !o && setManageRow(null)}
        plan={manageRow}
        suites={suites}
        cases={cases}
        busy={addCasesM.isPending || rmCaseM.isPending}
        onAddMany={async (testCaseIds) => {
          if (!manageRow) return;
          try {
            const updated = await addCasesM.mutateAsync({ planId: manageRow.id, dto: { testCaseIds } });
            setManageRow(updated as any);
            toast.success("Cases added to plan");
            await plansQ.refetch();
          } catch (e) {
            console.error(e);
            toast.error("Failed to add cases to plan");
          }
        }}
        onRemoveOne={async (testCaseId) => {
          if (!manageRow) return;
          try {
            const updated = await rmCaseM.mutateAsync({ planId: manageRow.id, testCaseId });
            setManageRow(updated as any);
            toast.success("Case removed from plan");
            await plansQ.refetch();
          } catch (e) {
            console.error(e);
            toast.error("Failed to remove case from plan");
          }
        }}
      />
    </TestingShell>
  );
}
