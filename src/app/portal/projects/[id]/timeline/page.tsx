// src/app/portal/projects/[id]/timeline/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, CalendarDays, Filter, Plus, Route } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";

import { ProjectShell } from "@/logaxp/components/projects/ProjectShell";
import { ProjectCrumbs } from "@/logaxp/components/projects/ProjectCrumbs";

import { ProjectTimelineNav } from "@/logaxp/components/projects/timeline/ProjectTimelineNav";
import { MilestonesTable } from "@/logaxp/components/projects/timeline/milestones/MilestonesTable";
import { MilestoneCreateEditDialog } from "@/logaxp/components/projects/timeline/milestones/MilestoneCreateEditDialog";
import { EventsTable } from "@/logaxp/components/projects/timeline/events/EventsTable";
import { EventCreateEditDialog } from "@/logaxp/components/projects/timeline/events/EventCreateEditDialog";

import type {
  ProjectMilestone,
  ProjectTimelineEvent,
  RoadmapResponse,
} from "@/logaxp/lib/project-management/projectManagement.types";
import { useProjectManagement } from "@/logaxp/hooks/useProjectManagement";

function formatDate(value: unknown) {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
}

export default function ProjectTimelinePage() {
  const { id: projectId } = useParams<{ id: string }>();

  const pm = useProjectManagement();
  const pmRef = React.useRef(pm);

  const [milestones, setMilestones] = React.useState<ProjectMilestone[]>([]);
  const [events, setEvents] = React.useState<ProjectTimelineEvent[]>([]);
  const [roadmap, setRoadmap] = React.useState<RoadmapResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<"all" | "upcoming" | "overdue">("all");

  // ✅ required state + dialogs
  const [milestoneOpen, setMilestoneOpen] = React.useState(false);
  const [editingMilestone, setEditingMilestone] = React.useState<any>(null);

  const [eventOpen, setEventOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<any>(null);

  React.useEffect(() => {
  pmRef.current = pm;
}, [pm]);

const load = React.useCallback(async () => {
  setLoading(true);
  try {
    const roadmapRes = await pmRef.current.timeline.roadmap(projectId, {
      includeDeleted: true,
      includeSprints: true,
      includeDueWorkItems: true,
      upcomingDays: 14,
    } as any);

    const data = (roadmapRes as any)?.data ?? roadmapRes;
    const mItems = data?.milestones ?? [];
    const eItems = data?.events ?? [];

    setRoadmap(data);
    setMilestones(mItems);
    setEvents(eItems);
  } finally {
    setLoading(false);
  }
}, [projectId]);

React.useEffect(() => {
  load();
}, [load]);

  const visibleMilestones = React.useMemo(() => {
    if (filter === "overdue") return milestones.filter((item) => item.isOverdue);
    if (filter === "upcoming") return milestones.filter((item) => item.isUpcoming);
    return milestones;
  }, [filter, milestones]);

  const visibleEvents = React.useMemo(() => {
    if (filter === "overdue") return events.filter((item) => item.isOverdue);
    if (filter === "upcoming") return events.filter((item) => item.isUpcoming);
    return events;
  }, [filter, events]);

  const overdueCount = milestones.filter((item) => item.isOverdue).length + events.filter((item) => item.isOverdue).length;
  const upcomingCount = milestones.filter((item) => item.isUpcoming).length + events.filter((item) => item.isUpcoming).length;

  return (
    <ProjectShell
      projectId={projectId}
      title="Timeline"
      subtitle="Roadmap milestones + timeline events in one place."
      pill="Work • Timeline"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <ProjectCrumbs
            items={[
              { label: "Work", href: "/portal/work" },
              { label: "Projects", href: "/portal/projects" },
              { label: "Project", href: `/portal/projects/${encodeURIComponent(projectId)}` },
              { label: "Timeline" },
            ]}
          />

          <Link href={`/portal/projects/${encodeURIComponent(projectId)}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to project
            </Button>
          </Link>
        </div>

        {/* ✅ new nav */}
        <ProjectTimelineNav projectId={projectId} />

        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="p-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <CalendarDays className="h-4 w-4 text-[#5E8500]" />
                    Project window
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                    {formatDate(roadmap?.projectWindow?.startDate)} → {formatDate(roadmap?.projectWindow?.targetDate)}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Overdue
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{overdueCount}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Route className="h-4 w-4 text-[#5E8500]" />
                    Upcoming
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{upcomingCount}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <Filter className="h-4 w-4" />
                  View
                </span>
                {(["all", "upcoming", "overdue"] as const).map((value) => (
                  <Button
                    key={value}
                    type="button"
                    size="sm"
                    variant={filter === value ? "default" : "outline"}
                    onClick={() => setFilter(value)}
                  >
                    {value === "all" ? "All" : value === "upcoming" ? "Upcoming" : "Overdue"}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ✅ two cards replaced with tables */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">Milestones</CardTitle>
                <CardDescription>Ordered milestones with optional work item links.</CardDescription>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  setEditingMilestone(null);
                  setMilestoneOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                New
              </Button>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="rounded-xl border border-slate-200 p-6 text-sm dark:border-slate-800">Loading…</div>
              ) : visibleMilestones.length ? (
                <MilestonesTable
                  rows={visibleMilestones}
                  busy={pm.loading}
                  onRefresh={load}
                  onEdit={(row) => {
                    setEditingMilestone(row);
                    setMilestoneOpen(true);
                  }}
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
                />
              ) : (
                <div className="rounded-xl border border-slate-200 p-8 dark:border-slate-800">
                  <EmptyState
                    title="No milestones yet"
                    description="Create an ordered milestone list for your roadmap."
                    action={
                      <Button
                        onClick={() => {
                          setEditingMilestone(null);
                          setMilestoneOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        New milestone
                      </Button>
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">Events</CardTitle>
                <CardDescription>Timeline events: launches, reviews, workshops, etc.</CardDescription>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  setEditingEvent(null);
                  setEventOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                New
              </Button>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="rounded-xl border border-slate-200 p-6 text-sm dark:border-slate-800">Loading…</div>
              ) : visibleEvents.length ? (
                <EventsTable
                  rows={visibleEvents}
                  busy={pm.loading}
                  onRefresh={load}
                  onEdit={(row) => {
                    setEditingEvent(row);
                    setEventOpen(true);
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
                    description="Create events like releases, reviews, workshops, and key meetings."
                    action={
                      <Button
                        onClick={() => {
                          setEditingEvent(null);
                          setEventOpen(true);
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
        </div>

        {/* ✅ dialogs (before end of page) */}
        <MilestoneCreateEditDialog
          open={milestoneOpen}
          onOpenChange={(v) => {
            setMilestoneOpen(v);
            if (!v) setEditingMilestone(null);
          }}
          mode={editingMilestone ? "edit" : "create"}
          milestone={editingMilestone}
          busy={pm.loading}
          onSubmit={async (dto) => {
            if (editingMilestone) {
              await pm.timeline.updateMilestone(projectId, String(editingMilestone.id), dto as any);
            } else {
              await pm.timeline.createMilestone(projectId, dto as any);
            }
            await load();
          }}
        />

        <EventCreateEditDialog
          open={eventOpen}
          onOpenChange={(v) => {
            setEventOpen(v);
            if (!v) setEditingEvent(null);
          }}
          mode={editingEvent ? "edit" : "create"}
          event={editingEvent}
          busy={pm.loading}
          onSubmit={async (dto) => {
            if (editingEvent) {
              await pm.timeline.updateEvent(projectId, String(editingEvent.id), dto as any);
            } else {
              await pm.timeline.createEvent(projectId, dto as any);
            }
            await load();
          }}
        />
      </div>
    </ProjectShell>
  );
}
