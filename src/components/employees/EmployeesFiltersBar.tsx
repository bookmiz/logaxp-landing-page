"use client";

import * as React from "react";
import {
  EMPLOYEE_STATUS_VALUES,
  EMPLOYMENT_TYPE_VALUES,
  type EmployeeStatus,
  type EmploymentType,
} from "@/logaxp/lib/employee-management/employee-management.types";
import type {
  OrgUnit,
  Location,
  Position,
  CostCenter,
} from "@/logaxp/lib/orgStructure/orgStructure.types";

function humanStatus(s?: string | null) {
  if (!s) return "—";
  return String(s).replaceAll("_", " ");
}

function SelectField({
  label,
  value,
  onChange,
  children,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
      >
        {children}
      </select>
    </div>
  );
}

export function EmployeesFiltersBar(props: {
  status: EmployeeStatus | "";
  onStatus: (v: EmployeeStatus | "") => void;
  employmentType: EmploymentType | "";
  onEmploymentType: (v: EmploymentType | "") => void;
  orgUnitId: string;
  onOrgUnitId: (v: string) => void;
  locationId: string;
  onLocationId: (v: string) => void;
  positionId: string;
  onPositionId: (v: string) => void;
  costCenterId: string;
  onCostCenterId: (v: string) => void;
  includeDeleted: boolean;
  onIncludeDeleted: (v: boolean) => void;
  pageSize: number;
  onPageSize: (v: number) => void;
  orgUnits: OrgUnit[];
  locations: Location[];
  positions: Position[];
  costCenters: CostCenter[];
  disabled?: boolean;
}) {
  const {
    status,
    onStatus,
    employmentType,
    onEmploymentType,
    orgUnitId,
    onOrgUnitId,
    locationId,
    onLocationId,
    positionId,
    onPositionId,
    costCenterId,
    onCostCenterId,
    includeDeleted,
    onIncludeDeleted,
    pageSize,
    onPageSize,
    orgUnits,
    locations,
    positions,
    costCenters,
    disabled,
  } = props;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
        <SelectField label="Status" value={status} onChange={(v) => onStatus(v as any)} disabled={disabled}>
          <option value="">All</option>
          {EMPLOYEE_STATUS_VALUES.map((s) => (
            <option key={s} value={s}>
              {humanStatus(s)}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Employment"
          value={employmentType}
          onChange={(v) => onEmploymentType(v as any)}
          disabled={disabled}
        >
          <option value="">All</option>
          {EMPLOYMENT_TYPE_VALUES.map((t) => (
            <option key={t} value={t}>
              {humanStatus(t)}
            </option>
          ))}
        </SelectField>

        <SelectField label="Org Unit" value={orgUnitId} onChange={onOrgUnitId} disabled={disabled}>
          <option value="">All</option>
          {orgUnits.map((x) => (
            <option key={x.id} value={x.id}>
              {String(x.name ?? "—")}
            </option>
          ))}
        </SelectField>

        <SelectField label="Location" value={locationId} onChange={onLocationId} disabled={disabled}>
          <option value="">All</option>
          {locations.map((x) => (
            <option key={x.id} value={x.id}>
              {String(x.name ?? "—")}
            </option>
          ))}
        </SelectField>

        <SelectField label="Position" value={positionId} onChange={onPositionId} disabled={disabled}>
          <option value="">All</option>
          {positions.map((x) => (
            <option key={x.id} value={x.id}>
              {String((x as any).title ?? (x as any).name ?? "—")}
            </option>
          ))}
        </SelectField>

        <SelectField label="Cost Center" value={costCenterId} onChange={onCostCenterId} disabled={disabled}>
          <option value="">All</option>
          {costCenters.map((x) => (
            <option key={x.id} value={x.id}>
              {String(x.name ?? "—")}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => onIncludeDeleted(e.target.checked)}
            className="h-4 w-4 rounded"
            disabled={disabled}
          />
          Include deleted
        </label>

        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="hidden sm:inline">Page size</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            disabled={disabled}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
          >
            {[10, 20, 30, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}