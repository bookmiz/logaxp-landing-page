"use client";

// src/components/leave/LeaveTable.tsx
import * as React from "react";
import {
  MoreHorizontal,
  Copy,
  Pencil,
  XCircle,
  CheckCircle2,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import type { LeaveRequest } from "@/logaxp/lib/leave/leave.types";
import {
  formatIsoDate,
  shortId,
  leaveEmployeeLabel,
  isCancelable,
  isDecidable,
  isRestorable,
} from "@/logaxp/lib/leave/leave.types";

import { LeaveStatusBadge } from "./LeaveStatusBadge";
import { LeaveTypeBadge } from "./LeaveTypeBadge";
import { cn } from "@/logaxp/lib/cn";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/logaxp/components/ui/dropdown-menu";
import { Button } from "@/logaxp/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/logaxp/components/ui/tooltip";
import { Input } from "@/logaxp/components/ui/input";

function CopyMini({ value }: { value: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex h-5 w-5 items-center justify-center rounded-md text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(value);
              } catch {}
            }}
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Copy ID</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function Pagination({
  page,
  pageSize,
  total,
  onPage,
  busy,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
  busy?: boolean;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span>–
        <span className="font-medium">{Math.min(page * pageSize, total)}</span> of{" "}
        <span className="font-medium">{total}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={busy || !canPrev}
          onClick={() => canPrev && onPage(page - 1)}
          className="h-9 w-9 p-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">Page</span>
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={page}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 1 && val <= totalPages) onPage(val);
            }}
            className="h-9 w-16 text-center"
            disabled={busy}
          />
          <span className="text-sm text-slate-600 dark:text-slate-400">of {totalPages}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={busy || !canNext}
          onClick={() => canNext && onPage(page + 1)}
          className="h-9 w-9 p-0"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

export function LeaveTable({
  rows,
  meta,
  busy = false,
  canWrite,
  canApprove,
  canAdmin,
  onPage,
  onView,
  onEdit,
  onCancel,
  onApprove,
  onReject,
  onRestore,
}: {
  rows: LeaveRequest[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
  busy?: boolean;
  canWrite: boolean;
  canApprove: boolean;
  canAdmin: boolean;
  onPage: (p: number) => void;
  onView: (row: LeaveRequest) => void;
  onEdit: (row: LeaveRequest) => void;
  onCancel: (row: LeaveRequest) => void;
  onApprove: (row: LeaveRequest) => void;
  onReject: (row: LeaveRequest) => void;
  onRestore: (row: LeaveRequest) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-950">
      {/* Pagination - Top */}
      <Pagination page={meta.page} pageSize={meta.pageSize} total={meta.total} onPage={onPage} busy={busy} />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="sticky top-0 z-10 bg-gradient-to-b from-slate-50 to-slate-100 text-xs font-medium text-slate-700 dark:from-slate-900 dark:to-slate-950 dark:text-slate-300">
            <tr>
              <th className="w-40 px-5 py-4 text-left whitespace-nowrap">Request</th>
              <th className="px-5 py-4 text-left whitespace-nowrap">Employee</th>
              <th className="w-32 px-5 py-4 text-left whitespace-nowrap">Type</th>
              <th className="w-44 px-5 py-4 text-left whitespace-nowrap">Dates</th>
              <th className="w-36 px-5 py-4 text-left whitespace-nowrap">Status</th>
              <th className="w-56 px-5 py-4 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {busy ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="px-5 py-5"><div className="h-5 w-24 bg-slate-200 rounded dark:bg-slate-700"></div></td>
                  <td className="px-5 py-5"><div className="h-5 w-40 bg-slate-200 rounded dark:bg-slate-700"></div></td>
                  <td className="px-5 py-5"><div className="h-5 w-20 bg-slate-200 rounded dark:bg-slate-700"></div></td>
                  <td className="px-5 py-5"><div className="h-5 w-32 bg-slate-200 rounded dark:bg-slate-700"></div></td>
                  <td className="px-5 py-5"><div className="h-5 w-24 bg-slate-200 rounded dark:bg-slate-700"></div></td>
                  <td className="px-5 py-5"><div className="h-8 w-40 bg-slate-200 rounded dark:bg-slate-700 ml-auto"></div></td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-500 dark:text-slate-400">
                  No leave requests found
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const id = String(r.id);
                const cancelOk = canWrite && isCancelable(r.status);
                const decideOk = canApprove && isDecidable(r.status);
                const restoreOk = canAdmin && isRestorable(r.status);

                return (
                  <tr
                    key={id}
                    className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Sticky first column */}
                    <td className="sticky left-0 z-0 bg-white px-5 py-5 group-hover:bg-slate-50/80 dark:bg-slate-950 dark:group-hover:bg-slate-800/40">
                      <div className="flex items-center gap-2">
                        <div className="font-mono font-medium text-slate-900 dark:text-slate-100">
                          {shortId(id, 10)}
                        </div>
                        <CopyMini value={id} />
                      </div>
                      {r.reason && (
                        <div className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400 max-w-[180px]">
                          {r.reason}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-5">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {leaveEmployeeLabel(r.employee)}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        ID: {shortId(r.employeeId)}
                      </div>
                    </td>

                    <td className="px-5 py-5">
                      <LeaveTypeBadge type={r.type as any} />
                    </td>

                    <td className="px-5 py-5 text-slate-700 dark:text-slate-300">
                      <div>{formatIsoDate(r.startDate)}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        → {formatIsoDate(r.endDate)}
                      </div>
                    </td>

                    <td className="px-5 py-5">
                      <LeaveStatusBadge status={r.status as any} />
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex items-center justify-end gap-3">
                        {/* Primary View button - always visible */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onView(r)}
                                disabled={busy}
                                className="h-9 px-3 gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="hidden sm:inline">View</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View details</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Dropdown for secondary actions */}
                        {(cancelOk || decideOk || restoreOk || (canWrite && isDecidable(r.status))) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                disabled={busy}
                              >
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {canWrite && isDecidable(r.status) && (
                                <DropdownMenuItem
                                  onClick={() => onEdit(r)}
                                  className="gap-2 text-emerald-700 dark:text-emerald-400"
                                >
                                  <Pencil className="h-4 w-4" />
                                  Edit Request
                                </DropdownMenuItem>
                              )}

                              {cancelOk && (
                                <DropdownMenuItem
                                  onClick={() => onCancel(r)}
                                  className="gap-2 text-rose-700 dark:text-rose-400"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Cancel Request
                                </DropdownMenuItem>
                              )}

                              {decideOk && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => onApprove(r)}
                                    className="gap-2 text-emerald-700 dark:text-emerald-400"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Approve
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => onReject(r)}
                                    className="gap-2 text-rose-700 dark:text-rose-400"
                                  >
                                    <XCircle className="h-4 w-4" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}

                              {restoreOk && (
                                <DropdownMenuItem
                                  onClick={() => onRestore(r)}
                                  className="gap-2 text-amber-700 dark:text-amber-400"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                  Restore Request
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - Bottom */}
      <Pagination page={meta.page} pageSize={meta.pageSize} total={meta.total} onPage={onPage} busy={busy} />
    </div>
  );
}