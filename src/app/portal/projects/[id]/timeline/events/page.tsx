// src/app/portal/projects/[id]/timeline/events/page.tsx
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
import { EventsTable } from "@/logaxp/components/projects/timeline/events/EventsTable";
import { EventCreateEditDialog } from "@/logaxp/components/projects/timeline/events/EventCreateEditDialog";

import type { ProjectTimelineEvent } from "@/logaxp/lib/project-management/projectManagement.types";
import { useProjectManagement } from "@/logaxp/hooks/useProjectManagement";

export default function ProjectEventsPage() {
  const { id: projectId } = useParams<{ id: string }>();

  const pm = useProjectManagement();
  const pmRef = React.useRef(pm);

  const [events, setEvents] = React.useState<ProjectTimelineEvent[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ProjectTimelineEvent | null>(null);

React.useEffect(() => {
  pmRef.current = pm;
}, [pm]);

const load = React.useCallback(async () => {
  setLoading(true);
  try {
    const res = await pmRef.current.timeline.listEvents(projectId);
    const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];
    setEvents(items as ProjectTimelineEvent[]);
  } finally {
    setLoading(false);
  }
}, [projectId]);

React.useEffect(() => {
  load();
}, [load]);

  return (
    <ProjectShell
      projectId={projectId}
      title="Events"
      subtitle="Manage project events across the timeline."
      pill="Work • Timeline • Events"
      actions={
        <Button
          onClick={() => {
            setEditing(null);
            setEditOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          New event
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
              { label: "Events" },
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
            <CardTitle className="text-base">Events</CardTitle>
            <CardDescription>Track key moments like reviews, releases, meetings.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {loading ? (
              <div className="rounded-xl border border-slate-200 p-6 text-sm dark:border-slate-800">Loading…</div>
            ) : events.length ? (
              <EventsTable
                rows={events}
                busy={pm.loading}
                onRefresh={load}
                onEdit={(row) => {
                  setEditing(row);
                  setEditOpen(true);
                }}
                onDelete={async (id) => {
                  await pm.timeline.softDeleteEvent(projectId, id);
                  await load();
                }}
                onRestore={async (id) => {
                  await pm.timeline.restoreEvent(projectId, id);
                  await load();
                }}
              />
            ) : (
              <div className="rounded-xl border border-slate-200 p-8 dark:border-slate-800">
                <EmptyState
                  title="No events yet"
                  description="Create an event like a release, review, or workshop."
                  action={
                    <Button
                      onClick={() => {
                        setEditing(null);
                        setEditOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      New event
                    </Button>
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>

        <EventCreateEditDialog
          open={editOpen}
          onOpenChange={(v) => {
            setEditOpen(v);
            if (!v) setEditing(null);
          }}
          mode={editing ? "edit" : "create"}
          event={editing}
          busy={pm.loading}
          onSubmit={async (dto) => {
            if (editing) await pm.timeline.updateEvent(projectId, String(editing.id), dto as any);
            else await pm.timeline.createEvent(projectId, dto as any);
            await load();
          }}
        />
      </div>
    </ProjectShell>
  );
}
