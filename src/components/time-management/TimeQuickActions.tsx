"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Clock, FilePlus2, Play } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/logaxp/components/ui/card";


function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

type Props = {
  from: string;
  to: string;
  canClock?: boolean;
  hasOpenClock?: boolean;
};

function dateOnly(v: string) {
  const s = String(v ?? "").trim();
  if (!s) return "";
  // if ISO datetime was passed, keep only YYYY-MM-DD
  return s.includes("T") ? s.slice(0, 10) : s;
}

export function TimeQuickActions({ from, to, canClock = true, hasOpenClock }: Props) {
  const router = useRouter();

  const go = (path: string) => {
    const qs = new URLSearchParams();

    const f = dateOnly(from);
    const t = dateOnly(to);

    if (f) qs.set("from", f);
    if (t) qs.set("to", t);

    router.push(`${path}?${qs.toString()}`);
  };

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>

        </div>
      </CardHeader>

      <CardContent className="flex flex-wrap gap-2">
        <Button
          className={cx("h-9 gap-2 rounded-lg px-3 text-xs")}
          onClick={() => go("/portal/time-attendance/entries")}
          title="Go to Time Entries"
        >
          <span className="inline-flex items-center gap-2">
            <FilePlus2 className="h-4 w-4" />
            Add time
          </span>

        </Button>

        <Button
          variant="outline"
          className={cx("h-9 gap-2 rounded-lg px-3 text-xs")}
          onClick={() => go("/portal/time-attendance/timers")}
          title="Go to Timers"
        >
          <span className="inline-flex items-center gap-2">
            <Play className="h-4 w-4" />
            Start timer
          </span>

        </Button>

        <Button
          variant="outline"
          className={cx("h-9 gap-2 rounded-lg px-3 text-xs")}
          onClick={() => go("/portal/time-attendance/clocks")}
          disabled={!canClock}
          title={!canClock ? "No employee context found for clock actions yet" : "Go to Time Clocks"}
        >
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {hasOpenClock ? "Clock out" : "Clock in"}
          </span>

        </Button>
      </CardContent>
    </Card>
  );
}