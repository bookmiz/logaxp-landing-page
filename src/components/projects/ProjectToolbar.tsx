"use client";

import * as React from "react";
import { Input } from "@/logaxp/components/ui/input";

export type ProjectToolbarProps = {
  searchLabel?: string;
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (v: string) => void;
  left?: React.ReactNode;
  right?: React.ReactNode;
};

export function ProjectToolbar({
  searchLabel = "Search",
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  left,
  right,
}: ProjectToolbarProps) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
      <div className="space-y-3">
        {left ? <div>{left}</div> : null}
        <Input
          label={searchLabel}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {right ? <div className="flex items-center justify-start gap-2 lg:justify-end">{right}</div> : null}
    </div>
  );
}