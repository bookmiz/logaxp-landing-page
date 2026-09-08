"use client";

import * as React from "react";
import Link from "next/link";
import { TimeBanner } from "@/logaxp/components/time-management/feedback/TimeBanner";
import type { PayPeriod } from "@/logaxp/lib/time-management/timePayroll.types";
import { overlaps } from "@/logaxp/lib/time-management/timePayroll.types";
import { formatIsoDateTime, shortId } from "@/logaxp/components/time-management/time.ui";

export function PayPeriodLockBanner({
  employeeId,
  rangeFromIso,
  rangeToIso,
  payPeriods,
}: {
  employeeId: string | null | undefined;
  rangeFromIso: string | null | undefined;
  rangeToIso: string | null | undefined;
  payPeriods: PayPeriod[];
}) {
  if (!employeeId || !rangeFromIso || !rangeToIso) return null;

  const locked = payPeriods.filter((p) => {
    const isLocked = String(p.status).toUpperCase() === "LOCKED" || Boolean(p.lockedAt);
    if (!isLocked) return false;
    return overlaps(rangeFromIso, rangeToIso, p.startAt, p.endAt);
    // note: backend enforces exact lock rules; this is UX guidance
  });

  if (!locked.length) return null;

  return (
    <TimeBanner tone="warning" title="Pay period is locked">
      Edits may be blocked for employee <span className="font-medium">{shortId(employeeId)}</span> because the selected range overlaps locked pay
      period(s):{" "}
      <span className="font-medium">
        {locked.slice(0, 2).map((p, i) => (
          <span key={p.id}>
            {i ? ", " : ""}
            {formatIsoDateTime(p.startAt)} → {formatIsoDateTime(p.endAt)}
          </span>
        ))}
        {locked.length > 2 ? ` +${locked.length - 2} more` : ""}
      </span>
      .{" "}
      <Link className="underline underline-offset-2" href="/portal/time/payroll/pay-periods">
        View pay periods
      </Link>
      .
    </TimeBanner>
  );
}