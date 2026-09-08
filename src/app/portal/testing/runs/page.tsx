"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, RefreshCcw, Search } from "lucide-react";

import { TestingShell } from "@/logaxp/components/testing/TestingShell";
import { toast } from "@/logaxp/components/ui/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { ProjectRequiredState } from "@/logaxp/components/projects/ProjectRequiredState";
import { normalizeProjectId, withProjectId } from "@/logaxp/lib/project-management/projectContext";

import type { TestPlan, TestRun } from "@/logaxp/lib/testing/testing.types";
import { normalizeList } from "@/logaxp/components/testing/testing.ui";

import {
  useTestingRuns,
  useTestingPlans,
  useCreateTestingRun,
  useStartTestingRun,
  useCompleteTestingRun,
  useCancelTestingRun,
  useDeleteTestingRun,
  usePublishTestingRun,
  useRestoreTestingRun,
} from "@/logaxp/hooks/useTesting";

import { TestRunsTable } from "@/logaxp/components/testing/runs/TestRunsTable";
import { TestRunCreateDialog } from "@/logaxp/components/testing/runs/TestRunCreateDialog";

export default function TestingRunsPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const projectId = normalizeProjectId(sp.get("projectId"));

  const [q, setQ] = React.useState("");
  const [includeDeleted, setIncludeDeleted] = React.useState(false);

  const runsQ = useTestingRuns({ projectId, includeDeleted, q: q.trim() || undefined });
  const plansQ = useTestingPlans({ projectId, includeDeleted: false, q: undefined });

  const createM = useCreateTestingRun();
  const startM = useStartTestingRun();
  const completeM = useCompleteTestingRun();
  const cancelM = useCancelTestingRun();
  const deleteM = useDeleteTestingRun();
  const publishM = usePublishTestingRun();
  const restoreM = useRestoreTestingRun();

  const [createOpen, setCreateOpen] = React.useState(false);

  const busy =
    runsQ.isFetching ||
    plansQ.isFetching ||
    createM.isPending ||
    startM.isPending ||
    completeM.isPending ||
    cancelM.isPending ||
    deleteM.isPending ||
    restoreM.isPending ||
    publishM.isPending;

  const runs = normalizeList<TestRun>(runsQ.data).items;
  const plans = normalizeList<TestPlan>(plansQ.data).items;

  const rows = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return [...runs]
      .filter((r) => {
        if (!includeDeleted && r.deletedAt) return false;
        if (!needle) return true;
        const name = String(r.name ?? "").toLowerCase();
        const id = String(r.id ?? "").toLowerCase();
        const st = String(r.status ?? "").toLowerCase();
        const planId = String(r.planId ?? "").toLowerCase();
        return name.includes(needle) || id.includes(needle) || st.includes(needle) || planId.includes(needle);
      })
      .sort((a, b) => {
        const bd = new Date((b as any).createdAt ?? 0).getTime();
        const ad = new Date((a as any).createdAt ?? 0).getTime();
        if (!Number.isNaN(bd) && !Number.isNaN(ad) && bd !== ad) return bd - ad;
        return String(a.name ?? "").localeCompare(String(b.name ?? ""));
      });
  }, [runs, q, includeDeleted]);

  if (!projectId) {
    return (
      <TestingShell title="Test Runs" subtitle="Execute plans and publish outcomes." pill="Testing • Runs">
        <ProjectRequiredState targetPath="/portal/testing/runs" targetLabel="Open runs" />
      </TestingShell>
    );
  }

  return (
    <TestingShell
      title="Test Runs"
      subtitle="Execute plans, track results per case, attach evidence, and publish outcomes."
      pill="Testing • Runs"
      projectId={projectId}
      actions={
        <>
          <Button variant="outline" onClick={() => runsQ.refetch()} disabled={runsQ.isFetching}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New run
          </Button>
        </>
      }
    >
      <Card className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-200/60 blur-3xl dark:bg-emerald-500/15" />
        <div className="pointer-events-none absolute -left-10 -bottom-16 h-52 w-52 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/10" />

        <CardHeader className="relative pb-3">
          <CardTitle className="text-xl">Runs</CardTitle>
          <CardDescription>Create, start, complete, cancel, and publish test runs.</CardDescription>
        </CardHeader>

        <CardContent className="relative pt-0 space-y-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <Input
              label="Search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, status, id, planId..."
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

      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">All runs</CardTitle>
          <CardDescription>
            Showing {rows.length} result{rows.length === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {runsQ.isLoading ? (
            <div className="text-sm text-slate-500">Loading runs...</div>
          ) : rows.length === 0 ? (
            <EmptyState
              title="No runs"
              description="Create a run to begin executing cases."
              action={<Button onClick={() => setCreateOpen(true)}>Create run</Button>}
            />
          ) : (
            <TestRunsTable
              rows={rows}
              busy={busy}
              onView={(r) => router.push(withProjectId(`/portal/testing/runs/${r.id}`, projectId))}
              onStart={async (r) => {
                try {
                  await startM.mutateAsync(r.id);
                  toast.success("Run started");
                } catch (e) {
                  console.error(e);
                  toast.error("Failed to start run");
                }
              }}
              onComplete={async (r) => {
                try {
                  await completeM.mutateAsync(r.id);
                  toast.success("Run completed");
                } catch (e) {
                  console.error(e);
                  toast.error("Failed to complete run");
                }
              }}
              onCancel={async (r) => {
                try {
                  await cancelM.mutateAsync(r.id);
                  toast.success("Run canceled");
                } catch (e) {
                  console.error(e);
                  toast.error("Failed to cancel run");
                }
              }}
              onPublish={async (r) => {
                try {
                  await publishM.mutateAsync({ id: r.id });
                  toast.success("Run published");
                } catch (e) {
                  console.error(e);
                  toast.error("Failed to publish run");
                }
              }}
              onDelete={async (r) => {
                try {
                  await deleteM.mutateAsync(r.id);
                  toast.success("Run deleted");
                } catch (e) {
                  console.error(e);
                  toast.error("Failed to delete run");
                }
              }}
              onRestore={async (r) => {
                try {
                  await restoreM.mutateAsync(r.id);
                  toast.success("Run restored");
                } catch (e) {
                  console.error(e);
                  toast.error("Failed to restore run");
                }
              }}
            />
          )}
        </CardContent>
      </Card>

      <TestRunCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        projectId={projectId}
        plans={plans}
        busy={createM.isPending}
        onSubmit={async (dto) => {
          try {
            const created = await createM.mutateAsync(dto) as TestRun;
            toast.success("Run created");
            setCreateOpen(false);
            router.push(withProjectId(`/portal/testing/runs/${created.id}`, projectId));
          } catch (e) {
            console.error(e);
            toast.error("Failed to create run");
          }
        }}
      />
    </TestingShell>
  );
}
