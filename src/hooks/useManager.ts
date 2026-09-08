// src/logaxp/hooks/useManager.ts
"use client";

import { useCallback, useMemo, useState } from "react";
import { managerService } from "@/logaxp/lib/manager/managerService";
import type {
  ManagerLeaveRequestsQueryDto,
  ManagerTeamQueryDto,
  ManagerTimeClocksQueryDto,
  ManagerTimesheetsQueryDto,
} from "@/logaxp/lib/manager/manager.types";

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

    if (Array.isArray(apiMsg) && apiMsg.length > 0) {
      const firstString = apiMsg.find((x) => typeof x === "string");
      if (typeof firstString === "string" && firstString.trim()) return firstString;
    }

    const msg = e.message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }

  return "Something went wrong";
}

export function useManager() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrap = useCallback(async <T,>(fn: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e: unknown) {
      const msg = getErrorMessage(e);
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const getMyProfile = useCallback(() => wrap(() => managerService.getMyProfile()), [wrap]);
  const getMySummary = useCallback(() => wrap(() => managerService.getMySummary()), [wrap]);

  const listMyTeam = useCallback(
    (query?: ManagerTeamQueryDto) => wrap(() => managerService.listMyTeam(query)),
    [wrap]
  );

  const listMyDirectReports = useCallback(
    (query?: ManagerTeamQueryDto) => wrap(() => managerService.listMyDirectReports(query)),
    [wrap]
  );

  const listMyAssignmentReports = useCallback(
    (query?: ManagerTeamQueryDto) => wrap(() => managerService.listMyAssignmentReports(query)),
    [wrap]
  );

  const listMyOrgUnitScope = useCallback(
    (query?: ManagerTeamQueryDto) => wrap(() => managerService.listMyOrgUnitScope(query)),
    [wrap]
  );

  const listMyLocationScope = useCallback(
    (query?: ManagerTeamQueryDto) => wrap(() => managerService.listMyLocationScope(query)),
    [wrap]
  );

  const listMyCostCenterScope = useCallback(
    (query?: ManagerTeamQueryDto) => wrap(() => managerService.listMyCostCenterScope(query)),
    [wrap]
  );

  const listMyManagedOrgUnits = useCallback(
    () => wrap(() => managerService.listMyManagedOrgUnits()),
    [wrap]
  );

  const listMyManagedLocations = useCallback(
    () => wrap(() => managerService.listMyManagedLocations()),
    [wrap]
  );

  const listMyOwnedCostCenters = useCallback(
    () => wrap(() => managerService.listMyOwnedCostCenters()),
    [wrap]
  );

  const listMyLeaveRequests = useCallback(
    (query?: ManagerLeaveRequestsQueryDto) => wrap(() => managerService.listMyLeaveRequests(query)),
    [wrap]
  );

  const listMyTimesheets = useCallback(
    (query?: ManagerTimesheetsQueryDto) => wrap(() => managerService.listMyTimesheets(query)),
    [wrap]
  );

  const listMyTimeClocks = useCallback(
    (query?: ManagerTimeClocksQueryDto) => wrap(() => managerService.listMyTimeClocks(query)),
    [wrap]
  );

  const getManagerSummaryByEmployeeId = useCallback(
    (employeeId: string) => wrap(() => managerService.getManagerSummaryByEmployeeId(employeeId)),
    [wrap]
  );

  const listManagerTeamByEmployeeId = useCallback(
    (employeeId: string, query?: ManagerTeamQueryDto) =>
      wrap(() => managerService.listManagerTeamByEmployeeId(employeeId, query)),
    [wrap]
  );

  const me = useMemo(
    () => ({
      profile: getMyProfile,
      summary: getMySummary,
      team: listMyTeam,
      directReports: listMyDirectReports,
      assignmentReports: listMyAssignmentReports,
      orgUnitScope: listMyOrgUnitScope,
      locationScope: listMyLocationScope,
      costCenterScope: listMyCostCenterScope,
      managedOrgUnits: listMyManagedOrgUnits,
      managedLocations: listMyManagedLocations,
      ownedCostCenters: listMyOwnedCostCenters,
      leaveRequests: listMyLeaveRequests,
      timesheets: listMyTimesheets,
      timeClocks: listMyTimeClocks,
    }),
    [
      getMyProfile,
      getMySummary,
      listMyTeam,
      listMyDirectReports,
      listMyAssignmentReports,
      listMyOrgUnitScope,
      listMyLocationScope,
      listMyCostCenterScope,
      listMyManagedOrgUnits,
      listMyManagedLocations,
      listMyOwnedCostCenters,
      listMyLeaveRequests,
      listMyTimesheets,
      listMyTimeClocks,
    ]
  );

  const admin = useMemo(
    () => ({
      summaryByEmployeeId: getManagerSummaryByEmployeeId,
      teamByEmployeeId: listManagerTeamByEmployeeId,
    }),
    [getManagerSummaryByEmployeeId, listManagerTeamByEmployeeId]
  );

  return {
    loading,
    error,
    clearError,
    wrap,
    me,
    admin,

    getMyProfile,
    getMySummary,
    listMyTeam,
    listMyDirectReports,
    listMyAssignmentReports,
    listMyOrgUnitScope,
    listMyLocationScope,
    listMyCostCenterScope,
    listMyManagedOrgUnits,
    listMyManagedLocations,
    listMyOwnedCostCenters,
    listMyLeaveRequests,
    listMyTimesheets,
    listMyTimeClocks,
    getManagerSummaryByEmployeeId,
    listManagerTeamByEmployeeId,
  };
}