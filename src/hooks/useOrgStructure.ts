// src/hooks/useOrgStructure.ts
"use client";

import { useCallback, useMemo, useState } from "react";
import { orgStructureService } from "@/logaxp/lib/orgStructure/orgStructureService";
import type {
  // DTOs
  OrgUnitListFilterDto,
  CreateOrgUnitDto,
  UpdateOrgUnitDto,

  PositionsListFilterDto,
  CreatePositionDto,
  UpdatePositionDto,

  LocationsListFilterDto,
  CreateLocationDto,
  UpdateLocationDto,

  CostCentersListFilterDto,
  CreateCostCenterDto,
  UpdateCostCenterDto,
  ListOrgUnitEmployeesQuery,
  ListLocationEmployeesQueryDto,
  ListCostCenterEmployeesQueryDto,
} from "@/logaxp/lib/orgStructure/orgStructure.types";

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

export function useOrgStructure() {
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

  /* =========================================
   * Org Units
   * ======================================= */

  const listOrgUnits = useCallback(
    (filter?: OrgUnitListFilterDto) => wrap(() => orgStructureService.listOrgUnits(filter)),
    [wrap]
  );

  const listEmployees = useCallback(
    (id: string, filter?: ListOrgUnitEmployeesQuery) =>
      wrap(() => orgStructureService.listOrgUnitEmployees(id, filter)),
    [wrap]
  );

  const getOrgUnit = useCallback((id: string) => wrap(() => orgStructureService.getOrgUnit(id)), [wrap]);

  const getOrgUnitTree = useCallback((id: string) => wrap(() => orgStructureService.getOrgUnitTree(id)), [wrap]);

  const getOrgUnitTreeAll = useCallback(() => wrap(() => orgStructureService.getOrgUnitTreeAll()), [wrap]);

  const createOrgUnit = useCallback((dto: CreateOrgUnitDto) => wrap(() => orgStructureService.createOrgUnit(dto)), [wrap]);

  const updateOrgUnit = useCallback(
    (id: string, dto: UpdateOrgUnitDto) => wrap(() => orgStructureService.updateOrgUnit(id, dto)),
    [wrap]
  );

  const softDeleteOrgUnit = useCallback((id: string) => wrap(() => orgStructureService.softDeleteOrgUnit(id)), [wrap]);

  const restoreOrgUnit = useCallback((id: string) => wrap(() => orgStructureService.restoreOrgUnit(id)), [wrap]);

  /* =========================================
   * Positions
   * ======================================= */

  const listPositions = useCallback(
    (filter?: PositionsListFilterDto) => wrap(() => orgStructureService.listPositions(filter)),
    [wrap]
  );

  const getPosition = useCallback((id: string) => wrap(() => orgStructureService.getPosition(id)), [wrap]);

  const createPosition = useCallback(
    (dto: CreatePositionDto) => wrap(() => orgStructureService.createPosition(dto)),
    [wrap]
  );

  const updatePosition = useCallback(
    (id: string, dto: UpdatePositionDto) => wrap(() => orgStructureService.updatePosition(id, dto)),
    [wrap]
  );

  const softDeletePosition = useCallback((id: string) => wrap(() => orgStructureService.softDeletePosition(id)), [wrap]);

  const restorePosition = useCallback((id: string) => wrap(() => orgStructureService.restorePosition(id)), [wrap]);

  /* =========================================
   * Locations
   * ======================================= */

  const listLocations = useCallback(
    (filter?: LocationsListFilterDto) => wrap(() => orgStructureService.listLocations(filter)),
    [wrap]
  );

  const getLocation = useCallback((id: string) => wrap(() => orgStructureService.getLocation(id)), [wrap]);

  const createLocation = useCallback(
    (dto: CreateLocationDto) => wrap(() => orgStructureService.createLocation(dto)),
    [wrap]
  );

  const updateLocation = useCallback(
    (id: string, dto: UpdateLocationDto) => wrap(() => orgStructureService.updateLocation(id, dto)),
    [wrap]
  );

  const listLocationEmployees = useCallback(
    (id: string, filter?: ListLocationEmployeesQueryDto) =>
      wrap(() => orgStructureService.listLocationEmployees(id, filter)),
    [wrap]
  );

  const softDeleteLocation = useCallback((id: string) => wrap(() => orgStructureService.softDeleteLocation(id)), [wrap]);

  const restoreLocation = useCallback((id: string) => wrap(() => orgStructureService.restoreLocation(id)), [wrap]);

  /* =========================================
   * Cost Centers
   * ======================================= */

  const listCostCenters = useCallback(
    (filter?: CostCentersListFilterDto) => wrap(() => orgStructureService.listCostCenters(filter)),
    [wrap]
  );

  const getCostCenter = useCallback((id: string) => wrap(() => orgStructureService.getCostCenter(id)), [wrap]);

  const createCostCenter = useCallback(
    (dto: CreateCostCenterDto) => wrap(() => orgStructureService.createCostCenter(dto)),
    [wrap]
  );

  const updateCostCenter = useCallback(
    (id: string, dto: UpdateCostCenterDto) => wrap(() => orgStructureService.updateCostCenter(id, dto)),
    [wrap]
  );

  const listCostCenterEmployees = useCallback(
    (id: string, filter?: ListCostCenterEmployeesQueryDto) =>
      wrap(() => orgStructureService.listCostCenterEmployees(id, filter)),
    [wrap]
  );

  const softDeleteCostCenter = useCallback(
    (id: string) => wrap(() => orgStructureService.softDeleteCostCenter(id)),
    [wrap]
  );

  const restoreCostCenter = useCallback((id: string) => wrap(() => orgStructureService.restoreCostCenter(id)), [wrap]);

  /* =========================================
   * Grouped API surfaces (nice DX)
   * ======================================= */

  const orgUnits = useMemo(
    () => ({
      list: listOrgUnits,
      get: getOrgUnit,
      listEmployees: listEmployees,
      tree: getOrgUnitTree,
      treeAll: getOrgUnitTreeAll,
      create: createOrgUnit,
      update: updateOrgUnit,
      remove: softDeleteOrgUnit,
      restore: restoreOrgUnit,
    }),
    [
      listOrgUnits,
      listEmployees,
      getOrgUnit,
      getOrgUnitTree,
      getOrgUnitTreeAll,
      createOrgUnit,
      updateOrgUnit,
      softDeleteOrgUnit,
      restoreOrgUnit,
    ]
  );

  const positions = useMemo(
    () => ({
      list: listPositions,
      get: getPosition,
      create: createPosition,
      update: updatePosition,
      remove: softDeletePosition,
      restore: restorePosition,
    }),
    [listPositions, getPosition, createPosition, updatePosition, softDeletePosition, restorePosition]
  );

  const locations = useMemo(
    () => ({
      list: listLocations,
      get: getLocation,
      create: createLocation,
      update: updateLocation,
      listEmployees: listLocationEmployees,
      remove: softDeleteLocation,
      restore: restoreLocation,
    }),
    [listLocations, getLocation, createLocation, updateLocation, softDeleteLocation, restoreLocation, listLocationEmployees]
  );

  const costCenters = useMemo(
    () => ({
      list: listCostCenters,
      get: getCostCenter,
      create: createCostCenter,
      update: updateCostCenter,
      remove: softDeleteCostCenter,
      restore: restoreCostCenter,
      listEmployees: listCostCenterEmployees,
    }),
    [
      listCostCenters,
      getCostCenter,
      createCostCenter,
      updateCostCenter,
      softDeleteCostCenter,
      restoreCostCenter,
      listCostCenterEmployees,
    ]
  );

  return {
    loading,
    error,
    clearError,
    wrap,

    // grouped surfaces
    orgUnits,
    positions,
    locations,
    costCenters,

    // flat methods (optional convenience)
    listOrgUnits,
    getOrgUnit,
    getOrgUnitTree,
    getOrgUnitTreeAll,
    createOrgUnit,
    updateOrgUnit,
    softDeleteOrgUnit,
    restoreOrgUnit,

    listPositions,
    getPosition,
    createPosition,
    updatePosition,
    softDeletePosition,
    restorePosition,

    listLocations,
    getLocation,
    createLocation,
    updateLocation,
    softDeleteLocation,
    restoreLocation,
    listEmployees: listLocationEmployees,

    listCostCenters,
    getCostCenter,
    createCostCenter,
    updateCostCenter,
    softDeleteCostCenter,
    restoreCostCenter,
    listCostCenterEmployees,
  };
}