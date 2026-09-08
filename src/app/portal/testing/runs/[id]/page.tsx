"use client";

import * as React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, RefreshCcw, BarChart3, ClipboardCheck, Filter, Bug, Upload } from "lucide-react";

import { toast } from "@/logaxp/components/ui/toast";
import { TestingShell } from "@/logaxp/components/testing/TestingShell";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { ProjectRequiredState } from "@/logaxp/components/projects/ProjectRequiredState";
import { Badge } from "@/logaxp/components/ui/badge";
import { Input } from "@/logaxp/components/ui/input";
import { normalizeProjectId } from "@/logaxp/lib/project-management/projectContext";
import { normalizeExecutionStatus } from "@/logaxp/components/testing/testing.ui";

import type {
  TestExecution,
  TestRun,
  TestRunSummary,
  TestExecutionStatus,
  UpdateTestExecutionDto,
  AddExecutionEvidenceDto,
  CreateBugFromExecutionDto,
  ListRunExecutionsQuery,
} from "@/logaxp/lib/testing/testing.types";

import {
  useUpdateTestExecution,
  useAddExecutionEvidence,
  useCreateBugFromExecution,
  useTestingRunDetail,
  useTestingRunExecutions,
} from "@/logaxp/hooks/useTesting";

import { TestExecutionTable } from "@/logaxp/components/testing/runs/TestExecutionTable";
import { TestExecutionEditDialog } from "@/logaxp/components/testing/runs/TestExecutionEditDialog";
import { TestExecutionEvidenceDialog } from "@/logaxp/components/testing/runs/TestExecutionEvidenceDialog";
import { TestExecutionCreateBugDialog } from "@/logaxp/components/testing/runs/TestExecutionCreateBugDialog";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

function computeSummary(execs: TestExecution[]): TestRunSummary {
  const total = execs.length;
  const pass = execs.filter((e) => normalizeExecutionStatus(e.status) === "PASS").length;
  const fail = execs.filter((e) => normalizeExecutionStatus(e.status) === "FAIL").length;
  const blocked = execs.filter((e) => normalizeExecutionStatus(e.status) === "BLOCKED").length;
  const skipped = execs.filter((e) => normalizeExecutionStatus(e.status) === "SKIPPED").length;
  return { total, pass, fail, blocked, skipped };
}

export default function TestingRunDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;

  const sp = useSearchParams();
  const projectId = normalizeProjectId(sp.get("projectId"));

  // Filters for executions endpoint
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<TestExecutionStatus | "ALL">("ALL");
  const [onlyFailures, setOnlyFailures] = React.useState(false);

  const [cursor, setCursor] = React.useState<string | null>(null);
  const pageSize = 50;

  const runQ = useTestingRunDetail(id);

  const execQuery: ListRunExecutionsQuery = React.useMemo(
    () => ({
      q: q.trim() || undefined,
      status: status === "ALL" ? undefined : status,
      onlyFailures: onlyFailures || undefined,
      cursor: cursor ?? undefined,
      pageSize,
    }),
    [q, status, onlyFailures, cursor]
  );

  const execsQ = useTestingRunExecutions(id, execQuery);

  const run = (runQ.data ?? null) as TestRun | null;
  const executionsPayload = execsQ.data as
    | { items: TestExecution[]; pageSize: number; nextCursor: string | null }
    | undefined;

  const executions = executionsPayload?.items ?? [];
  const nextCursor = executionsPayload?.nextCursor ?? null;

  // dialogs
  const [editExec, setEditExec] = React.useState<TestExecution | null>(null);
  const [evidenceExec, setEvidenceExec] = React.useState<TestExecution | null>(null);
  const [bugExec, setBugExec] = React.useState<TestExecution | null>(null);

  // mutations
  const updateExecM = useUpdateTestExecution();
  const addEvidenceM = useAddExecutionEvidence();
  const createBugM = useCreateBugFromExecution();

  const busy =
    runQ.isFetching ||
    execsQ.isFetching ||
    updateExecM.isPending ||
    addEvidenceM.isPending ||
    createBugM.isPending;

  const refreshAll = async () => {
    try {
      await Promise.all([runQ.refetch(), execsQ.refetch()]);
      toast.success("Refreshed");
    } catch (e) {
      console.error(e);
      toast.error("Refresh failed");
    }
  };

  // Reset cursor when filters change
  React.useEffect(() => {
    setCursor(null);
  }, [q, status, onlyFailures]);

  if (!projectId) {
    return (
      <TestingShell title="Run Detail" subtitle="Select a project to load this run." pill="Testing • Runs">
        <ProjectRequiredState targetPath={`/portal/testing/runs/${encodeURIComponent(id)}`} targetLabel="Open run" />
      </TestingShell>
    );
  }

  const loading = runQ.isLoading || execsQ.isLoading;

  const summary = run?.summary ?? computeSummary(executions);
  const progress = summary.total ? (summary.pass + summary.fail + summary.blocked) / summary.total : 0;

  return (
    <TestingShell
      title="Run Detail"
      subtitle={run ? `${run.name} • ${run.status}` : "Loading run..."}
      pill="Testing • Runs"
      projectId={projectId}
      actions={
        <>
          <Button variant="outline" onClick={() => history.back()} disabled={busy}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button variant="outline" onClick={() => void refreshAll()} disabled={busy}>
            <RefreshCcw className={cn("h-4 w-4", busy && "animate-spin")} />
            Refresh
          </Button>
        </>
      }
    >
      {loading ? (
        <Card className="rounded-2xl">
          <CardContent className="p-6 text-sm text-slate-500">Loading run...</CardContent>
        </Card>
      ) : !run ? (
        <EmptyState title="Run not found" description="We couldn’t load this run." />
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4" />
                  Progress
                </CardTitle>
                <CardDescription>{summary.total} executions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-semibold">{pct(progress)}</div>
                <div className="text-xs text-slate-500">
                  PASS {summary.pass} • FAIL {summary.fail} • BLOCKED {summary.blocked} • SKIPPED {summary.skipped}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardCheck className="h-4 w-4" />
                  Results
                </CardTitle>
                <CardDescription>Outcome distribution</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge className="rounded-full">PASS: {summary.pass}</Badge>
                <Badge variant="destructive">FAIL: {summary.fail}</Badge>
                <Badge variant="destructive">BLOCKED: {summary.blocked}</Badge>
                <Badge variant="muted" className="rounded-full">
                  SKIPPED: {summary.skipped}
                </Badge>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Run</CardTitle>
                <CardDescription className="font-mono text-xs">{run.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                <div>
                  Status: <span className="font-medium text-slate-900 dark:text-slate-50">{run.status}</span>
                </div>
                <div>
                  Plan: <span className="font-mono text-xs">{run.planId ?? "—"}</span>
                </div>
                <div>Environment: {run.environment ?? "—"}</div>
                <div>Build: {run.buildRef ?? "—"}</div>
                <div>Started: {run.startedAt ? new Date(run.startedAt).toLocaleString() : "—"}</div>
                <div>Completed: {run.completedAt ? new Date(run.completedAt).toLocaleString() : "—"}</div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Quality gates</CardTitle>
                <CardDescription>Simple run health</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Failures: <span className="font-medium">{summary.fail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Blockers: <span className="font-medium">{summary.blocked}</span>
                </div>
                <div className="text-xs text-slate-500">Tip: clear blockers before publishing.</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Filter className="h-4 w-4" />
                Execution filters
              </CardTitle>
              <CardDescription>Filters run against the new /runs/:id/executions endpoint.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto_auto] md:items-end">
              <Input
                label="Search"
                placeholder="Search id, case title, notes..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Status</label>
                <select
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="ALL">ALL</option>
                  <option value="PASS">PASS</option>
                  <option value="FAIL">FAIL</option>
                  <option value="BLOCKED">BLOCKED</option>
                  <option value="SKIPPED">SKIPPED</option>
                </select>
              </div>

              <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-800">
                <input
                  type="checkbox"
                  checked={onlyFailures}
                  onChange={(e) => setOnlyFailures(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                Only failures
              </label>

              <Button variant="outline" onClick={() => void execsQ.refetch()} disabled={busy}>
                <RefreshCcw className={cn("h-4 w-4", execsQ.isFetching && "animate-spin")} />
                Refresh list
              </Button>
            </CardContent>
          </Card>

          {/* Executions table */}
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Executions</CardTitle>
              <CardDescription>Update status, attach evidence, create bugs.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {execsQ.isError ? (
                <EmptyState title="Failed to load executions" description="Try refreshing this page." />
              ) : (
                <>
                  <TestExecutionTable
                    rows={executions}
                    // ✅ executions include testCase now; table can read e.testCase
                    casesById={{}}
                    busy={busy}
                    onEdit={(e) => setEditExec(e)}
                    onEvidence={(e) => setEvidenceExec(e)}
                    onCreateBug={(e) => setBugExec(e)}
                  />

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      Showing {executions.length} (pageSize {pageSize})
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        disabled={!cursor || busy}
                        onClick={() => setCursor(null)}
                        title="Back to first page"
                      >
                        Reset
                      </Button>

                      <Button
                        variant="outline"
                        disabled={!nextCursor || busy}
                        onClick={() => setCursor(nextCursor)}
                        title="Next page (cursor)"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Dialogs */}
          <TestExecutionEditDialog
            open={Boolean(editExec)}
            onOpenChange={(o) => !o && setEditExec(null)}
            execution={editExec}
            busy={updateExecM.isPending}
            onSubmit={async (dto: UpdateTestExecutionDto) => {
              if (!editExec) return;
              try {
                await updateExecM.mutateAsync({ id: editExec.id, dto });
                toast.success("Execution updated");
                setEditExec(null);
                await execsQ.refetch();
                await runQ.refetch();
              } catch (e) {
                console.error(e);
                toast.error("Failed to update execution");
              }
            }}
          />

          <TestExecutionEvidenceDialog
            open={Boolean(evidenceExec)}
            onOpenChange={(o) => !o && setEvidenceExec(null)}
            execution={evidenceExec}
            busy={addEvidenceM.isPending}
            onSubmit={async (dto: AddExecutionEvidenceDto) => {
              if (!evidenceExec) return;
              try {
                await addEvidenceM.mutateAsync({ id: evidenceExec.id, dto });
                toast.success("Evidence added");
                setEvidenceExec(null);
                await execsQ.refetch();
              } catch (e) {
                console.error(e);
                toast.error("Failed to add evidence");
              }
            }}
          />

          <TestExecutionCreateBugDialog
            open={Boolean(bugExec)}
            onOpenChange={(o) => !o && setBugExec(null)}
            execution={bugExec}
            busy={createBugM.isPending}
            onSubmit={async (dto: CreateBugFromExecutionDto) => {
              if (!bugExec) return;
              try {
                const res = await createBugM.mutateAsync({ id: bugExec.id, dto });
                toast.success(res?.issueKey ? `Bug created (${res.issueKey})` : "Bug created");
                setBugExec(null);
                await execsQ.refetch();
              } catch (e) {
                console.error(e);
                toast.error("Failed to create bug");
              }
            }}
          />
        </>
      )}
    </TestingShell>
  );
}
