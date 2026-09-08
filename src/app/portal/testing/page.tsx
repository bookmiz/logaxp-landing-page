"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { TestingShell } from "@/logaxp/components/testing/TestingShell";
import { Card, CardContent } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { ProjectRequiredState } from "@/logaxp/components/projects/ProjectRequiredState";
import {
  normalizeProjectId,
  readStoredActiveProject,
  withProjectId,
  writeStoredActiveProject,
} from "@/logaxp/lib/project-management/projectContext";

import {TestingHomeCards} from "@/logaxp/components/testing/TestingHomeCards";

function TestingHomeContent() {
  const router = useRouter();
  const sp = useSearchParams();

  const pidFromUrl = normalizeProjectId(sp.get("projectId"));
  const [projectId, setProjectId] = React.useState("");

  React.useEffect(() => {
    if (pidFromUrl) {
      setProjectId(pidFromUrl);
      writeStoredActiveProject({ id: pidFromUrl });
      return;
    }

    const stored = readStoredActiveProject()?.id ?? "";
    if (stored) {
      setProjectId(stored);
      router.replace(withProjectId("/portal/testing", stored));
      return;
    }

    setProjectId("");
  }, [pidFromUrl, router]);

  if (!projectId) {
    return (
      <TestingShell title="Testing" subtitle="Suites, cases, plans and runs." pill="Testing • Home">
        <ProjectRequiredState
          targetPath="/portal/testing"
          targetLabel="Open testing"
          description="Testing is project-scoped. Select a project and we will open suites, cases, plans, and runs with the project context attached."
        />
      </TestingShell>
    );
  }

  return (
    <TestingShell title="Testing" subtitle="Suites, cases, plans and runs." pill="Testing • Home" projectId={projectId}>
      <TestingHomeCards projectId={projectId} />
    </TestingShell>
  );
}

export default function TestingHomePage() {
  return (
    <React.Suspense
      fallback={
        <TestingShell title="Testing" subtitle="Suites, cases, plans and runs." pill="Testing • Home">
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6">
              <EmptyState title="Loading testing workspace" description="Preparing project context..." />
            </CardContent>
          </Card>
        </TestingShell>
      }
    >
      <TestingHomeContent />
    </React.Suspense>
  );
}
