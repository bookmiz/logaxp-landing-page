"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Badge } from "@/logaxp/components/ui/badge";
import type { ApiResponse, ListData, TimeEntriesDailySummaryRow } from "@/logaxp/lib/time-management/timeManagement.types";
import { unwrapApi, normalizeTimeList, formatMinutes } from "@/logaxp/components/time-management/time.ui";

function pickDate(r: TimeEntriesDailySummaryRow): string {
  return String(r.date ?? r.day ?? "");
}

export function TimeEntryDailySummaryCard({
  summary,
  loading,
}: {
  summary?: ApiResponse<ListData<TimeEntriesDailySummaryRow>> | null;
  loading?: boolean;
}) {
  const raw = unwrapApi(summary as any);
  const { items } = normalizeTimeList<TimeEntriesDailySummaryRow>(raw as any);

  const rows = [...items].sort((a, b) => pickDate(a).localeCompare(pickDate(b)));

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
            Daily Summary
          </CardTitle>
          <Badge variant="muted" className="rounded-full">
            Day
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 space-y-2">
            <div className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          </div>
        ) : rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-600 dark:bg-slate-900/30 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-right font-medium">Hours</th>
                  <th className="px-4 py-3 text-right font-medium">Entries</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((r, idx) => {
                  const mins = Number(r.totalMinutes ?? 0);
                  const count = Number(r.count ?? 0);
                  const date = pickDate(r) || `Row ${idx + 1}`;
                  return (
                    <tr key={`${date}-${idx}`} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/20">
                      <td className="px-4 py-3 text-slate-900 dark:text-slate-50">{date}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-50">
                        {formatMinutes(mins)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">
                        {count}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 text-sm text-slate-600 dark:text-slate-300">
            No daily summary data for this range.
          </div>
        )}
      </CardContent>
    </Card>
  );
}