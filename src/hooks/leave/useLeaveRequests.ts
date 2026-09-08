"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leaveService } from "@/logaxp/lib/leave/leaveService";
import type {
  LeaveListFilterDto,
  LeaveCalendarDto,
  LeaveSummaryDto,
  CheckLeaveOverlapDto,
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  CancelLeaveRequestDto,
  DecideLeaveRequestDto,
  BulkDecideLeaveRequestDto,
} from "@/logaxp/lib/leave/leave.types";

const qk = {
  list: (q?: LeaveListFilterDto) => ["leave", "list", q ?? {}] as const,
  pending: (q?: LeaveListFilterDto) => ["leave", "pending", q ?? {}] as const,
  me: (q?: LeaveListFilterDto) => ["leave", "me", q ?? {}] as const,
  employee: (employeeId: string, q?: LeaveListFilterDto) => ["leave", "employee", employeeId, q ?? {}] as const,

  one: (id: string) => ["leave", "one", id] as const,
  history: (id: string) => ["leave", "history", id] as const,

  calendar: (q: LeaveCalendarDto) => ["leave", "calendar", q] as const,
  summary: (q?: LeaveSummaryDto) => ["leave", "summary", q ?? {}] as const,
};

export function useLeaveRequests(q?: LeaveListFilterDto, enabled = true) {
  return useQuery({
    queryKey: qk.list(q),
    queryFn: () => leaveService.requests.list(q),
    enabled,
  });
}

export function useLeavePending(q?: LeaveListFilterDto, enabled = true) {
  return useQuery({
    queryKey: qk.pending(q),
    queryFn: () => leaveService.requests.pending(q),
    enabled,
  });
}

export function useLeaveMe(q?: LeaveListFilterDto, enabled = true) {
  return useQuery({
    queryKey: qk.me(q),
    queryFn: () => leaveService.requests.me(q),
    enabled,
  });
}

export function useLeaveEmployee(employeeId: string | null, q?: LeaveListFilterDto, enabled = true) {
  return useQuery({
    queryKey: ["leave", "employee", employeeId ?? "none", q ?? {}] as const,
    queryFn: () => leaveService.requests.employee(String(employeeId), q),
    enabled: Boolean(employeeId) && enabled,
  });
}

export function useLeaveRequest(id: string | null, enabled = true) {
  return useQuery({
    queryKey: ["leave", "one", id ?? "none"] as const,
    queryFn: () => leaveService.requests.get(String(id)),
    enabled: Boolean(id) && enabled,
  });
}

export function useLeaveHistory(id: string | null, enabled = true) {
  return useQuery({
    queryKey: ["leave", "history", id ?? "none"] as const,
    queryFn: () => leaveService.requests.history(String(id)),
    enabled: Boolean(id) && enabled,
  });
}

export function useLeaveCalendar(q: LeaveCalendarDto, enabled = true) {
  return useQuery({
    queryKey: qk.calendar(q),
    queryFn: () => leaveService.requests.calendar(q),
    enabled,
  });
}

export function useLeaveSummary(q?: LeaveSummaryDto, enabled = true) {
  return useQuery({
    queryKey: qk.summary(q),
    queryFn: () => leaveService.requests.summary(q ?? {}),
    enabled,
  });
}

export function useCheckLeaveOverlap() {
  return useMutation({
    mutationFn: (dto: CheckLeaveOverlapDto) => leaveService.requests.checkOverlap(dto),
  });
}

// ------------------- Mutations -------------------

export function useCreateLeaveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateLeaveRequestDto) => leaveService.requests.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leave"] as any });
    },
  });
}

export function useUpdateLeaveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: UpdateLeaveRequestDto }) => leaveService.requests.update(vars.id, vars.dto),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["leave"] as any });
      qc.invalidateQueries({ queryKey: ["leave", "one", vars.id] as any });
      qc.invalidateQueries({ queryKey: ["leave", "history", vars.id] as any });
    },
  });
}

export function useCancelLeaveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: CancelLeaveRequestDto }) => leaveService.requests.cancel(vars.id, vars.dto),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["leave"] as any });
      qc.invalidateQueries({ queryKey: ["leave", "one", vars.id] as any });
      qc.invalidateQueries({ queryKey: ["leave", "history", vars.id] as any });
    },
  });
}

export function useDecideLeaveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: DecideLeaveRequestDto }) => leaveService.requests.decide(vars.id, vars.dto),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["leave"] as any });
      qc.invalidateQueries({ queryKey: ["leave", "one", vars.id] as any });
      qc.invalidateQueries({ queryKey: ["leave", "history", vars.id] as any });
      qc.invalidateQueries({ queryKey: ["leave", "pending"] as any });
      qc.invalidateQueries({ queryKey: ["leave", "calendar"] as any });
    },
  });
}

export function useBulkDecideLeaveRequests() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: BulkDecideLeaveRequestDto) => leaveService.requests.bulkDecide(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leave"] as any });
      qc.invalidateQueries({ queryKey: ["leave", "pending"] as any });
      qc.invalidateQueries({ queryKey: ["leave", "calendar"] as any });
    },
  });
}

export function useRestoreLeaveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; reason?: string | null }) => leaveService.requests.restore(vars.id, vars.reason ?? null),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["leave"] as any });
      qc.invalidateQueries({ queryKey: ["leave", "one", vars.id] as any });
      qc.invalidateQueries({ queryKey: ["leave", "history", vars.id] as any });
      qc.invalidateQueries({ queryKey: ["leave", "pending"] as any });
    },
  });
}