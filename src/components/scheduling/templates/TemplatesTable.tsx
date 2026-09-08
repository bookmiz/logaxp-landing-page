"use client";

import * as React from "react";
import { 
  Pencil, 
  Trash2, 
  Copy, 
  Check 
} from "lucide-react";

import { Badge } from "@/logaxp/components/ui/badge";
import { Button } from "@/logaxp/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/logaxp/components/ui/tooltip";
import type { ScheduleTemplate } from "@/logaxp/lib/scheduling/scheduleManagement.types";

// Small reusable copy button with tooltip & feedback
function IdCopyButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {copied ? "Copied!" : "Copy ID"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface TemplatesTableProps {
  rows: ScheduleTemplate[];
  busy?: boolean;
  onEdit: (template: ScheduleTemplate) => void;
  onDelete: (template: ScheduleTemplate) => void;
}

export function TemplatesTable({
  rows,
  busy = false,
  onEdit,
  onDelete,
}: TemplatesTableProps) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-12 text-center dark:border-slate-700 dark:bg-slate-900/30">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          No schedule templates found
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Create your first template to get started
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
          <thead>
            <tr className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-600 dark:bg-slate-900/50 dark:text-slate-400">
              <th scope="col" className="px-5 py-3.5 text-left font-semibold">
                Template
              </th>
              <th scope="col" className="px-5 py-3.5 text-left font-semibold">
                Type
              </th>
              <th scope="col" className="px-5 py-3.5 text-left font-semibold">
                Status
              </th>
              <th scope="col" className="px-5 py-3.5 text-right font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((template) => (
              <tr
                key={template.id}
                className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
              >
                {/* Name + ID */}
                <td className="whitespace-nowrap px-5 py-4">
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {template.name}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono">{template.id.slice(0, 8)}…</span>
                    <IdCopyButton value={template.id} />
                  </div>
                </td>

                {/* Type */}
                <td className="whitespace-nowrap px-5 py-4 text-slate-700 dark:text-slate-300">
                  {template.type === "WEEKLY" ? "Weekly" : "Rotating"}
                </td>

                {/* Status */}
                <td className="whitespace-nowrap px-5 py-4">
                  {template.isActive ? (
                    <Badge
                      variant="outline"
                      className="border-emerald-200 bg-emerald-50/80 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-slate-200 bg-slate-100/80 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300"
                    >
                      Inactive
                    </Badge>
                  )}
                </td>

                {/* Actions */}
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                            onClick={() => onEdit(template)}
                            disabled={busy}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Edit template</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                            onClick={() => onDelete(template)}
                            disabled={busy}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Delete template</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}