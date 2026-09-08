"use client";

import * as React from "react";
import { Search, SlidersHorizontal, RotateCcw } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { Card } from "@/logaxp/components/ui/card";

import { LocationPicker, OrgUnitPicker, EmployeePicker, PickerItem } from "@/logaxp/components/scheduling/SchedulePickers";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export function ShiftsFilters({
  q,
  onQ,
  status,
  onStatus,
  pageSize,
  onPageSize,
  onReset,
  right,
}: {
  q: string;
  onQ: (v: string) => void;

  employeeId: string;
  onEmployeeId: (v: string) => void;

  orgUnitId: string;
  onOrgUnitId: (v: string) => void;

  locationId: string;
  onLocationId: (v: string) => void;

  status: string;
  onStatus: (v: string) => void;

  pageSize: number;
  onPageSize: (v: number) => void;

  onReset: () => void;

  right?: React.ReactNode;
}) {

  const [employee, setEmployee] = React.useState<PickerItem | null>(null);
const [orgUnit, setOrgUnit] = React.useState<PickerItem | null>(null);
const [location, setLocation] = React.useState<PickerItem | null>(null);
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
          <div className="relative w-full md:max-w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              value={q}
              onChange={(e) => onQ(e.target.value)}
              placeholder="Search shifts…"
              className={cx(
                "h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none",
                "focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100",
                "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
              )}
            />
          </div>

          <div className="grid w-full gap-2 md:grid-cols-4 ">
            <EmployeePicker
              valueId={employee?.id ?? null}
              valueLabel={employee?.label ?? null}
              onSelect={setEmployee}
            />

            <OrgUnitPicker
              valueId={orgUnit?.id ?? null}
              valueLabel={orgUnit?.label ?? null}
              onSelect={setOrgUnit}
            />

            <LocationPicker
              valueId={location?.id ?? null}
              valueLabel={location?.label ?? null}
              onSelect={setLocation}
            />
            <select
              value={status}
              onChange={(e) => onStatus(e.target.value)}
              className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            >
              <option value="">Any status</option>
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="CANCELED">CANCELED</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {right}

          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
            <span>Page size</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSize(Number(e.target.value))}
              className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-slate-800 dark:bg-slate-950"
            >
              {[10, 20, 30, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    </Card>
  );
}