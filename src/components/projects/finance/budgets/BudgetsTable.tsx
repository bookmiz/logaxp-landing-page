"use client";

import * as React from "react";
import { Badge } from "@/logaxp/components/ui/badge";
import { 
  FolderOpen, 
  Tag, 
  Calendar,
  CheckCircle2,
  XCircle,
  Ban,
  Clock,
  DraftingCompass,
  Archive,
  Target
} from "lucide-react";
import type { ProjectBudget } from "@/logaxp/lib/project-finance/projectFinance.types";
import { BudgetRowActions } from "./BudgetRowActions";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function fmtMoney(cents: number, currency: string) {
  const v = (cents ?? 0) / 100;
  try {
    return new Intl.NumberFormat(undefined, { 
      style: "currency", 
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(v);
  } catch {
    return `${currency} ${v.toFixed(2)}`;
  }
}

function getStatusConfig(status?: string) {
  const s = String(status ?? "DRAFT").toUpperCase();
  
  const config: Record<string, {
    label: string;
    className: string;
    icon: React.ElementType;
  }> = {
    DRAFT: {
      label: "Draft",
      className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      icon: DraftingCompass
    },
    SUBMITTED: {
      label: "Submitted",
      className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
      icon: Clock
    },
    APPROVED: {
      label: "Approved",
      className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
      icon: CheckCircle2
    },
    REJECTED: {
      label: "Rejected",
      className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
      icon: XCircle
    },
    ARCHIVED: {
      label: "Archived",
      className: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
      icon: Archive
    },
  };
  
  return config[s] ?? config.DRAFT;
}

export type BudgetsTableProps = {
  rows: ProjectBudget[];
  onEdit: (row: ProjectBudget) => void;
  onSubmit: (row: ProjectBudget) => void;
  onApprove: (row: ProjectBudget) => void;
  onReject: (row: ProjectBudget) => void;
  onDelete: (row: ProjectBudget) => void;
  onRestore: (row: ProjectBudget) => void;
  busy?: boolean;
};

export function BudgetsTable({
  rows,
  onEdit,
  onSubmit,
  onApprove,
  onReject,
  onDelete,
  onRestore,
  busy,
}: BudgetsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/50">
              <th className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-slate-400" />
                  Budget Details
                </div>
              </th>
              <th className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-slate-400" />
                  Status
                </div>
              </th>
              <th className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-slate-400" />
                  Planned
                </div>
              </th>
              <th className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-400" />
                  Approved
                </div>
              </th>
              <th className="w-[100px] px-5 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((r) => {
              const currency = r.currency ?? "USD";
              const planned = fmtMoney(r.plannedAmountCents ?? 0, currency);
              const approved = r.approvedAmountCents != null 
                ? fmtMoney(r.approvedAmountCents, currency) 
                : null;
              const deleted = Boolean(r.deletedAt);
              const statusConfig = getStatusConfig(r.status);
              const StatusIcon = statusConfig.icon;

              return (
                <tr
                  key={r.id}
                  className={cn(
                    "group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/20",
                    deleted && "bg-slate-50/30 dark:bg-slate-900/10"
                  )}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        <FolderOpen className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {r.name}
                          </span>
                          {deleted && (
                            <Badge variant="outline" className="border-slate-200 bg-slate-100 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                              Deleted
                            </Badge>
                          )}
                        </div>
                        {r.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                            {r.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 font-medium",
                        statusConfig.className
                      )}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusConfig.label}
                    </Badge>
                  </td>

                  <td className="px-5 py-4">
                    <div>
                      <span className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
                        {planned}
                      </span>
                      {r.plannedAmountCents === 0 && (
                        <span className="ml-2 text-xs text-slate-400">(Zero)</span>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    {approved ? (
                      <div>
                        <span className="font-mono text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          {approved}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400 dark:text-slate-500">—</span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end">
                      <BudgetRowActions
                        row={r}
                        busy={busy}
                        onEdit={() => onEdit(r)}
                        onSubmit={() => onSubmit(r)}
                        onApprove={() => onApprove(r)}
                        onReject={() => onReject(r)}
                        onDelete={() => onDelete(r)}
                        onRestore={() => onRestore(r)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}

            {!rows.length && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-800">
                      <FolderOpen className="h-6 w-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        No budgets found
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Get started by creating your first budget.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with summary */}
      {rows.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/20">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Showing {rows.length} budget{rows.length !== 1 ? 's' : ''}</span>
            <div className="flex items-center gap-4">
              <span>Total Planned: {fmtMoney(
                rows.reduce((sum, r) => sum + (r.plannedAmountCents ?? 0), 0),
                rows[0]?.currency ?? "USD"
              )}</span>
              <span>Total Approved: {fmtMoney(
                rows.reduce((sum, r) => sum + (r.approvedAmountCents ?? 0), 0),
                rows[0]?.currency ?? "USD"
              )}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}