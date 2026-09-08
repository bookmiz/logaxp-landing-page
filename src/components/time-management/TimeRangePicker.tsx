"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

type Props = {
  from: string;
  to: string;
  onChange: (next: { from: string; to: string }) => void;
  onLast7?: () => void;
  onLast30?: () => void;
  onThisMonth?: () => void;
  compact?: boolean;
};

export function TimeRangePicker({
  from,
  to,
  onChange,
  onLast7,
  onLast30,
  onThisMonth,
  compact,
}: Props) {
  return (
    <div className={cx("flex flex-wrap items-center gap-2", compact && "gap-1.5")}>
      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <Calendar className="h-4 w-4 text-slate-500" />
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => onChange({ from: e.target.value, to })}
            className="bg-transparent text-xs text-slate-700 outline-none dark:text-slate-200"
          />
          <span className="text-slate-400">→</span>
          <input
            type="date"
            value={to}
            onChange={(e) => onChange({ from, to: e.target.value })}
            className="bg-transparent text-xs text-slate-700 outline-none dark:text-slate-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onLast7} disabled={!onLast7}>
          Last 7d
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onLast30} disabled={!onLast30}>
          Last 30d
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onThisMonth} disabled={!onThisMonth}>
          This month
        </Button>
      </div>
    </div>
  );
}