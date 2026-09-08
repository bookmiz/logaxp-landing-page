"use client";

import * as React from "react";
import type { ProjectMember } from "@/logaxp/lib/project-management/projectManagement.types";
import { Button } from "@/logaxp/components/ui/button";

export function ProjectMembersTable({
  rows,
  busy,
  onChangeRole,
  onRemove,
  onTransferOwner,
  workloadByMembershipId = {},
}: {
  rows: ProjectMember[];
  busy?: boolean;
  onChangeRole: (m: ProjectMember) => void;
  onRemove: (m: ProjectMember) => void;
  onTransferOwner?: (m: ProjectMember) => void;
  workloadByMembershipId?: Record<string, number>;
}) {
  if (!rows.length) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Member</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Active assignments</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.map((m) => {
              const user = m.membership?.user;
              const profile = user?.profile;
              const displayName =
                profile?.displayName ||
                [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
                user?.email ||
                String(m.membershipId ?? "-");
              const email = user?.email ?? "";
              const workload = workloadByMembershipId[String(m.membershipId ?? "")] ?? 0;

              return (
              <tr key={m.id} className="bg-white dark:bg-slate-950">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900 dark:text-slate-50">{displayName}</div>
                  <div className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {email || String(m.membershipId ?? "-")}
                  </div>
                  {m.membership?.title ? (
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{String(m.membership.title)}</div>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-slate-800 dark:text-slate-100">
                  {String(m.role ?? "-")}
                </td>
                <td className="px-4 py-3 text-slate-800 dark:text-slate-100">
                  {workload}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {onTransferOwner && String(m.role ?? "").toUpperCase() !== "OWNER" ? (
                      <Button variant="outline" disabled={busy} onClick={() => onTransferOwner(m)}>
                        Transfer owner
                      </Button>
                    ) : null}
                    <Button variant="outline" disabled={busy} onClick={() => onChangeRole(m)}>
                      Change role
                    </Button>
                    <Button variant="outline" disabled={busy} onClick={() => onRemove(m)}>
                      Remove
                    </Button>
                  </div>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
