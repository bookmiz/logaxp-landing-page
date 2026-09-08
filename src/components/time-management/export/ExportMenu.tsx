"use client";

import * as React from "react";
import { Download, ChevronDown } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

type Props = {
  disabled?: boolean;
  busy?: boolean;

  onExportPage: () => void | Promise<void>;
  onExportAll: () => void | Promise<void>;

  label?: string;
  hint?: string;
};

export function ExportMenu({
  disabled,
  busy,
  onExportPage,
  onExportAll,
  label = "Export",
  hint,
}: Props) {
  return (
    <details className="relative">
      <summary
        className={cx(
          "list-none",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <Button variant="outline" disabled={disabled || busy}>
          <Download className={cx("h-4 w-4", busy && "animate-pulse")} />
          {label}
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </summary>

      <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950 z-50">
        <button
          type="button"
          onClick={() => onExportPage()}
          className="w-full px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-900"
          disabled={busy}
        >
          Export current page
        </button>
        <button
          type="button"
          onClick={() => onExportAll()}
          className="w-full px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-900"
          disabled={busy}
        >
          Export all (range)
        </button>
        {hint ? (
          <div className="border-t border-slate-100 px-3 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
            {hint}
          </div>
        ) : null}
      </div>
    </details>
  );
}