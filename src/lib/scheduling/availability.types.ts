"use client";

/** Matches your backend envelope style */
export type ApiResponse<T = unknown> = {
  statusCode: number;
  message: string;
  data: T;
};

export type AvailabilityStatus =
  | "ACTIVE"
  | "INACTIVE"
  | (string & {});

export type AvailabilityKind =
  | "AVAILABLE"
  | "UNAVAILABLE"
  | "PREFERRED"
  | (string & {});

/**
 * One row = a time window rule.
 * Interpreted in tenant timezone by backend.
 */
export type AvailabilityRule = {
  id: string;

  employeeId: string;

  // 0..6 (Mon..Sun) or 0..6 (Sun..Sat) — backend decides;
  // FE just passes through. We'll display as labels based on settings later.
  dayOfWeek: number;

  kind: AvailabilityKind;
  status?: AvailabilityStatus;

  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"

  locationId?: string | null;
  orgUnitId?: string | null;

  notes?: string | null;

  createdAt?: string;
  updatedAt?: string;

  [k: string]: unknown;
};

export type AvailabilityListFilterDto = {
  employeeId?: string;

  dayOfWeek?: number;
  kind?: AvailabilityKind;

  locationId?: string;
  orgUnitId?: string;

  includeInactive?: boolean;

  page?: number;
  pageSize?: number;
};

export type CreateAvailabilityRuleDto = {
  employeeId: string;
  dayOfWeek: number;

  kind: AvailabilityKind;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"

  locationId?: string | null;
  orgUnitId?: string | null;

  notes?: string | null;
};

export type UpdateAvailabilityRuleDto = {
  dayOfWeek?: number;

  kind?: AvailabilityKind;
  startTime?: string;
  endTime?: string;

  locationId?: string | null;
  orgUnitId?: string | null;

  status?: AvailabilityStatus;
  notes?: string | null;
};

export type BulkUpsertAvailabilityDto = {
  employeeId: string;
  rules: Array<Omit<CreateAvailabilityRuleDto, "employeeId"> & { id?: string }>;
  replace?: boolean; // if true: server may replace existing rules for employee
};

export type ListAvailabilityResponse = ApiResponse<{
  items: AvailabilityRule[];
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
}>;

export type GetAvailabilityResponse = ApiResponse<AvailabilityRule>;
export type CreateAvailabilityResponse = ApiResponse<AvailabilityRule>;
export type UpdateAvailabilityResponse = ApiResponse<AvailabilityRule>;
export type DeleteAvailabilityResponse = ApiResponse<{ ok?: true }>;
export type BulkUpsertAvailabilityResponse = ApiResponse<{
  ok?: boolean;
  updatedCount?: number;
  createdCount?: number;
}>;