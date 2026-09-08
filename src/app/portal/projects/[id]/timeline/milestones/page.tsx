// src/app/portal/projects/[id]/timeline/milestones/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";

import { ProjectShell } from "@/logaxp/components/projects/ProjectShell";
import { ProjectCrumbs } from "@/logaxp/components/projects/ProjectCrumbs";

import { ProjectTimelineNav } from "@/logaxp/components/projects/timeline/ProjectTimelineNav";

import { MilestonesDndTable } from "@/logaxp/components/projects/timeline/milestones/MilestonesDndTable";
import { MilestoneCreateEditDialog } from "@/logaxp/components/projects/timeline/milestones/MilestoneCreateEditDialog";
import { MilestoneLinkWorkItemsDialog } from "@/logaxp/components/projects/timeline/milestones/MilestoneLinkWorkItemsDialog";

import type { ProjectMilestone, WorkItem } from "@/logaxp/lib/project-management/projectManagement.types";
import { useProjectManagement } from "@/logaxp/hooks/useProjectManagement"; // you already have this pattern

export default function ProjectMilestonesPage() {
  const { id: projectId } = useParams<{ id: string }>();

  const pm = useProjectManagement();
   const pmRef = React.useRef(pm);

  const [milestones, setMilestones] = React.useState<ProjectMilestone[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ProjectMilestone | null>(null);

  const [linkOpen, setLinkOpen] = React.useState(false);
  const [linking, setLinking] = React.useState<ProjectMilestone | null>(null);

// keep ref updated when pm changes
React.useEffect(() => {
  pmRef.current = pm;
}, [pm]);

const load = React.useCallback(async () => {
  setLoading(true);
  try {
    const res = await pmRef.current.timeline.listMilestones(projectId);
    const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];
    setMilestones(items as ProjectMilestone[]);
  } finally {
    setLoading(false);
  }
}, [projectId]);

React.useEffect(() => {
  load();
}, [load]);

  const openCreate = () => {
    setEditing(null);
    setEditOpen(true);
  };

  const openEdit = (row: ProjectMilestone) => {
    setEditing(row);
    setEditOpen(true);
  };

  const openLinks = (row: ProjectMilestone) => {
    setLinking(row);
    setLinkOpen(true);
  };

  const reloadLinkingMilestone = React.useCallback(async () => {
    if (!linking) return;
    const res = await pm.timeline.getMilestone(projectId, String(linking.id));
    const fresh = (res as any)?.data ?? (res as any);
    setLinking(fresh as ProjectMilestone);
    // also refresh list so counts match
    await load();
  }, [pm, projectId, linking, load]);

  const searchWorkItems = React.useCallback(
    async (q: string): Promise<WorkItem[]> => {
      const res = await pm.workItems.list({ projectId, q, page: 1, pageSize: 20 } as any);
      const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];
      return items as WorkItem[];
    },
    [pm, projectId]
  );

  return (
    <ProjectShell
      projectId={projectId}
      title="Milestones"
      subtitle="Drag to reorder milestones and link work items."
      pill="Work • Timeline • Milestones"
      actions={
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New milestone
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <ProjectCrumbs
            items={[
              { label: "Work", href: "/portal/work" },
              { label: "Projects", href: "/portal/projects" },
              { label: "Project", href: `/portal/projects/${encodeURIComponent(projectId)}` },
              { label: "Timeline", href: `/portal/projects/${encodeURIComponent(projectId)}/timeline` },
              { label: "Milestones" },
            ]}
          />

          <Link href={`/portal/projects/${encodeURIComponent(projectId)}/timeline`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to roadmap
            </Button>
          </Link>
        </div>

        <ProjectTimelineNav projectId={projectId} />

        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <CardHeader>
            <CardTitle className="text-base">Milestones</CardTitle>
            <CardDescription>Reorder with drag & drop. Save order to persist.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {loading ? (
              <div className="rounded-xl border border-slate-200 p-6 text-sm dark:border-slate-800">Loading…</div>
            ) : milestones.length ? (
              <MilestonesDndTable
                rows={milestones}
                busy={pm.loading}
                onRefresh={load}
                onEdit={openEdit}
                onDelete={async (id) => {
                  await pm.timeline.softDeleteMilestone(projectId, id);
                  await load();
                }}
                onRestore={async (id) => {
                  await pm.timeline.restoreMilestone(projectId, id);
                  await load();
                }}
                onSaveOrder={async (items) => {
                  await pm.timeline.reorderMilestones(projectId, { milestones: items } as any);
                  await load();
                }}
                onOpenLinks={openLinks}
              />
            ) : (
              <div className="rounded-xl border border-slate-200 p-8 dark:border-slate-800">
                <EmptyState
                  title="No milestones yet"
                  description="Create your first milestone and link work items to it."
                  action={
                    <Button onClick={openCreate}>
                      <Plus className="h-4 w-4" />
                      New milestone
                    </Button>
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit */}
        <MilestoneCreateEditDialog
          open={editOpen}
          onOpenChange={(v) => {
            setEditOpen(v);
            if (!v) setEditing(null);
          }}
          mode={editing ? "edit" : "create"}
          milestone={editing}
          busy={pm.loading}
          onSubmit={async (dto) => {
            if (editing) await pm.timeline.updateMilestone(projectId, String(editing.id), dto as any);
            else await pm.timeline.createMilestone(projectId, dto as any);
            await load();
          }}
        />

        {/* Link Work Items */}
        <MilestoneLinkWorkItemsDialog
          open={linkOpen}
          onOpenChange={(v) => {
            setLinkOpen(v);
            if (!v) setLinking(null);
          }}
          projectId={projectId}
          milestone={linking}
          busy={pm.loading}
          searchWorkItems={searchWorkItems}
          attach={async (workItemId) => {
            if (!linking) return;
            await pm.timeline.attachWorkItem(projectId, String(linking.id), { workItemId } as any);
          }}
          detach={async (workItemId) => {
            if (!linking) return;
            await pm.timeline.detachWorkItem(projectId, String(linking.id), workItemId);
          }}
          reloadMilestone={reloadLinkingMilestone}
        />
      </div>
    </ProjectShell>
  );
}
