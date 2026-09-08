"use client";

import { api } from "@/logaxp/lib/api/apiClient";
import type {
  ApiResponse,

  LeaveRequest,
  LeaveHistoryRow,
  LeaveSummaryResult,

  LeaveListFilterDto,
  LeaveCalendarDto,
  LeaveSummaryDto,
  CheckLeaveOverlapDto,

  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  CancelLeaveRequestDto,
  DecideLeaveRequestDto,
  BulkDecideLeaveRequestDto,

  ListLeaveRequestsResponse,
  GetLeaveRequestResponse,
  LeaveHistoryResponse,
  LeaveCalendarResponse,
  LeaveSummaryResponse,
  CheckLeaveOverlapResponse,
  BulkDecideLeaveResponse,
} from "./leave.types";

function cleanParams<T extends Record<string, unknown>>(obj?: T): Record<string, unknown> | undefined {
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

export const leaveService = {
  requests: {
    async list(q?: LeaveListFilterDto): Promise<ListLeaveRequestsResponse> {
      const res = await api.get<ListLeaveRequestsResponse>("/leave-requests", {
        params: cleanParams(q as any),
      });
      return res.data;
    },

    async pending(q?: LeaveListFilterDto): Promise<ListLeaveRequestsResponse> {
      const res = await api.get<ListLeaveRequestsResponse>("/leave-requests/pending", {
        params: cleanParams(q as any),
      });
      return res.data;
    },

    async me(q?: LeaveListFilterDto): Promise<ListLeaveRequestsResponse> {
      const res = await api.get<ListLeaveRequestsResponse>("/leave-requests/me", {
        params: cleanParams(q as any),
      });
      return res.data;
    },

    async employee(employeeId: string, q?: LeaveListFilterDto): Promise<ListLeaveRequestsResponse> {
      const res = await api.get<ListLeaveRequestsResponse>(
        `/leave-requests/employee/${enc(employeeId)}`,
        { params: cleanParams(q as any) }
      );
      return res.data;
    },

    async get(id: string): Promise<GetLeaveRequestResponse> {
      const res = await api.get<GetLeaveRequestResponse>(`/leave-requests/${enc(id)}`);
      return res.data;
    },

    async history(id: string): Promise<LeaveHistoryResponse> {
      const res = await api.get<LeaveHistoryResponse>(`/leave-requests/${enc(id)}/history`);
      return res.data;
    },

    async create(dto: CreateLeaveRequestDto): Promise<ApiResponse<LeaveRequest>> {
      const res = await api.post<ApiResponse<LeaveRequest>>("/leave-requests", dto);
      return res.data;
    },

    async update(id: string, dto: UpdateLeaveRequestDto): Promise<ApiResponse<LeaveRequest>> {
      const res = await api.patch<ApiResponse<LeaveRequest>>(`/leave-requests/${enc(id)}`, dto);
      return res.data;
    },

    async cancel(id: string, dto: CancelLeaveRequestDto): Promise<ApiResponse<LeaveRequest>> {
      const res = await api.post<ApiResponse<LeaveRequest>>(`/leave-requests/${enc(id)}/cancel`, dto);
      return res.data;
    },

    async decide(id: string, dto: DecideLeaveRequestDto): Promise<ApiResponse<LeaveRequest>> {
      const res = await api.post<ApiResponse<LeaveRequest>>(`/leave-requests/${enc(id)}/decide`, dto);
      return res.data;
    },

    async bulkDecide(dto: BulkDecideLeaveRequestDto): Promise<BulkDecideLeaveResponse> {
      const res = await api.post<BulkDecideLeaveResponse>("/leave-requests/bulk/decide", dto);
      return res.data;
    },

    async restore(id: string, reason?: string | null): Promise<ApiResponse<LeaveRequest>> {
      const res = await api.post<ApiResponse<LeaveRequest>>(`/leave-requests/${enc(id)}/restore`, {
        reason: reason ?? null,
      });
      return res.data;
    },

    async checkOverlap(dto: CheckLeaveOverlapDto): Promise<CheckLeaveOverlapResponse> {
      const res = await api.post<CheckLeaveOverlapResponse>("/leave-requests/check-overlap", dto);
      return res.data;
    },

    async calendar(q: LeaveCalendarDto): Promise<LeaveCalendarResponse> {
      const res = await api.get<LeaveCalendarResponse>("/leave-requests/calendar", {
        params: cleanParams(q as any),
      });
      return res.data;
    },

    async summary(q: LeaveSummaryDto): Promise<LeaveSummaryResponse> {
      const res = await api.get<LeaveSummaryResponse>("/leave-requests/summary", {
        params: cleanParams(q as any),
      });
      return res.data;
    },
  },
};