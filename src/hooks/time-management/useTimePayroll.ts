"use client";


// C:\Users\kriss\logaxp-landing-page\src\hooks\time-management\useTimePayroll.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { timePayrollService } from "@/logaxp/lib/time-management/timePayrollService";

import type {
  UpdateTimeSettingsDto,
  ListPayPeriodsDto,
  GeneratePayPeriodsDto,
  UpdateOvertimePolicyDto,
  CalcOvertimeDto,
  TimesheetsListQuery,
  SubmitTimesheetDto,
  DecideTimesheetDto,
  ListTimesheetsDto,
} from "@/logaxp/lib/time-management/timePayroll.types";

/** Query keys */
const qk = {
  settings: () => ["time-settings"] as const,
  payPeriods: (filter?: ListPayPeriodsDto) => ["pay-periods", filter ?? {}] as const,
  overtimePolicy: () => ["overtime-policy"] as const,
  overtimeCalc: (dto: CalcOvertimeDto) => ["overtime-calc", dto] as const,

  timesheets: (query?: TimesheetsListQuery) => ["timesheets", query ?? {}] as const,
  timesheet: (id: string) => ["timesheet", id] as const,
};

/** ----------------------------------------
 * Time Settings
 * --------------------------------------- */
export function useTimeSettings() {
  return useQuery({
    queryKey: qk.settings(),
    queryFn: () => timePayrollService.settings.get(),
  });
}

export function useUpdateTimeSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateTimeSettingsDto) => timePayrollService.settings.update(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.settings() });
      qc.invalidateQueries({ queryKey: ["pay-periods"] });
    },
  });
}

/** ----------------------------------------
 * Pay Periods
 * --------------------------------------- */
export function usePayPeriods(q?: ListPayPeriodsDto, enabled = true) {
  return useQuery({
    queryKey: ["pay-periods", q] as const,
    queryFn: () => timePayrollService.payPeriods.list(q),
    enabled,
  });
}


export function useGeneratePayPeriods() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: GeneratePayPeriodsDto) => timePayrollService.payPeriods.generate(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pay-periods"] });
    },
  });
}

export function useLockPayPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => timePayrollService.payPeriods.lock(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pay-periods"] });
      qc.invalidateQueries({ queryKey: ["timesheets"] });
    },
  });
}

export function useUnlockPayPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => timePayrollService.payPeriods.unlock(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pay-periods"] });
      qc.invalidateQueries({ queryKey: ["timesheets"] });
    },
  });
}

/** ----------------------------------------
 * Overtime
 * --------------------------------------- */
export function useOvertimePolicy(enabled = true) {
  return useQuery({
    queryKey: qk.overtimePolicy(),
    queryFn: () => timePayrollService.overtime.getPolicy(),
    enabled,
  });
}

export function useUpdateOvertimePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateOvertimePolicyDto) => timePayrollService.overtime.updatePolicy(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.overtimePolicy() });
      qc.invalidateQueries({ queryKey: ["overtime-calc"] });
    },
  });
}

/**
 * Calc is usually “on demand” (button click), so keep it as a mutation.
 * If you want auto-calc with caching, switch to useQuery.
 */
export function useCalcOvertime() {
  return useMutation({
    mutationFn: (dto: CalcOvertimeDto) => timePayrollService.overtime.calc(dto),
  });
}

/** ----------------------------------------
 * Timesheets
 * --------------------------------------- */
export function useTimesheets(q?: ListTimesheetsDto, enabled = true) {
  return useQuery({
    queryKey: ["timesheets", q] as const,
    queryFn: () => timePayrollService.timesheets.list(q),
    enabled,
  });
}

export function useTimesheet(id: string | null, enabled = true) {
  return useQuery({
    queryKey: ["timesheets", "get", id] as const,
    queryFn: () => timePayrollService.timesheets.get(String(id)),
    enabled: Boolean(id) && enabled,
  });
}

export function useSubmitTimesheet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: SubmitTimesheetDto) => timePayrollService.timesheets.submit(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timesheets"] });
      qc.invalidateQueries({ queryKey: ["pay-periods"] });
      qc.invalidateQueries({ queryKey: ["time-entries"] });
      qc.invalidateQueries({ queryKey: ["time-clocks"] });
    },
  });
}

export function useApproveTimesheet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto?: DecideTimesheetDto }) =>
      timePayrollService.timesheets.approve(vars.id, vars.dto ?? {}),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["timesheets"] });
      qc.invalidateQueries({ queryKey: ["timesheet", vars.id] });
      qc.invalidateQueries({ queryKey: ["time-entries"] });
      qc.invalidateQueries({ queryKey: ["time-clocks"] });
    },
  });
}

export function useRejectTimesheet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto?: DecideTimesheetDto }) =>
      timePayrollService.timesheets.reject(vars.id, vars.dto ?? {}),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["timesheets"] });
      qc.invalidateQueries({ queryKey: ["timesheet", vars.id] });
    },
  });
}