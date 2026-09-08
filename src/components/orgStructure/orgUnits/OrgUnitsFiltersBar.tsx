"use client";

import React from "react";
import { Input } from "@/logaxp/components/ui/input";
import { IncludeDeletedToggle } from "@/logaxp/components/orgStructure/shared/IncludeDeletedToggle";
import { SelectField } from "@/logaxp/components/orgStructure/shared/SelectField";
import type { OrgUnitListFilterDto } from "@/logaxp/lib/orgStructure/orgStructure.types";

const TYPES = [
  { value: "DIVISION", label: "Division" },
  { value: "DEPARTMENT", label: "Department" },
  { value: "TEAM", label: "Team" },
];

export function OrgUnitsFiltersBar({
  value,
  onChange,
}: {
  value: OrgUnitListFilterDto;
  onChange: (next: OrgUnitListFilterDto) => void;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end">
      <div className="flex-1">
        <Input
          label="Search"
          placeholder="Search by name..."
          value={value.search ?? ""}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
        />
      </div>

      <div className="w-full md:w-56">
        <SelectField
          label="Type"
          value={value.type ? String(value.type) : ""}
          onChange={(v) => onChange({ ...value, type: v ? (v as any) : undefined })}
          options={TYPES}
          placeholder="All types"
        />
      </div>

      <IncludeDeletedToggle
        checked={Boolean(value.includeDeleted)}
        onChange={(v) => onChange({ ...value, includeDeleted: v })}
      />
    </div>
  );
}