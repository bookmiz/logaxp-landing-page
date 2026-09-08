"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import type { WeeklyTemplateRules } from "./WeeklyTemplateBuilder";

function countWindows(r: WeeklyTemplateRules) {
  const w = r.week ?? ({} as any);
  return Object.values(w).reduce((s: number, arr: any) => s + (Array.isArray(arr) ? arr.length : 0), 0);
}

export function TemplatePreviewCard({ rules }: { rules: WeeklyTemplateRules }) {
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Preview</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-slate-700 dark:text-slate-200">
        <div>Timezone: <span className="font-medium">{String(rules.timezone ?? "—")}</span></div>
        <div className="mt-1">Total windows: <span className="font-medium">{countWindows(rules)}</span></div>
        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Generation will expand these windows into shifts using assignments and date range.
        </div>
      </CardContent>
    </Card>
  );
}