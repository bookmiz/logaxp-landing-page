"use client";

import * as React from "react";
import { AsyncSelect } from "@/logaxp/components/time-management/pickers/AsyncSelect";
import { timePayrollService } from "@/logaxp/lib/time-management/timePayrollService";
import type { PayPeriod } from "@/logaxp/lib/time-management/timePayroll.types";
import { formatIsoDateTime, shortId } from "@/logaxp/components/time-management/time.ui";

type PickerItem = { id: string; label: string; raw?: PayPeriod };

export async function fetchPayPeriods(q: string): Promise<PickerItem[]> {
  const res = await timePayrollService.payPeriods.list({ page: 1, pageSize: 50 } as any);
  const data: any = (res as any)?.data ?? res;
  const items: PayPeriod[] = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];

  const needle = q.trim().toLowerCase();
  const filtered = !needle
    ? items
    : items.filter((p) => {
        const blob = [p.id, p.status, p.startAt, p.endAt, p.label].filter(Boolean).join(" ").toLowerCase();
        return blob.includes(needle);
      });

  return filtered.map((p) => ({
    id: p.id,
    raw: p,
    label: `${formatIsoDateTime(p.startAt)} → ${formatIsoDateTime(p.endAt)} • ${String(p.status ?? "OPEN")} • ${shortId(
      p.id
    )}`,
  }));
}

export function PayPeriodPicker({
  valueId,
  onPick,
  onChange, // optional backward compat
  allowClear,
  placeholder,
}: {
  valueId: string | null;
  onPick?: (id: string | null) => void;
  onChange?: (pp: PayPeriod | null) => void; // optional compat
  allowClear?: boolean;
  placeholder?: string;
}) {
  return (
    <AsyncSelect
      valueId={valueId}
      valueLabel={valueId ? `PayPeriod ${shortId(valueId)}` : null}
      placeholder={placeholder ?? "Select pay period…"}
      fetcher={fetchPayPeriods}
      onSelect={(it: any) => {
        const id = it?.id ?? null;
        onPick?.(id);
        onChange?.((it?.raw as PayPeriod) ?? (id ? ({ id } as any) : null));
      }}
      allowClear={allowClear}
    />
  );
}