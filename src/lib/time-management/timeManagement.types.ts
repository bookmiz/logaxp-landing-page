// src/lib/time-management/timeManagement.types.ts

/** ----------------------------------------
 * Generic API envelope
 * Adjust if your backend response shape differs
 * --------------------------------------- */
export type ApiResponse<T = unknown> = {
  statusCode: number;
  message: string;
  data: T;
};

export type Maybe<T> = T | null;

export type ListMeta = {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
};

export type ListData<T> =
  | T[]
  | {
      items: T[];
      meta?: ListMeta;
      [key: string]: unknown;
    };

/** ----------------------------------------
 * Frontend enum mirrors (Prisma enums on backend)
 * Keep string-based for FE compatibility
 * --------------------------------------- */
export type TimeClockStatus = "OPEN" | "CLOSED" | "ADJUSTED" | (string & {});
export type TimeEntrySource =
  | "MANUAL"
  | "TIMER"
  | "CLOCK"
  | "IMPORT"
  | "SYSTEM"
  | (string & {});

/** ----------------------------------------
 * Domain entities (flexible)
 * --------------------------------------- */
export interface TimerRecord {
  id: string;
  membershipId?: string;
  projectId?: string | null;
  workItemId?: string | null;

  startedAt?: string;
  stoppedAt?: string | null;
  endAt?: string | null;

  isRunning?: boolean;
  durationMinutes?: number | null;

  billable?: boolean;
  notes?: string | null;

  createdAt?: string;
  updatedAt?: string;

  [key: string]: unknown;
}

export interface TimeEntry {
  id: string;

  employeeId?: string | null;
  membershipId?: string | null;

  projectId?: string | null;
  workItemId?: string | null;

  source?: TimeEntrySource;

  startAt?: string | null;
  endAt?: string | null;
  durationMinutes?: number | null;

  billable?: boolean;
  notes?: string | null;

  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;

  [key: string]: unknown;
}

export interface TimeClock {
  id: string;

  employeeId?: string;
  locationId?: string | null;

  status?: TimeClockStatus;

  clockInAt?: string;
  clockOutAt?: string | null;

  breakMinutes?: number;
  notes?: string | null;

  createdAt?: string;
  updatedAt?: string;

  [key: string]: unknown;
}

/** ----------------------------------------
 * DTOs — Timers
 * --------------------------------------- */
export interface StartTimerDto {
  membershipId: string;
  projectId?: string | null;
  workItemId?: string | null;
}

export interface StopTimerDto {
  billable?: boolean;
  notes?: string | null;
}

export interface StopRunningTimerDto {
  membershipId: string;
  billable?: boolean;
  notes?: string | null;
}

export interface SwitchTimerDto {
  membershipId: string;
  billable?: boolean;
  notes?: string | null;
  projectId?: string | null;
  workItemId?: string | null;
}

export interface TimerHistoryFilterDto {
  membershipId?: string;
  projectId?: string;
  workItemId?: string;
  from?: string; // ISO (startedAt)
  to?: string; // ISO (startedAt)
  page?: number;
  pageSize?: number;
}

/** ----------------------------------------
 * DTOs — Time Entries
 * --------------------------------------- */
export interface CreateTimeEntryDto {
  employeeId?: string | null;
  membershipId?: string | null;

  projectId?: string | null;
  workItemId?: string | null;

  source?: TimeEntrySource;

  startAt?: string | null;
  endAt?: string | null;
  durationMinutes?: number;

  billable?: boolean;
  notes?: string | null;
}

export interface UpdateTimeEntryDto {
  employeeId?: string | null;
  membershipId?: string | null;

  projectId?: string | null;
  workItemId?: string | null;

  startAt?: string | null;
  endAt?: string | null;
  durationMinutes?: number;

  billable?: boolean;
  notes?: string | null;
}

export interface TimeEntryListFilterDto {
  employeeId?: string;
  membershipId?: string;
  projectId?: string;
  workItemId?: string;
  source?: TimeEntrySource;
  billable?: boolean;

  from?: string; // ISO (createdAt)
  to?: string; // ISO (createdAt)

  includeDeleted?: boolean;

  page?: number;
  pageSize?: number;
}

export interface BulkCreateTimeEntriesDto {
  items: CreateTimeEntryDto[];
  partialOk?: boolean;
}

export interface TimeEntriesStatsDto {
  from?: string;
  to?: string;
  employeeId?: string;
  membershipId?: string;
  projectId?: string;
  workItemId?: string;
  billable?: boolean;
  source?: TimeEntrySource;
}

export interface TimeEntriesDailySummaryDto {
  from: string;
  to: string;
  groupBy?: "day" | "project_day" | "member_day" | "employee_day";
}

/** ----------------------------------------
 * DTOs — Time Clocks
 * --------------------------------------- */
export interface ClockInDto {
  employeeId: string;
  locationId?: string | null;
  notes?: string | null;
  clockInAt?: string | null; // ISO
}

export interface ClockOutDto {
  notes?: string | null;
  clockOutAt?: string | null; // ISO
}

export interface AddBreakDto {
  minutes: number;
}

export interface SetBreakDto {
  minutes: number;
}

export interface TimeClockListFilterDto {
  employeeId?: string;
  locationId?: string;
  status?: TimeClockStatus;

  from?: string; // ISO
  to?: string; // ISO

  page?: number;
  pageSize?: number;
}

export interface TimeClockSummaryDto {
  from: string;
  to: string;
  employeeId?: string;
  includeOpen?: boolean;
  groupBy?: "employee" | "day" | "employee_day";
}

export interface TimeClockAdjustDto {
  status?: TimeClockStatus;
  clockInAt?: string;
  clockOutAt?: string | null;
  breakMinutes?: number;
  locationId?: string | null;
  notes?: string | null;
}

/** ----------------------------------------
 * Summary / Stats shapes (flexible)
 * --------------------------------------- */
export interface TimeEntriesStatsResult {
  totalEntries?: number;
  totalMinutes?: number;
  totalHours?: number;
  billableMinutes?: number;
  nonBillableMinutes?: number;
  [key: string]: unknown;
}

export interface TimeEntriesDailySummaryRow {
  day?: string;
  date?: string;
  employeeId?: string;
  membershipId?: string;
  projectId?: string;
  totalMinutes?: number;
  totalHours?: number;
  count?: number;
  [key: string]: unknown;
}

export interface TimeClockSummaryRow {
  day?: string;
  date?: string;
  employeeId?: string;
  totalMinutes?: number;
  totalHours?: number;
  clockCount?: number;
  breakMinutes?: number;
  [key: string]: unknown;
}

/** ----------------------------------------
 * Response aliases — Timers
 * --------------------------------------- */
export type GetRunningTimerResponse = ApiResponse<TimerRecord | null>;
export type TimerHistoryResponse = ApiResponse<ListData<TimerRecord>>;
export type GetTimerResponse = ApiResponse<TimerRecord>;
export type StartTimerResponse = ApiResponse<TimerRecord>;
export type StopTimerResponse = ApiResponse<TimerRecord>;
export type StopRunningTimerResponse = ApiResponse<TimerRecord | null>;
export type SwitchTimerResponse = ApiResponse<{
  stopped?: TimerRecord | null;
  started?: TimerRecord;
  [key: string]: unknown;
}>;

/** ----------------------------------------
 * Response aliases — Time Entries
 * --------------------------------------- */
export type ListTimeEntriesResponse = ApiResponse<ListData<TimeEntry>>;
export type GetTimeEntryResponse = ApiResponse<TimeEntry>;
export type CreateTimeEntryResponse = ApiResponse<TimeEntry>;
export type BulkCreateTimeEntriesResponse = ApiResponse<{
  items?: TimeEntry[];
  successCount?: number;
  failureCount?: number;
  errors?: Array<{ index: number; message: string; [key: string]: unknown }>;
  [key: string]: unknown;
}>;
export type UpdateTimeEntryResponse = ApiResponse<TimeEntry>;
export type RestoreTimeEntryResponse = ApiResponse<TimeEntry | { ok?: true }>;
export type SoftDeleteTimeEntryResponse = ApiResponse<{ ok?: true } | TimeEntry>;
export type HardDeleteTimeEntryResponse = ApiResponse<{ ok?: true }>;
export type TimeEntriesStatsResponse = ApiResponse<TimeEntriesStatsResult>;
export type TimeEntriesDailySummaryResponse = ApiResponse<ListData<TimeEntriesDailySummaryRow>>;

/** ----------------------------------------
 * Response aliases — Time Clocks
 * --------------------------------------- */
export type ListTimeClocksResponse = ApiResponse<ListData<TimeClock>>;
export type GetTimeClockResponse = ApiResponse<TimeClock>;
export type GetOpenTimeClockResponse = TimeClock | null;
export type ClockInResponse = ApiResponse<TimeClock>;
export type AddBreakResponse = ApiResponse<TimeClock>;
export type SetBreakResponse = ApiResponse<TimeClock>;
export type ClockOutResponse = ApiResponse<TimeClock>;
export type AdjustTimeClockResponse = ApiResponse<TimeClock>;
export type TimeClockSummaryResponse = ApiResponse<ListData<TimeClockSummaryRow> | Record<string, unknown>>;