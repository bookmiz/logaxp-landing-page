"use client";

import * as React from "react";
import {
  History,
  UserCircle2,
  FileJson,
  Search,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  Clock3,
  Sparkles,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Input } from "@/logaxp/components/ui/input";
import { Pagination } from "@/logaxp/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/logaxp/components/ui/select";
import type { TenantAuditEvent } from "./tenant-admin.types";
import { formatDateTime, safePrettyJson } from "./tenant-admin.helpers";

type Props = {
  events?: TenantAuditEvent[];
  title?: string;
  description?: string;
  loading?: boolean;
  onRefresh?: () => void | Promise<void>;
  pageSize?: number;
};

function actionBadgeVariant(action?: string) {
  const v = (action ?? "").toLowerCase();

  if (v.includes("delete") || v.includes("remove") || v.includes("revoke") || v.includes("archive")) {
    return "destructive" as const;
  }

  if (v.includes("suspend") || v.includes("disable") || v.includes("fail")) {
    return "warning" as const;
  }

  if (
    v.includes("create") ||
    v.includes("add") ||
    v.includes("invite") ||
    v.includes("activate") ||
    v.includes("verify") ||
    v.includes("assign")
  ) {
    return "success" as const;
  }

  return "default" as const;
}

function safeDateMs(value?: string | null) {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export function TenantAuditTimeline({
  events,
  title = "Audit Timeline",
  description = "Recent tenant changes, administrative actions, and configuration updates.",
  loading = false,
  onRefresh,
  pageSize = 8,
}: Props) {
  const [expandedIds, setExpandedIds] = React.useState<Record<string, boolean>>({});
  const [search, setSearch] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState<string>("ALL");
  const [targetTypeFilter, setTargetTypeFilter] = React.useState<string>("ALL");
  const [page, setPage] = React.useState(1);

  const rows = React.useMemo(
    () =>
      [...(events ?? [])].sort((a, b) => safeDateMs(b.createdAt) - safeDateMs(a.createdAt)),
    [events]
  );

  const actionOptions = React.useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      if (r.action?.trim()) set.add(r.action);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const targetTypeOptions = React.useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      if (r.targetType?.trim()) set.add(r.targetType);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();

    return rows.filter((evt) => {
      if (actionFilter !== "ALL" && evt.action !== actionFilter) return false;
      if (targetTypeFilter !== "ALL" && (evt.targetType ?? "") !== targetTypeFilter) return false;

      if (!q) return true;

      const haystack = [
        evt.action,
        evt.targetType,
        evt.targetId,
        evt.summary,
        evt.actorName,
        evt.actorEmail,
        evt.createdAt,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [rows, search, actionFilter, targetTypeFilter]);

  React.useEffect(() => {
    setPage(1);
  }, [search, actionFilter, targetTypeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pagedRows = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const stats = React.useMemo(() => {
    const actorSet = new Set<string>();
    const actionSet = new Set<string>();

    rows.forEach((r) => {
      const actor = r.actorEmail || r.actorName || "System";
      actorSet.add(actor);
      if (r.action) actionSet.add(r.action);
    });

    return {
      total: rows.length,
      actors: actorSet.size,
      actions: actionSet.size,
      latestAt: rows[0]?.createdAt ?? null,
    };
  }, [rows]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAllVisible = () => {
    setExpandedIds((prev) => {
      const next = { ...prev };
      for (const row of pagedRows) {
        if (row.metadata) next[row.id] = true;
      }
      return next;
    });
  };

  const collapseAllVisible = () => {
    setExpandedIds((prev) => {
      const next = { ...prev };
      for (const row of pagedRows) {
        delete next[row.id];
      }
      return next;
    });
  };

  const hasEvents = rows.length > 0;
  const hasFilteredEvents = filtered.length > 0;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <History className="h-4 w-4" />
              Events
            </CardTitle>
            <CardDescription>Total audit records</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-2xl font-black">{stats.total}</CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Action Types</CardTitle>
            <CardDescription>Distinct actions</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-2xl font-black">{stats.actions}</CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Actors</CardTitle>
            <CardDescription>Users / system sources</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-2xl font-black">{stats.actors}</CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock3 className="h-4 w-4" />
              Latest Event
            </CardTitle>
            <CardDescription>Most recent audit time</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-sm font-semibold">
            {stats.latestAt ? formatDateTime(stats.latestAt) : "—"}
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={expandAllVisible} disabled={!pagedRows.length}>
                <ChevronDown className="h-4 w-4" />
                Expand visible
              </Button>
              <Button variant="outline" onClick={collapseAllVisible} disabled={!pagedRows.length}>
                <ChevronUp className="h-4 w-4" />
                Collapse visible
              </Button>
              {onRefresh ? (
                <Button variant="outline" onClick={() => void onRefresh()} loading={loading}>
                  {!loading ? <RefreshCcw className="h-4 w-4" /> : null}
                  Refresh
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_220px_220px]">
            <Input
              placeholder="Search action, summary, actor, target..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All actions</SelectItem>
                {actionOptions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All targets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All target types</SelectItem>
                {targetTypeOptions.map((targetType) => (
                  <SelectItem key={targetType} value={targetType}>
                    {targetType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter summary */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Filter className="h-4 w-4" />
            <span>
              Showing <strong>{filtered.length}</strong> of <strong>{rows.length}</strong> event
              {rows.length === 1 ? "" : "s"}
            </span>
            {search ? <Badge variant="muted">Search: {search}</Badge> : null}
            {actionFilter !== "ALL" ? <Badge variant="muted">Action: {actionFilter}</Badge> : null}
            {targetTypeFilter !== "ALL" ? (
              <Badge variant="muted">Target: {targetTypeFilter}</Badge>
            ) : null}
          </div>

          {/* Empty states */}
          {!loading && !hasEvents ? (
            <EmptyState
              title="No audit events yet"
              description="Once audit logging is connected for tenant actions, events will appear here."
              icon={<History className="h-8 w-8" />}
            />
          ) : !loading && hasEvents && !hasFilteredEvents ? (
            <EmptyState
              title="No matching audit events"
              description="Try changing your search or filters."
              icon={<Search className="h-8 w-8" />}
            />
          ) : (
            <>
              <div className="space-y-4">
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <div key={`audit-loading-${i}`} className="relative pl-6">
                        <div className="absolute left-[10px] top-5 h-[calc(100%-8px)] w-px bg-slate-200 dark:bg-slate-800" />
                        <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950" />
                        <div className="rounded-2xl border border-slate-200/70 p-4 dark:border-slate-800/70">
                          <div className="h-4 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
                          <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
                          <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
                        </div>
                      </div>
                    ))
                  : pagedRows.map((evt, index) => {
                      const expanded = Boolean(expandedIds[evt.id]);
                      const actorLabel = evt.actorName || evt.actorEmail || "System";
                      const hasMetadata = !!evt.metadata;

                      return (
                        <div key={evt.id} className="relative pl-6">
                          {/* Timeline line */}
                          {index < pagedRows.length - 1 ? (
                            <div className="absolute left-[10px] top-5 h-[calc(100%-8px)] w-px bg-slate-200 dark:bg-slate-800" />
                          ) : null}

                          {/* Dot */}
                          <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950" />

                          <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-slate-800/70 dark:bg-slate-950">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0 space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge variant={actionBadgeVariant(evt.action)} className="font-mono">
                                    {evt.action}
                                  </Badge>

                                  {evt.targetType ? (
                                    <Badge variant="muted">{evt.targetType}</Badge>
                                  ) : null}

                                  {evt.targetId ? (
                                    <Badge variant="muted" className="max-w-[320px] truncate font-mono">
                                      {evt.targetId}
                                    </Badge>
                                  ) : null}
                                </div>

                                <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                                  {evt.summary ?? "No summary provided."}
                                </p>

                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                  <span className="inline-flex items-center gap-1">
                                    <UserCircle2 className="h-3.5 w-3.5" />
                                    {actorLabel}
                                  </span>
                                  <span>{formatDateTime(evt.createdAt)}</span>
                                </div>
                              </div>

                              <div className="flex shrink-0 flex-wrap gap-2">
                                {hasMetadata ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toggleExpanded(evt.id)}
                                  >
                                    <FileJson className="h-4 w-4" />
                                    {expanded ? "Hide metadata" : "View metadata"}
                                  </Button>
                                ) : (
                                  <Badge variant="muted">
                                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                                    No metadata
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {expanded && hasMetadata ? (
                              <pre className="mt-3 max-h-[420px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                                {safePrettyJson(evt.metadata)}
                              </pre>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
              </div>

              {filtered.length > pageSize ? (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  disabled={loading}
                />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}