"use client";

import * as React from "react";
import { Card, CardContent } from "@/logaxp/components/ui/card";

export function PayrollRunHeaderCard({
  left,
  right,
}: {
  left: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <CardContent className="p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>{left}</div>
          <div className="md:text-right">{right}</div>
        </div>
      </CardContent>
    </Card>
  );
}