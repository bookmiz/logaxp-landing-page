"use client";

// src/components/scheduling/pickers/SchedulePickers.tsx
import * as React from "react";
import { AsyncSelect, type AsyncSelectItem } from "../time-management/pickers/AsyncSelect";
import { pickerService } from "@/logaxp/lib/pickers/pickerService";

export type PickerItem = {
  id: string;
  label: string;
};

export type PickerProps = {
  valueId: string | null;
  valueLabel: string | null;
  onSelect: (it: PickerItem | null) => void;
  allowClear?: boolean;
  disabled?: boolean;
  placeholder?: string;
};

const PAGE_SIZE = 20;

export const fetchScheduleTemplates = async (q: string): Promise<AsyncSelectItem[]> =>
  pickerService.scheduleTemplates({ q, page: 1, pageSize: PAGE_SIZE });

export const fetchEmployees = async (q: string): Promise<AsyncSelectItem[]> =>
  pickerService.employees({ q, page: 1, pageSize: PAGE_SIZE });

export const fetchOrgUnits = async (q: string): Promise<AsyncSelectItem[]> =>
  pickerService.orgUnits({ q, page: 1, pageSize: PAGE_SIZE });

export const fetchLocations = async (q: string): Promise<AsyncSelectItem[]> =>
  pickerService.locations({ q, page: 1, pageSize: PAGE_SIZE });

export const fetchPositions = async (q: string): Promise<AsyncSelectItem[]> =>
  pickerService.positions({ q, page: 1, pageSize: PAGE_SIZE });

export const fetchCostCenters = async (q: string): Promise<AsyncSelectItem[]> =>
  pickerService.costCenters({ q, page: 1, pageSize: PAGE_SIZE });

function BasePicker({
  valueId,
  valueLabel,
  onSelect,
  allowClear = true,
  disabled = false,
  placeholder,
  fetcher,
}: PickerProps & {
  fetcher: (q: string) => Promise<AsyncSelectItem[]>;
}) {
  return (
    <AsyncSelect
      valueId={valueId}
      valueLabel={valueLabel}
      placeholder={placeholder ?? "Select option…"}
      fetcher={fetcher}
      onSelect={onSelect}
      allowClear={allowClear}
      disabled={disabled}
    />
  );
}

export function TemplatePicker(props: PickerProps) {
  return (
    <BasePicker
      {...props}
      placeholder={props.placeholder ?? "Select template…"}
      fetcher={fetchScheduleTemplates}
    />
  );
}

export function EmployeePicker(props: PickerProps) {
  return (
    <BasePicker
      {...props}
      placeholder={props.placeholder ?? "Select employee…"}
      fetcher={fetchEmployees}
    />
  );
}

export function OrgUnitPicker(props: PickerProps) {
  return (
    <BasePicker
      {...props}
      placeholder={props.placeholder ?? "Select org unit…"}
      fetcher={fetchOrgUnits}
    />
  );
}

export function LocationPicker(props: PickerProps) {
  return (
    <BasePicker
      {...props}
      placeholder={props.placeholder ?? "Select location…"}
      fetcher={fetchLocations}
    />
  );
}

export function PositionPicker(props: PickerProps) {
  return (
    <BasePicker
      {...props}
      placeholder={props.placeholder ?? "Select position…"}
      fetcher={fetchPositions}
    />
  );
}

export function CostCenterPicker(props: PickerProps) {
  return (
    <BasePicker
      {...props}
      placeholder={props.placeholder ?? "Select cost center…"}
      fetcher={fetchCostCenters}
    />
  );
}

/**
 * Optional convenience block:
 * Use this when a form needs employee + org unit + location together.
 */
export function EmployeeUnitLocationPickers({
  employee,
  orgUnit,
  location,
  onEmployeeChange,
  onOrgUnitChange,
  onLocationChange,
  disabled = false,
}: {
  employee: PickerItem | null;
  orgUnit: PickerItem | null;
  location: PickerItem | null;
  onEmployeeChange: (it: PickerItem | null) => void;
  onOrgUnitChange: (it: PickerItem | null) => void;
  onLocationChange: (it: PickerItem | null) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="space-y-2 text-xs bg-red-500">
        <label className="text-xs  text-slate-700 dark:text-slate-300">
          Employee
        </label>
        <EmployeePicker
          valueId={employee?.id ?? null}
          valueLabel={employee?.label ?? null}
          onSelect={onEmployeeChange}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Org Unit
        </label>
        <OrgUnitPicker
          valueId={orgUnit?.id ?? null}
          valueLabel={orgUnit?.label ?? null}
          onSelect={onOrgUnitChange}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Location
        </label>
        <LocationPicker
          valueId={location?.id ?? null}
          valueLabel={location?.label ?? null}
          onSelect={onLocationChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}