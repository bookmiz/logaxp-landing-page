"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Activity, ArrowLeft, DollarSign, Download, PieChart, Receipt, RefreshCcw } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Skeleton } from "@/logaxp/components/ui/skeleton";
import { useProjectFinanceSummary } from "@/logaxp/hooks/finance/useProjectFinanceSummary";
import { useProjectFinanceActivity } from "@/logaxp/hooks/finance/useProjectFinanceActivity";
import { BudgetsPanel } from "@/logaxp/components/projects/finance/budgets/BudgetsPanel";
import { ProjectCrumbs } from "@/logaxp/components/projects/ProjectCrumbs";
import { FinanceShell } from "@/logaxp/components/projects/finance/FinanceShell";
import { FinanceSummaryCards } from "@/logaxp/components/projects/finance/FinanceSummaryCards";
import { ExpensesPanel } from "@/logaxp/components/projects/finance/expenses/ExpensesPanel";

import { useProject } from "@/logaxp/hooks/projects/useProject";
import { projectFinanceService } from "@/logaxp/lib/project-finance/projectFinanceService";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function ProjectFinancePage() {
  const { id: projectId } = useParams<{ id: string }>();

  const projectQuery = useProject(projectId);
  const project = projectQuery.data?.data;

  const summaryQuery = useProjectFinanceSummary(projectId);
  const summary = summaryQuery.data?.data;
  const activityQuery = useProjectFinanceActivity(projectId);
  const activity = activityQuery.data?.data ?? [];

  const [tab, setTab] = React.useState<"budgets" | "expenses">("budgets");

  return (
    <FinanceShell
      projectId={projectId}
      title={
        <div className="flex items-center gap-3">
          <DollarSign className="h-5 w-5" />
          Finance
          <Badge variant="muted" className="rounded-full">
            Project
          </Badge>
        </div>
      }
      subtitle="Budgets, expenses, approvals, and cost visibility."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              projectQuery.refetch();
              summaryQuery.refetch();
              activityQuery.refetch();
            }}
            disabled={projectQuery.isFetching || summaryQuery.isFetching || activityQuery.isFetching}
          >
            <RefreshCcw className={cn("h-4 w-4", (projectQuery.isFetching || summaryQuery.isFetching || activityQuery.isFetching) && "animate-spin")} />
            Refresh
          </Button>

          <Button
            variant="outline"
            onClick={async () => {
              const report = await projectFinanceService.export(projectId);
              const blob = new Blob([JSON.stringify(report.data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = `project-finance-${projectId}.json`;
              anchor.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Link href={`/portal/projects/${encodeURIComponent(projectId)}`}>
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        <ProjectCrumbs
          items={[
            { label: "Work", href: "/portal/work" },
            { label: "Projects", href: "/portal/projects" },
            { label: project?.name ? String(project.name) : "Project", href: `/portal/projects/${encodeURIComponent(projectId)}` },
            { label: "Finance" },
          ]}
        />

        {projectQuery.isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-48" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-72 rounded-xl" />
          </div>
        ) : projectQuery.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300">
            Failed to load project. Try refresh.
          </div>
        ) : (
          <>
            {/* Summary cards (Batch 2 will feed real data from hooks) */}
            <FinanceSummaryCards
              loading={summaryQuery.isLoading}
              data={
                summary ?? {
                  currency: "USD",
                  approvedBudgetCents: 0,
                  approvedExpenseCents: 0,
                  paidExpenseCents: 0,
                  laborMinutes: 0,
                  laborCostCents: null,
                  actualCostCents: 0,
                  remainingCents: 0,
                }
              }
            />
            {/* Tabs shell area (Budgets + Expenses will be built in Batch 2 & 3) */}
            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
  <CardHeader className="pb-3">
    <CardTitle className="text-base">Finance Workspace</CardTitle>
    <CardDescription>
      Manage <span className="font-medium">Budgets</span> and{" "}
      <span className="font-medium">Expenses</span> for this project.
    </CardDescription>
  </CardHeader>

  <CardContent className="space-y-4">
    {/* Local tabs (no extra UI deps) */}
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={tab === "budgets" ? "default" : "outline"}
          onClick={() => setTab("budgets")}
          className="gap-2"
        >
          <PieChart className="h-4 w-4" />
          Budgets
        </Button>

        <Button
          type="button"
          variant={tab === "expenses" ? "default" : "outline"}
          onClick={() => setTab("expenses")}
          className="gap-2"
        >
          <Receipt className="h-4 w-4" />
          Expenses
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {tab === "budgets" ? (
          <BudgetsPanel projectId={projectId} />
        ) : (
          <ExpensesPanel projectId={projectId} />
        )}
      </div>
    </>
  </CardContent>
</Card>

            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-[#5E8500]" />
                  Finance activity
                </CardTitle>
                <CardDescription>Recent budget, expense, approval, and evidence changes for this project.</CardDescription>
              </CardHeader>
              <CardContent>
                {activityQuery.isLoading ? (
                  <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                    Loading finance activity...
                  </div>
                ) : activity.length ? (
                  <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                    {activity.slice(0, 8).map((item) => (
                      <div key={item.id} className="flex flex-col gap-1 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="font-medium text-slate-950 dark:text-white">
                            {String(item.action ?? "UPDATE")} · {String(item.entityType ?? "Finance")}
                          </div>
                          <div className="mt-0.5 font-mono text-xs text-slate-500">{String(item.entityId ?? "")}</div>
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.createdAt ? new Date(String(item.createdAt)).toLocaleString() : "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                    No finance activity yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </FinanceShell>
  );
}
