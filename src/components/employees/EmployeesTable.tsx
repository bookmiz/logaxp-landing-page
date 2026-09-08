"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Pencil,
  Trash2,
  RotateCcw,
  ShieldCheck,
  MoreHorizontal,
  Loader2,
} from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { PermissionGate } from "@/logaxp/components/auth/PermissionGate";
import { StatusBadge } from "@/logaxp/components/ui/status-badge";
import { EmploymentTypeBadge } from "@/logaxp/components/ui/employment-type-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper,
} from "@/logaxp/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/logaxp/components/ui/dropdown-menu";

import type { EmployeeListItem } from "@/logaxp/lib/employee-management/employee-management.types";
import { cn, fullName, getPrimaryAssignment, getPrimaryAssignmentLabel, safeIso } from "./employees.utils";

export function EmployeesTable({
  rows,
  busyAny,
  busyEmployeeId,
  busyAction,
  page,
  totalPages,
  total,
  onPrev,
  onNext,
  onOpenStatus,
  onOpenDelete,
  onOpenRestore,
}: {
  rows: EmployeeListItem[];
  busyAny: boolean;
  busyEmployeeId: string | null;
  busyAction: "refresh" | "delete" | "restore" | "status" | null;
  page: number;
  totalPages: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onOpenStatus: (emp: EmployeeListItem) => void;
  onOpenDelete: (emp: EmployeeListItem) => void;
  onOpenRestore: (emp: EmployeeListItem) => void;
}) {
  const router = useRouter();

  const rowBusy = (id: string) => busyEmployeeId === id;

  return (
    <>
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
        <div>
          Showing <span className="font-semibold">{rows.length}</span> of{" "}
          <span className="font-semibold">{total}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={busyAny || page <= 1} onClick={onPrev}>
            Prev
          </Button>
          <Badge variant="muted" className="h-8 px-3">
            Page {page} / {Math.max(1, totalPages)}
          </Badge>
          <Button variant="outline" size="sm" disabled={busyAny || page >= totalPages} onClick={onNext}>
            Next
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white dark:border-slate-800 dark:bg-slate-950">
        <TableWrapper>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Employment</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((emp) => {
                const busy = rowBusy(emp.id);
                const deleted = Boolean((emp as any)?.deletedAt);
                const employeeNumber = (emp as any)?.employeeNumber ? String((emp as any).employeeNumber) : null;
                const primary = getPrimaryAssignment(emp);

                return (
                  <TableRow
                    key={emp.id}
                    className={cn(
                      "hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors",
                      deleted && "opacity-70 bg-slate-50/40 dark:bg-slate-900/30"
                    )}
                  >
                    <TableCell className="min-w-[220px]">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{fullName(emp)}</div>
                        <div className="text-xs text-slate-500 truncate">
                          {employeeNumber ? `#${employeeNumber}` : "No employee #"}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={(emp as any)?.status} deleted={deleted} />
                    </TableCell>

                    <TableCell>
                      <EmploymentTypeBadge type={(emp as any)?.employmentType} />
                    </TableCell>

                    <TableCell className="max-w-[220px] truncate">
                      {(emp as any)?.workEmail ?? (emp as any)?.personalEmail ?? "—"}
                    </TableCell>

                    <TableCell className="max-w-[280px]">
                      <div className="truncate text-sm">{getPrimaryAssignmentLabel(primary)}</div>
                    </TableCell>

                    <TableCell>{safeIso(((emp as any)?.updatedAt ?? (emp as any)?.createdAt) as any)}</TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild disabled={busyAny}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            disabled={busy}
                          >
                            {busy ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                            <span className="sr-only">Open row actions</span>
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => router.push(`/portal/employees/${emp.id}`)}
                            disabled={busyAny}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View details
                          </DropdownMenuItem>

                          <PermissionGate permission="employee.write">
                            <DropdownMenuItem
                              onClick={() => router.push(`/portal/employees/${emp.id}/edit`)}
                              disabled={busyAny}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>

                            {!deleted && (
                              <DropdownMenuItem
                                onClick={() => onOpenStatus(emp)}
                                disabled={busyAny}
                              >
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Change status
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            {deleted ? (
                              <DropdownMenuItem
                                onClick={() => onOpenRestore(emp)}
                                disabled={busyAny}
                                className="text-emerald-600 focus:text-emerald-700 dark:text-emerald-400 dark:focus:text-emerald-300"
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Restore
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => onOpenDelete(emp)}
                                disabled={busyAny}
                                className="text-red-600 focus:text-red-700 dark:text-red-400 dark:focus:text-red-300"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </PermissionGate>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableWrapper>
      </div>
    </>
  );
}