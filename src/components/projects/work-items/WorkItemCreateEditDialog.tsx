"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, User, Calendar, Briefcase, Clock } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import { useProjectMembers } from "@/logaxp/hooks/projects/useProjectMembers";
import type {
  WorkItem,
  CreateWorkItemDto,
  UpdateWorkItemDto,
} from "@/logaxp/lib/project-management/projectManagement.types";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Mode = "create" | "edit";

interface ProjectMember {
  id: string;
  membershipId?: string;
  role?: string;
  membership?: {
    user?: {
      profile?: {
        displayName?: string | null;
        firstName?: string | null;
        lastName?: string | null;
      } | null;
      email?: string;
    } | null;
    title?: string | null;
  } | null;
}

export function WorkItemCreateEditDialog({
  open,
  onOpenChange,
  mode,
  projectId,
  item,
  defaults,
  busy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: Mode;
  projectId: string;
  item?: WorkItem | null;
  defaults?: Partial<CreateWorkItemDto>;
  busy?: boolean;
  onSubmit: (dto: CreateWorkItemDto | UpdateWorkItemDto) => Promise<void> | void;
}) {
  const isEdit = mode === "edit";

  // Form state
  const [title, setTitle] = React.useState(item?.title ?? "");
  const [description, setDescription] = React.useState(String(item?.description ?? ""));
  const [type, setType] = React.useState(String(item?.type ?? "TASK"));
  const [priority, setPriority] = React.useState(String(item?.priority ?? "MEDIUM"));
  const [storyPoints, setStoryPoints] = React.useState(item?.storyPoints?.toString() ?? "");
  const [dueDate, setDueDate] = React.useState(item?.dueAt?.split('T')[0] ?? "");
  
  // Assignment state - only using membershipId (project member)
  const [assigneeMembershipId, setAssigneeMembershipId] = React.useState(item?.assigneeMembershipId ?? "");
  
  // Fetch project members
  const { data: projectMembersData, isLoading: loadingMembers } = useProjectMembers(projectId);

  // Extract project members from response
  const projectMembers = React.useMemo(() => {
    const data = projectMembersData?.data;
    if (Array.isArray(data)) return data;
    if (data && 'items' in data) return data.items;
    return [];
  }, [projectMembersData]);

  // Reset form when dialog closes or item changes
  React.useEffect(() => {
    if (!open) return;
    
    if (isEdit && item) {
      setTitle(item.title ?? "");
      setDescription(String(item.description ?? ""));
      setType(String(item.type ?? "TASK"));
      setPriority(String(item.priority ?? "MEDIUM"));
      setStoryPoints(item.storyPoints?.toString() ?? "");
      setDueDate(item.dueAt?.split('T')[0] ?? "");
      setAssigneeMembershipId(item.assigneeMembershipId ?? "");
    } else {
      // Reset for create mode
      setTitle(defaults?.title ?? "");
      setDescription("");
      setType("TASK");
      setPriority("MEDIUM");
      setStoryPoints("");
      setDueDate("");
      setAssigneeMembershipId(defaults?.assigneeMembershipId ?? "");
    }
  }, [open, item?.id, isEdit, defaults]);

  const canSubmit = Boolean(title.trim());
  const isLoading = busy || loadingMembers;

  // Helper to get display name for project member
  const getProjectMemberDisplayName = (member: ProjectMember): string => {
    if (member.membership?.user?.profile?.displayName) {
      return member.membership.user.profile.displayName;
    }
    if (member.membership?.user?.profile?.firstName || member.membership?.user?.profile?.lastName) {
      return `${member.membership.user.profile.firstName || ''} ${member.membership.user.profile.lastName || ''}`.trim();
    }
    if (member.membership?.user?.email) {
      return member.membership.user.email;
    }
    if (member.membership?.title) {
      return member.membership.title;
    }
    return member.membershipId?.slice(0, 8) ?? 'Unknown';
  };

  const handleSubmit = async () => {
    const baseDto = {
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      priority,
      ...(storyPoints && { storyPoints: Number(storyPoints) }),
      ...(dueDate && { dueAt: new Date(dueDate).toISOString() }),
    };

    if (isEdit) {
      await onSubmit({
        ...baseDto,
        ...(assigneeMembershipId ? { assigneeMembershipId } : {}),
      } satisfies UpdateWorkItemDto);
    } else {
      await onSubmit({
        ...baseDto,
        projectId,
        boardId: defaults?.boardId,
        columnId: defaults?.columnId,
        sprintId: defaults?.sprintId,
        workflowId: defaults?.workflowId,
        statusId: defaults?.statusId,
        ...(assigneeMembershipId ? { assigneeMembershipId } : {}),
      } satisfies CreateWorkItemDto);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" />
        <Dialog.Content
          className={cx(
            "fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2",
            "rounded-xl border border-slate-200 bg-white shadow-lg",
            "dark:border-slate-800 dark:bg-slate-950",
            "max-h-[90vh] overflow-y-auto"
          )}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
            <div>
              <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {isEdit ? "Edit work item" : "Create new work item"}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-slate-500 dark:text-slate-400">
                {isEdit ? "Update the details below" : "Fill in the information to create a new work item"}
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Basic Information</h3>
              
              <Input 
                label="Title" 
                placeholder="e.g. Implement RBAC guard" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required
                className="text-sm"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
                  <select
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="TASK">Task</option>
                    <option value="BUG">Bug</option>
                    <option value="STORY">Story</option>
                    <option value="EPIC">Epic</option>
                    <option value="SUBTASK">Subtask</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Priority</label>
                  <select
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  className={cx(
                    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm",
                    "outline-none focus:ring-2 focus:ring-slate-300",
                    "dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-700",
                    "min-h-[100px] resize-y"
                  )}
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a detailed description..."
                />
              </div>
            </div>

            {/* Planning */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Planning</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Story Points
                    </div>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="e.g. 3"
                    value={storyPoints}
                    onChange={(e) => setStoryPoints(e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Due Date
                    </div>
                  </label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Assignment - Only Project Members */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Assignment</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Assignee (Project Member)
                  </div>
                </label>
                <select
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                  value={assigneeMembershipId}
                  onChange={(e) => setAssigneeMembershipId(e.target.value)}
                  disabled={loadingMembers}
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map((member) => (
                    <option key={member.id} value={member.membershipId}>
                      {getProjectMemberDisplayName(member)}
                      {member.role ? ` (${member.role})` : ''}
                    </option>
                  ))}
                </select>
                {loadingMembers && (
                  <p className="text-xs text-slate-500 mt-1">Loading project members...</p>
                )}
                {projectMembers.length === 0 && !loadingMembers && (
                  <p className="text-xs text-slate-500 mt-1">
                    No members in this project. Add members to the project first.
                  </p>
                )}
              </div>
            </div>

            {/* Context (read-only for create from sprint/board) */}
            {(defaults?.sprintId || defaults?.boardId || defaults?.columnId) && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Context</h3>
                <div className="flex flex-wrap gap-2">
                  {defaults?.sprintId && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <Clock className="h-3 w-3" />
                      Will be added to sprint
                    </span>
                  )}
                  {defaults?.boardId && defaults?.columnId && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Will be placed in column
                    </span>
                  )}
                  {defaults?.boardId && !defaults?.columnId && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Will be added to board backlog
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
            <Dialog.Close asChild>
              <Button 
                variant="outline" 
                disabled={isLoading}
              >
                Cancel
              </Button>
            </Dialog.Close>

            <Button
              disabled={!canSubmit || isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? "Saving..." : isEdit ? "Save changes" : "Create work item"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
