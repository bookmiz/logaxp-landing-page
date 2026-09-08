"use client";

import * as React from "react";
import { 
  Edit, 
  Send, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  RotateCcw,
  MoreHorizontal,
  AlertCircle,
  Ban,
  Clock,
  CheckCheck,
  Receipt,
  Eye
} from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/logaxp/components/ui/dropdown-menu";
import { Badge } from "@/logaxp/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/logaxp/components/ui/tooltip";

import type { ProjectExpense } from "@/logaxp/lib/project-finance/projectFinance.types";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function isStatus(row: ProjectExpense, s: string) {
  return String(row.status ?? "").toUpperCase() === s;
}

function getStatusIcon(status?: string) {
  const s = String(status ?? "").toUpperCase();
  const icons: Record<string, React.ElementType> = {
    DRAFT: Clock,
    SUBMITTED: Send,
    APPROVED: CheckCheck,
    REJECTED: Ban,
    PAID: CheckCircle,
    CANCELED: AlertCircle,
  };
  return icons[s] || Clock;
}

function getStatusColor(status?: string) {
  const s = String(status ?? "").toUpperCase();
  const colors: Record<string, string> = {
    DRAFT: "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800",
    SUBMITTED: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30",
    APPROVED: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30",
    REJECTED: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
    PAID: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
    CANCELED: "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800",
  };
  return colors[s] || colors.DRAFT;
}

export function ExpenseRowActions({
  row,
  busy,
  onEdit,
  onSubmit,
  onApprove,
  onReject,
  onDelete,
  onRestore,
}: {
  row: ProjectExpense;
  busy?: boolean;
  onEdit: () => void;
  onSubmit: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  onRestore: () => void;
}) {
  //const [showActions, setShowActions] = React.useState(false);
  const deleted = Boolean(row.deletedAt);
  const StatusIcon = getStatusIcon(row.status);
  const statusColor = getStatusColor(row.status);

  const canSubmit = !deleted && isStatus(row, "DRAFT");
  const canDecide = !deleted && isStatus(row, "SUBMITTED");
  const canEdit = !deleted;
  const canDelete = !deleted;
  const canRestore = deleted;
  const hasAttachments = (row.attachments?.length ?? 0) > 0;

  // Get action color based on type
  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      submit: "text-amber-600 dark:text-amber-400",
      approve: "text-emerald-600 dark:text-emerald-400",
      reject: "text-red-600 dark:text-red-400",
      delete: "text-red-600 dark:text-red-400",
      restore: "text-blue-600 dark:text-blue-400",
    };
    return colors[action] || "";
  };

  // If deleted, show only restore option with tooltip
  if (deleted) {
    return (
      <div className="flex items-center justify-end gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={onRestore}
                disabled={busy}
                className="h-8 gap-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Restore</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p>Restore this expense</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Status indicator badge */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "mr-1 flex h-7 w-7 items-center justify-center rounded-full",
              statusColor
            )}>
              <StatusIcon className="h-3.5 w-3.5" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <p>Status: {row.status || "DRAFT"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Attachment indicator */}
      {hasAttachments && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="mr-1 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <Receipt className="h-3.5 w-3.5" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p>{row.attachments?.length} attachment(s)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Primary actions - always visible */}
      <div className="flex items-center gap-1">
        {/* Edit button - always visible if not deleted */}
        {canEdit && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onEdit}
                  disabled={busy}
                  className="h-7 w-7 rounded-full p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p>Edit expense</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Submit button - for draft expenses */}
        {canSubmit && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={onSubmit}
                  disabled={busy}
                  className={cn(
                    "h-7 gap-1 bg-gradient-to-r from-amber-600 to-amber-500 px-2 text-xs text-white shadow-sm",
                    "hover:from-amber-500 hover:to-amber-400"
                  )}
                >
                  <Send className="h-3 w-3" />
                  <span>Submit</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p>Submit for approval</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Decision buttons - for submitted expenses */}
        {canDecide && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={onApprove}
                    disabled={busy}
                    className="h-7 gap-1 bg-gradient-to-r from-emerald-600 to-emerald-500 px-2 text-xs text-white shadow-sm hover:from-emerald-500 hover:to-emerald-400"
                  >
                    <CheckCircle className="h-3 w-3" />
                    <span>Approve</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p>Approve this expense</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onReject}
                    disabled={busy}
                    className="h-7 gap-1 border-red-200 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <XCircle className="h-3 w-3" />
                    <span>Reject</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p>Reject with feedback</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
      </div>

      {/* Secondary actions dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 rounded-full p-0 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel className="text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <Receipt className="h-3.5 w-3.5" />
              <span>Expense Actions</span>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {/* View details option */}
          <DropdownMenuItem 
            onClick={onEdit}
            disabled={busy}
            className="cursor-pointer gap-2 text-xs"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>View details</span>
          </DropdownMenuItem>

          {/* Edit option */}
          {canEdit && (
            <DropdownMenuItem 
              onClick={onEdit}
              disabled={busy}
              className="cursor-pointer gap-2 text-xs"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit expense</span>
            </DropdownMenuItem>
          )}

          {/* Status-specific options */}
          {canSubmit && (
            <DropdownMenuItem 
              onClick={onSubmit}
              disabled={busy}
              className={cn("cursor-pointer gap-2 text-xs", getActionColor("submit"))}
            >
              <Send className="h-3.5 w-3.5" />
              <span>Submit for approval</span>
            </DropdownMenuItem>
          )}

          {canDecide && (
            <>
              <DropdownMenuItem 
                onClick={onApprove}
                disabled={busy}
                className={cn("cursor-pointer gap-2 text-xs", getActionColor("approve"))}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Approve expense</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onReject}
                disabled={busy}
                className={cn("cursor-pointer gap-2 text-xs", getActionColor("reject"))}
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Reject expense</span>
              </DropdownMenuItem>
            </>
          )}

          {/* Delete/Restore option */}
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onDelete}
                disabled={busy}
                className="cursor-pointer gap-2 text-xs text-red-600 focus:text-red-600 dark:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete expense</span>
              </DropdownMenuItem>
            </>
          )}

          {canRestore && (
            <DropdownMenuItem 
              onClick={onRestore}
              disabled={busy}
              className="cursor-pointer gap-2 text-xs text-blue-600 focus:text-blue-600 dark:text-blue-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restore expense</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Busy overlay spinner */}
      {busy && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/50 backdrop-blur-[1px] dark:bg-slate-950/50">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      )}
    </div>
  );
}