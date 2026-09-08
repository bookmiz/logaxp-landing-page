"use client";

import * as React from "react";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { TimeFiltersBar } from "@/logaxp/components/time-management/TimeFiltersBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/logaxp/components/ui/select";

import {
  EmployeePicker,
  LocationPicker,
  type PickerItem,
} from "@/logaxp/components/scheduling/SchedulePickers";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export type ClockScope = "workspace" | "me";

type Props = {
  q: string;
  onQ: (v: string) => void;

  scope: ClockScope;
  onScope: (v: ClockScope) => void;
  canUseMeScope: boolean;

  status: string;
  onStatus: (v: string) => void;

  employeeId: string;
  onEmployeeId: (v: string) => void;

  locationId: string;
  onLocationId: (v: string) => void;

  pageSize: number;
  onPageSize: (v: number) => void;

  onReset: () => void;
  right?: React.ReactNode;
};

export function TimeClockFilters({
  q,
  onQ,
  scope,
  onScope,
  canUseMeScope,
  status,
  onStatus,
  employeeId,
  onEmployeeId,
  locationId,
  onLocationId,
  pageSize,
  onPageSize,
  onReset,
  right,
}: Props) {
  const [employeeOption, setEmployeeOption] = React.useState<PickerItem | null>(null);
  const [locationOption, setLocationOption] = React.useState<PickerItem | null>(null);

  React.useEffect(() => {
    if (!employeeId) {
      setEmployeeOption(null);
      return;
    }

    if (employeeOption?.id !== employeeId) {
      setEmployeeOption(null);
    }
  }, [employeeId, employeeOption?.id]);

  React.useEffect(() => {
    if (!locationId) {
      setLocationOption(null);
      return;
    }

    if (locationOption?.id !== locationId) {
      setLocationOption(null);
    }
  }, [locationId, locationOption?.id]);

  const handleReset = () => {
    setEmployeeOption(null);
    setLocationOption(null);
    onReset();
  };

  return (
    <TimeFiltersBar
      searchValue={q}
      onSearchChange={onQ}
      searchPlaceholder="Search clocks..."
      left={
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <button
              type="button"
              className={cx(
                "px-3 py-2 text-xs font-medium transition",
                scope === "workspace"
                  ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
                  : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
              )}
              onClick={() => onScope("workspace")}
            >
              Workspace
            </button>

            <button
              type="button"
              disabled={!canUseMeScope}
              className={cx(
                "px-3 py-2 text-xs font-medium transition",
                !canUseMeScope && "cursor-not-allowed opacity-50",
                scope === "me"
                  ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
                  : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
              )}
              onClick={() => onScope("me")}
              title={!canUseMeScope ? "No employee context available yet" : "Show only my clocks"}
            >
              My clocks
            </button>
          </div>

          <div className="w-[170px]">
            <Select
              value={status || "__all__"}
              onValueChange={(v) => onStatus(v === "__all__" ? "" : v)}
            >
              <SelectTrigger className="h-9 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Status: Any</SelectItem>
                <SelectItem value="OPEN">OPEN</SelectItem>
                <SelectItem value="CLOSED">CLOSED</SelectItem>
                <SelectItem value="ADJUSTED">ADJUSTED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[260px]">
            <EmployeePicker
              valueId={employeeId || null}
              valueLabel={employeeOption?.label ?? null}
              onSelect={(it) => {
                setEmployeeOption(it);
                onEmployeeId(it?.id ?? "");
              }}
              placeholder="Select employee"
              disabled={scope === "me"}
              allowClear
            />
          </div>

          <div className="w-[240px]">
            <LocationPicker
              valueId={locationId || null}
              valueLabel={locationOption?.label ?? null}
              onSelect={(it) => {
                setLocationOption(it);
                onLocationId(it?.id ?? "");
              }}
              placeholder="Select location"
              allowClear
            />
          </div>

          <div className="w-[130px]">
            <Select value={String(pageSize)} onValueChange={(v) => onPageSize(Number(v))}>
              <SelectTrigger className="h-9 rounded-xl">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="100">100 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" size="sm" onClick={handleReset} className="h-9 rounded-xl">
            Reset
          </Button>

          {scope === "me" ? (
            <Badge variant="muted" className="rounded-full">
              Personal view
            </Badge>
          ) : null}
        </div>
      }
      right={right}
    />
  );
}