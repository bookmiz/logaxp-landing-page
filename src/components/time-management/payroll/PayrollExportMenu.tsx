"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";

export function PayrollExportMenu({
  disabled,
  busy,
  onExportPage,
  onExportAll,
  hint,
}: {
  disabled?: boolean;
  busy?: boolean;
  onExportPage: () => void | Promise<void>;
  onExportAll: () => void | Promise<void>;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" disabled={disabled || busy} onClick={onExportPage}>
        <Download className="h-4 w-4" />
        Export page
      </Button>
      <Button disabled={disabled || busy} onClick={onExportAll}>
        <Download className="h-4 w-4" />
        Export all
      </Button>
      {hint ? <div className="hidden text-xs text-slate-500 dark:text-slate-400 md:block">{hint}</div> : null}
    </div>
  );
}