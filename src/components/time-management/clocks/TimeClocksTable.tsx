"use client";

import Link from "next/link";
import * as React from "react";
import { 
  ArrowRight, 
  Clock3, 
  Coffee, 
  Eye, 
  User2, 
  Calendar,
  Timer,
  PlayCircle,
  StopCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  UserCircle2
} from "lucide-react";

import { Badge } from "@/logaxp/components/ui/badge";
import type { TimeClock, ListMeta } from "@/logaxp/lib/time-management/timeManagement.types";
import { formatIsoDateTime, shortId } from "@/logaxp/components/time-management/time.ui";
import { computeClockDurationMinutes } from "./clock.utils";
import { TimeClockRowActions } from "./TimeClockRowActions";

function Pagination({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  pageSize: number;
  total?: number;
  onPage: (p: number) => void;
}) {
  const totalPages = total ? Math.max(1, Math.ceil(total / pageSize)) : undefined;

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Showing <span className="font-medium text-slate-900 dark:text-slate-200">{(page - 1) * pageSize + 1}</span> to{' '}
        <span className="font-medium text-slate-900 dark:text-slate-200">
          {Math.min(page * pageSize, total || page * pageSize)}
        </span>{' '}
        of <span className="font-medium text-slate-900 dark:text-slate-200">{total || page * pageSize}</span> results
      </div>

      <div className="flex items-center gap-2">
        <button
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100"
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <button
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100"
          onClick={() => onPage(page + 1)}
          disabled={totalPages ? page >= totalPages : false}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function getEmployeeName(row: TimeClock) {
  const employee = (row as any)?.employee;
  if (!employee) return shortId(row.employeeId);
  const full = [employee.firstName, employee.middleName, employee.lastName].filter(Boolean).join(" ").trim();
  return full || employee.preferredName || shortId(row.employeeId);
}

function getEmployeeSub(row: TimeClock) {
  const employee = (row as any)?.employee;
  if (!employee) return shortId(row.employeeId);
  return employee.employeeNumber || employee.workEmail || employee.personalEmail || shortId(row.employeeId);
}

export function TimeClocksTable({
  rows,
  meta,
  page,
  pageSize,
  onPage,
  busy,
  onClockOut,
  onAddBreak,
  onSetBreak,
  onAdjust,
  detailBaseHref = "/portal/time-attendance/clocks",
}: {
  rows: TimeClock[];
  meta?: ListMeta;
  page: number;
  pageSize: number;
  onPage: (p: number) => void;
  busy?: boolean;

  onClockOut: (row: TimeClock) => void;
  onAddBreak: (row: TimeClock) => void;
  onSetBreak: (row: TimeClock) => void;
  onAdjust: (row: TimeClock) => void;

  detailBaseHref?: string;
}) {
  const total = typeof meta?.total === "number" ? meta.total : rows.length;

  const openClocks = rows.filter(r => !r.clockOutAt).length;
  const closedClocks = rows.length - openClocks;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Time Clocks
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Track and manage employee time entries
          </p>
        </div>
        
        {/* Summary Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950/30">
            <PlayCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              {openClocks} Active
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
            <StopCircle className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {closedClocks} Closed
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        {/* Table Header with Meta */}
        <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Total tracked: {rows.reduce((acc, r) => acc + (computeClockDurationMinutes(
                    r.clockInAt ?? null, 
                    r.clockOutAt ?? null, 
                    r.breakMinutes ?? 0
                  ) ?? 0), 0)} minutes
                </span>
              </div>
            </div>
            <Badge variant="outline" className="rounded-full">
              {rows.length} records
            </Badge>
          </div>
        </div>

        {/* Top Pagination */}
        <div className="border-b border-slate-200 px-6 py-3 dark:border-slate-800">
          <Pagination page={page} pageSize={pageSize} total={total} onPage={onPage} />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs dark:border-slate-800 dark:bg-slate-900/40">
                <th className="px-6 py-4 text-left font-medium text-slate-600 dark:text-slate-400">Employee</th>
                <th className="px-6 py-4 text-left font-medium text-slate-600 dark:text-slate-400">Status</th>
                <th className="px-6 py-4 text-left font-medium text-slate-600 dark:text-slate-400">Time Details</th>
                <th className="px-6 py-4 text-right font-medium text-slate-600 dark:text-slate-400">Break</th>
                <th className="px-6 py-4 text-right font-medium text-slate-600 dark:text-slate-400">Net Time</th>
                <th className="px-6 py-4 text-right font-medium text-slate-600 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {rows.map((r) => {
                const isOpen = !r.clockOutAt;
                const net = computeClockDurationMinutes(
                  r.clockInAt ?? null, 
                  r.clockOutAt ?? null, 
                  r.breakMinutes ?? 0
                ) ?? 0;

                const hours = Math.floor(net / 60);
                const minutes = net % 60;
                const formattedNet = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

                return (
                  <tr 
                    key={r.id} 
                    className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                  >
                    {/* Employee Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <UserCircle2 className="h-6 w-6" />
                          </div>
                          {isOpen && (
                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-50">
                            {getEmployeeName(r)}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {getEmployeeSub(r)}
                          </div>
                          <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            ID: {shortId(r.id)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <Badge 
                          className={`
                            rounded-full px-3 py-1 font-medium
                            ${isOpen 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }
                          `}
                        >
                          <span className="flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                            {isOpen ? 'Active' : (r.status || 'Completed')}
                          </span>
                        </Badge>
                        <div className="text-xs text-slate-500">
                          {isOpen ? 'Currently on shift' : 'Shift ended'}
                        </div>
                      </div>
                    </td>

                    {/* Time Details Column */}
                    <td className="px-6 py-4">
                      <div className="space-y-3">
                        {/* Clock In */}
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30">
                            <PlayCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Clock In</div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                              {formatIsoDateTime(r.clockInAt ?? null)}
                            </div>
                          </div>
                        </div>

                        {/* Clock Out (if exists) */}
                        {r.clockOutAt && (
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                              <StopCircle className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">Clock Out</div>
                              <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                                {formatIsoDateTime(r.clockOutAt)}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Active indicator for open clocks */}
                        {isOpen && (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                            </span>
                            Clocking in progress
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Break Column */}
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2 dark:bg-slate-900">
                        <Coffee className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        <span className="font-medium text-slate-900 dark:text-slate-50">
                          {r.breakMinutes || 0}m
                        </span>
                      </div>
                    </td>

                    {/* Net Time Column */}
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 dark:bg-emerald-950/30">
                        <Timer className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-medium text-emerald-700 dark:text-emerald-300">
                          {formattedNet}
                        </span>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`${detailBaseHref}/${encodeURIComponent(r.id)}`}
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                        >
                          <Eye className="h-4 w-4" />
                          Details
                        </Link>

                        <TimeClockRowActions
                          row={r}
                          busy={busy}
                          onClockOut={onClockOut}
                          onAddBreak={onAddBreak}
                          onSetBreak={onSetBreak}
                          onAdjust={onAdjust}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination */}
        <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <Pagination page={page} pageSize={pageSize} total={total} onPage={onPage} />
        </div>

        {/* Empty State (if no rows) */}
        {rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
              <Clock3 className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-50">No time clocks found</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Get started by creating your first time clock entry
            </p>
          </div>
        )}
      </div>
    </div>
  );
}