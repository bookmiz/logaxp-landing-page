"use client";

import * as React from "react";
import { Plus, RefreshCcw, Search, Sparkles, FileText, Shield, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useOnboarding } from "@/logaxp/hooks/useOnboarding";
import type { OnboardingTemplate, CreateOnboardingTemplateDto } from "@/logaxp/lib/onboarding/onboarding.types";
import { unwrapApi, unwrapList, clampPage } from "@/logaxp/components/onboarding/onboarding.utils";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Input } from "@/logaxp/components/ui/input";
import { Button } from "@/logaxp/components/ui/button";
import { Pagination } from "@/logaxp/components/ui/pagination";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { toast } from "@/logaxp/components/ui/toast";
import { Badge } from "@/logaxp/components/ui/badge";

import { OnboardingTemplatesTable } from "@/logaxp/components/onboarding/templates/OnboardingTemplatesTable";
import { OnboardingTemplateCreateEditDialog } from "@/logaxp/components/onboarding/templates/OnboardingTemplateCreateEditDialog";

function Shell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
            Onboarding
          </div>

          <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            {title}
          </h1>

          {subtitle ? (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
          ) : null}
        </div>

        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>

      {children}
    </div>
  );
}

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function OnboardingTemplatesPage() {
  const router = useRouter();
  const { templates, loading } = useOnboarding();

  const [rows, setRows] = React.useState<OnboardingTemplate[]>([]);
  const [initialLoading, setInitialLoading] = React.useState(true);

  const [q, setQ] = React.useState("");
  const [includeInactive, setIncludeInactive] = React.useState(false);

  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTemplate, setEditTemplate] = React.useState<OnboardingTemplate | null>(null);

  const load = React.useCallback(
    async (opts?: { silent?: boolean }) => {
      try {
        const res = await templates.list({ q: q.trim() || undefined, includeInactive });
        const data = unwrapApi(res);
        const { items } = unwrapList(data);

        const sorted = [...(items as OnboardingTemplate[])].sort((a, b) => {
          const bd = new Date((b as OnboardingTemplate).createdAt ?? 0).getTime();
          const ad = new Date((a as OnboardingTemplate).createdAt ?? 0).getTime();
          if (!Number.isNaN(bd) && !Number.isNaN(ad) && bd !== ad) return bd - ad;
          return String(a.name ?? "").localeCompare(String(b.name ?? ""));
        });

        setRows(sorted);
      } catch (e) {
        console.error(e);
        if (!opts?.silent) toast.error("Failed to load onboarding templates");
      } finally {
        setInitialLoading(false);
      }
    },
    [templates, q, includeInactive]
  );

  React.useEffect(() => {
    void load({ silent: true });
  }, [load]);

  React.useEffect(() => {
    setPage(1);
  }, [q, includeInactive]);

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((t) => {
      const name = String(t.name ?? "").toLowerCase();
      const desc = String((t as OnboardingTemplate).description ?? "").toLowerCase();
      return name.includes(needle) || desc.includes(needle);
    });
  }, [rows, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = clampPage(page, totalPages);

  const paged = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  return (
    <Shell
      title="Templates"
      subtitle="Create templates and manage steps used for employee onboarding."
      actions={
        <Link
          href="/portal/rbac"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          <Shield className="h-3.5 w-3.5" />
          RBAC
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {/* Hero */}
      <Card className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-200/60 blur-3xl dark:bg-emerald-500/15" />
        <div className="pointer-events-none absolute -left-10 -bottom-16 h-52 w-52 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/10" />

        <CardHeader className="relative pb-3">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Onboarding Templates
          </CardTitle>
          <CardDescription>
            Showing <span className="font-medium">{filtered.length}</span> result
            {filtered.length === 1 ? "" : "s"}.
          </CardDescription>
        </CardHeader>

        <CardContent className="relative pt-0 space-y-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto_auto] lg:items-end">
            <Input
              placeholder="Search templates..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />

            <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              Include inactive
            </label>

            <Button variant="outline" onClick={() => void load()} disabled={loading}>
              <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </Button>

            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New template
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="muted" className="rounded-full">
              Template-driven onboarding
            </Badge>
            <Badge variant="muted" className="rounded-full">
              Steps + tasks + signoffs (future-proof)
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <CardContent className="space-y-4 p-4">
          {initialLoading ? (
            <div className="text-sm text-slate-500">Loading templates...</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No templates found"
              description="Create your first onboarding template to begin."
              action={<Button onClick={() => setCreateOpen(true)}>Create template</Button>}
            />
          ) : (
            <>
              <OnboardingTemplatesTable
                rows={paged}
                busy={loading}
                onView={(t) => router.push(`/portal/onboarding/templates/${t.id}`)}
                onEdit={(t) => setEditTemplate(t)}
                onDelete={async (t) => {
                  try {
                    await templates.remove(t.id);
                    toast.success("Template removed");
                    await load({ silent: true });
                  } catch (e) {
                    console.error(e);
                    toast.error("Failed to remove template");
                  }
                }}
              />

              {filtered.length > pageSize ? (
                <Pagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  disabled={loading}
                />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create */}
      <OnboardingTemplateCreateEditDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        template={null}
        onSubmit={async (payload) => {
          if (!payload.name) {
            toast.error("Template name is required");
            return;
          }

          const res = await templates.create(payload as CreateOnboardingTemplateDto);
          toast.success("Template created");
          setCreateOpen(false);
          await load({ silent: true });

          const created = unwrapApi(res);
          router.push(`/portal/onboarding/templates/${created.id}`);
        }}
      />

      {/* Edit */}
      <OnboardingTemplateCreateEditDialog
        open={Boolean(editTemplate)}
        onOpenChange={(o) => !o && setEditTemplate(null)}
        template={editTemplate}
        onSubmit={async (payload) => {
          if (!editTemplate) return;
          await templates.update(editTemplate.id, payload);
          toast.success("Template updated");
          setEditTemplate(null);
          await load({ silent: true });
        }}
      />
    </Shell>
  );
}