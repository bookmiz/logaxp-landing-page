"use client";

import * as React from "react";
import { MoreHorizontal, LogOut, Coffee, PencilLine } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/logaxp/components/ui/dropdown-menu";

import type { TimeClock } from "@/logaxp/lib/time-management/timeManagement.types";

export function TimeClockRowActions({
  row,
  busy,
  onClockOut,
  onAddBreak,
  onSetBreak,
  onAdjust,
}: {
  row: TimeClock;
  busy?: boolean;
  onClockOut: (row: TimeClock) => void;
  onAddBreak: (row: TimeClock) => void;
  onSetBreak: (row: TimeClock) => void;
  onAdjust: (row: TimeClock) => void;
}) {
  const isOpen = !row.clockOutAt;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={busy}
          className="h-9 w-9 rounded-xl"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 rounded-2xl">
        <DropdownMenuItem onClick={() => onAdjust(row)}>
          <PencilLine className="mr-2 h-4 w-4" />
          Adjust clock
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => onAddBreak(row)} disabled={!isOpen}>
          <Coffee className="mr-2 h-4 w-4" />
          Add break
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onSetBreak(row)} disabled={!isOpen}>
          <Coffee className="mr-2 h-4 w-4" />
          Set break
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onClockOut(row)} disabled={!isOpen}>
          <LogOut className="mr-2 h-4 w-4" />
          Clock out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}