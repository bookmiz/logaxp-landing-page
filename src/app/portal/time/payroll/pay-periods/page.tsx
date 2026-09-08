"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, RefreshCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";

import { TimeShell } from "@/logaxp/components/time-management/TimeShell";
import { TimeHeroCard } from "@/logaxp/components/time-management/TimeHeroCard";
import { TimeBanner } from "@/logaxp/components/time-management/feedback/TimeBanner";
import { useTimeToast } from "@/logaxp/components/time-management/feedback/useTimeToast";

import { PayPeriodFilters } from "@/logaxp/components/time-management/payroll/PayPeriodFilters";
import { PayPeriodsTable } from "@/logaxp/components/time-management/payroll/PayPeriodsTable";
import { GeneratePayPeriodsDialog } from "@/logaxp/components/time-management/payroll/GeneratePayPeriodsDialog";

import {
  usePayPeriods,
  useGeneratePayPeriods,
  useLockPayPeriod,
  useUnlockPayPeriod,
} from "@/logaxp/hooks/time-management/useTimePayroll";
import type { PayPeriod } from "@/logaxp/lib/time-management/timePayroll.types";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}
function numFromQs(v: string | null, def: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
}

export default function PortalPayPeriodsPage() {
  const qc = useQueryClient();
  const { toast } = useTimeToast();

  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // URL filters
  const q0 = sp.get("q") ?? "";
  const status0 = sp.get("status") ?? "";
  const page0 = numFromQs(sp.get("page"), 1);
  const pageSize0 = numFromQs(sp.get("pageSize"), 20);

  const [q, setQ] = React.useState(q0);
  const [status, setStatus] = React.useState(status0);
  const [page, setPage] = React.useState(page0);
  const [pageSize, setPageSize] = React.useState(pageSize0);

  React.useEffect(() => {
    const next = new URLSearchParams(sp.toString());
    const setOrDel = (k: string, v: string) => (v ? next.set(k, v) : next.delete(k));

    setOrDel("q", q.trim());
    setOrDel("status", status.trim());
    next.set("page", String(page));
    next.set("pageSize", String(pageSize));

    const nextQs = next.toString();
    if (nextQs !== sp.toString()) router.replace(`${pathname}?${nextQs}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, page, pageSize]);

  React.useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, pageSize]);

  const listQ = usePayPeriods({ page, pageSize, status: (status || undefined) as any });

  // keep your current parsing (safe for both array + {items,total} envelopes)
  const data = listQ.data?.data as any;
  const items: PayPeriod[] = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  const total: number | undefined = (data?.total as any) ?? undefined;

  // local search
  const rows = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    const base = [...items].sort((a, b) => String(b.startAt ?? "").localeCompare(String(a.startAt ?? "")));
    if (!needle) return base;
    return base.filter((pp) => {
      const blob = [pp.id, pp.label, pp.status, pp.frequency, pp.startAt, pp.endAt]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(needle);
    });
  }, [items, q]);

  const genM = useGeneratePayPeriods();
  const lockM = useLockPayPeriod();
  const unlockM = useUnlockPayPeriod();

  const busy = listQ.isFetching || genM.isPending || lockM.isPending || unlockM.isPending;

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["pay-periods"] });
    await qc.invalidateQueries({ queryKey: ["timesheets"] });
    await qc.invalidateQueries({ queryKey: ["time"] as any }); // ✅ parity with your other page (if you use this key)
  };

  const [genOpen, setGenOpen] = React.useState(false);

  const reset = () => {
    setQ("");
    setStatus("");
    setPageSize(20);
  };

  const confirmOrThrow = async (msg: string) => {
    // ✅ works even if you don't have ConfirmDialog yet
    const ok = window.confirm(msg);
    if (!ok) throw new Error("cancelled");
  };

  return (
    <TimeShell
      title="Pay Periods"
      subtitle="Generate, lock, and manage payroll periods — enterprise-grade governance."
      pill="Time • Payroll • Pay Periods"
      actions={
        <>
          <Button variant="outline" onClick={refresh} disabled={busy}>
            <RefreshCcw className={cn("h-4 w-4", busy && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={() => setGenOpen(true)} disabled={busy}>
            <Plus className="h-4 w-4" />
            Generate
          </Button>
        </>
      }
      requiredAnyCapabilities={["portal.time"]}
    >
      <div className="space-y-5">
        <TimeHeroCard
          title="Pay Periods"
          description="Control payroll boundaries: locking enforces immutability for entries/clocks in that period."
        />

        <TimeBanner tone="info" title="Enterprise behavior">
          Locked pay periods prevent edits to Time Entries and Time Clocks within the period (unless admin override).
          Timesheet approval adds an additional lock layer.
        </TimeBanner>

        <PayPeriodFilters
          q={q}
          onQ={setQ}
          status={status}
          onStatus={setStatus}
          pageSize={pageSize}
          onPageSize={setPageSize}
          onReset={reset}
          right={
            <span>
              Showing <span className="font-medium">{rows.length}</span> items
              {typeof total === "number" ? (
                <>
                  {" "}
                  • Total <span className="font-medium">{total}</span>
                </>
              ) : null}
            </span>
          }
        />

        {listQ.isLoading ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-slate-600 dark:text-slate-300">Loading pay periods…</CardContent>
          </Card>
        ) : listQ.isError ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-red-600 dark:text-red-300">Failed to load pay periods.</CardContent>
          </Card>
        ) : rows.length ? (
          <PayPeriodsTable
            rows={rows}
            total={total}
            page={page}
            pageSize={pageSize}
            onPage={setPage}
            busy={busy}
            onLock={async (id) => {
              try {
                await confirmOrThrow("Lock this pay period? This will prevent edits inside the period.");
                await lockM.mutateAsync(id);
                toast({ tone: "success", title: "Pay period locked" });
                await refresh();
              } catch (e) {
                if ((e as any)?.message !== "cancelled") {
                  toast({ tone: "error", title: "Failed to lock pay period" });
                }
              }
            }}
            onUnlock={async (id) => {
              try {
                await confirmOrThrow("Unlock this pay period? This re-enables edits inside the period.");
                await unlockM.mutateAsync(id);
                toast({ tone: "success", title: "Pay period unlocked" });
                await refresh();
              } catch (e) {
                if ((e as any)?.message !== "cancelled") {
                  toast({ tone: "error", title: "Failed to unlock pay period" });
                }
              }
            }}
          />
        ) : (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6">
              <EmptyState
                title="No pay periods yet"
                description="Generate pay periods to activate payroll governance."
                action={
                  <Button onClick={() => setGenOpen(true)} disabled={busy}>
                    <Plus className="h-4 w-4" />
                    Generate pay periods
                  </Button>
                }
              />
            </CardContent>
          </Card>
        )}

        <GeneratePayPeriodsDialog
          open={genOpen}
          onOpenChange={setGenOpen}
          busy={genM.isPending}
          onGenerate={async (dto) => {
            try {
              await genM.mutateAsync(dto as any);
              toast({ tone: "success", title: "Pay periods generated" });
              await refresh();
            } catch {
              toast({ tone: "error", title: "Failed to generate pay periods" });
            }
          }}
        />
      </div>
    </TimeShell>
  );
}