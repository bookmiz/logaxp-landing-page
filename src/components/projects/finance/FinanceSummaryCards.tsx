"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Badge } from "@/logaxp/components/ui/badge";
import { DollarSign, TrendingDown, TrendingUp, Timer } from "lucide-react";

function fmtMoney(cents: number, currency: string) {
  const v = (cents ?? 0) / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(v);
  } catch {
    return `${currency} ${v.toFixed(2)}`;
  }
}

function fmtMinutes(mins: number) {
  const m = mins ?? 0;
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h <= 0) return `${r}m`;
  return `${h}h ${r}m`;
}

export type FinanceSummary = {
  currency: string;

  approvedBudgetCents: number;
  approvedExpenseCents: number;
  paidExpenseCents: number;

  laborMinutes: number;
  laborCostCents: number | null;

  actualCostCents: number;
  remainingCents: number;
};

type Props = {
  loading?: boolean;
  data: FinanceSummary;
};

export function FinanceSummaryCards({ loading, data }: Props) {
  const currency = data.currency || "USD";

  const cards = [
    {
      title: "Approved Budget",
      icon: DollarSign,
      value: fmtMoney(data.approvedBudgetCents, currency),
      hint: "Total approved budget for this project.",
      badge: "Budget",
    },
    {
      title: "Approved Expenses",
      icon: TrendingUp,
      value: fmtMoney(data.approvedExpenseCents, currency),
      hint: "Approved expenses (not necessarily paid).",
      badge: "Actual",
    },
    {
      title: "Paid Expenses",
      icon: TrendingDown,
      value: fmtMoney(data.paidExpenseCents, currency),
      hint: "Cash-out expenses marked as paid.",
      badge: "Paid",
    },
    {
      title: "Labor Time",
      icon: Timer,
      value: fmtMinutes(data.laborMinutes),
      hint: "Sum of time entries on this project.",
      badge: "Time",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card
            key={c.title}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-sm">{c.title}</CardTitle>
                  <CardDescription className="mt-1 text-xs">{c.hint}</CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="muted" className="rounded-full text-[11px]">
                    {c.badge}
                  </Badge>
                  <div className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/30">
                    <Icon className="h-4 w-4 text-slate-700 dark:text-slate-200" />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">
                {loading ? "…" : c.value}
              </div>

              {/* Remaining hint on Budget card */}
              {c.title === "Approved Budget" ? (
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Remaining:{" "}
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {fmtMoney(data.remainingCents ?? 0, currency)}
                  </span>
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}