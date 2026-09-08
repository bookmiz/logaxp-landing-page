"use client";

import * as React from "react";
import { RefreshCcw, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";

import { ScheduleShell } from "@/logaxp/components/scheduling/ScheduleShell";
import { ScheduleHeroCard } from "@/logaxp/components/scheduling/ScheduleHeroCard";

import { AssignmentsTable } from "@/logaxp/components/scheduling/assignments/AssignmentsTable";
import { AssignmentCreateEditDialog } from "@/logaxp/components/scheduling/assignments/AssignmentCreateEditDialog";

import type { ScheduleAssignment } from "@/logaxp/lib/scheduling/scheduleManagement.types";
import {
  useScheduleAssignments,
  useCreateScheduleAssignment,
  useUpdateScheduleAssignment,
  useDeleteScheduleAssignment,
} from "@/logaxp/hooks/scheduling/useScheduleAssignments";

export default function PortalScheduleAssignmentsPage() {
  const qc = useQueryClient();

  const listQ = useScheduleAssignments(undefined, true);
  const createM = useCreateScheduleAssignment();
  const updateM = useUpdateScheduleAssignment();
  const deleteM = useDeleteScheduleAssignment();

  const busy = listQ.isFetching || createM.isPending || updateM.isPending || deleteM.isPending;

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["schedule"] as any });
  };

  const raw = listQ.data?.data as any;
  const rows: ScheduleAssignment[] = raw?.items ?? (Array.isArray(raw) ? raw : []);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [active, setActive] = React.useState<ScheduleAssignment | null>(null);

  return (
    <ScheduleShell
      title="Assignments"
      subtitle="Attach templates to employees or org units (generation uses these)."
      pill="People • Scheduling • Assignments"
      actions={
        <>
          <Button variant="outline" onClick={refresh} disabled={busy}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setCreateOpen(true)} disabled={busy}>
            <Plus className="h-4 w-4" />
            New assignment
          </Button>
        </>
      }
      requiredAnyCapabilities={["portal.schedule"]}
    >
      <div className="space-y-5">
        <ScheduleHeroCard title="Assignments" description="Assign templates to employees/org units for generation." />

        {listQ.isLoading ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-slate-600 dark:text-slate-300">Loading assignments…</CardContent>
          </Card>
        ) : listQ.isError ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-red-600 dark:text-red-300">Failed to load assignments.</CardContent>
          </Card>
        ) : rows.length ? (
          <AssignmentsTable
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
                title="No assignments"
                description="Create an assignment to enable generation."
                action={<Button onClick={() => setCreateOpen(true)}>Create assignment</Button>}
              />
            </CardContent>
          </Card>
        )}

        <AssignmentCreateEditDialog
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

        <AssignmentCreateEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          mode="edit"
          assignment={active}
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