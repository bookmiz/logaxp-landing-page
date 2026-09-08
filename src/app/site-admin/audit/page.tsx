"use client";

import * as React from "react";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  RefreshCcw,
  Search,
  ShieldCheck,
  FileJson,
  History,
} from "lucide-react";

import { useAuditLog, useAuditLogs, useAuditSummary } from "@/logaxp/hooks/useAudit";
import type { AuditAction, AuditListDto, AuditLog } from "@/logaxp/lib/audit/audit.types";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Badge } from "@/logaxp/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/logaxp/components/ui/dialog";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function fieldClassName() {
  return "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-lime-300 focus:ring-2 focus:ring-lime-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-lime-700 dark:focus:ring-lime-950/40";
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(d);
}

function prettyJson(value: unknown) {
  if (value == null) return "—";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function actionTone(action?: string | null) {
  switch (action) {
    case "CREATE":
      return "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200";
    case "UPDATE":
      return "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200";
    case "DELETE":
      return "border-red-200 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200";
    case "RESTORE":
      return "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-200";
    case "ARCHIVE":
      return "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200";
    default:
      return "border-slate-200 bg-slate-100 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200";
  }
}

function JsonBlock({
  title,
  value,
}: {
  title: string;
  value: unknown;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</div>
      <pre className="max-h-[340px] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
        {prettyJson(value)}
      </pre>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  hint,
  icon,
}: {
  title: string;
  value: React.ReactNode;
  hint?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="rounded-3xl">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {title}
            </div>
            <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">
              {value}
            </div>
            {hint ? (
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</div>
            ) : null}
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AuditDetailDialog({
  open,
  onOpenChange,
  auditId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  auditId?: string | null;
}) {
  const detailQ = useAuditLog(auditId ?? undefined);
  const item = detailQ.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-6xl overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Audit log detail</DialogTitle>
        </DialogHeader>

        {detailQ.isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
            Loading audit log...
          </div>
        ) : !item ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
            Audit log not found.
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="rounded-3xl">
              <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Action</div>
                  <div className="mt-2">
                    <Badge className={cx("rounded-full border", actionTone(item.action))}>
                      {item.action}
                    </Badge>
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Entity Type</div>
                  <div className="mt-2 font-medium text-slate-900 dark:text-slate-50">{item.entityType}</div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Entity ID</div>
                  <div className="mt-2 break-all font-medium text-slate-900 dark:text-slate-50">{item.entityId || "—"}</div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Created At</div>
                  <div className="mt-2 font-medium text-slate-900 dark:text-slate-50">{formatDateTime(item.createdAt)}</div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Actor User</div>
                  <div className="mt-2 break-all text-sm text-slate-900 dark:text-slate-50">{item.actorUserId || "—"}</div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Membership</div>
                  <div className="mt-2 break-all text-sm text-slate-900 dark:text-slate-50">{item.actorMembershipId || "—"}</div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Tenant</div>
                  <div className="mt-2 break-all text-sm text-slate-900 dark:text-slate-50">{item.tenantId || "—"}</div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Request ID</div>
                  <div className="mt-2 break-all text-sm text-slate-900 dark:text-slate-50">{item.requestId || "—"}</div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Route</div>
                  <div className="mt-2 break-all text-sm text-slate-900 dark:text-slate-50">{item.route || "—"}</div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Method</div>
                  <div className="mt-2 text-sm text-slate-900 dark:text-slate-50">{item.method || "—"}</div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">IP</div>
                  <div className="mt-2 break-all text-sm text-slate-900 dark:text-slate-50">{item.ip || "—"}</div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">User Agent</div>
                  <div className="mt-2 break-all text-sm text-slate-900 dark:text-slate-50">{item.userAgent || "—"}</div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-3">
              <JsonBlock title="Before" value={item.before} />
              <JsonBlock title="After" value={item.after} />
              <JsonBlock title="Diff" value={item.diff} />
            </div>

            <JsonBlock title="Metadata" value={item.metadata} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TopActionCount({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; count: number }>;
}) {
  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length ? (
          items.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="text-sm font-medium text-slate-900 dark:text-slate-50">{item.label}</div>
              <Badge variant="muted" className="rounded-full">{item.count}</Badge>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            No data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SiteAdminAuditLogsPage() {
  const [filters, setFilters] = React.useState<AuditListDto>({
    q: "",
    action: undefined,
    entityType: "",
    entityId: "",
    actorUserId: "",
    actorMembershipId: "",
    tenantId: "",
    requestId: "",
    from: "",
    to: "",
    page: 1,
    pageSize: 20,
  });

  const [detailId, setDetailId] = React.useState<string | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const listQ = useAuditLogs(filters);
  const summaryQ = useAuditSummary(filters);

  const rows = listQ.data?.items ?? [];
  const meta = listQ.data ?? { page: 1, pageSize: 20, total: 0 };

  const topActions = React.useMemo(() => {
    return (summaryQ.data?.byAction ?? [])
      .map((x) => ({
        label: x.action || "UNKNOWN",
        count: x._count._all,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [summaryQ.data]);

  const topEntities = React.useMemo(() => {
    return (summaryQ.data?.byEntityType ?? [])
      .map((x) => ({
        label: x.entityType || "UNKNOWN",
        count: x._count._all,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [summaryQ.data]);

  const openDetail = (id: string) => {
    setDetailId(id);
    setDetailOpen(true);
  };

  const resetFilters = () => {
    setFilters({
      q: "",
      action: undefined,
      entityType: "",
      entityId: "",
      actorUserId: "",
      actorMembershipId: "",
      tenantId: "",
      requestId: "",
      from: "",
      to: "",
      page: 1,
      pageSize: 20,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Audit Logs
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Inspect system changes, actor activity, before/after snapshots, and audit trails.
          </p>
        </div>

        <Button variant="outline" onClick={() => { listQ.refetch(); summaryQ.refetch(); }}>
          <RefreshCcw className={cx("mr-2 h-4 w-4", (listQ.isFetching || summaryQ.isFetching) && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Logs"
          value={summaryQ.data?.total ?? 0}
          hint="Matching current filters"
          icon={<History className="h-5 w-5" />}
        />
        <SummaryCard
          title="Visible Rows"
          value={rows.length}
          hint={`Page ${meta.page ?? 1}`}
          icon={<FileJson className="h-5 w-5" />}
        />
        <SummaryCard
          title="Create / Update / Delete"
          value={topActions.slice(0, 3).map((x) => x.count).reduce((a, b) => a + b, 0)}
          hint="Top tracked actions"
          icon={<Activity className="h-5 w-5" />}
        />
        <SummaryCard
          title="Security Context"
          value={rows.filter((x) => Boolean(x.actorUserId || x.actorMembershipId)).length}
          hint="Rows with actor context"
          icon={<ShieldCheck className="h-5 w-5" />}
        />
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 lg:grid-cols-4 xl:grid-cols-5">
          <div className="relative lg:col-span-2 xl:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className={cx(fieldClassName(), "pl-9")}
              placeholder="Search route, request ID, entity type..."
              value={filters.q ?? ""}
              onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value, page: 1 }))}
            />
          </div>

          <select
            className={fieldClassName()}
            value={filters.action ?? "__all__"}
            onChange={(e) =>
              setFilters((p) => ({
                ...p,
                action: e.target.value === "__all__" ? undefined : (e.target.value as AuditAction),
                page: 1,
              }))
            }
          >
            <option value="__all__">Action: All</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="RESTORE">RESTORE</option>
            <option value="ARCHIVE">ARCHIVE</option>
            <option value="PUBLISH">PUBLISH</option>
            <option value="UNPUBLISH">UNPUBLISH</option>
          </select>

          <input
            className={fieldClassName()}
            placeholder="Entity type"
            value={filters.entityType ?? ""}
            onChange={(e) => setFilters((p: AuditListDto) => ({ ...p, entityType: e.target.value, page: 1 }))}
          />

          <input
            className={fieldClassName()}
            placeholder="Entity ID"
            value={filters.entityId ?? ""}
            onChange={(e) => setFilters((p) => ({ ...p, entityId: e.target.value, page: 1 }))}
          />

          <input
            className={fieldClassName()}
            placeholder="Actor user ID"
            value={filters.actorUserId ?? ""}
            onChange={(e) => setFilters((p) => ({ ...p, actorUserId: e.target.value, page: 1 }))}
          />

          <input
            className={fieldClassName()}
            placeholder="Membership ID"
            value={filters.actorMembershipId ?? ""}
            onChange={(e) => setFilters((p) => ({ ...p, actorMembershipId: e.target.value, page: 1 }))}
          />

          <input
            className={fieldClassName()}
            placeholder="Tenant ID"
            value={filters.tenantId ?? ""}
            onChange={(e) => setFilters((p) => ({ ...p, tenantId: e.target.value, page: 1 }))}
          />

          <input
            className={fieldClassName()}
            placeholder="Request ID"
            value={filters.requestId ?? ""}
            onChange={(e) => setFilters((p) => ({ ...p, requestId: e.target.value, page: 1 }))}
          />

          <input
            type="datetime-local"
            className={fieldClassName()}
            value={filters.from ?? ""}
            onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value, page: 1 }))}
          />

          <input
            type="datetime-local"
            className={fieldClassName()}
            value={filters.to ?? ""}
            onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value, page: 1 }))}
          />

          <select
            className={fieldClassName()}
            value={String(filters.pageSize ?? 20)}
            onChange={(e) =>
              setFilters((p) => ({
                ...p,
                pageSize: Number(e.target.value),
                page: 1,
              }))
            }
          >
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
          </select>

          <Button variant="outline" onClick={resetFilters}>
            Reset
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <TopActionCount title="Top Actions" items={topActions} />
        <TopActionCount title="Top Entity Types" items={topEntities} />
      </div>

      <Card className="overflow-hidden rounded-3xl">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base">Audit Entries</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {listQ.isLoading ? (
            <div className="px-5 py-10 text-sm text-slate-500 dark:text-slate-400">
              Loading audit logs...
            </div>
          ) : rows.length === 0 ? (
            <div className="px-5 py-10 text-sm text-slate-500 dark:text-slate-400">
              No audit logs found for the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-900/30 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Action</th>
                    <th className="px-4 py-3 text-left font-semibold">Entity</th>
                    <th className="px-4 py-3 text-left font-semibold">Actor</th>
                    <th className="px-4 py-3 text-left font-semibold">Request</th>
                    <th className="px-4 py-3 text-left font-semibold">Route</th>
                    <th className="px-4 py-3 text-left font-semibold">Created</th>
                    <th className="px-4 py-3 text-right font-semibold">View</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rows.map((row: AuditLog) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/20">
                      <td className="px-4 py-3">
                        <Badge className={cx("rounded-full border", actionTone(row.action))}>
                          {row.action}
                        </Badge>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 dark:text-slate-50">
                          {row.entityType}
                        </div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {row.entityId || "—"}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-slate-900 dark:text-slate-50">
                          {row.actorUserId || "—"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {row.actorMembershipId || "—"}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="break-all text-slate-900 dark:text-slate-50">
                          {row.requestId || "—"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {row.ip || "—"}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-slate-900 dark:text-slate-50">{row.method || "—"}</div>
                        <div className="mt-1 max-w-[320px] truncate text-xs text-slate-500 dark:text-slate-400">
                          {row.route || "—"}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                        {formatDateTime(row.createdAt)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm" onClick={() => openDetail(row.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Page <span className="font-semibold text-slate-700 dark:text-slate-200">{meta.page ?? 1}</span> of{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {Math.max(1, Math.ceil((meta.total ?? 0) / (meta.pageSize ?? 20)))}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={(meta.page ?? 1) <= 1}
            onClick={() =>
              setFilters((p) => ({
                ...p,
                page: Math.max(1, (p.page ?? 1) - 1),
              }))
            }
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Prev
          </Button>

          <Button
            variant="outline"
            disabled={(meta.page ?? 1) >= Math.max(1, Math.ceil((meta.total ?? 0) / (meta.pageSize ?? 20)))}
            onClick={() =>
              setFilters((p) => ({
                ...p,
                page: (p.page ?? 1) + 1,
              }))
            }
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <AuditDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        auditId={detailId}
      />
    </div>
  );
}