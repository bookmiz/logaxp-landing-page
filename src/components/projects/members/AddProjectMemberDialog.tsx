"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { useTenants } from "@/logaxp/hooks/useTenants";
import type { AddProjectMemberDto, InviteProjectMemberDto } from "@/logaxp/lib/project-management/projectManagement.types";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface Membership {
  id: string;
  user?: {
    profile?: {
      displayName?: string;
      firstName?: string;
      lastName?: string;
    };
    email?: string;
  };
  title?: string;
}

// Match the Prisma enum exactly
type ProjectMemberRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export function AddProjectMemberDialog({
  open,
  onOpenChange,
  busy,
  onSubmit,
  onInvite,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  busy?: boolean;
  onSubmit: (dto: AddProjectMemberDto) => Promise<void> | void;
  onInvite?: (dto: InviteProjectMemberDto) => Promise<void> | void;
}) {
  const [mode, setMode] = React.useState<"existing" | "invite">("existing");
  const [selectedMembershipId, setSelectedMembershipId] = React.useState("");
  const [role, setRole] = React.useState<ProjectMemberRole>("MEMBER");
  const [email, setEmail] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [memberships, setMemberships] = React.useState<Membership[]>([]);
  const [loading, setLoading] = React.useState(false);
  
  const { listMemberships } = useTenants();

  // Fetch available members when dialog opens
  React.useEffect(() => {
    if (!open) return;
    
    const fetchMemberships = async () => {
      setLoading(true);
      try {
        const data = await listMemberships();
        if (Array.isArray(data)) {
          const normalized = data.map((m) => ({
            ...m,
            title: m.title ?? undefined,
          }));
          setMemberships(normalized);
        } else {
          setMemberships([]);
        }
      } catch (error) {
        console.error("Failed to fetch memberships:", error);
        setMemberships([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMemberships();
  }, [open, listMemberships]);

  React.useEffect(() => {
    if (!open) return;
    setSelectedMembershipId("");
    setRole("MEMBER");
    setEmail("");
    setTitle("");
    setMode("existing");
  }, [open]);

  const canSubmit = mode === "existing" ? Boolean(selectedMembershipId) : Boolean(email.trim() && onInvite);
  const isLoading = loading || busy;

  // Helper to get display name for a membership
  const getMemberDisplayName = (membership: Membership): string => {
    if (membership.user?.profile?.displayName) {
      return membership.user.profile.displayName;
    }
    if (membership.user?.profile?.firstName || membership.user?.profile?.lastName) {
      return `${membership.user.profile.firstName || ''} ${membership.user.profile.lastName || ''}`.trim();
    }
    if (membership.user?.email) {
      return membership.user.email;
    }
    return membership.id;
  };

  const handleSubmit = async () => {
    if (mode === "invite") {
      if (!onInvite) return;
      await onInvite({ email: email.trim(), title: title.trim() || undefined, role });
      return;
    }

    await onSubmit({
      membershipId: selectedMembershipId,
      role,
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content
          className={cx(
            "fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl border border-slate-200 bg-white p-4 shadow-xl",
            "dark:border-slate-800 dark:bg-slate-950"
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Add member
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Add an existing tenant member or invite a new person directly into this project.
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900/30"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900/30">
              {(["existing", "invite"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={cx(
                    "rounded-xl px-3 py-2 text-sm font-semibold transition",
                    mode === item
                      ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  )}
                >
                  {item === "existing" ? "Existing member" : "Invite new"}
                </button>
              ))}
            </div>

            {mode === "existing" ? (
            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Select Member
              </div>
              <select
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                value={selectedMembershipId}
                onChange={(e) => setSelectedMembershipId(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Select a member...</option>
                {memberships.map((membership) => (
                  <option key={membership.id} value={membership.id}>
                    {getMemberDisplayName(membership)}
                    {membership.title ? ` (${membership.title})` : ''}
                  </option>
                ))}
              </select>
              {memberships.length === 0 && !loading && (
                <p className="text-xs text-slate-500 mt-1">
                  No members found. Invite members to the tenant first.
                </p>
              )}
              {loading && (
                <p className="text-xs text-slate-500 mt-1">
                  Loading members...
                </p>
              )}
            </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</span>
                  <input
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="person@company.com"
                    type="email"
                    disabled={isLoading}
                  />
                </label>
                <label className="space-y-1 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Project title</span>
                  <input
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. QA Lead"
                    disabled={isLoading}
                  />
                </label>
              </div>
            )}

            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Role</div>
              <select
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                value={role}
                onChange={(e) => setRole(e.target.value as ProjectMemberRole)}
                disabled={isLoading}
              >
                <option value="OWNER">Owner</option>
                <option value="ADMIN">Admin</option>
                <option value="MEMBER">Member</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="outline" disabled={isLoading}>Cancel</Button>
            </Dialog.Close>

            <Button
              disabled={!canSubmit || isLoading}
              onClick={handleSubmit}
            >
              {busy ? "Saving..." : mode === "invite" ? "Send invite" : "Add member"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
