"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Workflow,
  Braces,
  Shield,
  HelpCircle,
  Search,
  CheckCircle2,
  ArrowRight,
  Code2,
  Layers,
  TestTube2,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Input } from "@/logaxp/components/ui/input";

type DocTab = "overview" | "workflows" | "api" | "permissions" | "faq";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function Pill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
      {icon}
      {text}
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
      <code>{children}</code>
    </pre>
  );
}

function Section({
  title,
  description,
  children,
  id,
  icon,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  id?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card id={id} className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon ? <span className="text-slate-900 dark:text-slate-50">{icon}</span> : null}
          {title}
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

type ApiEndpoint = {
  group: "Suites" | "Cases" | "Plans" | "Runs" | "Executions";
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  summary: string;
  query?: string[];
  requestType?: string;
  responseType?: string;
  example?: string;
};

const ENDPOINTS: ApiEndpoint[] = [
  // Suites
  {
    group: "Suites",
    method: "GET",
    path: "/testing/suites?projectId=...&includeDeleted=...&q=...",
    summary: "List test suites for a project (optionally include deleted).",
    query: ["projectId (required)", "includeDeleted (optional)", "q (optional)"],
    responseType: "Paginated<TestSuite> | TestSuite[]",
    example: `await testingService.listSuites({ projectId, q: "smoke" });`,
  },
  {
    group: "Suites",
    method: "POST",
    path: "/testing/suites",
    summary: "Create a suite.",
    requestType: "CreateTestSuiteDto",
    responseType: "TestSuite",
    example: `await testingService.createSuite({ projectId, name: "Smoke", description: "Critical checks" });`,
  },
  {
    group: "Suites",
    method: "PATCH",
    path: "/testing/suites/:id",
    summary: "Update a suite.",
    requestType: "UpdateTestSuiteDto",
    responseType: "TestSuite",
    example: `await testingService.updateSuite(id, { name: "Smoke (Core)" });`,
  },
  {
    group: "Suites",
    method: "DELETE",
    path: "/testing/suites/:id",
    summary: "Soft delete a suite.",
    responseType: "{ ok: true }",
    example: `await testingService.deleteSuite(id);`,
  },
  {
    group: "Suites",
    method: "POST",
    path: "/testing/suites/:id/restore",
    summary: "Restore a deleted suite.",
    responseType: "TestSuite",
    example: `await testingService.restoreSuite(id);`,
  },

  // Cases
  {
    group: "Cases",
    method: "GET",
    path: "/testing/cases?projectId=...&suiteId=...&tag=...&q=...&includeDeleted=...",
    summary: "List test cases (filter by suite/tag/search).",
    query: ["projectId (required)", "suiteId (optional)", "tag (optional)", "q (optional)", "includeDeleted (optional)"],
    responseType: "Paginated<TestCase> | TestCase[]",
    example: `await testingService.listCases({ projectId, suiteId, tag: "smoke" });`,
  },
  {
    group: "Cases",
    method: "POST",
    path: "/testing/cases",
    summary: "Create a test case.",
    requestType: "CreateTestCaseDto",
    responseType: "TestCase",
    example: `await testingService.createCase({ projectId, title: "Login works", priority: "HIGH", tags: ["smoke"] });`,
  },
  {
    group: "Cases",
    method: "PATCH",
    path: "/testing/cases/:id",
    summary: "Update a test case.",
    requestType: "UpdateTestCaseDto",
    responseType: "TestCase",
    example: `await testingService.updateCase(id, { status: "ACTIVE", tags: ["smoke","auth"] });`,
  },
  {
    group: "Cases",
    method: "DELETE",
    path: "/testing/cases/:id",
    summary: "Soft delete a case.",
    responseType: "{ ok: true }",
    example: `await testingService.deleteCase(id);`,
  },
  {
    group: "Cases",
    method: "POST",
    path: "/testing/cases/:id/restore",
    summary: "Restore a deleted case.",
    responseType: "TestCase",
    example: `await testingService.restoreCase(id);`,
  },
  {
    group: "Cases",
    method: "POST",
    path: "/testing/cases/:id/coverage",
    summary: "Attach coverage (work item id).",
    requestType: "AddCoverageDto",
    responseType: "TestCase",
    example: `await testingService.addCoverage(caseId, { workItemId: "BUG-123" });`,
  },
  {
    group: "Cases",
    method: "DELETE",
    path: "/testing/cases/:id/coverage/:workItemId",
    summary: "Remove coverage work item link.",
    responseType: "TestCase",
    example: `await testingService.removeCoverage(caseId, workItemId);`,
  },

  // Plans
  {
    group: "Plans",
    method: "GET",
    path: "/testing/plans?projectId=...&includeDeleted=...&q=...",
    summary: "List test plans for a project.",
    query: ["projectId (required)", "includeDeleted (optional)", "q (optional)"],
    responseType: "Paginated<TestPlan> | TestPlan[]",
    example: `await testingService.listPlans({ projectId, q: "release" });`,
  },
  {
    group: "Plans",
    method: "POST",
    path: "/testing/plans",
    summary: "Create a plan (optionally with initial testCaseIds).",
    requestType: "CreateTestPlanDto",
    responseType: "TestPlan",
    example: `await testingService.createPlan({ projectId, name: "Release Gate", testCaseIds: [caseId1, caseId2] });`,
  },
  {
    group: "Plans",
    method: "PATCH",
    path: "/testing/plans/:id",
    summary: "Update a plan.",
    requestType: "UpdateTestPlanDto",
    responseType: "TestPlan",
    example: `await testingService.updatePlan(planId, { description: "Must pass before deploy" });`,
  },
  {
    group: "Plans",
    method: "DELETE",
    path: "/testing/plans/:id",
    summary: "Soft delete a plan.",
    responseType: "{ ok: true }",
    example: `await testingService.deletePlan(planId);`,
  },
  {
    group: "Plans",
    method: "POST",
    path: "/testing/plans/:id/cases",
    summary: "Attach multiple cases to plan.",
    requestType: "AddPlanCasesDto",
    responseType: "TestPlan",
    example: `await testingService.addPlanCases(planId, { testCaseIds: [caseId] });`,
  },
  {
    group: "Plans",
    method: "DELETE",
    path: "/testing/plans/:id/cases/:testCaseId",
    summary: "Remove a case from plan.",
    responseType: "TestPlan",
    example: `await testingService.removePlanCase(planId, testCaseId);`,
  },

  // Runs
  {
    group: "Runs",
    method: "GET",
    path: "/testing/runs?projectId=...&status=...&planId=...&includeDeleted=...&q=...",
    summary: "List runs for a project (filter by status/plan).",
    query: ["projectId (required)", "status (optional)", "planId (optional)", "includeDeleted (optional)", "q (optional)"],
    responseType: "Paginated<TestRun> | TestRun[]",
    example: `await testingService.listRuns({ projectId, status: "RUNNING" });`,
  },
  {
    group: "Runs",
    method: "POST",
    path: "/testing/runs",
    summary: "Create a run (optionally linked to a plan).",
    requestType: "CreateTestRunDto",
    responseType: "TestRun",
    example: `await testingService.createRun({ projectId, name: "Smoke - Staging", planId });`,
  },
  { group: "Runs", method: "POST", path: "/testing/runs/:id/start", summary: "Start a run.", responseType: "TestRun" },
  { group: "Runs", method: "POST", path: "/testing/runs/:id/complete", summary: "Complete a run.", responseType: "TestRun" },
  { group: "Runs", method: "POST", path: "/testing/runs/:id/cancel", summary: "Cancel a run.", responseType: "TestRun" },
  { group: "Runs", method: "POST", path: "/testing/runs/:id/publish", summary: "Publish a run.", responseType: "TestRun" },

  // Executions
  {
    group: "Executions",
    method: "PATCH",
    path: "/testing/executions/:id",
    summary: "Update execution status/notes/assignee/duration.",
    requestType: "UpdateTestExecutionDto",
    responseType: "TestExecution",
    example: `await testingService.updateExecution(execId, { status: "FAIL", notes: "500 on /login" });`,
  },
  {
    group: "Executions",
    method: "POST",
    path: "/testing/executions/:id/evidence",
    summary: "Attach evidence to an execution (URL or fileId).",
    requestType: "AddExecutionEvidenceDto",
    responseType: "TestExecution",
    example: `await testingService.addExecutionEvidence(execId, { title: "Screenshot", url: "https://..." });`,
  },
  {
    group: "Executions",
    method: "POST",
    path: "/testing/executions/:id/create-bug",
    summary: "Create a bug from an execution result.",
    requestType: "CreateBugFromExecutionDto",
    responseType: "CreateBugFromExecutionResult",
    example: `await testingService.createBugFromExecution(execId, { title: "Login broken", priority: "URGENT" });`,
  },
];

function methodBadge(method: ApiEndpoint["method"]) {
  const m = method.toUpperCase();
  if (m === "GET") return <Badge variant="muted" className="rounded-full">GET</Badge>;
  if (m === "POST") return <Badge className="rounded-full">POST</Badge>;
  if (m === "PATCH") return <Badge className="rounded-full">PATCH</Badge>;
  return <Badge variant="destructive">DELETE</Badge>;
}

export default function TestingDocsPage() {
  const [tab, setTab] = React.useState<DocTab>("overview");
  const [q, setQ] = React.useState("");

  const filteredEndpoints = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return ENDPOINTS;
    return ENDPOINTS.filter((e) => {
      const hay = [
        e.group,
        e.method,
        e.path,
        e.summary,
        e.requestType ?? "",
        e.responseType ?? "",
        ...(e.query ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [q]);

  const navItems: Array<{ key: DocTab; label: string; icon: React.ReactNode; desc: string }> = [
    { key: "overview", label: "Overview", icon: <BookOpen className="h-4 w-4" />, desc: "What Testing is + model map" },
    { key: "workflows", label: "Workflows", icon: <Workflow className="h-4 w-4" />, desc: "How teams use it end-to-end" },
    { key: "api", label: "API Reference", icon: <Braces className="h-4 w-4" />, desc: "Endpoints + DTOs + examples" },
    { key: "permissions", label: "Permissions", icon: <Shield className="h-4 w-4" />, desc: "RBAC recommendations" },
    { key: "faq", label: "FAQ", icon: <HelpCircle className="h-4 w-4" />, desc: "Common questions / gotchas" },
  ];

  return (
    <div className="space-y-5 p-6">
      {/* Hero */}
      <Card className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-200/60 blur-3xl dark:bg-emerald-500/15" />
        <div className="pointer-events-none absolute -left-10 -bottom-16 h-52 w-52 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/10" />

        <CardHeader className="relative">
          <Pill icon={<TestTube2 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />} text="Testing • Documentation" />
          <CardTitle className="mt-2 text-xl">Testing Module Docs</CardTitle>
          <CardDescription>
            Enterprise-ready documentation for Suites, Cases, Plans, Runs, and Executions — including API reference,
            workflows, and RBAC guidance.
          </CardDescription>
        </CardHeader>

        <CardContent className="relative">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[320px_1fr_auto] lg:items-end">
            <Input
              label="Search docs & endpoints"
              placeholder="Search: /testing/runs, CreateTestPlanDto, evidence, permissions..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />

            <div className="text-xs text-slate-500 dark:text-slate-300">
              Tip: search “coverage”, “publish”, “FAIL”, “CreateBugFromExecutionDto”.
            </div>

            <Button asChild>
              <Link href="/portal/testing/suites">
                Open testing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        {/* Left nav */}
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Documentation</CardTitle>
            <CardDescription>Navigate sections</CardDescription>
          </CardHeader>

          <CardContent className="space-y-2">
            {navItems.map((item) => {
              const active = tab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  className={cn(
                    "w-full rounded-2xl border px-3 py-3 text-left transition",
                    active
                      ? "border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-900/40"
                      : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900/40"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("mt-0.5", active ? "text-slate-900 dark:text-slate-50" : "text-slate-600 dark:text-slate-300")}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 dark:text-slate-50">{item.label}</div>
                      <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-300">{item.desc}</div>
                    </div>
                  </div>
                </button>
              );
            })}

            <div className="pt-2 text-xs text-slate-500 dark:text-slate-300">
              Related pages:
              <div className="mt-2 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/portal/testing/suites">Suites</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/portal/testing/cases">Cases</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/portal/testing/plans">Plans</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/portal/testing/runs">Runs</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="space-y-4">
          {tab === "overview" ? (
            <>
              <Section
                title="Domain model map"
                description="The 5 core objects and how they relate."
                icon={<Layers className="h-4 w-4" />}
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="font-semibold text-slate-900 dark:text-slate-50">TestSuite</div>
                    <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      A folder/container for test cases within a project.
                    </div>
                    <div className="mt-3 text-xs text-slate-500">Examples: Smoke, Regression, Auth, Payments.</div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="font-semibold text-slate-900 dark:text-slate-50">TestCase</div>
                    <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      The executable unit: steps, expected results, tags, references, coverage links.
                    </div>
                    <div className="mt-3 text-xs text-slate-500">Status: DRAFT / ACTIVE / DEPRECATED.</div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="font-semibold text-slate-900 dark:text-slate-50">TestPlan</div>
                    <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      A curated set of cases for a purpose (release gate, sprint, smoke, nightly).
                    </div>
                    <div className="mt-3 text-xs text-slate-500">Attach/remove cases over time.</div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="font-semibold text-slate-900 dark:text-slate-50">TestRun</div>
                    <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      An execution event of a plan (or ad-hoc) at a point in time.
                    </div>
                    <div className="mt-3 text-xs text-slate-500">Status: DRAFT → RUNNING → COMPLETED → PUBLISHED.</div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900 md:col-span-2">
                    <div className="font-semibold text-slate-900 dark:text-slate-50">TestExecution</div>
                    <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      The per-case outcome inside a run. Contains status, notes, evidence, created bug linkage.
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge className="rounded-full">PASS</Badge>
                      <Badge variant="destructive">FAIL</Badge>
                      <Badge variant="destructive">BLOCKED</Badge>
                      <Badge variant="muted" className="rounded-full">SKIPPED</Badge>
                      <Badge variant="muted" className="rounded-full">NOT_RUN</Badge>
                    </div>
                  </div>
                </div>

                <CodeBlock>
{`Suite -> contains Cases
Plan  -> contains many Cases (IDs)
Run   -> optionally references a Plan
Execution -> (RunId + TestCaseId) with status/notes/evidence`}
                </CodeBlock>
              </Section>

              <Section
                title="Recommended usage"
                description="How teams get the most value from Testing."
                icon={<CheckCircle2 className="h-4 w-4" />}
              >
                <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-200">
                  <li>Create Suites by feature area (Auth, Payments, Scheduling, RBAC).</li>
                  <li>Tag cases for quick slicing: <span className="font-mono text-xs">smoke</span>, <span className="font-mono text-xs">regression</span>, <span className="font-mono text-xs">critical</span>.</li>
                  <li>Create Plans by purpose (Release Gate, Nightly, Sprint 12).</li>
                  <li>Run execution in Runs, attach Evidence, and create Bugs directly from failing executions.</li>
                  <li>Publish runs to lock and share results (release readiness signal).</li>
                </ul>
              </Section>
            </>
          ) : null}

          {tab === "workflows" ? (
            <>
              <Section
                title="Workflow: Release readiness"
                description="A strong end-to-end flow used by QA and engineering teams."
                icon={<Workflow className="h-4 w-4" />}
              >
                <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-200">
                  <li>Create/maintain Cases in feature Suites.</li>
                  <li>Create a Plan: “Release Gate - v1.2”.</li>
                  <li>Attach required cases to the plan.</li>
                  <li>Create a Run for staging: “Release Gate - Staging - Feb 28”.</li>
                  <li>Start run → update executions (PASS/FAIL/BLOCKED) as testing proceeds.</li>
                  <li>Attach Evidence for failures and create Bugs from failed executions.</li>
                  <li>Complete run → publish run results.</li>
                </ol>

                <CodeBlock>
{`// Example with testingService
const plan = await testingService.createPlan({ projectId, name: "Release Gate" });
await testingService.addPlanCases(plan.id, { testCaseIds: [caseA, caseB] });

const run = await testingService.createRun({ projectId, name: "Release Gate - Staging", planId: plan.id });
await testingService.startRun(run.id);

// executions are updated during testing
await testingService.updateExecution(execId, { status: "FAIL", notes: "500 on /login" });
await testingService.addExecutionEvidence(execId, { title: "Screenshot", url: "https://..." });
await testingService.createBugFromExecution(execId, { title: "Login broken", priority: "URGENT" });

await testingService.completeRun(run.id);
await testingService.publishRun(run.id);`}
                </CodeBlock>
              </Section>

              <Section
                title="Workflow: Smoke checks"
                description="Fast validation after deploy."
                icon={<TestTube2 className="h-4 w-4" />}
              >
                <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-200">
                  <li>Cases tagged <span className="font-mono text-xs">smoke</span>.</li>
                  <li>Plan: “Smoke - Core”.</li>
                  <li>Run: “Smoke - Production - Feb 28”.</li>
                  <li>Publish the run so the whole org sees status quickly.</li>
                </ul>
              </Section>
            </>
          ) : null}

          {tab === "api" ? (
            <>
              <Section
                title="API Reference"
                description="Endpoints, DTOs, responses, and examples."
                icon={<Code2 className="h-4 w-4" />}
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {(["Suites", "Cases", "Plans", "Runs", "Executions"] as const).map((g) => {
                    const count = filteredEndpoints.filter((e) => e.group === g).length;
                    return (
                      <div
                        key={g}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-slate-900 dark:text-slate-50">{g}</div>
                          <Badge variant="muted" className="rounded-full">{count} endpoints</Badge>
                        </div>
                        <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                          Search above to filter endpoints in real-time.
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  {filteredEndpoints.map((e, idx) => (
                    <div
                      key={`${e.group}-${e.method}-${e.path}-${idx}`}
                      className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {methodBadge(e.method)}
                            <Badge variant="muted" className="rounded-full">{e.group}</Badge>
                            <span className="font-mono text-xs text-slate-800 dark:text-slate-100">{e.path}</span>
                          </div>
                          <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">{e.summary}</div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {e.requestType ? (
                            <Badge className="rounded-full">Req: {e.requestType}</Badge>
                          ) : null}
                          {e.responseType ? (
                            <Badge variant="muted" className="rounded-full">Res: {e.responseType}</Badge>
                          ) : null}
                        </div>
                      </div>

                      {e.query?.length ? (
                        <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-medium text-slate-800 dark:text-slate-200">Query:</span>{" "}
                          {e.query.join(" • ")}
                        </div>
                      ) : null}

                      {e.example ? (
                        <div className="mt-3">
                          <CodeBlock>{e.example}</CodeBlock>
                        </div>
                      ) : null}
                    </div>
                  ))}

                  {filteredEndpoints.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      No endpoints match your search.
                    </div>
                  ) : null}
                </div>
              </Section>

              <Section
                title="Frontend integration"
                description="How you should call the APIs in the UI layer (recommended pattern)."
                icon={<Braces className="h-4 w-4" />}
              >
                <CodeBlock>
{`// ✅ Prefer hooks for UI
import { useTestingRuns, useCreateTestingRun } from "@/logaxp/hooks/useTesting";

// ✅ Service works for non-react code / utilities
import { testingService } from "@/logaxp/lib/testing/testingService";

// Example: list runs
const runs = await testingService.listRuns({ projectId });

// Example: create run from UI
const createRun = useCreateTestingRun();
await createRun.mutateAsync({ projectId, name: "Smoke - Staging" });`}
                </CodeBlock>
              </Section>
            </>
          ) : null}

          {tab === "permissions" ? (
            <>
              <Section
                title="RBAC permissions model"
                description="Recommended permission keys and role mapping."
                icon={<Shield className="h-4 w-4" />}
              >
                <div className="text-sm text-slate-700 dark:text-slate-200 space-y-2">
                  <div className="font-medium">Recommended permissions (you can seed these):</div>
                  <CodeBlock>
{`testing.suites.read
testing.suites.write

testing.cases.read
testing.cases.write

testing.plans.read
testing.plans.write

testing.runs.read
testing.runs.write
testing.runs.publish

testing.executions.write
testing.executions.evidence.write
testing.executions.bug.create`}
                  </CodeBlock>

                  <div className="font-medium">Suggested roles:</div>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><span className="font-medium">QA Viewer</span>: read-only across suites/cases/plans/runs</li>
                    <li><span className="font-medium">QA Engineer</span>: write suites/cases/plans/runs + update executions + evidence</li>
                    <li><span className="font-medium">QA Lead</span>: all above + publish runs</li>
                    <li><span className="font-medium">Engineering</span>: read + create bugs from executions (optional)</li>
                  </ul>
                </div>
              </Section>

              <Section
                title="UI gating guidance"
                description="How to hide/show actions without breaking the page."
                icon={<CheckCircle2 className="h-4 w-4" />}
              >
                <CodeBlock>
{`// Example gating:
const perms = membership?.permissions ?? [];
const isOwner = Boolean(membership?.isOwner);

const canWriteRuns = isOwner || perms.includes("testing.runs.write");
const canPublish = isOwner || perms.includes("testing.runs.publish");

// Then disable buttons
<Button disabled={!canWriteRuns}>New run</Button>
<Button disabled={!canPublish}>Publish</Button>`}
                </CodeBlock>
              </Section>
            </>
          ) : null}

          {tab === "faq" ? (
            <>
              <Section title="FAQ" description="Common questions and practical answers." icon={<HelpCircle className="h-4 w-4" />}>
                <div className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
                  <div>
                    <div className="font-medium">Why Plans and Runs both exist?</div>
                    <div className="mt-1 text-slate-600 dark:text-slate-300">
                      Plans are reusable sets of cases. Runs are time-based executions of a plan (or ad-hoc) and store outcomes.
                    </div>
                  </div>

                  <div>
                    <div className="font-medium">When do we create bugs?</div>
                    <div className="mt-1 text-slate-600 dark:text-slate-300">
                      Usually for FAIL or BLOCKED executions. Attach evidence first, then create bug for traceability.
                    </div>
                  </div>

                  <div>
                    <div className="font-medium">Do we allow deleting?</div>
                    <div className="mt-1 text-slate-600 dark:text-slate-300">
                      Soft delete is recommended for audit trails. Restore endpoints are already defined for suites/cases.
                    </div>
                  </div>

                  <div>
                    <div className="font-medium">What is “Publish Run”?</div>
                    <div className="mt-1 text-slate-600 dark:text-slate-300">
                      Publishing indicates results are final and ready for broad sharing (release readiness signal).
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button asChild variant="outline">
                    <Link href="/portal/testing/runs">
                      Go to Runs
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Section>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}