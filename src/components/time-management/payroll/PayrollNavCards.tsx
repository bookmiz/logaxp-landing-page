"use client";

import * as React from "react";
import Link from "next/link";
import { Settings, Timer, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/logaxp/components/ui/card";

function Tile({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string;
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href} className="group block">
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-800 group-hover:border-emerald-200 group-hover:bg-emerald-50 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-200">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-medium text-slate-900 dark:text-slate-50">{title}</div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{desc}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function PayrollNavCards() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Tile
        href="/portal/time/payroll/timesheets"
        icon={CreditCard}
        title="Timesheets"
        desc="Submit, review, approve, audit."
      />
      <Tile
        href="/portal/time/payroll/overtime"
        icon={Timer}
        title="Overtime"
        desc="Policy + calculator for payroll."
      />
      <Tile
        href="/portal/time/payroll/settings"
        icon={Settings}
        title="Time Settings"
        desc="Rounding, week start, break defaults."
      />
      <Tile
        href="/portal/time/payroll/pay-periods"
        icon={CreditCard} // or Calendar icon if you prefer
        title="Pay Periods"
        desc="Generate, lock, unlock boundaries."
        />
    </div>
  );
}