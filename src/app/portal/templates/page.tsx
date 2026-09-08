"use client";

import * as React from "react";
import { Plus, RefreshCcw, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { useOnboarding } from "@/logaxp/hooks/useOnboarding";
import type { OnboardingTemplate, CreateOnboardingTemplateDto } from "@/logaxp/lib/onboarding/onboarding.types";
import { unwrapApi, unwrapList, clampPage } from "@/logaxp/components/onboarding/onboarding.utils";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Input } from "@/logaxp/components/ui/input";
import { Button } from "@/logaxp/components/ui/button";
import { Pagination } from "@/logaxp/components/ui/pagination";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { toast } from "@/logaxp/components/ui/toast";

import { OnboardingTemplatesTable } from "@/logaxp/components/onboarding/templates/OnboardingTemplatesTable";
import { OnboardingTemplateCreateEditDialog } from "@/logaxp/components/onboarding/templates/OnboardingTemplateCreateEditDialog";

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

  const load = React.useCallback(async (opts?: { silent?: boolean }) => {
    try {
      const res = await templates.list({ q: q.trim() || undefined, includeInactive });
      const data = unwrapApi(res);
      const { items } = unwrapList(data);

      // stable sort (newest first, fallback by name)
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
  }, [templates, q, includeInactive]);

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
    <div className="space-y-4 p-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Onboarding Templates</CardTitle>
          <CardDescription>Create templates and manage steps used for employee onboarding.</CardDescription>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto_auto] lg:items-end">
            <Input
              placeholder="Search templates..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />

            <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-800">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              Include inactive
            </label>

            <Button variant="outline" onClick={() => void load()} disabled={loading}>
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>

            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New template
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Templates</CardTitle>
          <CardDescription>
            Showing {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
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

      <OnboardingTemplateCreateEditDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        template={null}
        onSubmit={async (payload) => {
          const res = await templates.create(payload as CreateOnboardingTemplateDto);
          toast.success("Template created");
          setCreateOpen(false);
          await load({ silent: true });

          // go to detail page
          const created = unwrapApi(res);
          router.push(`/portal/onboarding/templates/${created.id}`);
        }}
      />

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
    </div>
  );
}