// src/logaxp/lib/manager/manager.types.ts

export type ApiResponse<T = unknown> = {
  statusCode?: number;
  message?: string;
  data?: T;
};

export type ListMeta = {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
};

export type EmployeeStatus =
  | "ONBOARDING"
  | "ACTIVE"
  | "ON_LEAVE"
  | "SUSPENDED"
  | "TERMINATED"
  | "INACTIVE"
  | (string & {});

export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACTOR"
  | "INTERN"
  | "TEMPORARY"
  | (string & {});

export type LeaveStatus =
  | "REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELED"
  | (string & {});

export type LeaveType =
  | "VACATION"
  | "SICK"
  | "PERSONAL"
  | "UNPAID"
  | "OTHER"
  | (string & {});

export type TimesheetStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | (string & {});

export type TimeClockStatus =
  | "OPEN"
  | "CLOSED"
  | "ADJUSTED"
  | (string & {});

export interface ManagerEmployeeMini {
  id: string;
  tenantId?: string;
  employeeNumber?: string | null;
  firstName?: string;
  lastName?: string;
  preferredName?: string | null;
  workEmail?: string | null;
  personalEmail?: string | null;
  workPhone?: string | null;
  personalPhone?: string | null;
  status?: EmployeeStatus;
  employmentType?: EmploymentType;
  hireDate?: string | null;
  startDate?: string | null;
  managerId?: string | null;
  deletedAt?: string | null;
  [key: string]: unknown;
}

export interface ManagerAssignmentSummary {
  id: string;
  orgUnitId?: string | null;
  locationId?: string | null;
  positionId?: string | null;
  costCenterId?: string | null;
  managerId?: string | null;
  isPrimary?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  orgUnit?: {
    id: string;
    name?: string;
    code?: string | null;
    type?: string;
  } | null;
  location?: {
    id: string;
    name?: string;
    code?: string | null;
    type?: string;
  } | null;
  position?: {
    id: string;
    name?: string | null;
    title?: string | null;
    code?: string | null;
  } | null;
  costCenter?: {
    id: string;
    name?: string;
    code?: string | null;
  } | null;
  manager?: {
    id: string;
    employeeNumber?: string | null;
    firstName?: string;
    lastName?: string;
    preferredName?: string | null;
    status?: EmployeeStatus;
  } | null;
}

export interface ManagerTeamListItem extends ManagerEmployeeMini {
  primaryAssignment?: ManagerAssignmentSummary | null;
}

export interface ManagedScopeSummary {
  directReports: number;
  assignmentReports: number;
  orgUnitScoped: number;
  locationScoped: number;
  costCenterScoped: number;
  totalManagedDistinctEmployees: number;
  activeManagedEmployees: number;
  inactiveManagedEmployees: number;
  onLeaveManagedEmployees: number;
  onboardingManagedEmployees: number;
  suspendedManagedEmployees: number;
  terminatedManagedEmployees: number;
  managedOrgUnits: number;
  managedLocations: number;
  ownedCostCenters: number;
  pendingLeaveRequests: number;
  pendingTimesheets: number;
  openTimeClocks: number;
}

export interface PaginatedResult<T> {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: T[];
}

export interface ManagerTeamQueryDto {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: EmployeeStatus;
  employmentType?: EmploymentType;
  orgUnitId?: string;
  locationId?: string;
  costCenterId?: string;
  includeInactive?: boolean;
  includeDeleted?: boolean;
}

export interface ManagerLeaveRequestsQueryDto {
  page?: number;
  pageSize?: number;
  search?: string;
  employeeId?: string;
  status?: LeaveStatus;
  type?: LeaveType;
  includeInactive?: boolean;
  includeDeleted?: boolean;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
}

export interface ManagerTimesheetsQueryDto {
  page?: number;
  pageSize?: number;
  search?: string;
  employeeId?: string;
  status?: TimesheetStatus;
  includeInactive?: boolean;
  includeDeleted?: boolean;
  payPeriodId?: string;
}

export interface ManagerTimeClocksQueryDto {
  page?: number;
  pageSize?: number;
  search?: string;
  employeeId?: string;
  status?: TimeClockStatus;
  includeInactive?: boolean;
  includeDeleted?: boolean;
  locationId?: string;
  clockInFrom?: string;
  clockInTo?: string;
}

export interface ManagerOrgUnit {
  id: string;
  tenantId?: string;
  type?: string;
  name?: string;
  code?: string | null;
  parentId?: string | null;
  managerEmployeeId?: string | null;
  deletedAt?: string | null;
  parent?: {
    id: string;
    name?: string;
    code?: string | null;
    type?: string;
  } | null;
  children?: Array<{
    id: string;
    name?: string;
    code?: string | null;
    type?: string;
  }>;
  [key: string]: unknown;
}

export interface ManagerLocation {
  id: string;
  tenantId?: string;
  name?: string;
  code?: string | null;
  type?: string;
  timezone?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  managerEmployeeId?: string | null;
  deletedAt?: string | null;
  [key: string]: unknown;
}

export interface ManagerCostCenter {
  id: string;
  tenantId?: string;
  name?: string;
  code?: string | null;
  description?: string | null;
  ownerEmployeeId?: string | null;
  ownerEmployee?: ManagerEmployeeMini | null;
  deletedAt?: string | null;
  [key: string]: unknown;
}

export interface ManagerLeaveRequest {
  id: string;
  tenantId?: string;
  employeeId?: string;
  type?: LeaveType;
  status?: LeaveStatus;
  startDate?: string;
  endDate?: string;
  reason?: string | null;
  requestedAt?: string;
  decidedAt?: string | null;
  employee?: ManagerEmployeeMini | null;
  decidedByUser?: {
    id: string;
    email?: string;
  } | null;
  [key: string]: unknown;
}

export interface ManagerTimesheet {
  id: string;
  tenantId?: string;
  employeeId?: string;
  payPeriodId?: string;
  status?: TimesheetStatus;
  totalMinutes?: number;
  regularMinutes?: number;
  overtimeMinutes?: number;
  doubleTimeMinutes?: number;
  billableMinutes?: number;
  submittedAt?: string | null;
  decidedAt?: string | null;
  employee?: ManagerEmployeeMini | null;
  payPeriod?: {
    id: string;
    label?: string;
    startAt?: string;
    endAt?: string;
    status?: string;
  } | null;
  decidedByUser?: {
    id: string;
    email?: string;
  } | null;
  [key: string]: unknown;
}

export interface ManagerTimeClock {
  id: string;
  tenantId?: string;
  employeeId?: string;
  locationId?: string | null;
  status?: TimeClockStatus;
  clockInAt?: string;
  clockOutAt?: string | null;
  breakMinutes?: number;
  employee?: ManagerEmployeeMini | null;
  location?: {
    id: string;
    name?: string;
    code?: string | null;
    type?: string;
  } | null;
  shift?: {
    id: string;
    startAt?: string;
    endAt?: string;
    status?: string;
    assignmentStatus?: string;
  } | null;
  [key: string]: unknown;
}

export type GetMyManagerProfileResponse = ApiResponse<ManagerEmployeeMini>;
export type GetMyManagerSummaryResponse = ApiResponse<ManagedScopeSummary>;
export type ListMyManagerTeamResponse = ApiResponse<PaginatedResult<ManagerTeamListItem>>;
export type ListMyDirectReportsResponse = ApiResponse<PaginatedResult<ManagerTeamListItem>>;
export type ListMyAssignmentReportsResponse = ApiResponse<PaginatedResult<ManagerTeamListItem>>;
export type ListMyOrgUnitScopeResponse = ApiResponse<PaginatedResult<ManagerTeamListItem>>;
export type ListMyLocationScopeResponse = ApiResponse<PaginatedResult<ManagerTeamListItem>>;
export type ListMyCostCenterScopeResponse = ApiResponse<PaginatedResult<ManagerTeamListItem>>;

export type ListMyManagedOrgUnitsResponse = ApiResponse<ManagerOrgUnit[]>;
export type ListMyManagedLocationsResponse = ApiResponse<ManagerLocation[]>;
export type ListMyOwnedCostCentersResponse = ApiResponse<ManagerCostCenter[]>;

export type ListMyLeaveRequestsResponse = ApiResponse<PaginatedResult<ManagerLeaveRequest>>;
export type ListMyTimesheetsResponse = ApiResponse<PaginatedResult<ManagerTimesheet>>;
export type ListMyTimeClocksResponse = ApiResponse<PaginatedResult<ManagerTimeClock>>;

export type GetManagerSummaryByEmployeeIdResponse = ApiResponse<ManagedScopeSummary>;
export type ListManagerTeamByEmployeeIdResponse = ApiResponse<PaginatedResult<ManagerTeamListItem>>;