"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Plus, RefreshCcw, Search, Tags, Layers } from "lucide-react";

import { TestingShell } from "@/logaxp/components/testing/TestingShell";
import { normalizeList } from "@/logaxp/components/testing/testing.ui";
import { toast } from "@/logaxp/components/ui/toast";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { ProjectRequiredState } from "@/logaxp/components/projects/ProjectRequiredState";
import { normalizeProjectId } from "@/logaxp/lib/project-management/projectContext";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/logaxp/components/ui/select";

import type { TestCase, TestSuite } from "@/logaxp/lib/testing/testing.types";

import {
  useTestingSuites,
  useTestingCases,
  useCreateTestingCase,
  useUpdateTestingCase,
  useDeleteTestingCase,
  useRestoreTestingCase,
  useAddTestCaseCoverage,
  useRemoveTestCaseCoverage,
} from "@/logaxp/hooks/useTesting";

import { TestCasesTable } from "@/logaxp/components/testing/case/TestCasesTable";
import { TestCaseCreateEditDialog } from "@/logaxp/components/testing/case/TestCaseCreateEditDialog";
import { TestCaseCoverageDialog } from "@/logaxp/components/testing/case/TestCaseCoverageDialog";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function toSuiteOptionValue(id?: string | null) {
  return id ? id : "ALL";
}

export default function TestingCasesPage() {
  const sp = useSearchParams();
  const projectId = normalizeProjectId(sp.get("projectId"));

  // filters (local UI state)
  const [suiteFilter, setSuiteFilter] = React.useState<string>("ALL");
  const [tagFilter, setTagFilter] = React.useState("");
  const [q, setQ] = React.useState("");
  const [includeDeleted, setIncludeDeleted] = React.useState(false);

  // dialogs
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editRow, setEditRow] = React.useState<TestCase | null>(null);
  const [coverageRow, setCoverageRow] = React.useState<TestCase | null>(null);

  // queries (these hooks must always run; ideally your hooks internally use `enabled: !!projectId`)
  const suitesQ = useTestingSuites({ projectId, includeDeleted, q: undefined });
  const casesQ = useTestingCases({
    projectId,
    suiteId: suiteFilter === "ALL" ? undefined : suiteFilter,
    tag: tagFilter.trim() || undefined,
    q: q.trim() || undefined,
    includeDeleted,
  });

  // mutations
  const createM = useCreateTestingCase();
  const updateM = useUpdateTestingCase();
  const deleteM = useDeleteTestingCase();
  const restoreM = useRestoreTestingCase();
  const addCovM = useAddTestCaseCoverage();
  const rmCovM = useRemoveTestCaseCoverage();

  // data
  const suites = normalizeList<TestSuite>(suitesQ.data).items;
  const cases = normalizeList<TestCase>(casesQ.data).items;

  const suitesById = React.useMemo(() => {
    const map: Record<string, TestSuite> = {};
    for (const s of suites) map[s.id] = s;
    return map;
  }, [suites]);

  // keep suiteFilter valid if project changes or suite disappears
  React.useEffect(() => {
    if (suiteFilter !== "ALL" && !suites.some((s) => s.id === suiteFilter)) {
      setSuiteFilter("ALL");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suites]);

  // ✅ IMPORTANT: this useMemo must be called unconditionally (no early return before it)
  const filteredRows = React.useMemo<TestCase[]>(() => {
    const needle = q.trim().toLowerCase();
    const tagNeedle = tagFilter.trim().toLowerCase();

    return [...cases]
      .filter((tc) => {
        if (!includeDeleted && tc.deletedAt) return false;
        if (suiteFilter !== "ALL" && String(tc.suiteId ?? "") !== suiteFilter) return false;

        if (tagNeedle) {
          const tags = Array.isArray(tc.tags) ? tc.tags : [];
          if (!tags.some((t) => String(t).toLowerCase().includes(tagNeedle))) return false;
        }

        if (needle) {
          const title = String(tc.title ?? "").toLowerCase();
          const desc = String(tc.description ?? "").toLowerCase();
          const id = String(tc.id ?? "").toLowerCase();
          if (!title.includes(needle) && !desc.includes(needle) && !id.includes(needle)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // active first, then newest, then title
        const da = Boolean(a.deletedAt);
        const db = Boolean(b.deletedAt);
        if (da !== db) return da ? 1 : -1;

        const bd = new Date((b as any).createdAt ?? 0).getTime();
        const ad = new Date((a as any).createdAt ?? 0).getTime();
        if (!Number.isNaN(bd) && !Number.isNaN(ad) && bd !== ad) return bd - ad;

        return String(a.title ?? "").localeCompare(String(b.title ?? ""));
      });
  }, [cases, q, tagFilter, suiteFilter, includeDeleted]);

  const busy =
    suitesQ.isFetching ||
    casesQ.isFetching ||
    createM.isPending ||
    updateM.isPending ||
    deleteM.isPending ||
    restoreM.isPending ||
    addCovM.isPending ||
    rmCovM.isPending;

  // ✅ now it is safe to early return (after hooks)
  if (!projectId) {
    return (
      <TestingShell title="Test Cases" subtitle="Author, organize, and maintain test cases." pill="Testing • Cases">
        <ProjectRequiredState targetPath="/portal/testing/cases" targetLabel="Open cases" />
      </TestingShell>
    );
  }

  return (
    <TestingShell
      title="Test Cases"
      subtitle="Author, organize, and maintain enterprise-quality test cases (steps, tags, references, and coverage)."
      pill="Testing • Cases"
      projectId={projectId}
      actions={
        <>
          <Button variant="outline" onClick={() => casesQ.refetch()} disabled={casesQ.isFetching}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New case
          </Button>
        </>
      }
    >
      {/* Filters / hero */}
      <Card className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-200/60 blur-3xl dark:bg-emerald-500/15" />
        <div className="pointer-events-none absolute -left-10 -bottom-16 h-52 w-52 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/10" />

        <CardHeader className="relative pb-3">
          <CardTitle className="text-xl">Test Cases</CardTitle>
          <CardDescription>Filter by suite, tag, and keywords. Manage lifecycle with soft-delete/restore.</CardDescription>
        </CardHeader>

        <CardContent className="relative space-y-3 pt-0">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[320px_260px_1fr_auto] lg:items-end">
            {/* Suite filter */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Suite</label>
              <Select value={suiteFilter} onValueChange={setSuiteFilter}>
                <SelectTrigger className="pl-9">
                  <Layers className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform pointer-events-none" />
                  <SelectValue placeholder="All suites" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Suites</SelectLabel>
                    <SelectItem value="ALL">All suites</SelectItem>
                    {suites
                      .filter((s) => (includeDeleted ? true : !s.deletedAt))
                      .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")))
                      .map((s) => (
                        <SelectItem key={s.id} value={toSuiteOptionValue(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Tag filter */}
            <Input
              label="Tag"
              placeholder="e.g., regression"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              leftIcon={<Tags className="h-4 w-4" />}
              hint="Matches any tag containing this text."
            />

            {/* Search */}
            <Input
              label="Search"
              placeholder="Search title, description, id..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />

            {/* Include deleted */}
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
          <CardTitle className="text-base">Cases</CardTitle>
          <CardDescription>
            Showing {filteredRows.length} result{filteredRows.length === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {casesQ.isLoading ? (
            <div className="text-sm text-slate-500">Loading cases...</div>
          ) : filteredRows.length === 0 ? (
            <EmptyState
              title="No test cases"
              description="Create your first test case to begin building reliable coverage."
              action={<Button onClick={() => setCreateOpen(true)}>Create test case</Button>}
            />
          ) : (
            <TestCasesTable
              rows={filteredRows}
              suitesById={suitesById}
              busy={busy}
              onEdit={(r) => setEditRow(r)}
              onCoverage={(r) => setCoverageRow(r)}
              onDelete={(r) => deleteM.mutate(r.id)}
              onRestore={(r) => restoreM.mutate(r.id)}
            />
          )}
        </CardContent>
      </Card>

      {/* Create */}
      <TestCaseCreateEditDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        projectId={projectId}
        suites={suites.filter((s) => !s.deletedAt)}
        busy={createM.isPending}
        onSubmit={async (dto) => {
          try {
            await createM.mutateAsync(dto as any);
            toast.success("Test case created");
            setCreateOpen(false);
          } catch (e) {
            console.error(e);
            toast.error("Failed to create test case");
          }
        }}
      />

      {/* Edit */}
      <TestCaseCreateEditDialog
        open={Boolean(editRow)}
        onOpenChange={(o) => !o && setEditRow(null)}
        mode="edit"
        projectId={projectId}
        suites={suites.filter((s) => !s.deletedAt)}
        caseRow={editRow}
        busy={updateM.isPending}
        onSubmit={async (dto) => {
          if (!editRow) return;
          try {
            await updateM.mutateAsync({ id: editRow.id, dto: dto as any });
            toast.success("Test case updated");
            setEditRow(null);
          } catch (e) {
            console.error(e);
            toast.error("Failed to update test case");
          }
        }}
      />

      {/* Coverage */}
      <TestCaseCoverageDialog
        open={Boolean(coverageRow)}
        onOpenChange={(o) => !o && setCoverageRow(null)}
        testCase={coverageRow}
        busy={addCovM.isPending || rmCovM.isPending}
        onAdd={async (workItemId) => {
          if (!coverageRow) return;
          try {
            const updated = await addCovM.mutateAsync({ caseId: coverageRow.id, dto: { workItemId } });
            setCoverageRow(updated as any);
            toast.success("Coverage added");
            await casesQ.refetch();
          } catch (e) {
            console.error(e);
            toast.error("Failed to add coverage");
          }
        }}
        onRemove={async (workItemId) => {
          if (!coverageRow) return;
          try {
            const updated = await rmCovM.mutateAsync({ caseId: coverageRow.id, workItemId });
            setCoverageRow(updated as any);
            toast.success("Coverage removed");
            await casesQ.refetch();
          } catch (e) {
            console.error(e);
            toast.error("Failed to remove coverage");
          }
        }}
      />
    </TestingShell>
  );
}
