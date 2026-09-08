"use client";

export type ApiResponse<T = unknown> = {
  statusCode: number;
  message: string;
  data: T;
};

export type WeekStartDay = "SUNDAY" | "MONDAY";
export type OvertimeBasis = "WEEKLY" | "DAILY";
export type OvertimeRateMode = "MULTIPLIER" | "MINUTES_ONLY";

export type TimeSettings = {
  id: string;
  tenantId: string;

  timezone?: string | null;
  weekStartDay: WeekStartDay;            // affects pay period boundaries, summaries
  defaultBreakMinutes: number;           // suggested default in clock dialogs
  roundingMinutes: number;               // 0/5/10/15 for rounding
  allowFutureClockIns: boolean;
  allowManualTimeEntries: boolean;

  createdAt?: string;
  updatedAt?: string;
};

export type UpdateTimeSettingsDto = Partial<{
  timezone: string | null;
  weekStartDay: WeekStartDay;
  defaultBreakMinutes: number;
  roundingMinutes: number;
  allowFutureClockIns: boolean;
  allowManualTimeEntries: boolean;
}>;

export type OvertimePolicy = {
  id: string;
  tenantId: string;

  enabled: boolean;

  basis: OvertimeBasis;                 // WEEKLY or DAILY
  weeklyThresholdMinutes: number;       // e.g. 2400 for 40h
  dailyThresholdMinutes: number;        // e.g. 480 for 8h

  overtimeMultiplier: number;           // e.g. 1.5
  doubleTimeEnabled: boolean;
  doubleTimeThresholdMinutes: number;   // e.g. 720 for 12h
  doubleTimeMultiplier: number;         // e.g. 2.0

  rateMode: OvertimeRateMode;           // display / downstream payroll behavior

  updatedAt?: string;
  createdAt?: string;
};

export type UpdateOvertimePolicyDto = Partial<{
  enabled: boolean;

  basis: OvertimeBasis;
  weeklyThresholdMinutes: number;
  dailyThresholdMinutes: number;

  overtimeMultiplier: number;
  doubleTimeEnabled: boolean;
  doubleTimeThresholdMinutes: number;
  doubleTimeMultiplier: number;

  rateMode: OvertimeRateMode;
}>;

export type CalcOvertimeDto = {
  employeeId: string;
  from: string; // ISO
  to: string;   // ISO
};

export type OvertimeCalcResult = {
  employeeId: string;
  from: string;
  to: string;

  totalMinutes: number;
  regularMinutes: number;
  overtimeMinutes: number;
  doubleTimeMinutes: number;

  // optional details (backend can add)
  breakdown?: unknown;
};