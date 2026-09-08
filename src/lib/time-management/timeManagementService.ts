// src/lib/time-management/timeManagementService.ts
"use client";

import { api } from "@/logaxp/lib/api/apiClient";
import type {
  // Timer DTOs
  StartTimerDto,
  StopTimerDto,
  StopRunningTimerDto,
  SwitchTimerDto,
  TimerHistoryFilterDto,

  // Time Entry DTOs
  CreateTimeEntryDto,
  UpdateTimeEntryDto,
  BulkCreateTimeEntriesDto,
  TimeEntryListFilterDto,
  TimeEntriesStatsDto,
  TimeEntriesDailySummaryDto,

  // Time Clock DTOs
  ClockInDto,
  ClockOutDto,
  AddBreakDto,
  SetBreakDto,
  TimeClockListFilterDto,
  TimeClockSummaryDto,
  TimeClockAdjustDto,

  // Responses (timers)
  GetRunningTimerResponse,
  TimerHistoryResponse,
  GetTimerResponse,
  StartTimerResponse,
  StopTimerResponse,
  StopRunningTimerResponse,
  SwitchTimerResponse,

  // Responses (time entries)
  ListTimeEntriesResponse,
  GetTimeEntryResponse,
  CreateTimeEntryResponse,
  BulkCreateTimeEntriesResponse,
  UpdateTimeEntryResponse,
  RestoreTimeEntryResponse,
  SoftDeleteTimeEntryResponse,
  HardDeleteTimeEntryResponse,
  TimeEntriesStatsResponse,
  TimeEntriesDailySummaryResponse,

  // Responses (clocks)
  ListTimeClocksResponse,
  TimeClockSummaryResponse,
  GetOpenTimeClockResponse,
  GetTimeClockResponse,
  ClockInResponse,
  AddBreakResponse,
  SetBreakResponse,
  ClockOutResponse,
  AdjustTimeClockResponse,
} from "./timeManagement.types";


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

export type PickerListDto = { q?: string; page?: number; pageSize?: number };

export type ApiResponse<T = unknown> = { statusCode: number; message: string; data: T };
export type Paged<T> = { items: T[]; page?: number; pageSize?: number; total?: number };

export type EmployeePickerRow = { id: string; firstName?: string | null; lastName?: string | null };
export type OrgUnitPickerRow = { id: string; name?: string | null; code?: string | null };
export type LocationPickerRow = { id: string; name?: string | null; code?: string | null };
export type ScheduleTemplatePickerRow = { id: string; name?: string | null; type?: string | null };

export type EmployeesListResponse = ApiResponse<Paged<EmployeePickerRow> | any>;
export type OrgUnitsListResponse = ApiResponse<any>;
export type LocationsListResponse = ApiResponse<any>;
export type ScheduleTemplatesListResponse = ApiResponse<any>;

export const timeManagementService = {
  /** ======================================
   * TIMERS
   * Base route: /timers
   * ===================================== */
  timers: {
    async getRunning(membershipId: string): Promise<GetRunningTimerResponse> {
      const res = await api.get<GetRunningTimerResponse>(`/timers/running/${enc(membershipId)}`);
      return res.data;
    },

    async history(filter?: TimerHistoryFilterDto): Promise<TimerHistoryResponse> {
      const res = await api.get<TimerHistoryResponse>("/timers/history", {
        params: cleanParams(filter),
      });
      return res.data;
    },

    async get(timerId: string): Promise<GetTimerResponse> {
      const res = await api.get<GetTimerResponse>(`/timers/${enc(timerId)}`);
      return res.data;
    },

    async start(dto: StartTimerDto): Promise<StartTimerResponse> {
      const res = await api.post<StartTimerResponse>("/timers/start", dto);
      return res.data;
    },

    async stop(timerId: string, dto: StopTimerDto = {}): Promise<StopTimerResponse> {
      const res = await api.post<StopTimerResponse>(`/timers/${enc(timerId)}/stop`, dto);
      return res.data;
    },

    async stopRunning(dto: StopRunningTimerDto): Promise<StopRunningTimerResponse> {
      const res = await api.post<StopRunningTimerResponse>("/timers/stop-running", dto);
      return res.data;
    },

    async switch(dto: SwitchTimerDto): Promise<SwitchTimerResponse> {
      const res = await api.post<SwitchTimerResponse>("/timers/switch", dto);
      return res.data;
    },
  },

  /** ======================================
   * TIME ENTRIES
   * Base route: /time-entries
   * ===================================== */
  entries: {
    async list(filter?: TimeEntryListFilterDto): Promise<ListTimeEntriesResponse> {
      const res = await api.get<ListTimeEntriesResponse>("/time-entries", {
        params: cleanParams(filter),
      });
      return res.data;
    },

    async stats(filter?: TimeEntriesStatsDto): Promise<TimeEntriesStatsResponse> {
      const res = await api.get<TimeEntriesStatsResponse>("/time-entries/stats", {
        params: cleanParams(filter),
      });
      return res.data;
    },

    async dailySummary(filter: TimeEntriesDailySummaryDto): Promise<TimeEntriesDailySummaryResponse> {
      const res = await api.get<TimeEntriesDailySummaryResponse>("/time-entries/summary/daily", {
        params: cleanParams(filter),
      });
      return res.data;
    },

    async get(id: string): Promise<GetTimeEntryResponse> {
      const res = await api.get<GetTimeEntryResponse>(`/time-entries/${enc(id)}`);
      return res.data;
    },

    async create(dto: CreateTimeEntryDto): Promise<CreateTimeEntryResponse> {
      const res = await api.post<CreateTimeEntryResponse>("/time-entries", dto);
      return res.data;
    },

    async bulkCreate(dto: BulkCreateTimeEntriesDto): Promise<BulkCreateTimeEntriesResponse> {
      const res = await api.post<BulkCreateTimeEntriesResponse>("/time-entries/bulk", dto);
      return res.data;
    },

    async update(id: string, dto: UpdateTimeEntryDto): Promise<UpdateTimeEntryResponse> {
      const res = await api.patch<UpdateTimeEntryResponse>(`/time-entries/${enc(id)}`, dto);
      return res.data;
    },

    async restore(id: string): Promise<RestoreTimeEntryResponse> {
      const res = await api.post<RestoreTimeEntryResponse>(`/time-entries/${enc(id)}/restore`);
      return res.data;
    },

    async softDelete(id: string): Promise<SoftDeleteTimeEntryResponse> {
      const res = await api.delete<SoftDeleteTimeEntryResponse>(`/time-entries/${enc(id)}`);
      return res.data;
    },

    async hardDelete(id: string): Promise<HardDeleteTimeEntryResponse> {
      const res = await api.delete<HardDeleteTimeEntryResponse>(`/time-entries/${enc(id)}/hard`);
      return res.data;
    },
  },

    /** ======================================
   * PICKERS (for AsyncSelect)
   * Aligns with real controllers:
   * - /employees   (EmployeeListQueryDto)
   * - /org-units   (?search=)
   * - /locations   (?search=)
   * - /schedule/templates (?q= or ?search= depending on DTO)
   * ===================================== */

  employees: {
    async list(filter?: PickerListDto): Promise<EmployeesListResponse> {
      // EmployeesController list(@Query() query: EmployeeListQueryDto)
      // Most of your app uses q/page/pageSize; we pass through.
      const res = await api.get<EmployeesListResponse>("/employees", {
        params: cleanParams({
          ...filter,
          // if backend expects "search" instead of "q", flip it here:
          // search: filter?.q,
          // q: undefined,
        } as any),
      });
      return res.data;
    },
  },

  orgUnits: {
    async list(filter?: PickerListDto): Promise<OrgUnitsListResponse> {
      // OrgUnitsController expects: type,parentId,includeDeleted,search
      const res = await api.get<OrgUnitsListResponse>("/org-units", {
        params: cleanParams({
          page: filter?.page,
          pageSize: filter?.pageSize,
          search: filter?.q, // ✅ map q -> search
          includeDeleted: false,
        } as any),
      });
      return res.data;
    },
  },

  locations: {
    async list(filter?: PickerListDto): Promise<LocationsListResponse> {
      // LocationsController expects: type,includeDeleted,search
      const res = await api.get<LocationsListResponse>("/locations", {
        params: cleanParams({
          page: filter?.page,
          pageSize: filter?.pageSize,
          search: filter?.q, // ✅ map q -> search
          includeDeleted: false,
        } as any),
      });
      return res.data;
    },
  },

  schedule: {
    templates: {
      async list(filter?: PickerListDto): Promise<ScheduleTemplatesListResponse> {
        // ScheduleTemplatesController list(@Query() q: ListScheduleTemplatesDto)
        // If your DTO supports q, keep it. If it uses search, map like orgUnits.
        const res = await api.get<ScheduleTemplatesListResponse>("/schedule/templates", {
          params: cleanParams({
            q: filter?.q,
            page: filter?.page,
            pageSize: filter?.pageSize,
            // If DTO uses "search" instead:
            // search: filter?.q,
            // q: undefined,
          } as any),
        });
        return res.data;
      },
    },
  },

  /** ======================================
   * TIME CLOCKS
   * Base route: /time-clocks
   * ===================================== */
  clocks: {
    async list(filter?: TimeClockListFilterDto): Promise<ListTimeClocksResponse> {
      const res = await api.get<ListTimeClocksResponse>("/time-clocks", {
        params: cleanParams(filter),
      });
      return res.data;
    },

    async summary(filter: TimeClockSummaryDto): Promise<TimeClockSummaryResponse> {
      const res = await api.get<TimeClockSummaryResponse>("/time-clocks/summary", {
        params: cleanParams(filter),
      });
      return res.data;
    },

    async getOpen(employeeId: string): Promise<GetOpenTimeClockResponse> {
      const res = await api.get<GetOpenTimeClockResponse>(`/time-clocks/open/${enc(employeeId)}`);
      return res.data;
    },

    async get(clockId: string): Promise<GetTimeClockResponse> {
      const res = await api.get<GetTimeClockResponse>(`/time-clocks/${enc(clockId)}`);
      return res.data;
    },

    async clockIn(dto: ClockInDto): Promise<ClockInResponse> {
      const res = await api.post<ClockInResponse>("/time-clocks/clock-in", dto);
      return res.data;
    },

    async addBreak(clockId: string, dto: AddBreakDto): Promise<AddBreakResponse> {
      const res = await api.post<AddBreakResponse>(`/time-clocks/${enc(clockId)}/break`, dto);
      return res.data;
    },

    async setBreak(clockId: string, dto: SetBreakDto): Promise<SetBreakResponse> {
      const res = await api.post<SetBreakResponse>(`/time-clocks/${enc(clockId)}/break/set`, dto);
      return res.data;
    },

    async clockOut(clockId: string, dto: ClockOutDto = {}): Promise<ClockOutResponse> {
      const res = await api.post<ClockOutResponse>(`/time-clocks/${enc(clockId)}/clock-out`, dto);
      return res.data;
    },

    async adjust(clockId: string, dto: TimeClockAdjustDto): Promise<AdjustTimeClockResponse> {
      const res = await api.patch<AdjustTimeClockResponse>(`/time-clocks/${enc(clockId)}`, dto);
      return res.data;
    },
  },
};