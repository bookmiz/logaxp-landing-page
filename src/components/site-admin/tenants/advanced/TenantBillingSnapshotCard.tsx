"use client";

import * as React from "react";
import {
  CreditCard,
  CalendarClock,
  Receipt,
  AlertTriangle,
  RefreshCcw,
  FileJson,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Badge } from "@/logaxp/components/ui/badge";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Button } from "@/logaxp/components/ui/button";
import { toast } from "@/logaxp/components/ui/toast";
import type { TenantBillingSnapshot } from "./tenant-admin.types";
import { formatDateTime, safePrettyJson } from "./tenant-admin.helpers";

function billingBadgeVariant(status: TenantBillingSnapshot["status"]) {
  switch (status) {
    case "ACTIVE":
    case "TRIALING":
      return "success" as const;
    case "PAST_DUE":
    case "INCOMPLETE":
    case "PAUSED":
      return "warning" as const;
    case "CANCELED":
      return "destructive" as const;
    default:
      return "muted" as const;
  }
}

function formatMoney(currency?: string | null, amount?: number | null) {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "—";

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: (currency || "USD").toUpperCase(),
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${(currency ?? "USD").toUpperCase()} ${amount}`;
  }
}

function getDaysUntil(date?: string | null): number | null {
  if (!date) return null;
  const t = new Date(date).getTime();
  if (Number.isNaN(t)) return null;
  const diff = t - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getStatusHelp(snapshot: TenantBillingSnapshot) {
  const status = snapshot.status;
  if (status === "TRIALING") return "Tenant is on trial period.";
  if (status === "ACTIVE") return "Subscription is active and in good standing.";
  if (status === "PAST_DUE") return "Payment is overdue. Billing attention may be required.";
  if (status === "INCOMPLETE") return "Subscription setup/payment is incomplete.";
  if (status === "PAUSED") return "Subscription is paused.";
  if (status === "CANCELED") return "Subscription has been canceled.";
  return "Billing status available.";
}

export function TenantBillingSnapshotCard({
  snapshot,
  loading,
  onRefresh,
}: {
  snapshot?: TenantBillingSnapshot | null;
  loading?: boolean;
  onRefresh?: () => void | Promise<void>;
}) {
  const [showUsageJson, setShowUsageJson] = React.useState(false);
  const [showMetadataJson, setShowMetadataJson] = React.useState(false);

  const nextBillingDays = React.useMemo(
    () => getDaysUntil(snapshot?.nextBillingAt),
    [snapshot?.nextBillingAt]
  );

  const trialEndsDays = React.useMemo(
    () => getDaysUntil(snapshot?.trialEndsAt),
    [snapshot?.trialEndsAt]
  );

  const providerRefs = React.useMemo(() => {
    const meta = snapshot?.metadata as Record<string, unknown> | undefined;
    if (!meta) return [];

    const candidates = [
      ["customerId", meta["customerId"]],
      ["subscriptionId", meta["subscriptionId"]],
      ["planId", meta["planId"]],
      ["priceId", meta["priceId"]],
      ["invoiceId", meta["invoiceId"]],
      ["paymentIntentId", meta["paymentIntentId"]],
    ] as const;

    return candidates.filter(([, v]) => typeof v === "string" && v.trim().length > 0) as Array<
      readonly [string, string]
    >;
  }, [snapshot?.metadata]);

  const copyValue = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to copy ${label}`);
    }
  };

  if (loading && !snapshot) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing Snapshot
          </CardTitle>
          <CardDescription>Loading billing summary...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-8 w-56 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="h-4 w-28 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-5 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!snapshot) {
    return (
      <EmptyState
        title="No billing snapshot"
        description="Connect billing API endpoints (Stripe/Paystack) and pass a snapshot to display plan health."
        icon={<CreditCard className="h-8 w-8" />}
        action={
          onRefresh ? (
            <Button variant="outline" onClick={() => void onRefresh()} loading={loading}>
              {!loading ? <RefreshCcw className="h-4 w-4" /> : null}
              Refresh
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Billing Snapshot
            </CardTitle>
            <CardDescription>Tenant subscription and payment health overview.</CardDescription>
          </div>

          {onRefresh ? (
            <Button variant="outline" onClick={() => void onRefresh()} loading={loading}>
              {!loading ? <RefreshCcw className="h-4 w-4" /> : null}
              Refresh
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status row */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={billingBadgeVariant(snapshot.status)}>{snapshot.status}</Badge>
          <Badge variant="muted">{snapshot.provider ?? "UNKNOWN_PROVIDER"}</Badge>
          {snapshot.planKey ? <Badge variant="default">{snapshot.planKey}</Badge> : null}
          {snapshot.interval ? <Badge variant="muted">{snapshot.interval}</Badge> : null}
          {snapshot.delinquent ? (
            <Badge variant="warning" className="inline-flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Delinquent
            </Badge>
          ) : null}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {getStatusHelp(snapshot)}
        </div>

        {/* Quick signals */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Plan Amount
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-base font-bold">
              {formatMoney(snapshot.currency, snapshot.amount)}
              {snapshot.interval ? (
                <span className="ml-1 text-sm font-medium text-slate-500">/ {snapshot.interval}</span>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Next Billing</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-1">
              <div className="text-sm">{formatDateTime(snapshot.nextBillingAt)}</div>
              <div className="text-xs text-slate-500">
                {nextBillingDays === null
                  ? "—"
                  : nextBillingDays < 0
                    ? `${Math.abs(nextBillingDays)} day(s) ago`
                    : `in ${nextBillingDays} day(s)`}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Trial Ends</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-1">
              <div className="text-sm">{formatDateTime(snapshot.trialEndsAt)}</div>
              <div className="text-xs text-slate-500">
                {trialEndsDays === null
                  ? "No trial"
                  : trialEndsDays < 0
                    ? `ended ${Math.abs(trialEndsDays)} day(s) ago`
                    : `in ${trialEndsDays} day(s)`}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                Last Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm">{formatDateTime(snapshot.lastPaymentAt)}</CardContent>
          </Card>
        </div>

        {/* Health indicators */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Payment Health
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <Badge variant={billingBadgeVariant(snapshot.status)}>{snapshot.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Delinquent</span>
                <Badge variant={snapshot.delinquent ? "warning" : "success"}>
                  {snapshot.delinquent ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Provider</span>
                <span className="font-medium">{snapshot.provider ?? "—"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                Billing Cycle Timing
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Next billing</span>
                <span className="font-medium">
                  {nextBillingDays === null
                    ? "—"
                    : nextBillingDays < 0
                      ? `${Math.abs(nextBillingDays)}d overdue`
                      : `${nextBillingDays}d`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Trial remaining</span>
                <span className="font-medium">
                  {trialEndsDays === null
                    ? "—"
                    : trialEndsDays < 0
                      ? "Ended"
                      : `${trialEndsDays}d`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Interval</span>
                <span className="font-medium">{snapshot.interval ?? "—"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Provider references (from metadata if present) */}
        {providerRefs.length > 0 ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Provider References</CardTitle>
              <CardDescription>Useful IDs for Stripe/Paystack support/debugging</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {providerRefs.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
                >
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500">{label}</div>
                    <div className="truncate font-mono text-xs sm:text-sm">{value}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void copyValue(value, label)}
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {/* JSON panels */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm">Usage Summary</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUsageJson((p) => !p)}
                >
                  <FileJson className="h-4 w-4" />
                  {showUsageJson ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Hide
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      View
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {showUsageJson ? (
                <pre className="max-h-[280px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900">
                  {safePrettyJson((snapshot.usageSummary ?? {}) as Record<string, unknown>)}
                </pre>
              ) : (
                <div className="text-sm text-slate-500">Expand to view raw usage JSON.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm">Billing Metadata</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMetadataJson((p) => !p)}
                >
                  <FileJson className="h-4 w-4" />
                  {showMetadataJson ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Hide
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      View
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {showMetadataJson ? (
                <pre className="max-h-[280px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900">
                  {safePrettyJson((snapshot.metadata ?? {}) as Record<string, unknown>)}
                </pre>
              ) : (
                <div className="text-sm text-slate-500">Expand to view provider metadata JSON.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}