"use client";

import * as React from "react";
import { Badge } from "@/logaxp/components/ui/badge";
import { Button } from "@/logaxp/components/ui/button";
import { TimeFiltersBar } from "@/logaxp/components/time-management/TimeFiltersBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/logaxp/components/ui/select";
import {
  AsyncSelect,
  type AsyncSelectItem,
} from "@/logaxp/components/time-management/pickers/AsyncSelect";
import {
  fetchProjects,
  fetchWorkItems,
} from "@/logaxp/components/time-management/pickers/projectPickers";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export type BillableFilter = "any" | "billable" | "non_billable";
export type ScopeFilter = "workspace" | "me";

type Props = {
  q: string;
  onQ: (v: string) => void;

  scope: ScopeFilter;
  onScope: (v: ScopeFilter) => void;
  canUseMeScope: boolean;

  includeDeleted: boolean;
  onIncludeDeleted: (v: boolean) => void;

  billable: BillableFilter;
  onBillable: (v: BillableFilter) => void;

  source: string;
  onSource: (v: string) => void;

  projectId: string;
  onProjectId: (v: string) => void;

  workItemId: string;
  onWorkItemId: (v: string) => void;

  pageSize: number;
  onPageSize: (v: number) => void;

  onReset: () => void;
  right?: React.ReactNode;
};

export function TimeEntryFilters(props: Props) {
  const {
    q,
    onQ,
    scope,
    onScope,
    canUseMeScope,
    includeDeleted,
    onIncludeDeleted,
    billable,
    onBillable,
    source,
    onSource,
    projectId,
    onProjectId,
    workItemId,
    onWorkItemId,
    pageSize,
    onPageSize,
    onReset,
    right,
  } = props;

  const [projectOption, setProjectOption] = React.useState<AsyncSelectItem | null>(null);
  const [workItemOption, setWorkItemOption] = React.useState<AsyncSelectItem | null>(null);

  React.useEffect(() => {
    if (!projectId) {
      setProjectOption(null);
      return;
    }

    if (projectOption?.id !== projectId) {
      setProjectOption(null);
    }
  }, [projectId, projectOption?.id]);

  React.useEffect(() => {
    if (!workItemId) {
      setWorkItemOption(null);
      return;
    }

    if (workItemOption?.id !== workItemId) {
      setWorkItemOption(null);
    }
  }, [workItemId, workItemOption?.id]);

  const handleProjectSelect = (it: AsyncSelectItem | null) => {
    const nextProjectId = it?.id ?? "";
    const changed = nextProjectId !== projectId;

    setProjectOption(it);
    onProjectId(nextProjectId);

    if (changed) {
      setWorkItemOption(null);
      onWorkItemId("");
    }
  };

  const handleWorkItemSelect = (it: AsyncSelectItem | null) => {
    setWorkItemOption(it);
    onWorkItemId(it?.id ?? "");
  };

  const handleReset = () => {
    setProjectOption(null);
    setWorkItemOption(null);
    onReset();
  };

  return (
    <TimeFiltersBar
      searchValue={q}
      onSearchChange={onQ}
      searchPlaceholder="Search entries..."
      left={
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <button
              type="button"
              className={cx(
                "px-3 py-2 text-xs font-medium transition",
                scope === "workspace"
                  ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
                  : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
              )}
              onClick={() => onScope("workspace")}
            >
              Workspace
            </button>

            <button
              type="button"
              disabled={!canUseMeScope}
              className={cx(
                "px-3 py-2 text-xs font-medium transition",
                !canUseMeScope && "cursor-not-allowed opacity-50",
                scope === "me"
                  ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
                  : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
              )}
              onClick={() => onScope("me")}
              title={!canUseMeScope ? "No employee context available yet" : "Show only my entries"}
            >
              My entries
            </button>
          </div>

          <label className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => onIncludeDeleted(e.target.checked)}
            />
            Include deleted
            {includeDeleted ? (
              <Badge className="rounded-full" variant="muted">
                On
              </Badge>
            ) : null}
          </label>

          <div className="w-[170px]">
            <Select value={billable} onValueChange={(v) => onBillable(v as BillableFilter)}>
              <SelectTrigger className="h-9 rounded-xl">
                <SelectValue placeholder="Billable" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Billable: Any</SelectItem>
                <SelectItem value="billable">Billable: Yes</SelectItem>
                <SelectItem value="non_billable">Billable: No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[170px]">
            <Select value={source || "__all__"} onValueChange={(v) => onSource(v === "__all__" ? "" : v)}>
              <SelectTrigger className="h-9 rounded-xl">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Source: Any</SelectItem>
                <SelectItem value="MANUAL">MANUAL</SelectItem>
                <SelectItem value="TIMER">TIMER</SelectItem>
                <SelectItem value="CLOCK">CLOCK</SelectItem>
                <SelectItem value="IMPORT">IMPORT</SelectItem>
                <SelectItem value="SYSTEM">SYSTEM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[240px]">
            <AsyncSelect
              valueId={projectId || null}
              valueLabel={projectOption?.label ?? null}
              placeholder="Select project..."
              fetcher={fetchProjects}
              onSelect={handleProjectSelect}
              allowClear
            />
          </div>

          <div className="w-[260px]">
            <AsyncSelect
              valueId={workItemId || null}
              valueLabel={workItemOption?.label ?? null}
              placeholder={projectId ? "Select work item..." : "Select project first (optional)"}
              fetcher={(search) => fetchWorkItems({ q: search, projectId: projectId || undefined })}
              onSelect={handleWorkItemSelect}
              allowClear
            />
          </div>

          <div className="w-[130px]">
            <Select value={String(pageSize)} onValueChange={(v) => onPageSize(Number(v))}>
              <SelectTrigger className="h-9 rounded-xl">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="100">100 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" size="sm" onClick={handleReset} className="h-9 rounded-xl">
            Reset
          </Button>
        </div>
      }
      right={right}
    />
  );
}