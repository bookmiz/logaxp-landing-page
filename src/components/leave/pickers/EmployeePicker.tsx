"use client";

import * as React from "react";
import { AsyncSelect } from "@/logaxp/components/time-management/pickers/AsyncSelect";
import { pickerService } from "@/logaxp/lib/pickers/pickerService";

const PAGE_SIZE = 20;

export const fetchEmployees = (q: string) =>
  pickerService.employees({ q, page: 1, pageSize: PAGE_SIZE });

export function LeaveEmployeePicker({
  valueId,
  valueLabel,
  onPick,
  allowClear = true,
  placeholder = "Select employee…",
}: {
  valueId: string | null;
  valueLabel: string | null;
  onPick: (id: string | null) => void;
  allowClear?: boolean;
  placeholder?: string;
}) {
  return (
    <AsyncSelect
      valueId={valueId}
      valueLabel={valueLabel}
      placeholder={placeholder}
      fetcher={fetchEmployees}
      onSelect={(it) => onPick(it?.id ?? null)}
      allowClear={allowClear}
    />
  );
}