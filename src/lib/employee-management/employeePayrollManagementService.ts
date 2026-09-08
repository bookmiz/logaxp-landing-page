"use client";

import { api } from "@/logaxp/lib/api/apiClient";
import type {
  CreateEmployeeCompensationDto,
  CreateEmployeeCompensationResponse,
  CreateEmployeePaymentMethodDto,
  CreateEmployeePaymentMethodResponse,
  CreateEmployeePaymentSplitDto,
  CreateEmployeePaymentSplitResponse,
  GetEmployeeCompensationResponse,
  GetEmployeePaymentMethodResponse,
  GetEmployeePaymentSplitResponse,
  GetEmployeePayrollProfileResponse,
  ListEmployeeCompensationsQueryDto,
  ListEmployeeCompensationsResponse,
  ListEmployeePaymentMethodsQueryDto,
  ListEmployeePaymentMethodsResponse,
  ListEmployeePaymentSplitsQueryDto,
  ListEmployeePaymentSplitsResponse,
  RemoveEmployeeCompensationResponse,
  RemoveEmployeePaymentMethodResponse,
  RemoveEmployeePaymentSplitResponse,
  SetPrimaryEmployeePaymentMethodResponse,
  UpdateEmployeeCompensationDto,
  UpdateEmployeeCompensationResponse,
  UpdateEmployeePaymentMethodDto,
  UpdateEmployeePaymentMethodResponse,
  UpdateEmployeePaymentSplitDto,
  UpdateEmployeePaymentSplitResponse,
  UpsertEmployeePayrollProfileDto,
  UpsertEmployeePayrollProfileResponse,
} from "./employee-payroll.types";

function cleanParams<T extends Record<string, unknown>>(obj?: T): Record<string, unknown> | undefined {
  if (!obj) return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    out[key] = value;
  }
  return out;
}

function enc(value: string): string {
  return encodeURIComponent(value);
}

export const employeePayrollManagementService = {
  async getPayrollProfile(employeeId: string): Promise<GetEmployeePayrollProfileResponse> {
    const res = await api.get<GetEmployeePayrollProfileResponse>(`/employees/${enc(employeeId)}/payroll-profile`);
    return res.data;
  },

  async upsertPayrollProfile(
    employeeId: string,
    input: UpsertEmployeePayrollProfileDto
  ): Promise<UpsertEmployeePayrollProfileResponse> {
    const res = await api.put<UpsertEmployeePayrollProfileResponse>(
      `/employees/${enc(employeeId)}/payroll-profile`,
      input
    );
    return res.data;
  },

  async listCompensations(
    employeeId: string,
    query?: ListEmployeeCompensationsQueryDto
  ): Promise<ListEmployeeCompensationsResponse> {
    const res = await api.get<ListEmployeeCompensationsResponse>(
      `/employees/${enc(employeeId)}/compensations`,
      { params: cleanParams(query) }
    );
    return res.data;
  },

  async getCompensation(compensationId: string): Promise<GetEmployeeCompensationResponse> {
    const res = await api.get<GetEmployeeCompensationResponse>(
      `/employees/compensations/${enc(compensationId)}`
    );
    return res.data;
  },

  async createCompensation(
    employeeId: string,
    input: CreateEmployeeCompensationDto
  ): Promise<CreateEmployeeCompensationResponse> {
    const res = await api.post<CreateEmployeeCompensationResponse>(
      `/employees/${enc(employeeId)}/compensations`,
      input
    );
    return res.data;
  },

  async updateCompensation(
    compensationId: string,
    input: UpdateEmployeeCompensationDto
  ): Promise<UpdateEmployeeCompensationResponse> {
    const res = await api.patch<UpdateEmployeeCompensationResponse>(
      `/employees/compensations/${enc(compensationId)}`,
      input
    );
    return res.data;
  },

  async removeCompensation(compensationId: string): Promise<RemoveEmployeeCompensationResponse> {
    const res = await api.delete<RemoveEmployeeCompensationResponse>(
      `/employees/compensations/${enc(compensationId)}`
    );
    return res.data;
  },

  async listPaymentMethods(
    employeeId: string,
    query?: ListEmployeePaymentMethodsQueryDto
  ): Promise<ListEmployeePaymentMethodsResponse> {
    const res = await api.get<ListEmployeePaymentMethodsResponse>(
      `/employees/${enc(employeeId)}/payment-methods`,
      { params: cleanParams(query) }
    );
    return res.data;
  },

  async getPaymentMethod(paymentMethodId: string): Promise<GetEmployeePaymentMethodResponse> {
    const res = await api.get<GetEmployeePaymentMethodResponse>(
      `/employees/payment-methods/${enc(paymentMethodId)}`
    );
    return res.data;
  },

  async createPaymentMethod(
    employeeId: string,
    input: CreateEmployeePaymentMethodDto
  ): Promise<CreateEmployeePaymentMethodResponse> {
    const res = await api.post<CreateEmployeePaymentMethodResponse>(
      `/employees/${enc(employeeId)}/payment-methods`,
      input
    );
    return res.data;
  },

  async updatePaymentMethod(
    paymentMethodId: string,
    input: UpdateEmployeePaymentMethodDto
  ): Promise<UpdateEmployeePaymentMethodResponse> {
    const res = await api.patch<UpdateEmployeePaymentMethodResponse>(
      `/employees/payment-methods/${enc(paymentMethodId)}`,
      input
    );
    return res.data;
  },

  async setPrimaryPaymentMethod(
    paymentMethodId: string
  ): Promise<SetPrimaryEmployeePaymentMethodResponse> {
    const res = await api.post<SetPrimaryEmployeePaymentMethodResponse>(
      `/employees/payment-methods/${enc(paymentMethodId)}/primary`
    );
    return res.data;
  },

  async removePaymentMethod(paymentMethodId: string): Promise<RemoveEmployeePaymentMethodResponse> {
    const res = await api.delete<RemoveEmployeePaymentMethodResponse>(
      `/employees/payment-methods/${enc(paymentMethodId)}`
    );
    return res.data;
  },

  async listPaymentSplits(
    employeeId: string,
    query?: ListEmployeePaymentSplitsQueryDto
  ): Promise<ListEmployeePaymentSplitsResponse> {
    const res = await api.get<ListEmployeePaymentSplitsResponse>(
      `/employees/${enc(employeeId)}/payment-splits`,
      { params: cleanParams(query) }
    );
    return res.data;
  },

  async getPaymentSplit(paymentSplitId: string): Promise<GetEmployeePaymentSplitResponse> {
    const res = await api.get<GetEmployeePaymentSplitResponse>(
      `/employees/payment-splits/${enc(paymentSplitId)}`
    );
    return res.data;
  },

  async createPaymentSplit(
    employeeId: string,
    input: CreateEmployeePaymentSplitDto
  ): Promise<CreateEmployeePaymentSplitResponse> {
    const res = await api.post<CreateEmployeePaymentSplitResponse>(
      `/employees/${enc(employeeId)}/payment-splits`,
      input
    );
    return res.data;
  },

  async updatePaymentSplit(
    paymentSplitId: string,
    input: UpdateEmployeePaymentSplitDto
  ): Promise<UpdateEmployeePaymentSplitResponse> {
    const res = await api.patch<UpdateEmployeePaymentSplitResponse>(
      `/employees/payment-splits/${enc(paymentSplitId)}`,
      input
    );
    return res.data;
  },

  async removePaymentSplit(paymentSplitId: string): Promise<RemoveEmployeePaymentSplitResponse> {
    const res = await api.delete<RemoveEmployeePaymentSplitResponse>(
      `/employees/payment-splits/${enc(paymentSplitId)}`
    );
    return res.data;
  },
};