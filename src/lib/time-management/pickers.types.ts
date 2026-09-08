"use client";

export type ApiResponse<T = unknown> = {
  statusCode: number;
  message: string;
  data: T;
};

export type Paged<T> = {
  items: T[];
  page?: number;
  pageSize?: number;
  total?: number;
};

export type PickerListDto = {
  q?: string;
  page?: number;
  pageSize?: number;
};

export type EmployeePickerRow = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
};

export type OrgUnitPickerRow = {
  id: string;
  name?: string | null;
  code?: string | null;
};

export type LocationPickerRow = {
  id: string;
  name?: string | null;
  code?: string | null;
};

export type ScheduleTemplatePickerRow = {
  id: string;
  name?: string | null;
  type?: string | null; // WEEKLY | ROTATING
};

export type EmployeesListResponse = ApiResponse<Paged<EmployeePickerRow>>;
export type OrgUnitsListResponse = ApiResponse<Paged<OrgUnitPickerRow>>;
export type LocationsListResponse = ApiResponse<Paged<LocationPickerRow>>;
export type ScheduleTemplatesListResponse = ApiResponse<Paged<ScheduleTemplatePickerRow>>;