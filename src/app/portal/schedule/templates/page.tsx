"use client";

import * as React from "react";
import { RefreshCcw, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";

import { ScheduleShell } from "@/logaxp/components/scheduling/ScheduleShell";
import { ScheduleHeroCard } from "@/logaxp/components/scheduling/ScheduleHeroCard";

import { TemplatesTable } from "@/logaxp/components/scheduling/templates/TemplatesTable";
import { TemplateCreateEditDialog } from "@/logaxp/components/scheduling/templates/TemplateCreateEditDialog";

import type { ScheduleTemplate } from "@/logaxp/lib/scheduling/scheduleManagement.types";
import { useScheduleTemplates, useCreateScheduleTemplate, useUpdateScheduleTemplate, useDeleteScheduleTemplate } from "@/logaxp/hooks/scheduling/useScheduleTemplates";

export default function PortalScheduleTemplatesPage() {
  const qc = useQueryClient();

  const listQ = useScheduleTemplates(true);
  const createM = useCreateScheduleTemplate();
  const updateM = useUpdateScheduleTemplate();
  const deleteM = useDeleteScheduleTemplate();

  const busy = listQ.isFetching || createM.isPending || updateM.isPending || deleteM.isPending;

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["schedule"] as any });
  };

  const raw = listQ.data?.data as any;
  const rows: ScheduleTemplate[] = raw?.items ?? (Array.isArray(raw) ? raw : []);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [active, setActive] = React.useState<ScheduleTemplate | null>(null);

  return (
    <ScheduleShell
      title="Templates"
      subtitle="Define weekly/rotating rules used for generation."
      pill="People • Scheduling • Templates"
      actions={
        <>
          <Button variant="outline" onClick={refresh} disabled={busy}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setCreateOpen(true)} disabled={busy}>
            <Plus className="h-4 w-4" />
            New template
          </Button>
        </>
      }
      requiredAnyCapabilities={["portal.schedule"]}
    >
      <div className="space-y-5">
        <ScheduleHeroCard title="Templates" description="Create template rules and reuse them across the org." />

        {listQ.isLoading ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-slate-600 dark:text-slate-300">Loading templates…</CardContent>
          </Card>
        ) : listQ.isError ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-red-600 dark:text-red-300">Failed to load templates.</CardContent>
          </Card>
        ) : rows.length ? (
          <TemplatesTable
            rows={rows}
            busy={busy}
            onEdit={(r) => {
              setActive(r);
              setEditOpen(true);
            }}
            onDelete={(r) => deleteM.mutateAsync(r.id).then(refresh)}
          />
        ) : (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6">
              <EmptyState
                title="No templates"
                description="Create your first schedule template."
                action={<Button onClick={() => setCreateOpen(true)}>Create template</Button>}
              />
            </CardContent>
          </Card>
        )}

        <TemplateCreateEditDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          mode="create"
          busy={createM.isPending}
          onCreate={async (dto) => {
            await createM.mutateAsync(dto);
            await refresh();
          }}
          onUpdate={async () => {}}
        />

        <TemplateCreateEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          mode="edit"
          template={active}
          busy={updateM.isPending}
          onCreate={async () => {}}
          onUpdate={async (id, dto) => {
            await updateM.mutateAsync({ id, dto });
            await refresh();
          }}
        />
      </div>
    </ScheduleShell>
  );
}