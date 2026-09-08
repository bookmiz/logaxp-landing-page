"use client";

import * as React from "react";
import { Badge } from "@/logaxp/components/ui/badge";
import { 
  FileText, 
  Calendar, 
  Tag, 
  Paperclip,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  DraftingCompass
} from "lucide-react";
import type { ProjectExpense } from "@/logaxp/lib/project-finance/projectFinance.types";
import { ExpenseRowActions } from "./ExpenseRowActions";

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
    PAID: {
      label: "Paid",
      className: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
      icon: CheckCircle2
    },
    CANCELED: {
      label: "Canceled",
      className: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
      icon: Ban
    },
  };
  
  return config[s] ?? config.DRAFT;
}

export function ExpensesTable({
  rows,
  busy,
  onEdit,
  onSubmit,
  onApprove,
  onReject,
  onDelete,
  onRestore,
}: {
  rows: ProjectExpense[];
  busy?: boolean;
  onEdit: (row: ProjectExpense) => void;
  onSubmit: (row: ProjectExpense) => void;
  onApprove: (row: ProjectExpense) => void;
  onReject: (row: ProjectExpense) => void;
  onDelete: (row: ProjectExpense) => void;
  onRestore: (row: ProjectExpense) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/50">
              <th className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  Expense Details
                </div>
              </th>
              <th className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-slate-400" />
                  Status
                </div>
              </th>
              <th className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Amount</th>
              <th className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  Date Spent
                </div>
              </th>
              <th className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Attachments</th>
              <th className="w-[100px] px-5 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((r) => {
              const currency = r.currency ?? "USD";
              const amount = fmtMoney(r.amountCents ?? 0, currency);
              const spentDate = r.spentAt ? new Date(r.spentAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : "—";
              const deleted = Boolean(r.deletedAt);
              const attachmentCount = (r.attachments ?? []).length;
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
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {r.title}
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
                    <span className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
                      {amount}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {spentDate}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    {attachmentCount > 0 ? (
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                        <Paperclip className="h-4 w-4 text-slate-400" />
                        <span>{attachmentCount} file{attachmentCount !== 1 ? 's' : ''}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400 dark:text-slate-500">—</span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end">
                      <ExpenseRowActions
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
                <td colSpan={6} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-800">
                      <FileText className="h-6 w-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        No expenses found
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Get started by creating your first expense.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Optional: Add footer with summary */}
      {rows.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/20">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Showing {rows.length} expense{rows.length !== 1 ? 's' : ''}</span>
            <span>Total: {fmtMoney(
              rows.reduce((sum, r) => sum + (r.amountCents ?? 0), 0),
              rows[0]?.currency ?? "USD"
            )}</span>
          </div>
        </div>
      )}
    </div>
  );
}