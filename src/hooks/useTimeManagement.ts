// src/hooks/useTimeManagement.ts
"use client";

import { useCallback, useMemo, useState } from "react";
import { timeManagementService } from "@/logaxp/lib/time-management/timeManagementService";
import type {
  // Timers
  StartTimerDto,
  StopTimerDto,
  StopRunningTimerDto,
  SwitchTimerDto,
  TimerHistoryFilterDto,

  // Entries
  CreateTimeEntryDto,
  UpdateTimeEntryDto,
  BulkCreateTimeEntriesDto,
  TimeEntryListFilterDto,
  TimeEntriesStatsDto,
  TimeEntriesDailySummaryDto,

  // Clocks
  ClockInDto,
  ClockOutDto,
  AddBreakDto,
  SetBreakDto,
  TimeClockListFilterDto,
  TimeClockSummaryDto,
  TimeClockAdjustDto,
} from "@/logaxp/lib/time-management/timeManagement.types";

type ApiErrorShape = {
  response?: {
    data?: {
      message?: unknown;
    };
  };
  message?: unknown;
};

function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;

  if (err && typeof err === "object") {
    const e = err as ApiErrorShape;

    const apiMsg = e.response?.data?.message;
    if (typeof apiMsg === "string" && apiMsg.trim()) return apiMsg;

    if (Array.isArray(apiMsg) && apiMsg.length) {
      const first = apiMsg.find((x) => typeof x === "string" && x.trim());
      if (typeof first === "string") return first;
    }

    const msg = e.message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }

  return "Something went wrong";
}

export function useTimeManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrap = useCallback(async <T,>(fn: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  /** ======================================
   * Timers
   * ===================================== */
  const getRunningTimer = useCallback(
    (membershipId: string) => wrap(() => timeManagementService.timers.getRunning(membershipId)),
    [wrap]
  );

  const listTimerHistory = useCallback(
    (filter?: TimerHistoryFilterDto) => wrap(() => timeManagementService.timers.history(filter)),
    [wrap]
  );

  const getTimer = useCallback(
    (timerId: string) => wrap(() => timeManagementService.timers.get(timerId)),
    [wrap]
  );

  const startTimer = useCallback(
    (dto: StartTimerDto) => wrap(() => timeManagementService.timers.start(dto)),
    [wrap]
  );

  const stopTimer = useCallback(
    (timerId: string, dto?: StopTimerDto) => wrap(() => timeManagementService.timers.stop(timerId, dto)),
    [wrap]
  );

  const stopRunningTimer = useCallback(
    (dto: StopRunningTimerDto) => wrap(() => timeManagementService.timers.stopRunning(dto)),
    [wrap]
  );

  const switchTimer = useCallback(
    (dto: SwitchTimerDto) => wrap(() => timeManagementService.timers.switch(dto)),
    [wrap]
  );

  /** ======================================
   * Time Entries
   * ===================================== */
  const listTimeEntries = useCallback(
    (filter?: TimeEntryListFilterDto) => wrap(() => timeManagementService.entries.list(filter)),
    [wrap]
  );

  const getTimeEntry = useCallback(
    (id: string) => wrap(() => timeManagementService.entries.get(id)),
    [wrap]
  );

  const createTimeEntry = useCallback(
    (dto: CreateTimeEntryDto) => wrap(() => timeManagementService.entries.create(dto)),
    [wrap]
  );

  const bulkCreateTimeEntries = useCallback(
    (dto: BulkCreateTimeEntriesDto) => wrap(() => timeManagementService.entries.bulkCreate(dto)),
    [wrap]
  );

  const updateTimeEntry = useCallback(
    (id: string, dto: UpdateTimeEntryDto) => wrap(() => timeManagementService.entries.update(id, dto)),
    [wrap]
  );

  const restoreTimeEntry = useCallback(
    (id: string) => wrap(() => timeManagementService.entries.restore(id)),
    [wrap]
  );

  const softDeleteTimeEntry = useCallback(
    (id: string) => wrap(() => timeManagementService.entries.softDelete(id)),
    [wrap]
  );

  const hardDeleteTimeEntry = useCallback(
    (id: string) => wrap(() => timeManagementService.entries.hardDelete(id)),
    [wrap]
  );

  const getTimeEntriesStats = useCallback(
    (filter?: TimeEntriesStatsDto) => wrap(() => timeManagementService.entries.stats(filter)),
    [wrap]
  );

  const getTimeEntriesDailySummary = useCallback(
    (filter: TimeEntriesDailySummaryDto) => wrap(() => timeManagementService.entries.dailySummary(filter)),
    [wrap]
  );

  /** ======================================
   * Time Clocks
   * ===================================== */
  const listTimeClocks = useCallback(
    (filter?: TimeClockListFilterDto) => wrap(() => timeManagementService.clocks.list(filter)),
    [wrap]
  );

  const getTimeClockSummary = useCallback(
    (filter: TimeClockSummaryDto) => wrap(() => timeManagementService.clocks.summary(filter)),
    [wrap]
  );

  const getOpenTimeClock = useCallback(
    (employeeId: string) => wrap(() => timeManagementService.clocks.getOpen(employeeId)),
    [wrap]
  );

  const getTimeClock = useCallback(
    (clockId: string) => wrap(() => timeManagementService.clocks.get(clockId)),
    [wrap]
  );

  const clockIn = useCallback(
    (dto: ClockInDto) => wrap(() => timeManagementService.clocks.clockIn(dto)),
    [wrap]
  );

  const addClockBreak = useCallback(
    (clockId: string, dto: AddBreakDto) => wrap(() => timeManagementService.clocks.addBreak(clockId, dto)),
    [wrap]
  );

  const setClockBreak = useCallback(
    (clockId: string, dto: SetBreakDto) => wrap(() => timeManagementService.clocks.setBreak(clockId, dto)),
    [wrap]
  );

  const clockOut = useCallback(
    (clockId: string, dto?: ClockOutDto) => wrap(() => timeManagementService.clocks.clockOut(clockId, dto)),
    [wrap]
  );

  const adjustTimeClock = useCallback(
    (clockId: string, dto: TimeClockAdjustDto) => wrap(() => timeManagementService.clocks.adjust(clockId, dto)),
    [wrap]
  );

  /** ======================================
   * Grouped surfaces for nice DX
   * ===================================== */
  const timers = useMemo(
    () => ({
      getRunning: getRunningTimer,
      history: listTimerHistory,
      get: getTimer,
      start: startTimer,
      stop: stopTimer,
      stopRunning: stopRunningTimer,
      switch: switchTimer,
    }),
    [getRunningTimer, listTimerHistory, getTimer, startTimer, stopTimer, stopRunningTimer, switchTimer]
  );

  const timeEntries = useMemo(
    () => ({
      list: listTimeEntries,
      get: getTimeEntry,
      create: createTimeEntry,
      bulkCreate: bulkCreateTimeEntries,
      update: updateTimeEntry,
      restore: restoreTimeEntry,
      softDelete: softDeleteTimeEntry,
      hardDelete: hardDeleteTimeEntry,
      stats: getTimeEntriesStats,
      dailySummary: getTimeEntriesDailySummary,
    }),
    [
      listTimeEntries,
      getTimeEntry,
      createTimeEntry,
      bulkCreateTimeEntries,
      updateTimeEntry,
      restoreTimeEntry,
      softDeleteTimeEntry,
      hardDeleteTimeEntry,
      getTimeEntriesStats,
      getTimeEntriesDailySummary,
    ]
  );

  const timeClocks = useMemo(
    () => ({
      list: listTimeClocks,
      summary: getTimeClockSummary,
      getOpen: getOpenTimeClock,
      get: getTimeClock,
      clockIn,
      addBreak: addClockBreak,
      setBreak: setClockBreak,
      clockOut,
      adjust: adjustTimeClock,
    }),
    [
      listTimeClocks,
      getTimeClockSummary,
      getOpenTimeClock,
      getTimeClock,
      clockIn,
      addClockBreak,
      setClockBreak,
      clockOut,
      adjustTimeClock,
    ]
  );

  return {
    loading,
    error,
    clearError,
    wrap,

    // grouped
    timers,
    timeEntries,
    timeClocks,

    // flat methods (optional)
    getRunningTimer,
    listTimerHistory,
    getTimer,
    startTimer,
    stopTimer,
    stopRunningTimer,
    switchTimer,

    listTimeEntries,
    getTimeEntry,
    createTimeEntry,
    bulkCreateTimeEntries,
    updateTimeEntry,
    restoreTimeEntry,
    softDeleteTimeEntry,
    hardDeleteTimeEntry,
    getTimeEntriesStats,
    getTimeEntriesDailySummary,

    listTimeClocks,
    getTimeClockSummary,
    getOpenTimeClock,
    getTimeClock,
    clockIn,
    addClockBreak,
    setClockBreak,
    clockOut,
    adjustTimeClock,
  };
}