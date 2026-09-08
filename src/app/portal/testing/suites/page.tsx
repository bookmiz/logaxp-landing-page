"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Plus, RefreshCcw, Search } from "lucide-react";

import { TestingShell } from "@/logaxp/components/testing/TestingShell";
import { normalizeList } from "@/logaxp/components/testing/testing.ui";
import { Card, CardContent } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { ProjectRequiredState } from "@/logaxp/components/projects/ProjectRequiredState";
import { normalizeProjectId } from "@/logaxp/lib/project-management/projectContext";

import type { TestSuite } from "@/logaxp/lib/testing/testing.types";
import {
  useTestingSuites,
  useCreateTestingSuite,
  useUpdateTestingSuite,
  useDeleteTestingSuite,
  useRestoreTestingSuite,
} from "@/logaxp/hooks/useTesting";

import { TestSuitesTable } from "@/logaxp/components/testing/suites/TestSuitesTable";
import { TestSuiteCreateEditDialog } from "@/logaxp/components/testing/suites/TestSuiteCreateEditDialog";

export default function TestingSuitesPage() {
  const sp = useSearchParams();

  const projectId = normalizeProjectId(sp.get("projectId"));
  const q = sp.get("q") ?? "";

  const [search, setSearch] = React.useState(q);
  const [includeDeleted, setIncludeDeleted] = React.useState(false);

  const suitesQuery = useTestingSuites({ projectId, q: search.trim() || undefined, includeDeleted });
  const create = useCreateTestingSuite();
  const update = useUpdateTestingSuite();
  const del = useDeleteTestingSuite();
  const restore = useRestoreTestingSuite();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [edit, setEdit] = React.useState<TestSuite | null>(null);

  if (!projectId) {
    return (
      <TestingShell title="Suites" subtitle="Organize test cases by feature area." pill="Testing • Suites">
        <ProjectRequiredState targetPath="/portal/testing/suites" targetLabel="Open suites" />
      </TestingShell>
    );
  }

  const { items } = normalizeList<TestSuite>(suitesQuery.data);

  const rows = [...items].sort((a, b) => {
    const da = Boolean(a.deletedAt);
    const db = Boolean(b.deletedAt);
    if (da !== db) return da ? 1 : -1;
    const soA = a.sortOrder ?? 0;
    const soB = b.sortOrder ?? 0;
    if (soA !== soB) return soA - soB;
    return String(a.name ?? "").localeCompare(String(b.name ?? ""));
  });

  return (
    <TestingShell
      title="Suites"
      subtitle="Organize your test cases into a hierarchy-ready suite list."
      pill="Testing • Suites"
      projectId={projectId}
      actions={
        <>
          <Button variant="outline" onClick={() => suitesQuery.refetch()} disabled={suitesQuery.isFetching}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New suite
          </Button>
        </>
      }
    >
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <Input
              label="Search"
              placeholder="Search suites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

          <TestSuitesTable
            rows={rows}
            busy={create.isPending || update.isPending || del.isPending || restore.isPending}
            onEdit={(r) => setEdit(r)}
            onDelete={(r) => del.mutate(r.id)}
            onRestore={(r) => restore.mutate(r.id)}
          />
        </CardContent>
      </Card>

      <TestSuiteCreateEditDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        projectId={projectId}
        busy={create.isPending}
        onSubmit={async (dto) => {
          // ✅ force projectId even if dialog forgets it
          await create.mutateAsync({ ...(dto as any), projectId });
          setCreateOpen(false);
        }}
      />

      <TestSuiteCreateEditDialog
        open={Boolean(edit)}
        onOpenChange={(o) => !o && setEdit(null)}
        mode="edit"
        projectId={projectId}
        suite={edit}
        busy={update.isPending}
        onSubmit={async (dto) => {
          if (!edit) return;
          await update.mutateAsync({ id: edit.id, dto: dto as any });
          setEdit(null);
        }}
      />
    </TestingShell>
  );
}
