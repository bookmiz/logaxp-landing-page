// src/logaxp/lib/manager/managerService.ts
"use client";

import { api } from "@/logaxp/lib/api/apiClient";
import type {
  GetManagerSummaryByEmployeeIdResponse,
  GetMyManagerProfileResponse,
  GetMyManagerSummaryResponse,
  ListManagerTeamByEmployeeIdResponse,
  ListMyAssignmentReportsResponse,
  ListMyCostCenterScopeResponse,
  ListMyDirectReportsResponse,
  ListMyLeaveRequestsResponse,
  ListMyLocationScopeResponse,
  ListMyManagedLocationsResponse,
  ListMyManagedOrgUnitsResponse,
  ListMyOrgUnitScopeResponse,
  ListMyOwnedCostCentersResponse,
  ListMyTimeClocksResponse,
  ListMyTimesheetsResponse,
  ListMyManagerTeamResponse,
  ManagerLeaveRequestsQueryDto,
  ManagerTeamQueryDto,
  ManagerTimeClocksQueryDto,
  ManagerTimesheetsQueryDto,
} from "./manager.types";

function cleanParams<T extends object = Record<string, unknown>>(
  obj?: T
): Record<string, unknown> | undefined {
  if (!obj) return undefined;

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (value === undefined) continue;
    out[key] = value;
  }
  return out;
}

function enc(value: string): string {
  return encodeURIComponent(value);
}

export const managerService = {
  async getMyProfile(): Promise<GetMyManagerProfileResponse> {
    const res = await api.get<GetMyManagerProfileResponse>("/manager/me");
    return res.data;
  },

  async getMySummary(): Promise<GetMyManagerSummaryResponse> {
    const res = await api.get<GetMyManagerSummaryResponse>("/manager/me/summary");
    return res.data;
  },

  async listMyTeam(query?: ManagerTeamQueryDto): Promise<ListMyManagerTeamResponse> {
    const res = await api.get<ListMyManagerTeamResponse>("/manager/me/team", {
      params: cleanParams(query),
    });
    return res.data;
  },

  async listMyDirectReports(query?: ManagerTeamQueryDto): Promise<ListMyDirectReportsResponse> {
    const res = await api.get<ListMyDirectReportsResponse>("/manager/me/direct-reports", {
      params: cleanParams(query),
    });
    return res.data;
  },

  async listMyAssignmentReports(
    query?: ManagerTeamQueryDto
  ): Promise<ListMyAssignmentReportsResponse> {
    const res = await api.get<ListMyAssignmentReportsResponse>(
      "/manager/me/assignment-reports",
      {
        params: cleanParams(query),
      }
    );
    return res.data;
  },

  async listMyOrgUnitScope(query?: ManagerTeamQueryDto): Promise<ListMyOrgUnitScopeResponse> {
    const res = await api.get<ListMyOrgUnitScopeResponse>("/manager/me/org-unit-scope", {
      params: cleanParams(query),
    });
    return res.data;
  },

  async listMyLocationScope(query?: ManagerTeamQueryDto): Promise<ListMyLocationScopeResponse> {
    const res = await api.get<ListMyLocationScopeResponse>("/manager/me/location-scope", {
      params: cleanParams(query),
    });
    return res.data;
  },

  async listMyCostCenterScope(
    query?: ManagerTeamQueryDto
  ): Promise<ListMyCostCenterScopeResponse> {
    const res = await api.get<ListMyCostCenterScopeResponse>("/manager/me/cost-center-scope", {
      params: cleanParams(query),
    });
    return res.data;
  },

  async listMyManagedOrgUnits(): Promise<ListMyManagedOrgUnitsResponse> {
    const res = await api.get<ListMyManagedOrgUnitsResponse>("/manager/me/org-units");
    return res.data;
  },

  async listMyManagedLocations(): Promise<ListMyManagedLocationsResponse> {
    const res = await api.get<ListMyManagedLocationsResponse>("/manager/me/locations");
    return res.data;
  },

  async listMyOwnedCostCenters(): Promise<ListMyOwnedCostCentersResponse> {
    const res = await api.get<ListMyOwnedCostCentersResponse>("/manager/me/cost-centers");
    return res.data;
  },

  async listMyLeaveRequests(
    query?: ManagerLeaveRequestsQueryDto
  ): Promise<ListMyLeaveRequestsResponse> {
    const res = await api.get<ListMyLeaveRequestsResponse>("/manager/me/leave-requests", {
      params: cleanParams(query),
    });
    return res.data;
  },

  async listMyTimesheets(
    query?: ManagerTimesheetsQueryDto
  ): Promise<ListMyTimesheetsResponse> {
    const res = await api.get<ListMyTimesheetsResponse>("/manager/me/timesheets", {
      params: cleanParams(query),
    });
    return res.data;
  },

  async listMyTimeClocks(
    query?: ManagerTimeClocksQueryDto
  ): Promise<ListMyTimeClocksResponse> {
    const res = await api.get<ListMyTimeClocksResponse>("/manager/me/time-clocks", {
      params: cleanParams(query),
    });
    return res.data;
  },

  async getManagerSummaryByEmployeeId(
    employeeId: string
  ): Promise<GetManagerSummaryByEmployeeIdResponse> {
    const res = await api.get<GetManagerSummaryByEmployeeIdResponse>(
      `/manager/employees/${enc(employeeId)}/summary`
    );
    return res.data;
  },

  async listManagerTeamByEmployeeId(
    employeeId: string,
    query?: ManagerTeamQueryDto
  ): Promise<ListManagerTeamByEmployeeIdResponse> {
    const res = await api.get<ListManagerTeamByEmployeeIdResponse>(
      `/manager/employees/${enc(employeeId)}/team`,
      {
        params: cleanParams(query),
      }
    );
    return res.data;
  },
};