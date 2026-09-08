"use client";


// C:\Users\kriss\logaxp-landing-page\src\lib\scheduling\scheduleManagementService.ts
import { api } from "@/logaxp/lib/api/apiClient";
import type {
  UpdateScheduleSettingsDto,
  GetScheduleSettingsResponse,
  UpdateScheduleSettingsResponse,

  CreateScheduleTemplateDto,
  UpdateScheduleTemplateDto,
  ListScheduleTemplatesResponse,
  GetScheduleTemplateResponse,
  CreateScheduleTemplateResponse,
  UpdateScheduleTemplateResponse,
  DeleteScheduleTemplateResponse,

  CreateScheduleAssignmentDto,
  UpdateScheduleAssignmentDto,
  ListScheduleAssignmentsResponse,
  CreateScheduleAssignmentResponse,
  UpdateScheduleAssignmentResponse,
  DeleteScheduleAssignmentResponse,

  ListShiftsDto,
  CreateShiftDto,
  UpdateShiftDto,
  CancelShiftDto,
  GenerateShiftsDto,
  PublishShiftsDto,
  ShiftConflictsDto,

  ListShiftsResponse,
  GetShiftResponse,
  CreateShiftResponse,
  UpdateShiftResponse,
  CancelShiftResponse,
  GenerateShiftsResponse,
  PublishShiftsResponse,
  ShiftConflictsResponse,
} from "./scheduleManagement.types";

function cleanParams<T extends object = Record<string, unknown>>(obj?: T): Record<string, unknown> | undefined {
  if (!obj) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    out[k] = v;
  }
  return out;
}

function enc(value: string): string {
  return encodeURIComponent(value);
}

export const scheduleManagementService = {
  /** ======================================
   * Schedule Settings
   * Base route: /schedule/settings
   * ===================================== */
  settings: {
    async get(): Promise<GetScheduleSettingsResponse> {
      const res = await api.get<GetScheduleSettingsResponse>("/schedule/settings");
      return res.data;
    },

    async update(dto: UpdateScheduleSettingsDto): Promise<UpdateScheduleSettingsResponse> {
      const res = await api.patch<UpdateScheduleSettingsResponse>("/schedule/settings", dto);
      return res.data;
    },
  },

  /** ======================================
   * Schedule Templates
   * Base route: /schedule/templates
   * ===================================== */
  templates: {
    async list(): Promise<ListScheduleTemplatesResponse> {
      const res = await api.get<ListScheduleTemplatesResponse>("/schedule/templates");
      return res.data;
    },

    async get(id: string): Promise<GetScheduleTemplateResponse> {
      const res = await api.get<GetScheduleTemplateResponse>(`/schedule/templates/${enc(id)}`);
      return res.data;
    },

    async create(dto: CreateScheduleTemplateDto): Promise<CreateScheduleTemplateResponse> {
      const res = await api.post<CreateScheduleTemplateResponse>("/schedule/templates", dto);
      return res.data;
    },

    async update(id: string, dto: UpdateScheduleTemplateDto): Promise<UpdateScheduleTemplateResponse> {
      const res = await api.patch<UpdateScheduleTemplateResponse>(`/schedule/templates/${enc(id)}`, dto);
      return res.data;
    },

    async remove(id: string): Promise<DeleteScheduleTemplateResponse> {
      const res = await api.delete<DeleteScheduleTemplateResponse>(`/schedule/templates/${enc(id)}`);
      return res.data;
    },
  },

  /** ======================================
   * Schedule Assignments
   * Base route: /schedule/assignments
   * ===================================== */
  assignments: {
    async list(params?: { employeeId?: string; orgUnitId?: string; templateId?: string }): Promise<ListScheduleAssignmentsResponse> {
      const res = await api.get<ListScheduleAssignmentsResponse>("/schedule/assignments", {
        params: cleanParams(params as any),
      });
      return res.data;
    },

    async create(dto: CreateScheduleAssignmentDto): Promise<CreateScheduleAssignmentResponse> {
      const res = await api.post<CreateScheduleAssignmentResponse>("/schedule/assignments", dto);
      return res.data;
    },

    async update(id: string, dto: UpdateScheduleAssignmentDto): Promise<UpdateScheduleAssignmentResponse> {
      const res = await api.patch<UpdateScheduleAssignmentResponse>(`/schedule/assignments/${enc(id)}`, dto);
      return res.data;
    },

    async remove(id: string): Promise<DeleteScheduleAssignmentResponse> {
      const res = await api.delete<DeleteScheduleAssignmentResponse>(`/schedule/assignments/${enc(id)}`);
      return res.data;
    },
  },

  /** ======================================
   * Shifts
   * Base route: /schedule/shifts
   * ===================================== */
  shifts: {
    async list(filter: ListShiftsDto): Promise<ListShiftsResponse> {
      const res = await api.get<ListShiftsResponse>("/schedule/shifts", {
        params: cleanParams(filter),
      });
      return res.data;
    },

    async get(id: string): Promise<GetShiftResponse> {
      const res = await api.get<GetShiftResponse>(`/schedule/shifts/${enc(id)}`);
      return res.data;
    },

    async create(dto: CreateShiftDto): Promise<CreateShiftResponse> {
      const res = await api.post<CreateShiftResponse>("/schedule/shifts", dto);
      return res.data;
    },

    async update(id: string, dto: UpdateShiftDto): Promise<UpdateShiftResponse> {
      const res = await api.patch<UpdateShiftResponse>(`/schedule/shifts/${enc(id)}`, dto);
      return res.data;
    },

    async cancel(id: string, dto: CancelShiftDto = {}): Promise<CancelShiftResponse> {
      const res = await api.post<CancelShiftResponse>(`/schedule/shifts/${enc(id)}/cancel`, dto);
      return res.data;
    },

    async generate(dto: GenerateShiftsDto): Promise<GenerateShiftsResponse> {
      const res = await api.post<GenerateShiftsResponse>("/schedule/shifts/generate", dto);
      return res.data;
    },

    async publish(dto: PublishShiftsDto): Promise<PublishShiftsResponse> {
      const res = await api.post<PublishShiftsResponse>("/schedule/shifts/publish", dto);
      return res.data;
    },

    async conflicts(dto: ShiftConflictsDto): Promise<ShiftConflictsResponse> {
      const res = await api.post<ShiftConflictsResponse>("/schedule/shifts/conflicts", dto);
      return res.data;
    },
  },
};