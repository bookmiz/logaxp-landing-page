"use client";

import * as React from "react";
import { Plus, Search, Trash2, Layers, Tags } from "lucide-react";

import type { TestCase, TestPlan, TestSuite } from "@/logaxp/lib/testing/testing.types";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import { Badge } from "@/logaxp/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/logaxp/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/logaxp/components/ui/select";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

export function TestPlanCasesDialog({
  open,
  onOpenChange,
  plan,
  suites,
  cases,
  busy,
  onAddMany,
  onRemoveOne,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  plan: TestPlan | null;

  suites: TestSuite[];
  cases: TestCase[]; // already loaded for project
  busy?: boolean;

  onAddMany: (testCaseIds: string[]) => void | Promise<void>;
  onRemoveOne: (testCaseId: string) => void | Promise<void>;
}) {
  const [q, setQ] = React.useState("");
  const [suiteId, setSuiteId] = React.useState<string>("ALL");
  const [tag, setTag] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!open) return;
    setQ("");
    setSuiteId("ALL");
    setTag("");
    setSelected([]);
  }, [open]);

  const currentIds = React.useMemo(() => {
    if (Array.isArray(plan?.cases)) {
      return uniq(plan.cases.map((item) => item.testCaseId).filter(Boolean));
    }
    const ids = Array.isArray(plan?.testCaseIds) ? (plan!.testCaseIds as string[]) : [];
    return uniq(ids.filter(Boolean));
  }, [plan]);

  const suitesById = React.useMemo(() => {
    const map: Record<string, TestSuite> = {};
    for (const s of suites) map[s.id] = s;
    return map;
  }, [suites]);

  const available = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    const tagNeedle = tag.trim().toLowerCase();

    return cases
      .filter((c) => !c.deletedAt) // keep plan attachment clean
      .filter((c) => (suiteId === "ALL" ? true : String(c.suiteId ?? "") === suiteId))
      .filter((c) => {
        if (!tagNeedle) return true;
        const tags = Array.isArray(c.tags) ? c.tags : [];
        return tags.some((t) => String(t).toLowerCase().includes(tagNeedle));
      })
      .filter((c) => {
        if (!needle) return true;
        const title = String(c.title ?? "").toLowerCase();
        const desc = String(c.description ?? "").toLowerCase();
        const id = String(c.id ?? "").toLowerCase();
        return title.includes(needle) || desc.includes(needle) || id.includes(needle);
      })
      .sort((a, b) => String(a.title ?? "").localeCompare(String(b.title ?? "")));
  }, [cases, q, suiteId, tag]);

  const toggle = (id: string) => {
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  const selectAllVisible = () => {
    const ids = available.map((c) => c.id);
    setSelected((p) => uniq([...p, ...ids]));
  };

  const clearSelection = () => setSelected([]);

  const addSelected = async () => {
    if (!plan) return;
    const ids = selected.filter(Boolean);
    if (ids.length === 0) return;

    // avoid sending duplicates already in plan
    const toAdd = ids.filter((id) => !currentIds.includes(id));
    if (toAdd.length === 0) return;

    await onAddMany(toAdd);
    setSelected([]);
  };

  const currentCases = React.useMemo(() => {
    const byId: Record<string, TestCase> = {};
    for (const c of cases) byId[c.id] = c;
    return currentIds
      .map((id) => byId[id])
      .filter(Boolean)
      .filter((c) => !c.deletedAt);
  }, [cases, currentIds]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1100px]">
        <DialogHeader>
          <DialogTitle>Manage Plan Cases</DialogTitle>
          <DialogDescription>
            Attach cases to this plan. Plans become “runs” when you execute them.
          </DialogDescription>
        </DialogHeader>

        {!plan ? (
          <div className="text-sm text-slate-500">No plan selected.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_420px]">
            {/* LEFT: Available cases */}
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-50">{plan.name}</div>
                <div className="mt-0.5 text-xs text-slate-500">{plan.id}</div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[260px_260px_1fr] md:items-end">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-50">Suite</label>
                  <Select value={suiteId} onValueChange={setSuiteId}>
                    <SelectTrigger className="pl-3">
                      <Layers className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="All suites" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Suites</SelectLabel>
                        <SelectItem value="ALL">All suites</SelectItem>
                        {suites
                          .filter((s) => !s.deletedAt)
                          .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")))
                          .map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <Input
                  label="Tag"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="e.g., regression"
                  leftIcon={<Tags className="h-4 w-4" />}
                />

                <Input
                  label="Search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search title, description, id..."
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={selectAllVisible} disabled={busy || available.length === 0}>
                  Select visible
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection} disabled={busy || selected.length === 0}>
                  Clear
                </Button>

                <div className="ml-auto flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Badge variant="muted" className="rounded-full">
                    {available.length} available
                  </Badge>
                  <Badge variant="muted" className="rounded-full">
                    {selected.length} selected
                  </Badge>
                </div>
              </div>

              <div className="max-h-[420px] overflow-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                {available.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500">No matching cases.</div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {available.map((c) => {
                      const inPlan = currentIds.includes(c.id);
                      const checked = selected.includes(c.id);

                      return (
                        <label
                          key={c.id}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 p-3 transition",
                            "bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900/40",
                            inPlan && "opacity-70"
                          )}
                        >
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded"
                            checked={checked}
                            disabled={busy || inPlan}
                            onChange={() => toggle(c.id)}
                          />

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="font-medium text-slate-900 dark:text-slate-50">{c.title}</div>
                              {inPlan ? <Badge variant="muted">in plan</Badge> : null}
                              <Badge variant="muted" className="rounded-full">
                                {c.priority}
                              </Badge>
                              <Badge variant="muted" className="rounded-full">
                                {c.status}
                              </Badge>
                            </div>
                            <div className="mt-0.5 text-xs text-slate-500">
                              {suitesById[c.suiteId ?? ""]?.name ? `Suite: ${suitesById[c.suiteId ?? ""]?.name}` : "Suite: —"} •{" "}
                              {c.id}
                            </div>
                            {Array.isArray(c.tags) && c.tags.length ? (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {c.tags.slice(0, 6).map((t) => (
                                  <span
                                    key={t}
                                    className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                                  >
                                    {t}
                                  </span>
                                ))}
                                {c.tags.length > 6 ? (
                                  <span className="text-[11px] text-slate-500">+{c.tags.length - 6}</span>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button onClick={() => void addSelected()} disabled={busy || selected.length === 0}>
                  <Plus className="h-4 w-4" />
                  Add selected to plan
                </Button>
              </div>
            </div>

            {/* RIGHT: Current plan cases */}
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-50">Cases in plan</div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {currentCases.length} case{currentCases.length === 1 ? "" : "s"} attached
                </div>
              </div>

              <div className="max-h-[620px] overflow-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                {currentCases.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500">No cases attached yet.</div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {currentCases.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-start justify-between gap-3 bg-white p-3 dark:bg-slate-950"
                      >
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 dark:text-slate-50">{c.title}</div>
                          <div className="mt-0.5 text-xs text-slate-500">{c.id}</div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void onRemoveOne(c.id)}
                          disabled={busy}
                          title="Remove from plan"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
