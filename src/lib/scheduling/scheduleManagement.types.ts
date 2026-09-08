"use client";

/** ----------------------------------------
 * Generic API envelope (same pattern as timeManagement.types)
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
      page?: number;
      pageSize?: number;
      total?: number;
      totalPages?: number;
      [key: string]: unknown;
    };

/** ----------------------------------------
 * Enums (FE string mirrors)
 * --------------------------------------- */
export type ScheduleTemplateType = "WEEKLY" | "ROTATING" | (string & {});
export type ShiftStatus = "DRAFT" | "PUBLISHED" | "CANCELED" | (string & {});
export type ShiftSource = "MANUAL" | "GENERATED" | (string & {});
export type ShiftAssignmentStatus = "UNASSIGNED" | "ASSIGNED" | "CONFIRMED" | (string & {});

/** ----------------------------------------
 * Entities
 * --------------------------------------- */
export interface ScheduleSettings {
  id: string;
  tenantId: string;

  timezone?: string; // "America/Chicago"
  minRestMinutes?: number; // e.g. 480
  maxShiftMinutes?: number; // e.g. 720

  createdAt?: string;
  updatedAt?: string;

  [key: string]: unknown;
}

export type WeeklyRules = {
  timezone?: string;
  week: Record<
    "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat",
    Array<{ start: string; end: string; notes?: string }>
  >;
};

export type RotatingRules = {
  timezone?: string;
  cycleWeeks: number; // e.g. 2
  weeks: Array<
    Record<
      "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat",
      Array<{ start: string; end: string; notes?: string }>
    >
  >;
};

export interface ScheduleTemplate {
  id: string;
  tenantId: string;

  name: string;
  type: ScheduleTemplateType;
  rules: WeeklyRules | RotatingRules | Record<string, unknown>;

  locationId?: string | null;
  positionId?: string | null;

  isActive?: boolean;
  metadata?: any;

  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;

  [key: string]: unknown;
}

export interface ScheduleAssignment {
  id: string;
  tenantId: string;

  templateId: string;
  employeeId?: string | null;
  orgUnitId?: string | null;

  isPrimary?: boolean;

  effectiveFrom?: string;
  effectiveTo?: string | null;

  createdAt?: string;

  [key: string]: unknown;
}

export interface Shift {
  id: string;
  tenantId: string;

  employeeId?: string | null;
  orgUnitId?: string | null;
  locationId?: string | null;
  positionId?: string | null;

  startAt: string; // ISO
  endAt: string; // ISO

  status?: ShiftStatus;
  assignmentStatus?: ShiftAssignmentStatus;
  source?: ShiftSource;

  notes?: string | null;

  publishedAt?: string | null;
  canceledAt?: string | null;

  createdAt?: string;
  updatedAt?: string;

  // optional includes
  employee?: any;
  location?: any;
  orgUnit?: any;
  position?: any;

  [key: string]: unknown;
}

/** ----------------------------------------
 * DTOs — Settings
 * --------------------------------------- */
export type UpdateScheduleSettingsDto = {
  timezone?: string;
  minRestMinutes?: number;
  maxShiftMinutes?: number;
};

/** ----------------------------------------
 * DTOs — Templates
 * --------------------------------------- */
export type CreateScheduleTemplateDto = {
  name: string;
  type: ScheduleTemplateType;
  rules: WeeklyRules | RotatingRules | Record<string, unknown>;

  locationId?: string | null;
  positionId?: string | null;

  isActive?: boolean;
  metadata?: any;
};

export type UpdateScheduleTemplateDto = Partial<CreateScheduleTemplateDto>;

/** ----------------------------------------
 * DTOs — Assignments
 * --------------------------------------- */
export type CreateScheduleAssignmentDto = {
  templateId: string;
  employeeId?: string | null;
  orgUnitId?: string | null;
  isPrimary?: boolean;
  effectiveFrom?: string; // ISO
  effectiveTo?: string | null; // ISO
};

export type UpdateScheduleAssignmentDto = Partial<CreateScheduleAssignmentDto>;

/** ----------------------------------------
 * DTOs — Shifts
 * --------------------------------------- */
export type CreateShiftDto = {
  startAt: string;
  endAt: string;

  employeeId?: string | null;
  orgUnitId?: string | null;
  locationId?: string | null;
  positionId?: string | null;

  status?: ShiftStatus; // DRAFT default
  source?: ShiftSource; // MANUAL default

  notes?: string | null;
};

export type UpdateShiftDto = Partial<CreateShiftDto> & {
  assignmentStatus?: ShiftAssignmentStatus;
};

export type ListShiftsDto = {
  from: string;
  to: string;

  employeeId?: string;
  orgUnitId?: string;
  locationId?: string;
  status?: ShiftStatus;

  page?: number;
  pageSize?: number;
};

export type CancelShiftDto = { reason?: string };

export type GenerateShiftsDto = {
  from: string;
  to: string;

  templateId?: string;
  employeeId?: string;
  orgUnitId?: string;

  publish?: boolean;
  overwriteDrafts?: boolean;
};

export type PublishShiftsDto = {
  from: string;
  to: string;

  employeeId?: string;
  orgUnitId?: string;
  locationId?: string;
};

export type ShiftConflictsDto = {
  from: string;
  to: string;
  employeeId?: string;
  orgUnitId?: string;
  locationId?: string; // ✅ add
};

export type ShiftConflictsResult = {
  overlaps: Array<{ employeeId: string; a: string; b: string }>;
  restViolations: Array<{ employeeId: string; prevId: string; nextId: string; restMinutes: number; required: number }>;
  invalid: Array<{ id: string; reason: string }>;
  totalShifts?: number;
  // shiftIds can be included in the above arrays if needed for FE mapping, but are not required for the conflict detection itself
  shiftIds?: string[];
};

/** ----------------------------------------
 * Response aliases
 * --------------------------------------- */
export type GetScheduleSettingsResponse = ApiResponse<ScheduleSettings>;
export type UpdateScheduleSettingsResponse = ApiResponse<ScheduleSettings>;

export type ListScheduleTemplatesResponse = ApiResponse<ListData<ScheduleTemplate>>;
export type GetScheduleTemplateResponse = ApiResponse<ScheduleTemplate>;
export type CreateScheduleTemplateResponse = ApiResponse<ScheduleTemplate>;
export type UpdateScheduleTemplateResponse = ApiResponse<ScheduleTemplate>;
export type DeleteScheduleTemplateResponse = ApiResponse<{ ok?: true }>;

export type ListScheduleAssignmentsResponse = ApiResponse<ListData<ScheduleAssignment>>;
export type CreateScheduleAssignmentResponse = ApiResponse<ScheduleAssignment>;
export type UpdateScheduleAssignmentResponse = ApiResponse<ScheduleAssignment>;
export type DeleteScheduleAssignmentResponse = ApiResponse<{ ok?: true }>;

export type ListShiftsResponse = ApiResponse<ListData<Shift>>;
export type GetShiftResponse = ApiResponse<Shift>;
export type CreateShiftResponse = ApiResponse<Shift>;
export type UpdateShiftResponse = ApiResponse<Shift>;
export type CancelShiftResponse = ApiResponse<Shift | { ok?: true }>;
export type GenerateShiftsResponse = ApiResponse<{ ok: boolean; createdCount: number; createdIds?: string[]; errors?: any[] }>;
export type PublishShiftsResponse = ApiResponse<{ ok: true; count: number }>;
export type ShiftConflictsResponse = ApiResponse<ShiftConflictsResult>;