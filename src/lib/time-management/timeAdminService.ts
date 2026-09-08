"use client";

import { api } from "@/logaxp/lib/api/apiClient";
import type {
  ApiResponse,
  TimeSettings,
  UpdateTimeSettingsDto,
  OvertimePolicy,
  UpdateOvertimePolicyDto,
  CalcOvertimeDto,
  OvertimeCalcResult,
} from "./timeAdmin.types";

export const timeAdminService = {
  timeSettings: {
    async get(): Promise<ApiResponse<TimeSettings>> {
      const res = await api.get<ApiResponse<TimeSettings>>("/time-settings");
      return res.data;
    },
    async update(dto: UpdateTimeSettingsDto): Promise<ApiResponse<TimeSettings>> {
      const res = await api.patch<ApiResponse<TimeSettings>>("/time-settings", dto);
      return res.data;
    },
  },

  overtime: {
    async getPolicy(): Promise<ApiResponse<OvertimePolicy>> {
      const res = await api.get<ApiResponse<OvertimePolicy>>("/overtime/policy");
      return res.data;
    },
    async updatePolicy(dto: UpdateOvertimePolicyDto): Promise<ApiResponse<OvertimePolicy>> {
      const res = await api.patch<ApiResponse<OvertimePolicy>>("/overtime/policy", dto);
      return res.data;
    },
    async calc(dto: CalcOvertimeDto): Promise<ApiResponse<OvertimeCalcResult>> {
      const res = await api.post<ApiResponse<OvertimeCalcResult>>("/overtime/calc", dto);
      return res.data;
    },
  },
};