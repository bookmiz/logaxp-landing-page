// src/lib/orgStructure/orgStructureService.ts
"use client";

import { api } from "@/logaxp/lib/api/apiClient";
import type {
  // DTOs
  OrgUnitListFilterDto,
  CreateOrgUnitDto,
  UpdateOrgUnitDto,
  //ListOrgUnitEmployeesQueryDto,
  ListOrgUnitEmployeesQuery,

  PositionsListFilterDto,
  CreatePositionDto,
  UpdatePositionDto,

  LocationsListFilterDto,
  CreateLocationDto,
  UpdateLocationDto,
  ListLocationEmployeesQueryDto,

  CostCentersListFilterDto,
  CreateCostCenterDto,
  UpdateCostCenterDto,
  ListCostCenterEmployeesQueryDto,

  // Responses
  ListOrgUnitsResponse,
  GetOrgUnitResponse,
  GetOrgUnitTreeResponse,
  GetOrgUnitTreeAllResponse,
  CreateOrgUnitResponse,
  UpdateOrgUnitResponse,
  SoftDeleteOrgUnitResponse,
  RestoreOrgUnitResponse,
  ListOrgUnitEmployeesResponse,

  ListPositionsResponse,
  GetPositionResponse,
  CreatePositionResponse,
  UpdatePositionResponse,
  SoftDeletePositionResponse,
  RestorePositionResponse,

  ListLocationsResponse,
  GetLocationResponse,
  CreateLocationResponse,
  UpdateLocationResponse,
  SoftDeleteLocationResponse,
  RestoreLocationResponse,
  ListLocationEmployeesResponse,

  ListCostCentersResponse,
  GetCostCenterResponse,
  CreateCostCenterResponse,
  UpdateCostCenterResponse,
  SoftDeleteCostCenterResponse,
  RestoreCostCenterResponse,
  ListCostCenterEmployeesResponse,
} from "./orgStructure.types";

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

function normalizeOrgUnitFilter(
  filter?: OrgUnitListFilterDto
): Record<string, unknown> | undefined {
  if (!filter) return undefined;

  return cleanParams({
    ...filter,
    parentId: filter.parentId === null ? "null" : filter.parentId,
  });
}

export const orgStructureService = {
  /* =========================================
   * Org Units
   * ======================================= */

  async listOrgUnits(filter?: OrgUnitListFilterDto): Promise<ListOrgUnitsResponse> {
    const res = await api.get<ListOrgUnitsResponse>("/org-units", {
      params: normalizeOrgUnitFilter(filter),
    });
    return res.data;
  },

  async getOrgUnit(id: string): Promise<GetOrgUnitResponse> {
    const res = await api.get<GetOrgUnitResponse>(`/org-units/${enc(id)}`);
    return res.data;
  },

  async getOrgUnitTree(id: string): Promise<GetOrgUnitTreeResponse> {
    const res = await api.get<GetOrgUnitTreeResponse>(`/org-units/${enc(id)}/tree`);
    return res.data;
  },

  async getOrgUnitTreeAll(): Promise<GetOrgUnitTreeAllResponse> {
    const res = await api.get<GetOrgUnitTreeAllResponse>("/org-units/tree/all");
    return res.data;
  },

 async listOrgUnitEmployees(
  id: string,
  filter?: ListOrgUnitEmployeesQuery
): Promise<ListOrgUnitEmployeesResponse> {
  const res = await api.get<ListOrgUnitEmployeesResponse>(
    `/org-units/${enc(id)}/employees`,
    {
      params: cleanParams(filter),
    }
  );
  return res.data;
},

  async createOrgUnit(dto: CreateOrgUnitDto): Promise<CreateOrgUnitResponse> {
    const res = await api.post<CreateOrgUnitResponse>("/org-units", dto);
    return res.data;
  },

  async updateOrgUnit(id: string, dto: UpdateOrgUnitDto): Promise<UpdateOrgUnitResponse> {
    const res = await api.patch<UpdateOrgUnitResponse>(`/org-units/${enc(id)}`, dto);
    return res.data;
  },

  async softDeleteOrgUnit(id: string): Promise<SoftDeleteOrgUnitResponse> {
    const res = await api.delete<SoftDeleteOrgUnitResponse>(`/org-units/${enc(id)}`);
    return res.data;
  },

  async restoreOrgUnit(id: string): Promise<RestoreOrgUnitResponse> {
    const res = await api.post<RestoreOrgUnitResponse>(`/org-units/${enc(id)}/restore`);
    return res.data;
  },

  /* =========================================
   * Positions
   * ======================================= */

  async listPositions(filter?: PositionsListFilterDto): Promise<ListPositionsResponse> {
    const res = await api.get<ListPositionsResponse>("/positions", {
      params: cleanParams(filter),
    });
    return res.data;
  },

  async getPosition(id: string): Promise<GetPositionResponse> {
    const res = await api.get<GetPositionResponse>(`/positions/${enc(id)}`);
    return res.data;
  },

  async createPosition(dto: CreatePositionDto): Promise<CreatePositionResponse> {
    const res = await api.post<CreatePositionResponse>("/positions", dto);
    return res.data;
  },

  async updatePosition(id: string, dto: UpdatePositionDto): Promise<UpdatePositionResponse> {
    const res = await api.patch<UpdatePositionResponse>(`/positions/${enc(id)}`, dto);
    return res.data;
  },

  async softDeletePosition(id: string): Promise<SoftDeletePositionResponse> {
    const res = await api.delete<SoftDeletePositionResponse>(`/positions/${enc(id)}`);
    return res.data;
  },

  async restorePosition(id: string): Promise<RestorePositionResponse> {
    const res = await api.post<RestorePositionResponse>(`/positions/${enc(id)}/restore`);
    return res.data;
  },

  /* =========================================
   * Locations
   * ======================================= */

  async listLocations(filter?: LocationsListFilterDto): Promise<ListLocationsResponse> {
    const res = await api.get<ListLocationsResponse>("/locations", {
      params: cleanParams(filter),
    });
    return res.data;
  },

  async getLocation(id: string): Promise<GetLocationResponse> {
    const res = await api.get<GetLocationResponse>(`/locations/${enc(id)}`);
    return res.data;
  },

  async listLocationEmployees(
    id: string,
    query?: ListLocationEmployeesQueryDto
  ): Promise<ListLocationEmployeesResponse> {
    const res = await api.get<ListLocationEmployeesResponse>(
      `/locations/${enc(id)}/employees`,
      {
        params: cleanParams(query),
      }
    );
    return res.data;
  },

  async createLocation(dto: CreateLocationDto): Promise<CreateLocationResponse> {
    const res = await api.post<CreateLocationResponse>("/locations", dto);
    return res.data;
  },

  async updateLocation(id: string, dto: UpdateLocationDto): Promise<UpdateLocationResponse> {
    const res = await api.patch<UpdateLocationResponse>(`/locations/${enc(id)}`, dto);
    return res.data;
  },

  async softDeleteLocation(id: string): Promise<SoftDeleteLocationResponse> {
    const res = await api.delete<SoftDeleteLocationResponse>(`/locations/${enc(id)}`);
    return res.data;
  },

  async restoreLocation(id: string): Promise<RestoreLocationResponse> {
    const res = await api.post<RestoreLocationResponse>(`/locations/${enc(id)}/restore`);
    return res.data;
  },

  /* =========================================
   * Cost Centers
   * ======================================= */

  async listCostCenters(filter?: CostCentersListFilterDto): Promise<ListCostCentersResponse> {
    const res = await api.get<ListCostCentersResponse>("/cost-centers", {
      params: cleanParams(filter),
    });
    return res.data;
  },

  async getCostCenter(id: string): Promise<GetCostCenterResponse> {
    const res = await api.get<GetCostCenterResponse>(`/cost-centers/${enc(id)}`);
    return res.data;
  },

  async listCostCenterEmployees(
    id: string,
    query?: ListCostCenterEmployeesQueryDto
  ): Promise<ListCostCenterEmployeesResponse> {
    const res = await api.get<ListCostCenterEmployeesResponse>(
      `/cost-centers/${enc(id)}/employees`,
      {
        params: cleanParams(query),
      }
    );
    return res.data;
  },

  async createCostCenter(dto: CreateCostCenterDto): Promise<CreateCostCenterResponse> {
    const res = await api.post<CreateCostCenterResponse>("/cost-centers", dto);
    return res.data;
  },

  async updateCostCenter(id: string, dto: UpdateCostCenterDto): Promise<UpdateCostCenterResponse> {
    const res = await api.patch<UpdateCostCenterResponse>(`/cost-centers/${enc(id)}`, dto);
    return res.data;
  },

  async softDeleteCostCenter(id: string): Promise<SoftDeleteCostCenterResponse> {
    const res = await api.delete<SoftDeleteCostCenterResponse>(`/cost-centers/${enc(id)}`);
    return res.data;
  },

  async restoreCostCenter(id: string): Promise<RestoreCostCenterResponse> {
    const res = await api.post<RestoreCostCenterResponse>(`/cost-centers/${enc(id)}/restore`);
    return res.data;
  },
};