"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/logaxp/components/ui/button";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { ProjectShell } from "@/logaxp/components/projects/ProjectShell";
import { ProjectCrumbs } from "@/logaxp/components/projects/ProjectCrumbs";
import { useWorkItem } from "@/logaxp/hooks/work-items/useWorkItem";
import { useWorkItemActivity } from "@/logaxp/hooks/work-items/useWorkItemActivity";
import { useAddWorkItemComment } from "@/logaxp/hooks/work-items/useWorkItemMutations";
import { TypeBadge } from "@/logaxp/components/projects/work-items/TypeBadge";
import { PriorityPill } from "@/logaxp/components/projects/work-items/PriorityPill";
import { normalizeProjectId, withProjectId } from "@/logaxp/lib/project-management/projectContext";

function formatDate(value: unknown) {
  if (!value) return "-";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function DetailTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{value || "-"}</div>
    </div>
  );
}

export default function WorkItemDetailPage() {
  const sp = useSearchParams();
  const projectIdFromUrl = normalizeProjectId(sp.get("projectId"));

  const { id } = useParams<{ id: string }>(); // ✅ reads /portal/work-items/[id]

  const q = useWorkItem(id);
  const item = q.data?.data;
  const projectId = projectIdFromUrl || normalizeProjectId(item?.projectId);
  const activityQ = useWorkItemActivity(item?.id ?? id);
  const addComment = useAddWorkItemComment();
  const [comment, setComment] = React.useState("");

  const workKey = String((item as any)?.issueKey ?? (item as any)?.key ?? item?.id ?? id);
  const labels = Array.isArray((item as any)?.labels) ? ((item as any).labels as any[]) : [];
  const comments = Array.isArray((item as any)?.comments) ? ((item as any).comments as any[]) : [];
  const relations = [
    ...(Array.isArray((item as any)?.relationsFrom) ? ((item as any).relationsFrom as any[]) : []),
    ...(Array.isArray((item as any)?.relationsTo) ? ((item as any).relationsTo as any[]) : []),
  ];
  const attachments = Array.isArray((item as any)?.attachments) ? ((item as any).attachments as any[]) : [];
  const activity = Array.isArray(activityQ.data?.data) ? activityQ.data.data : [];
  const backHref = item?.boardId
    ? withProjectId(`/portal/boards/${encodeURIComponent(String(item.boardId))}`, projectId)
    : item?.sprintId
    ? withProjectId(`/portal/sprints/${encodeURIComponent(String(item.sprintId))}`, projectId)
    : withProjectId("/portal/work-items", projectId);

  return (
    <ProjectShell
      projectId={projectId}
      title={item?.title ? String(item.title) : "Work Item"}
      subtitle="Details, planning links, comments, labels, relations, and activity."
      pill="Work • Work Item"
      actions={
        projectId ? (
          <Link href={backHref}>
            <Button variant="outline">Back</Button>
          </Link>
        ) : null
      }
    >
      <ProjectCrumbs
        items={[
          { label: "Work", href: "/portal/work" },
          projectId
            ? { label: "Work Items", href: withProjectId("/portal/work-items", projectId) }
            : { label: "Work Items", href: "/portal/work-items" },
          item?.boardId && projectId
            ? { label: "Board", href: withProjectId(`/portal/boards/${encodeURIComponent(String(item.boardId))}`, projectId) }
            : null,
          item?.sprintId && projectId
            ? { label: "Sprint", href: withProjectId(`/portal/sprints/${encodeURIComponent(String(item.sprintId))}`, projectId) }
            : null,
          { label: workKey ? workKey : (id ? id.slice(0, 8) : "...") },
        ].filter(Boolean) as any}
      />

      <div className="mt-4">
        {q.isLoading ? (
          <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
            Loading...
          </div>
        ) : q.isError || !item ? (
          <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
            <EmptyState title="Not found" description="This work item may not exist or you don't have access." />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex flex-wrap items-center gap-2">
                <TypeBadge type={String(item.type ?? "")} />
                <PriorityPill priority={String(item.priority ?? "")} />
                <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  {workKey}
                </span>
                {(item as any).status?.name ? (
                  <span className="rounded-full bg-[#86BF00]/15 px-3 py-1 text-xs font-semibold text-[#5E8500] dark:text-[#9DDB1B]">
                    {String((item as any).status.name)}
                  </span>
                ) : null}
              </div>

              <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">
                {item.description ? String(item.description) : "No description."}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <DetailTile label="Board" value={(item as any).board?.name ? String((item as any).board.name) : item.boardId ? String(item.boardId).slice(0, 10) : "Unassigned"} />
              <DetailTile label="Sprint" value={(item as any).sprint?.name ? String((item as any).sprint.name) : item.sprintId ? String(item.sprintId).slice(0, 10) : "Backlog"} />
              <DetailTile label="Due date" value={formatDate(item.dueAt)} />
              <DetailTile label="Estimate" value={item.storyPoints != null ? `${String(item.storyPoints)} pts` : "Not estimated"} />
              <DetailTile label="Assignee" value={item.assigneeMembershipId ? String(item.assigneeMembershipId).slice(0, 10) : "Unassigned"} />
              <DetailTile label="Reporter" value={item.reporterMembershipId ? String(item.reporterMembershipId).slice(0, 10) : "Not set"} />
              <DetailTile label="Created" value={formatDate(item.createdAt)} />
              <DetailTile label="Updated" value={formatDate(item.updatedAt)} />
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-5">
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-slate-950 dark:text-white">Comments</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Keep decisions and follow-up notes attached to the work item.</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">{comments.length}</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {comments.length ? (
                      comments.map((c) => (
                        <div key={String(c.id)} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
                          <div className="text-sm text-slate-700 dark:text-slate-200">{String(c.body ?? "")}</div>
                          <div className="mt-2 text-xs text-slate-400">{formatDate(c.createdAt)}</div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        No comments yet.
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <textarea
                      className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-100/10"
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <Button
                      disabled={addComment.isPending || !comment.trim()}
                      onClick={async () => {
                        await addComment.mutateAsync({ workItemId: item.id, body: comment.trim() });
                        setComment("");
                        q.refetch();
                        activityQ.refetch();
                      }}
                    >
                      Add comment
                    </Button>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                  <h2 className="text-base font-semibold text-slate-950 dark:text-white">Activity</h2>
                  <div className="mt-4 space-y-3">
                    {activity.length ? (
                      activity.slice(0, 12).map((event) => (
                        <div key={String(event.id)} className="flex gap-3 rounded-2xl border border-slate-200 p-3 text-sm dark:border-slate-800">
                          <div className="mt-1 h-2 w-2 rounded-full bg-[#86BF00]" />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {String(event.action ?? "UPDATE")} {String(event.entityType ?? "WorkItem")}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{formatDate(event.createdAt)}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        No activity captured yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                  <h2 className="text-base font-semibold text-slate-950 dark:text-white">Labels</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {labels.length ? (
                      labels.map((entry) => (
                        <span key={String(entry.id ?? entry.labelId)} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300">
                          {String(entry.label?.name ?? entry.labelId ?? "Label")}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500 dark:text-slate-400">No labels.</span>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                  <h2 className="text-base font-semibold text-slate-950 dark:text-white">Relations</h2>
                  <div className="mt-3 space-y-2">
                    {relations.length ? (
                      relations.map((rel) => {
                        const other = rel.to ?? rel.from ?? {};
                        return (
                          <div key={String(rel.id)} className="rounded-2xl border border-slate-200 p-3 text-sm dark:border-slate-800">
                            <div className="font-semibold text-slate-900 dark:text-white">{String(rel.type ?? "RELATED")}</div>
                            <div className="mt-1 text-slate-500 dark:text-slate-400">{String(other.issueKey ?? other.title ?? rel.toId ?? rel.fromId)}</div>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-sm text-slate-500 dark:text-slate-400">No relations.</span>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                  <h2 className="text-base font-semibold text-slate-950 dark:text-white">Attachments</h2>
                  <div className="mt-3 space-y-2">
                    {attachments.length ? (
                      attachments.map((attachment) => (
                        <div key={String(attachment.id)} className="rounded-2xl border border-slate-200 p-3 text-sm dark:border-slate-800">
                          File {String(attachment.fileId ?? attachment.id).slice(0, 12)}
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500 dark:text-slate-400">No attachments.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProjectShell>
  );
}
