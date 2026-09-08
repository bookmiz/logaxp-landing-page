"use client";

import * as React from "react";
import { SelectField } from "@/logaxp/components/orgStructure/shared/SelectField";
import { Input } from "@/logaxp/components/ui/input";
import type {
  EmployeeStatus,
  EmploymentType,
  ManagerTeamQueryDto,
} from "@/logaxp/lib/manager/manager.types";

const STATUS_OPTIONS: Array<{ value: EmployeeStatus; label: string }> = [
  { value: "ONBOARDING", label: "Onboarding" },
  { value: "ACTIVE", label: "Active" },
  { value: "ON_LEAVE", label: "On Leave" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "TERMINATED", label: "Terminated" },
  { value: "INACTIVE", label: "Inactive" },
];

const EMPLOYMENT_TYPE_OPTIONS: Array<{ value: EmploymentType; label: string }> = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACTOR", label: "Contractor" },
  { value: "INTERN", label: "Intern" },
  { value: "TEMPORARY", label: "Temporary" },
];

export function ManagerTeamFiltersBar({
  value,
  onChange,
}: {
  value: ManagerTeamQueryDto;
  onChange: React.Dispatch<React.SetStateAction<ManagerTeamQueryDto>>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Input
        label="Search"
        placeholder="Search employee..."
        value={value.search ?? ""}
        onChange={(e) => onChange((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
      />

      <SelectField
        label="Status"
        value={value.status ?? ""}
        onChange={(v) =>
          onChange((prev) => ({
            ...prev,
            status: (v || undefined) as EmployeeStatus | undefined,
            page: 1,
          }))
        }
        options={STATUS_OPTIONS}
        placeholder="All statuses"
      />

      <SelectField
        label="Employment Type"
        value={value.employmentType ?? ""}
        onChange={(v) =>
          onChange((prev) => ({
            ...prev,
            employmentType: (v || undefined) as EmploymentType | undefined,
            page: 1,
          }))
        }
        options={EMPLOYMENT_TYPE_OPTIONS}
        placeholder="All types"
      />

      <div className="flex flex-col justify-end gap-2 pb-1">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={Boolean(value.includeInactive)}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                includeInactive: e.target.checked,
                page: 1,
              }))
            }
          />
          Include inactive
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={Boolean(value.includeDeleted)}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                includeDeleted: e.target.checked,
                page: 1,
              }))
            }
          />
          Include deleted
        </label>
      </div>
    </div>
  );
}