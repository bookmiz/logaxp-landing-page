"use client";

import * as React from "react";
import { Plus, Trash2, Clock, Globe } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Input } from "@/logaxp/components/ui/input";
import { Label } from "@/logaxp/components/ui/label";
import { cn } from "@/logaxp/lib/cn"; // assuming you have cn utility

export type WeeklyRule = {
  start: string;
  end: string;
  breakMinutes?: number;
};

export type WeeklyTemplateRules = {
  timezone: string;
  week: Record<DayKey, WeeklyRule[]>;
};

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

const DAYS: Array<{ key: DayKey; label: string }> = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

function isValidTime(time: string): boolean {
  return /^\d{2}:\d{2}$/.test(time);
}

function isValidWindow(rule: WeeklyRule): boolean {
  return (
    isValidTime(rule.start) &&
    isValidTime(rule.end) &&
    rule.end > rule.start
  );
}

export function WeeklyTemplateBuilder({
  value,
  onChange,
}: {
  value: WeeklyTemplateRules | null;
  onChange: (next: WeeklyTemplateRules) => void;
}) {
  const rules = value ?? {
    timezone: "America/Chicago",
    week: Object.fromEntries(DAYS.map(d => [d.key, []])) as unknown as Record<DayKey, WeeklyRule[]>,
  };

  const updateDay = (day: DayKey, updater: (prev: WeeklyRule[]) => WeeklyRule[]) => {
    onChange({
      ...rules,
      week: {
        ...rules.week,
        [day]: updater(rules.week[day] ?? []),
      },
    });
  };

  const addSlot = (day: DayKey) => {
    updateDay(day, prev => [
      ...prev,
      { start: "09:00", end: "17:00", breakMinutes: 0 },
    ]);
  };

  const removeSlot = (day: DayKey, index: number) => {
    updateDay(day, prev => prev.filter((_, i) => i !== index));
  };

  const updateSlot = (day: DayKey, index: number, patch: Partial<WeeklyRule>) => {
    updateDay(day, prev =>
      prev.map((slot, i) => (i === index ? { ...slot, ...patch } : slot))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header / Timezone */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <Label htmlFor="timezone" className="text-sm font-medium flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Timezone
          </Label>
          <Input
            id="timezone"
            value={rules.timezone}
            onChange={e => onChange({ ...rules, timezone: e.target.value.trim() })}
            placeholder="America/Chicago"
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            All times are interpreted in this timezone.
          </p>
        </div>

        <Badge variant="secondary" className="self-start sm:self-center gap-1.5 px-3 py-1">
          <Clock className="h-3.5 w-3.5" />
          Working windows
        </Badge>
      </div>

      {/* Days */}
      <div className="space-y-4">
        {DAYS.map(day => {
          const slots = rules.week[day.key] ?? [];
          const hasSlots = slots.length > 0;

          return (
            <div
              key={day.key}
              className={cn(
                "rounded-lg border bg-card shadow-sm transition-colors",
                hasSlots ? "border-border" : "border-dashed border-muted"
              )}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
                <h3 className="font-medium">{day.label}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addSlot(day.key)}
                  className="gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  Add window
                </Button>
              </div>

              {!hasSlots ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No working windows defined for this day
                </div>
              ) : (
                <div className="p-3 space-y-3">
                  {slots.map((slot, idx) => {
                    const valid = isValidWindow(slot);
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "grid grid-cols-1 sm:grid-cols-12 gap-3 rounded-md border p-3 bg-background",
                          !valid && "border-destructive/40 bg-destructive/5"
                        )}
                      >
                        {/* Start */}
                        <div className="sm:col-span-3">
                          <Label className="text-xs mb-1.5 block">Start</Label>
                          <Input
                            value={slot.start}
                            onChange={e => updateSlot(day.key, idx, { start: e.target.value })}
                            placeholder="09:00"
                            className={cn(!valid && "border-destructive")}
                          />
                        </div>

                        {/* End */}
                        <div className="sm:col-span-3">
                          <Label className="text-xs mb-1.5 block">End</Label>
                          <Input
                            value={slot.end}
                            onChange={e => updateSlot(day.key, idx, { end: e.target.value })}
                            placeholder="17:00"
                            className={cn(!valid && "border-destructive")}
                          />
                        </div>

                        {/* Break */}
                        <div className="sm:col-span-3">
                          <Label className="text-xs mb-1.5 block">Break (minutes)</Label>
                          <Input
                            type="number"
                            min={0}
                            step={15}
                            value={slot.breakMinutes ?? 0}
                            onChange={e =>
                              updateSlot(day.key, idx, { breakMinutes: Number(e.target.value) || 0 })
                            }
                          />
                        </div>

                        {/* Actions */}
                        <div className="sm:col-span-3 flex items-end justify-end pb-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => removeSlot(day.key, idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {!valid && (
                          <p className="sm:col-span-12 text-xs text-destructive mt-1">
                            Invalid time range (start must be before end)
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}