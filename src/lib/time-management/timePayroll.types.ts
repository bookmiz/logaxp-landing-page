"use client";



/** ----------------------------------------
 * Enums (FE string mirrors)
 * --------------------------------------- */
export type PayFrequency = "WEEKLY" | "BIWEEKLY" | "SEMI_MONTHLY" | "MONTHLY" | (string & {});
export type OvertimeSource = "CLOCKS" | "ENTRIES" | "BOTH" | (string & {});

/** ----------------------------------------
 * Entities
 * --------------------------------------- */
export type TimeSettings = {
  id: string;
  tenantId: string;

  frequency: PayFrequency;
  weekStartDay: number; // 0..6
  anchorDate: string;   // ISO
  timezone: string;

  overtimePolicyId?: string | null;

  createdAt?: string;
  updatedAt?: string;

  [key: string]: unknown;
};

export type OvertimePolicy = {
  id: string;
  tenantId: string;

  source: OvertimeSource;

  weeklyThresholdMinutes: number;
  dailyThresholdMinutes?: number | null;
  doubleTimeDailyThresholdMinutes?: number | null;

  roundingMinutes: number;
  subtractBreaks: boolean;

  metadata?: any;

  createdAt?: string;
  updatedAt?: string;

  [key: string]: unknown;
};

export type OvertimeCalcResult = {
  policy: OvertimePolicy;
  totals: {
    totalMinutes: number;
    regularMinutes: number;
    overtimeMinutes: number;
    doubleTimeMinutes: number;
  };
};
/** ----------------------------------------
 * DTOs
 * --------------------------------------- */
export type UpdateTimeSettingsDto = Partial<{
  frequency: PayFrequency;
  weekStartDay: number;
  anchorDate: string; // ISO
  timezone: string;
  overtimePolicyId: string | null;
}>;

export type UpdateOvertimePolicyDto = Partial<{
  source: OvertimeSource;
  weeklyThresholdMinutes: number;
  dailyThresholdMinutes: number | null;
  doubleTimeDailyThresholdMinutes: number | null;
  roundingMinutes: number;
  subtractBreaks: boolean;
}>;

export type CalcOvertimeDto = {
  employeeId: string;
  from: string; // ISO
  to: string;   // ISO (exclusive)
  includeOpen?: boolean;
};

export type TimesheetsListQuery = Partial<{
  employeeId: string;
  payPeriodId: string;
  status: TimesheetStatus;
}>;

export type SubmitTimesheetDto = {
  payPeriodId: string;
  employeeId: string;
};

export type DecideTimesheetDto = {
  decisionNote?: string;
};

/** ----------------------------------------
 * Responses (enveloped)
 * --------------------------------------- */
export type GetTimeSettingsResponse = ApiResponse<TimeSettings>;
export type UpdateTimeSettingsResponse = ApiResponse<TimeSettings>;

export type ListPayPeriodsResponse = ApiResponse<ListData<PayPeriod>>;
export type GeneratePayPeriodsResponse = ApiResponse<{ createdCount: number; created: PayPeriod[] }>;
export type LockPayPeriodResponse = ApiResponse<PayPeriod>;
export type UnlockPayPeriodResponse = ApiResponse<PayPeriod>;

export type GetOvertimePolicyResponse = ApiResponse<OvertimePolicy>;
export type UpdateOvertimePolicyResponse = ApiResponse<OvertimePolicy>;
export type CalcOvertimeResponse = ApiResponse<OvertimeCalcResult>;

export type ListTimesheetsResponse = ApiResponse<Timesheet[]>;
export type GetTimesheetResponse = ApiResponse<Timesheet>;
export type SubmitTimesheetResponse = ApiResponse<Timesheet>;
export type ApproveTimesheetResponse = ApiResponse<Timesheet>;
export type RejectTimesheetResponse = ApiResponse<Timesheet>;
export type ApiResponse<T = unknown> = {
  statusCode: number;
  message: string;
  data: T;
};

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
      page?: number;
      pageSize?: number;
      total?: number;
      [key: string]: unknown;
    };

export type PayPeriodStatus = "OPEN" | "LOCKED" | (string & {});
export type TimesheetStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | (string & {});

export type PayPeriod = {
  id: string;
  tenantId: string;

  startAt: string; // ISO
  endAt: string;   // ISO

  status: PayPeriodStatus;

  lockedAt?: string | null;
  lockedByUserId?: string | null;

  createdAt?: string;
  updatedAt?: string;

  [key: string]: unknown;
};

export type GeneratePayPeriodsDto = {
  startAt: string;     // ISO
  monthsAhead: number; // 1..24 typical
};

export type ListPayPeriodsDto = {
  from?: string; // ISO filter
  to?: string;   // ISO filter
  status?: PayPeriodStatus;
  page?: number;
  pageSize?: number;
};

export type Timesheet = {
  id: string;
  tenantId: string;

  employeeId: string;
  payPeriodId: string;

  status: TimesheetStatus;

  submittedAt?: string | null;
  submittedByMembershipId?: string | null;

  decidedAt?: string | null;
  decidedByUserId?: string | null;
  decisionNote?: string | null;

  // Optional rollups computed by backend
  totalMinutes?: number | null;
  regularMinutes?: number | null;
  overtimeMinutes?: number | null;
  doubleTimeMinutes?: number | null;

  createdAt?: string;
  updatedAt?: string;

  // Optional expansions
  payPeriod?: PayPeriod | null;

  [key: string]: unknown;
};

export type ListTimesheetsDto = {
  employeeId?: string;
  payPeriodId?: string;
  status?: TimesheetStatus;
};



// helpers
export function normalizeList<T>(res: ApiResponse<ListData<T>> | null | undefined): { items: T[]; meta?: ListMeta } {
  const data: any = res?.data;
  if (!data) return { items: [] };
  if (Array.isArray(data)) return { items: data };
  const items: T[] = Array.isArray(data.items) ? data.items : [];
  const meta: ListMeta | undefined =
    data.meta ??
    (typeof data.page === "number" || typeof data.total === "number"
      ? { page: data.page, pageSize: data.pageSize, total: data.total }
      : undefined);
  return { items, meta };
}

export function overlaps(aStartIso: string, aEndIso: string, bStartIso: string, bEndIso: string) {
  const aS = new Date(aStartIso).getTime();
  const aE = new Date(aEndIso).getTime();
  const bS = new Date(bStartIso).getTime();
  const bE = new Date(bEndIso).getTime();
  return aS <= bE && bS <= aE;
}
