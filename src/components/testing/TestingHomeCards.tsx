"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowRight, Bug, ClipboardList, Layers, ListChecks, PlayCircle, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { ProjectRequiredState } from "@/logaxp/components/projects/ProjectRequiredState";
import { normalizeProjectId, withProjectId } from "@/logaxp/lib/project-management/projectContext";
import { useTestingDashboard } from "@/logaxp/hooks/useTesting";
import { runOutcome, runOutcomeLabel } from "./testing.ui";

export function TestingHomeCards({ projectId }: { projectId: string }) {
  const sp = useSearchParams();
  const pid = normalizeProjectId(projectId) || normalizeProjectId(sp.get("projectId"));
  const dashboardQ = useTestingDashboard(pid);

  if (!pid) {
    return <ProjectRequiredState targetPath="/portal/testing" targetLabel="Open testing" />;
  }

  const dashboard = dashboardQ.data;
  const cards = [
    { href: withProjectId("/portal/testing/suites", pid), title: "Suites", desc: "Group test coverage by product area.", icon: Layers, value: dashboard?.counts.suites ?? 0 },
    { href: withProjectId("/portal/testing/cases", pid), title: "Cases", desc: "Maintain steps, priority, and coverage links.", icon: ListChecks, value: dashboard?.counts.cases ?? 0 },
    { href: withProjectId("/portal/testing/plans", pid), title: "Plans", desc: "Prepare smoke, regression, and release sets.", icon: ClipboardList, value: dashboard?.counts.plans ?? 0 },
    { href: withProjectId("/portal/testing/runs", pid), title: "Runs", desc: "Execute, attach evidence, and raise defects.", icon: PlayCircle, value: dashboard?.counts.runs ?? 0 },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[1.5rem] border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle className="text-xl">Project testing dashboard</CardTitle>
                <CardDescription>Coverage, execution health, failed runs, and defect follow-up for this project.</CardDescription>
              </div>
              <Badge variant="muted" className="w-fit rounded-full">
                {dashboard?.project?.key ?? "Project"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {dashboardQ.isLoading ? (
              <div className="text-sm text-slate-500">Loading testing dashboard...</div>
            ) : dashboardQ.isError ? (
              <EmptyState title="Testing summary unavailable" description="Refresh the page or check the API connection." />
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <ShieldCheck className="h-4 w-4 text-[#5E8500]" /> Coverage
                  </div>
                  <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    {dashboard?.coverage.coveragePercent ?? 0}%
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {dashboard?.coverage.coveredCases ?? 0} covered, {dashboard?.coverage.uncoveredCases ?? 0} uncovered
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <AlertTriangle className="h-4 w-4 text-amber-600" /> Current risk
                  </div>
                  <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    {(dashboard?.executions.fail ?? 0) + (dashboard?.executions.blocked ?? 0)}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">Failed or blocked executions</div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <Bug className="h-4 w-4 text-rose-600" /> Defects
                  </div>
                  <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    {dashboard?.executions.linkedBugs ?? 0}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{dashboard?.executions.failedWithoutBug ?? 0} failures still need bugs</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[1.5rem] border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <CardHeader>
            <CardTitle className="text-base">Latest runs</CardTitle>
            <CardDescription>Recent execution outcomes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {dashboardQ.isLoading ? (
              <div className="text-sm text-slate-500">Loading runs...</div>
            ) : !dashboard?.latestRuns?.length ? (
              <EmptyState title="No runs yet" description="Create a run from a plan or from the project case set." />
            ) : (
              dashboard.latestRuns.map((run) => {
                const outcome = runOutcome(run);
                return (
                  <Link
                    key={run.id}
                    href={withProjectId(`/portal/testing/runs/${run.id}`, pid)}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-3 py-3 text-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/40"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-950 dark:text-white">{run.name}</div>
                      <div className="mt-0.5 text-xs text-slate-500">{run.status} • {run.summary?.total ?? 0} executions</div>
                    </div>
                    <Badge variant={outcome === "FAILED" || outcome === "BLOCKED" ? "destructive" : outcome === "PASSED" ? "default" : "muted"} className="shrink-0 rounded-full">
                      {runOutcomeLabel(outcome)}
                    </Badge>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.href} className="rounded-[1.25rem] border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{card.value}</span>
                </div>
                <CardTitle className="text-base">{card.title}</CardTitle>
                <CardDescription>{card.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link href={card.href}>Open <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
