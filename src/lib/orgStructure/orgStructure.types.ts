// src/lib/orgStructure/orgStructure.types.ts

import { OnboardingStepInstance } from "../onboarding/onboarding.types";

/** ----------------------------------------
 * Generic API envelope
 * --------------------------------------- */
export type ApiResponse<T = unknown> = {
  statusCode: number;
  message: string;
  data: T;
};

export type Maybe<T> = T | null;

export type ListMeta = {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
};

export type ListData<T> =
  | T[]
  | {
      items: T[];
      meta?: ListMeta;
      [key: string]: unknown;
    };

/** ----------------------------------------
 * FE-safe enums
 * --------------------------------------- */
export type OrgUnitType = "DIVISION" | "DEPARTMENT" | "TEAM" | (string & {});
export type LocationType = "HQ" | "BRANCH" | "REMOTE" | "OTHER" | (string & {});

/** ----------------------------------------
 * Shared summaries
 * --------------------------------------- */
export interface EmployeeSummary {
  id: string;
  employeeNumber?: string | null;
  firstName?: string;
  lastName?: string;
  preferredName?: string | null;
  workEmail?: string | null;
  personalEmail?: string | null;
  workPhone?: string | null;
  personalPhone?: string | null;
  status?: string;
  [key: string]: unknown;
}

export interface OrgUnitMini {
  id: string;
  name?: string;
  code?: string | null;
  type?: OrgUnitType;
  [key: string]: unknown;
}

export interface LocationMini {
  id: string;
  name?: string;
  code?: string | null;
  type?: LocationType;
  [key: string]: unknown;
}

export interface PositionMini {
  id: string;
  name?: string | null;
  title?: string | null;
  code?: string | null;
  [key: string]: unknown;
}

export interface CostCenterMini {
  id: string;
  name?: string;
  code?: string | null;
  [key: string]: unknown;
}



export interface EmployeeAssignmentSummary {
  id: string;
  orgUnitId?: string | null;
  locationId?: string | null;
  positionId?: string | null;
  costCenterId?: string | null;
  managerId?: string | null;
  isPrimary?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  orgUnit?: { id: string; name: string; code?: string | null } | null;
  location?: { id: string; name: string; code?: string | null; type?: string | null } | null;
  position?: { id: string; name?: string | null; title?: string | null; code?: string | null } | null;
  costCenter?: { id: string; name: string; code?: string | null } | null;
  manager?: {
    id: string;
    employeeNumber?: string | null;
    firstName?: string;
    lastName?: string;
    preferredName?: string | null;
    workEmail?: string | null;
    personalEmail?: string | null;
    workPhone?: string | null;
    personalPhone?: string | null;
    status?: string;
  } | null;
}

// export interface EmployeeAssignmentSummary {
//   id: string;
//   orgUnitId?: string | null;
//   locationId?: string | null;
//   positionId?: string | null;
//   costCenterId?: string | null;
//   managerId?: string | null;
//   isPrimary?: boolean;
//   effectiveFrom?: string;
//   effectiveTo?: string | null;

//   orgUnit?: OrgUnitMini | null;
//   location?: LocationMini | null;
//   position?: PositionMini | null;
//   costCenter?: CostCenterMini | null;
//   manager?: EmployeeSummary | null;

//   [key: string]: unknown;
// }

/** ----------------------------------------
 * Domain entities
 * --------------------------------------- */



export interface OrgUnit extends Record<string, unknown> {
  id: string;
  name?: string;
  type?: OrgUnitType;
  parentId?: string | null;

  code?: string | null;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  metadata?: unknown;

  managerEmployeeId?: string | null;
  managerEmployee?: OrgUnitManagerSummary | null;

  parent?: OrgUnitParentSummary | null;
  children?: OrgUnitChildSummary[];

  [key: string]: unknown;
}

export interface OrgUnitTreeNode extends OrgUnit {
  children?: OrgUnitTreeNode[];
}

export interface Location {
  id: string;
  tenantId?: string;

  name?: string;
  type?: LocationType;

  code?: string | null;
  description?: string | null;

  timezone?: string | null;
  phone?: string | null;
  email?: string | null;

  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;

  geoLat?: string | null;
  geoLng?: string | null;

  managerEmployeeId?: string | null;
  managerEmployee?: EmployeeSummary | null;

  metadata?: unknown;

  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;

  [key: string]: unknown;
}



export interface CostCenter {
  id: string;
  tenantId?: string;
  name?: string;
  code?: string | null;
  description?: string | null;
  ownerEmployeeId?: string | null;
  ownerEmployee?: EmployeeSummary | null;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}


export interface Position {
  id: string;
  tenantId: string;
  name: string;
  title?: string | null;
  code?: string | null;
  description?: string | null;
  level?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

/** ----------------------------------------
 * Employee list items returned by org structure routes
 * --------------------------------------- */
export interface OrgUnitEmployeeListItem {
  id: string;
  tenantId: string;
  employeeNumber?: string | null;
  status?: string;
  employmentType?: string;
  firstName?: string;
  lastName?: string;
  preferredName?: string | null;
  workEmail?: string | null;
  personalEmail?: string | null;
  workPhone?: string | null;
  personalPhone?: string | null;
  hireDate?: string | null;
  startDate?: string | null;
  deletedAt?: string | null;
  primaryAssignment?: EmployeeAssignmentSummary | null;
  [key: string]: unknown;
}

export interface LocationEmployeeListItem {
  id: string;
  tenantId: string;
  employeeNumber?: string | null;
  status?: string;
  employmentType?: string;
  firstName?: string;
  lastName?: string;
  preferredName?: string | null;
  workEmail?: string | null;
  personalEmail?: string | null;
  workPhone?: string | null;
  personalPhone?: string | null;
  hireDate?: string | null;
  startDate?: string | null;
  deletedAt?: string | null;
  primaryAssignment?: EmployeeAssignmentSummary | null;
  [key: string]: unknown;
}

export interface CostCenterEmployeeListItem {
  id: string;
  tenantId: string;
  employeeNumber?: string | null;
  status?: string;
  employmentType?: string;
  firstName?: string;
  lastName?: string;
  preferredName?: string | null;
  workEmail?: string | null;
  personalEmail?: string | null;
  workPhone?: string | null;
  personalPhone?: string | null;
  hireDate?: string | null;
  startDate?: string | null;
  deletedAt?: string | null;
  assignments?: EmployeeAssignmentSummary[];
  [key: string]: unknown;
}

/** ----------------------------------------
 * DTOs
 * --------------------------------------- */

// Org Units
export interface OrgUnitListFilterDto {
  type?: OrgUnitType;
  parentId?: string | null;
  includeDeleted?: boolean;
  search?: string;
  includeManager?: boolean;
}

export interface CreateOrgUnitDto {
  name: string;
  type: OrgUnitType;
  parentId?: string | null;
  code?: string | null;
  description?: string | null;
  managerEmployeeId?: string | null;
  metadata?: unknown;
  [key: string]: unknown;
}

export interface UpdateOrgUnitDto extends Partial<CreateOrgUnitDto> {
  name?: string;
  type?: OrgUnitType;
}



// Positions
export interface PositionsListFilterDto {
  includeDeleted?: boolean;
  search?: string;
}

export interface CreatePositionDto {
  name: string;
  title?: string | null;
  code?: string | null;
  description?: string | null;
  level?: string | null;
}

export type UpdatePositionDto = Partial<CreatePositionDto>;

// Locations
export interface LocationsListFilterDto {
  type?: LocationType;
  includeDeleted?: boolean;
  search?: string;
  includeManager?: boolean;
}

export interface CreateLocationDto {
  name: string;
  type?: LocationType;
  code?: string | null;
  description?: string | null;
  timezone?: string | null;
  phone?: string | null;
  email?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  geoLat?: string | null;
  geoLng?: string | null;
  managerEmployeeId?: string | null;
  metadata?: unknown;
  [key: string]: unknown;
}


export interface UpdateLocationDto extends Partial<CreateLocationDto> {
  name?: string;
  type?: LocationType;
}

export interface ListLocationEmployeesQueryDto {
  includeInactive?: boolean;
  includeDeleted?: boolean;
  primaryOnly?: boolean;
  page?: number;
  pageSize?: number;
  search?: string;
}

// Cost Centers
export interface CostCentersListFilterDto {
  includeDeleted?: boolean;
  search?: string;
  includeOwner?: boolean;
}

export interface CreateCostCenterDto {
  name: string;
  code?: string | null;
  description?: string | null;
  ownerEmployeeId?: string | null;
  metadata?: unknown;
  [key: string]: unknown;
}


export interface UpdateCostCenterDto extends Partial<CreateCostCenterDto> {
  name?: string;
}

export interface ListCostCenterEmployeesQueryDto {
  includeInactive?: boolean;
  includeDeleted?: boolean;
  primaryOnly?: boolean;
  page?: number;
  pageSize?: number;
  search?: string;
}

// Step Instances list
export interface StepInstanceListFilterDto {
  instanceId?: string;
}


export interface CostCenterOwnerSummary {
  id: string;
  employeeNumber?: string | null;
  firstName?: string;
  lastName?: string;
  preferredName?: string | null;
  workEmail?: string | null;
  personalEmail?: string | null;
  workPhone?: string | null;
  personalPhone?: string | null;
  status?: string;
}

export interface ListLocationEmployeesQueryDto {
  includeInactive?: boolean;
  includeDeleted?: boolean;
  primaryOnly?: boolean;
  page?: number;
  pageSize?: number;
  search?: string;
}

// Cost Centers
export interface CostCentersListFilterDto {
  includeDeleted?: boolean;
  search?: string;
  includeOwner?: boolean;
}



export interface UpdateCostCenterDto extends Partial<CreateCostCenterDto> {
  name?: string;
}

export interface ListCostCenterEmployeesQueryDto {
  includeInactive?: boolean;
  includeDeleted?: boolean;
  primaryOnly?: boolean;
  page?: number;
  pageSize?: number;
  search?: string;
}



export interface CostCenterEmployeeListItem {
  id: string;
  tenantId: string;
  employeeNumber?: string | null;
  status?: string;
  employmentType?: string;
  firstName?: string;
  lastName?: string;
  preferredName?: string | null;
  workEmail?: string | null;
  personalEmail?: string | null;
  workPhone?: string | null;
  personalPhone?: string | null;
  hireDate?: string | null;
  startDate?: string | null;
  deletedAt?: string | null;
  primaryAssignment?: EmployeeAssignmentSummary | null;
}

export type ListOnboardingStepInstancesResponse = ApiResponse<ListData<OnboardingStepInstance>>;

/** ----------------------------------------
 * List wrapper responses for employee subroutes
 * --------------------------------------- */
export interface OrgUnitEmployeesListData {
  page: number;
  pageSize: number;
  total: number;
  items: OrgUnitEmployeeListItem[];
}

export interface LocationEmployeesListData {
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
  location?: Location;
  items: LocationEmployeeListItem[];
}

export interface CostCenterEmployeesListData {
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
  costCenter?: CostCenter;
  items: CostCenterEmployeeListItem[];
}

/** ----------------------------------------
 * Response aliases
 * --------------------------------------- */

// Org Units
export type ListOrgUnitsResponse = ApiResponse<ListData<OrgUnit>>;
export type GetOrgUnitResponse = ApiResponse<OrgUnit>;
export type GetOrgUnitTreeResponse = ApiResponse<OrgUnitTreeNode>;
export type GetOrgUnitTreeAllResponse = ApiResponse<OrgUnitTreeNode[] | OrgUnitTreeNode>;
export type CreateOrgUnitResponse = ApiResponse<OrgUnit>;
export type UpdateOrgUnitResponse = ApiResponse<OrgUnit>;
export type SoftDeleteOrgUnitResponse = ApiResponse<OrgUnit | { ok?: true }>;
export type RestoreOrgUnitResponse = ApiResponse<OrgUnit>;
export type ListOrgUnitEmployeesResponse = ApiResponse<OrgUnitEmployeesListData>;

// Positions
export type ListPositionsResponse = ApiResponse<ListData<Position>>;
export type GetPositionResponse = ApiResponse<Position>;
export type CreatePositionResponse = ApiResponse<Position>;
export type UpdatePositionResponse = ApiResponse<Position>;
export type SoftDeletePositionResponse = ApiResponse<Position | { ok?: true }>;
export type RestorePositionResponse = ApiResponse<Position>;

// Locations
export type ListLocationsResponse = ApiResponse<ListData<Location>>;
export type GetLocationResponse = ApiResponse<Location>;
export type CreateLocationResponse = ApiResponse<Location>;
export type UpdateLocationResponse = ApiResponse<Location>;
export type SoftDeleteLocationResponse = ApiResponse<Location | { ok?: true }>;
export type RestoreLocationResponse = ApiResponse<Location>;
export type ListLocationEmployeesResponse = ApiResponse<LocationEmployeesListData>;

// Cost Centers
export type ListCostCentersResponse = ApiResponse<ListData<CostCenter>>;
export type GetCostCenterResponse = ApiResponse<CostCenter>;
export type CreateCostCenterResponse = ApiResponse<CostCenter>;
export type UpdateCostCenterResponse = ApiResponse<CostCenter>;
export type SoftDeleteCostCenterResponse = ApiResponse<CostCenter | { ok?: true }>;
export type RestoreCostCenterResponse = ApiResponse<CostCenter>;
export type ListCostCenterEmployeesResponse = ApiResponse<CostCenterEmployeesListData>;



export interface OrgUnitManagerSummary {
  id: string;
  employeeNumber?: string | null;
  firstName?: string;
  lastName?: string;
  preferredName?: string | null;
  workEmail?: string | null;
  personalEmail?: string | null;
  workPhone?: string | null;
  personalPhone?: string | null;
  status?: string;
}

export interface OrgUnitChildSummary {
  id: string;
  name?: string;
  code?: string | null;
  type?: OrgUnitType;
}

export interface OrgUnitParentSummary {
  id: string;
  name?: string;
  code?: string | null;
  type?: OrgUnitType;
}



export interface ListOrgUnitEmployeesQuery {
  includeInactive?: boolean;
  includeDeleted?: boolean;
  primaryOnly?: boolean;
  includeChildren?: boolean;
  page?: number;
  pageSize?: number;
  search?: string;
}


export interface EmployeeAssignmentSummary {
  id: string;
  orgUnitId?: string | null;
  locationId?: string | null;
  positionId?: string | null;
  costCenterId?: string | null;
  managerId?: string | null;
  isPrimary?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  orgUnit?: { id: string; name: string; code?: string | null } | null;
  location?: { id: string; name: string; code?: string | null; type?: string | null } | null;
  position?: { id: string; name?: string | null; title?: string | null; code?: string | null } | null;
  costCenter?: { id: string; name: string; code?: string | null } | null;
  manager?: {
    id: string;
    employeeNumber?: string | null;
    firstName?: string;
    lastName?: string;
    preferredName?: string | null;
    workEmail?: string | null;
    personalEmail?: string | null;
    workPhone?: string | null;
    personalPhone?: string | null;
    status?: string;
  } | null;
}

export interface LocationsListFilterDto {
  type?: LocationType;
  includeDeleted?: boolean;
  search?: string;
  includeManager?: boolean;
}



export interface UpdateLocationDto extends Partial<CreateLocationDto> {
  name?: string;
  type?: LocationType;
}

export interface ListLocationEmployeesQueryDto {
  includeInactive?: boolean;
  includeDeleted?: boolean;
  primaryOnly?: boolean;
  page?: number;
  pageSize?: number;
  search?: string;
}



export interface LocationEmployeesListData {
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
  location?: Location;
  items: LocationEmployeeListItem[];
}
