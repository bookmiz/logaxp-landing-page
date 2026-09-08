"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus, RefreshCcw } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { toast } from "@/logaxp/components/ui/toast";

import { ProjectShell } from "@/logaxp/components/projects/ProjectShell";
import { ProjectCrumbs } from "@/logaxp/components/projects/ProjectCrumbs";
import { normalizeList } from "@/logaxp/components/projects/project.ui";

import type { ProjectMember } from "@/logaxp/lib/project-management/projectManagement.types";

import {
  useAddProjectMember,
  useChangeProjectMemberRole,
  useProjectMembers,
  useRemoveProjectMember,
  useTransferProjectOwner,
} from "@/logaxp/hooks/projects/useProjectMembers";
import { useWorkItems } from "@/logaxp/hooks/work-items/useWorkItems";
import { useTenants } from "@/logaxp/hooks/useTenants";

import { ProjectMembersTable } from "@/logaxp/components/projects/members/ProjectMembersTable";
import { AddProjectMemberDialog } from "@/logaxp/components/projects/members/AddProjectMemberDialog";
import { ChangeMemberRoleDialog } from "@/logaxp/components/projects/members/ChangeMemberRoleDialog";

export default function ProjectMembersPage() {
  const params = useParams<{ id: string }>();
  const projectId = typeof params.id === "string" ? params.id : "";

  const membersQuery = useProjectMembers(projectId);

  const add = useAddProjectMember(projectId);
  const changeRole = useChangeProjectMemberRole(projectId);
  const remove = useRemoveProjectMember(projectId);
  const transferOwner = useTransferProjectOwner(projectId);
  const workItemsQuery = useWorkItems({ projectId, page: 1, pageSize: 500 });
  const { inviteMember } = useTenants();

  const [addOpen, setAddOpen] = React.useState(false);
  const [editMember, setEditMember] = React.useState<ProjectMember | null>(null);
  const [removeMember, setRemoveMember] = React.useState<ProjectMember | null>(null);
  const [transferMember, setTransferMember] = React.useState<ProjectMember | null>(null);

  const { items } = normalizeList<ProjectMember>(membersQuery.data);
  const rows = React.useMemo(() => [...items], [items]);
  const workloadByMembershipId = React.useMemo(() => {
    const workItems = normalizeList<any>(workItemsQuery.data).items;
    return workItems.reduce<Record<string, number>>((acc, item) => {
      if (item.deletedAt || item.completedAt) return acc;
      const membershipId = String(item.assigneeMembershipId ?? "");
      if (!membershipId) return acc;
      acc[membershipId] = (acc[membershipId] ?? 0) + 1;
      return acc;
    }, {});
  }, [workItemsQuery.data]);

  const busy = add.isPending || changeRole.isPending || remove.isPending || transferOwner.isPending;

  return (
    <ProjectShell
      projectId={projectId}
      title="Members"
      subtitle="Manage project membership and roles."
      pill="Work • Project • Members"
      actions={
        <>
          <Button variant="outline" onClick={() => membersQuery.refetch()} disabled={membersQuery.isFetching}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add member
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <ProjectCrumbs
          items={[
            { label: "Work", href: "/portal/work" },
            { label: "Projects", href: "/portal/projects" },
            { label: "Project", href: `/portal/projects/${encodeURIComponent(projectId)}` },
            { label: "Members" },
          ]}
        />

        <div className="flex items-center justify-between">
          <Link href={`/portal/projects/${encodeURIComponent(projectId)}`}>
            <Button variant="outline">Back to overview</Button>
          </Link>
        </div>

        {membersQuery.isLoading ? (
          <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
            Loading members...
          </div>
        ) : membersQuery.isError ? (
          <div className="rounded-2xl border border-slate-200 p-6 text-sm text-red-600 dark:border-slate-800">
            Failed to load members.
          </div>
        ) : rows.length ? (
          <>
            <ProjectMembersTable
              rows={rows}
              busy={busy}
              onChangeRole={(m) => setEditMember(m)}
              onRemove={(m) => setRemoveMember(m)}
              onTransferOwner={(m) => setTransferMember(m)}
              workloadByMembershipId={workloadByMembershipId}
            />

            {/* Minimal inline confirm (can be replaced by your ConfirmDialog reusable later) */}
            {removeMember ? (
              <div className="rounded-2xl border border-slate-200 p-4 text-sm dark:border-slate-800">
                <div className="font-medium text-slate-900 dark:text-slate-50">Remove member?</div>
                <div className="mt-1 text-slate-600 dark:text-slate-300">
                  Membership: <span className="font-mono text-xs">{String(removeMember.membershipId ?? "-")}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" onClick={() => setRemoveMember(null)} disabled={busy}>
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      await remove.mutateAsync({ projectMemberId: removeMember.id });
                      setRemoveMember(null);
                    }}
                    disabled={busy}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            ) : null}

            {transferMember ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100">
                <div className="font-semibold">Transfer project ownership?</div>
                <div className="mt-1">
                  This will make the selected member the project owner and move other owners to admin.
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" onClick={() => setTransferMember(null)} disabled={busy}>
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      await transferOwner.mutateAsync({ projectMemberId: transferMember.id });
                      setTransferMember(null);
                    }}
                    disabled={busy}
                  >
                    Confirm transfer
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
            <EmptyState title="No members yet" description="Add members to grant access to this project." />
          </div>
        )}
      </div>

      <AddProjectMemberDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        busy={add.isPending}
        onSubmit={async (dto) => {
          await add.mutateAsync(dto);
          setAddOpen(false);
        }}
        onInvite={async (dto) => {
          await inviteMember({
            email: dto.email,
            title: dto.title,
            payload: {
              projectId,
              projectRole: dto.role ?? "MEMBER",
              title: dto.title,
            },
          });
          toast.success("Project invite sent");
          setAddOpen(false);
        }}
      />

      <ChangeMemberRoleDialog
        open={Boolean(editMember)}
        onOpenChange={(o) => !o && setEditMember(null)}
        member={editMember}
        busy={changeRole.isPending}
        onSubmit={async (role) => {
          if (!editMember) return;
          await changeRole.mutateAsync({ projectMemberId: editMember.id, dto: { role } as any });
          setEditMember(null);
        }}
      />
    </ProjectShell>
  );
}
