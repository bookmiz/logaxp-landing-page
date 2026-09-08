"use client";

import React from "react";
import { Input } from "@/logaxp/components/ui/input";
import { IncludeDeletedToggle } from "@/logaxp/components/orgStructure/shared/IncludeDeletedToggle";
import type { PositionsListFilterDto } from "@/logaxp/lib/orgStructure/orgStructure.types";

export function PositionsFiltersBar({
  value,
  onChange,
}: {
  value: PositionsListFilterDto;
  onChange: (v: PositionsListFilterDto) => void;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="flex-1">
        <Input
          label="Search"
          placeholder='Search by name, code, title, level...'
          value={value.search ?? ""}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
        />
      </div>

      <div className="md:pl-3">
        <IncludeDeletedToggle
          checked={Boolean(value.includeDeleted)}
          onChange={(v) => onChange({ ...value, includeDeleted: v })}
        />
      </div>
    </div>
  );
}