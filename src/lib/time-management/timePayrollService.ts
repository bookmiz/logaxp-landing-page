"use client";

import { api } from "@/logaxp/lib/api/apiClient";
import type {
  GetTimeSettingsResponse,
  UpdateTimeSettingsResponse,
  UpdateTimeSettingsDto,

  ListPayPeriodsDto,
  GeneratePayPeriodsDto,

  GetOvertimePolicyResponse,
  UpdateOvertimePolicyResponse,
  UpdateOvertimePolicyDto,
  CalcOvertimeResponse,
  CalcOvertimeDto,


} from "./timePayroll.types";

import type {
  ApiResponse,
  ListData,
  PayPeriod,
  Timesheet,
  ListTimesheetsDto,
  SubmitTimesheetDto,
  DecideTimesheetDto,
} from "./timePayroll.types";


function cleanParams<T extends object = Record<string, unknown>>(obj?: T): Record<string, unknown> | undefined {
  if (!obj) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    out[k] = v;
  }
  return out;
}

function enc(v: string) {
  return encodeURIComponent(v);
}

export const timePayrollService = {
  /** ======================================
   * TIME SETTINGS
   * Base: /time-settings
   * ===================================== */
  settings: {
    async get(): Promise<GetTimeSettingsResponse> {
      const res = await api.get<GetTimeSettingsResponse>("/time-settings");
      return res.data;
    },

    async update(dto: UpdateTimeSettingsDto): Promise<UpdateTimeSettingsResponse> {
      const res = await api.patch<UpdateTimeSettingsResponse>("/time-settings", dto);
      return res.data;
    },
  },

  /** ======================================
   * PAY PERIODS
   * Base: /pay-periods
   * ===================================== */
 payPeriods: {
    async list(q?: ListPayPeriodsDto): Promise<ApiResponse<ListData<PayPeriod>>> {
      const res = await api.get<ApiResponse<ListData<PayPeriod>>>("/pay-periods", { params: cleanParams(q) });
      return res.data;
    },
    async generate(dto: GeneratePayPeriodsDto): Promise<ApiResponse<{ ok?: true; items?: PayPeriod[] } | PayPeriod[]>> {
      const res = await api.post<ApiResponse<any>>("/pay-periods/generate", dto);
      return res.data;
    },
    async lock(id: string): Promise<ApiResponse<PayPeriod | { ok?: true }>> {
      const res = await api.patch<ApiResponse<any>>(`/pay-periods/${enc(id)}/lock`);
      return res.data;
    },
    async unlock(id: string): Promise<ApiResponse<PayPeriod | { ok?: true }>> {
      const res = await api.patch<ApiResponse<any>>(`/pay-periods/${enc(id)}/unlock`);
      return res.data;
    },
  },

  /** ======================================
   * OVERTIME
   * Base: /overtime
   * ===================================== */
  overtime: {
    async getPolicy(): Promise<GetOvertimePolicyResponse> {
      const res = await api.get<GetOvertimePolicyResponse>("/overtime/policy");
      return res.data;
    },

    async updatePolicy(dto: UpdateOvertimePolicyDto): Promise<UpdateOvertimePolicyResponse> {
      const res = await api.patch<UpdateOvertimePolicyResponse>("/overtime/policy", dto);
      return res.data;
    },

    async calc(dto: CalcOvertimeDto): Promise<CalcOvertimeResponse> {
      const res = await api.post<CalcOvertimeResponse>("/overtime/calc", dto);
      return res.data;
    },
  },

  /** ======================================
   * TIMESHEETS
   * Base: /timesheets
   * ===================================== */
   timesheets: {
    async list(q?: ListTimesheetsDto): Promise<ApiResponse<ListData<Timesheet>>> {
      const res = await api.get<ApiResponse<ListData<Timesheet>>>("/timesheets", { params: cleanParams(q) });
      return res.data;
    },
    async get(id: string): Promise<ApiResponse<Timesheet>> {
      const res = await api.get<ApiResponse<Timesheet>>(`/timesheets/${enc(id)}`);
      return res.data;
    },
    async submit(dto: SubmitTimesheetDto): Promise<ApiResponse<Timesheet>> {
      const res = await api.post<ApiResponse<Timesheet>>("/timesheets/submit", dto);
      return res.data;
    },
    async approve(id: string, dto: DecideTimesheetDto): Promise<ApiResponse<Timesheet>> {
      const res = await api.post<ApiResponse<Timesheet>>(`/timesheets/${enc(id)}/approve`, dto);
      return res.data;
    },
    async reject(id: string, dto: DecideTimesheetDto): Promise<ApiResponse<Timesheet>> {
      const res = await api.post<ApiResponse<Timesheet>>(`/timesheets/${enc(id)}/reject`, dto);
      return res.data;
    },
  },
};