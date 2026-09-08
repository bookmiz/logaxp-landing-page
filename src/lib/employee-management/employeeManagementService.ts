// src/lib/employee-management/employeeManagementService.ts
"use client";

import { api } from "@/logaxp/lib/api/apiClient";
import type {
  // Query / filter
  EmployeeListFilterDto,
  PaginationDto,

  // Employee DTOs
  CreateEmployeeDto,
  UpdateEmployeeDto,
  ChangeEmployeeStatusDto,

  // Assignments
  CreateEmployeeAssignmentDto,
  UpdateEmployeeAssignmentDto,

  // Addresses
  CreateEmployeeAddressDto,
  UpdateEmployeeAddressDto,

  // Emergency Contacts
  CreateEmergencyContactDto,
  UpdateEmergencyContactDto,

  // Dependents
  CreateDependentDto,
  UpdateDependentDto,

  // Documents
  CreateEmployeeDocumentDto,
  VerifyEmployeeDocumentDto,
  EmployeeDocumentFolderQueryDto,
  CreateEmployeeDocumentRequestDto,
  SubmitEmployeeDocumentRequestDto,
  SendEmployeeDocumentExpiryRemindersDto,

  // Response wrappers
  ListEmployeesResponse,
  GetEmployeeResponse,
  CreateEmployeeResponse,
  UpdateEmployeeResponse,
  ChangeEmployeeStatusResponse,
  SoftDeleteEmployeeResponse,
  RestoreEmployeeResponse,

  ListEmployeeAssignmentsResponse,
  CreateEmployeeAssignmentResponse,
  UpdateEmployeeAssignmentResponse,
  SetPrimaryEmployeeAssignmentResponse,
  EndEmployeeAssignmentResponse,
  RemoveEmployeeAssignmentResponse,

  ListEmployeeAddressesResponse,
  CreateEmployeeAddressResponse,
  UpdateEmployeeAddressResponse,
  SetPrimaryEmployeeAddressResponse,
  RemoveEmployeeAddressResponse,

  ListEmergencyContactsResponse,
  CreateEmergencyContactResponse,
  UpdateEmergencyContactResponse,
  SetPrimaryEmergencyContactResponse,
  RemoveEmergencyContactResponse,

  ListDependentsResponse,
  CreateDependentResponse,
  UpdateDependentResponse,
  RemoveDependentResponse,

  ListEmployeeDocumentsResponse,
  CreateEmployeeDocumentResponse,
  VerifyEmployeeDocumentResponse,
  RemoveEmployeeDocumentResponse,
  ListEmployeeDocumentFoldersResponse,
  ListExpiringEmployeeDocumentsResponse,
  SendEmployeeDocumentExpiryRemindersResponse,
  GetEmployeeDocumentFolderResponse,
  ListEmployeeDocumentRequestsResponse,
  CreateEmployeeDocumentRequestResponse,
  GetPublicEmployeeDocumentRequestResponse,
  SubmitPublicEmployeeDocumentRequestResponse,
} from "./employee-management.types";

type EmployeeListQuery = EmployeeListFilterDto & PaginationDto;

function cleanParams<T extends Record<string, unknown>>(obj?: T): Record<string, unknown> | undefined {
  if (!obj) return undefined;

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    // keep false / 0 / null if intentionally sent
    out[key] = value;
  }
  return out;
}

function enc(value: string): string {
  return encodeURIComponent(value);
}

export const employeeManagementService = {
  /* =========================================
   * Employees
   * ======================================= */

  async listEmployees(query?: EmployeeListQuery): Promise<ListEmployeesResponse> {
    const res = await api.get<ListEmployeesResponse>("/employees", {
      params: cleanParams(query),
    });
    return res.data;
  },

  async getEmployee(id: string): Promise<GetEmployeeResponse> {
    const res = await api.get<GetEmployeeResponse>(`/employees/${enc(id)}`);
    return res.data;
  },

  async createEmployee(input: CreateEmployeeDto): Promise<CreateEmployeeResponse> {
    const res = await api.post<CreateEmployeeResponse>("/employees", input);
    return res.data;
  },

  async updateEmployee(id: string, input: UpdateEmployeeDto): Promise<UpdateEmployeeResponse> {
    const res = await api.patch<UpdateEmployeeResponse>(`/employees/${enc(id)}`, input);
    return res.data;
  },

  async changeEmployeeStatus(id: string, input: ChangeEmployeeStatusDto): Promise<ChangeEmployeeStatusResponse> {
    const res = await api.post<ChangeEmployeeStatusResponse>(`/employees/${enc(id)}/status`, input);
    return res.data;
  },

  async softDeleteEmployee(id: string): Promise<SoftDeleteEmployeeResponse> {
    const res = await api.delete<SoftDeleteEmployeeResponse>(`/employees/${enc(id)}`);
    return res.data;
  },

  async restoreEmployee(id: string): Promise<RestoreEmployeeResponse> {
    const res = await api.post<RestoreEmployeeResponse>(`/employees/${enc(id)}/restore`);
    return res.data;
  },

  /* =========================================
   * Employee Assignments
   * ======================================= */

  async listAssignments(employeeId: string): Promise<ListEmployeeAssignmentsResponse> {
    const res = await api.get<ListEmployeeAssignmentsResponse>(`/employees/${enc(employeeId)}/assignments`);
    return res.data;
  },

  async createAssignment(
    employeeId: string,
    input: CreateEmployeeAssignmentDto
  ): Promise<CreateEmployeeAssignmentResponse> {
    const res = await api.post<CreateEmployeeAssignmentResponse>(
      `/employees/${enc(employeeId)}/assignments`,
      input
    );
    return res.data;
  },

  async updateAssignment(
    assignmentId: string,
    input: UpdateEmployeeAssignmentDto
  ): Promise<UpdateEmployeeAssignmentResponse> {
    const res = await api.patch<UpdateEmployeeAssignmentResponse>(
      `/employees/assignments/${enc(assignmentId)}`,
      input
    );
    return res.data;
  },

  async setPrimaryAssignment(assignmentId: string): Promise<SetPrimaryEmployeeAssignmentResponse> {
    const res = await api.post<SetPrimaryEmployeeAssignmentResponse>(
      `/employees/assignments/${enc(assignmentId)}/primary`
    );
    return res.data;
  },

  async endAssignment(assignmentId: string, effectiveTo: string): Promise<EndEmployeeAssignmentResponse> {
    const res = await api.post<EndEmployeeAssignmentResponse>(
      `/employees/assignments/${enc(assignmentId)}/end/${enc(effectiveTo)}`
    );
    return res.data;
  },

  async removeAssignment(assignmentId: string): Promise<RemoveEmployeeAssignmentResponse> {
    const res = await api.delete<RemoveEmployeeAssignmentResponse>(
      `/employees/assignments/${enc(assignmentId)}`
    );
    return res.data;
  },

  /* =========================================
   * Employee Addresses
   * ======================================= */

  async listAddresses(employeeId: string): Promise<ListEmployeeAddressesResponse> {
    const res = await api.get<ListEmployeeAddressesResponse>(`/employees/${enc(employeeId)}/addresses`);
    return res.data;
  },

  async createAddress(employeeId: string, input: CreateEmployeeAddressDto): Promise<CreateEmployeeAddressResponse> {
    const res = await api.post<CreateEmployeeAddressResponse>(
      `/employees/${enc(employeeId)}/addresses`,
      input
    );
    return res.data;
  },

  async updateAddress(addressId: string, input: UpdateEmployeeAddressDto): Promise<UpdateEmployeeAddressResponse> {
    const res = await api.patch<UpdateEmployeeAddressResponse>(
      `/employees/addresses/${enc(addressId)}`,
      input
    );
    return res.data;
  },

  async setPrimaryAddress(addressId: string): Promise<SetPrimaryEmployeeAddressResponse> {
    const res = await api.post<SetPrimaryEmployeeAddressResponse>(
      `/employees/addresses/${enc(addressId)}/primary`
    );
    return res.data;
  },

  async removeAddress(addressId: string): Promise<RemoveEmployeeAddressResponse> {
    const res = await api.delete<RemoveEmployeeAddressResponse>(`/employees/addresses/${enc(addressId)}`);
    return res.data;
  },

  /* =========================================
   * Emergency Contacts
   * ======================================= */

  async listEmergencyContacts(employeeId: string): Promise<ListEmergencyContactsResponse> {
    const res = await api.get<ListEmergencyContactsResponse>(
      `/employees/${enc(employeeId)}/emergency-contacts`
    );
    return res.data;
  },

  async createEmergencyContact(
    employeeId: string,
    input: CreateEmergencyContactDto
  ): Promise<CreateEmergencyContactResponse> {
    const res = await api.post<CreateEmergencyContactResponse>(
      `/employees/${enc(employeeId)}/emergency-contacts`,
      input
    );
    return res.data;
  },

  async updateEmergencyContact(
    contactId: string,
    input: UpdateEmergencyContactDto
  ): Promise<UpdateEmergencyContactResponse> {
    const res = await api.patch<UpdateEmergencyContactResponse>(
      `/employees/emergency-contacts/${enc(contactId)}`,
      input
    );
    return res.data;
  },

  async setPrimaryEmergencyContact(contactId: string): Promise<SetPrimaryEmergencyContactResponse> {
    const res = await api.post<SetPrimaryEmergencyContactResponse>(
      `/employees/emergency-contacts/${enc(contactId)}/primary`
    );
    return res.data;
  },

  async removeEmergencyContact(contactId: string): Promise<RemoveEmergencyContactResponse> {
    const res = await api.delete<RemoveEmergencyContactResponse>(
      `/employees/emergency-contacts/${enc(contactId)}`
    );
    return res.data;
  },

  /* =========================================
   * Dependents
   * ======================================= */

  async listDependents(employeeId: string): Promise<ListDependentsResponse> {
    const res = await api.get<ListDependentsResponse>(`/employees/${enc(employeeId)}/dependents`);
    return res.data;
  },

  async createDependent(employeeId: string, input: CreateDependentDto): Promise<CreateDependentResponse> {
    const res = await api.post<CreateDependentResponse>(`/employees/${enc(employeeId)}/dependents`, input);
    return res.data;
  },

  async updateDependent(dependentId: string, input: UpdateDependentDto): Promise<UpdateDependentResponse> {
    const res = await api.patch<UpdateDependentResponse>(
      `/employees/dependents/${enc(dependentId)}`,
      input
    );
    return res.data;
  },

  async removeDependent(dependentId: string): Promise<RemoveDependentResponse> {
    const res = await api.delete<RemoveDependentResponse>(`/employees/dependents/${enc(dependentId)}`);
    return res.data;
  },

  /* =========================================
   * Documents
   * ======================================= */

  async listDocuments(employeeId: string): Promise<ListEmployeeDocumentsResponse> {
    const res = await api.get<ListEmployeeDocumentsResponse>(`/employees/${enc(employeeId)}/documents`);
    return res.data;
  },

  async listDocumentFolders(
    query?: EmployeeDocumentFolderQueryDto
  ): Promise<ListEmployeeDocumentFoldersResponse> {
    const res = await api.get<ListEmployeeDocumentFoldersResponse>("/employees/folders", {
      params: cleanParams(query),
    });
    return res.data;
  },

  async listExpiringDocuments(
    query?: EmployeeDocumentFolderQueryDto
  ): Promise<ListExpiringEmployeeDocumentsResponse> {
    const res = await api.get<ListExpiringEmployeeDocumentsResponse>("/employees/documents/expiring", {
      params: cleanParams(query),
    });
    return res.data;
  },

  async sendDocumentExpiryReminders(
    input: SendEmployeeDocumentExpiryRemindersDto = {}
  ): Promise<SendEmployeeDocumentExpiryRemindersResponse> {
    const res = await api.post<SendEmployeeDocumentExpiryRemindersResponse>(
      "/employees/documents/expiry-reminders/send",
      input
    );
    return res.data;
  },

  async getDocumentFolder(
    employeeId: string,
    query?: EmployeeDocumentFolderQueryDto
  ): Promise<GetEmployeeDocumentFolderResponse> {
    const res = await api.get<GetEmployeeDocumentFolderResponse>(`/employees/${enc(employeeId)}/folder`, {
      params: cleanParams(query),
    });
    return res.data;
  },

  async createDocument(
    employeeId: string,
    input: CreateEmployeeDocumentDto
  ): Promise<CreateEmployeeDocumentResponse> {
    const res = await api.post<CreateEmployeeDocumentResponse>(
      `/employees/${enc(employeeId)}/documents`,
      input
    );
    return res.data;
  },

  async verifyDocument(
    documentId: string,
    input: VerifyEmployeeDocumentDto
  ): Promise<VerifyEmployeeDocumentResponse> {
    const res = await api.post<VerifyEmployeeDocumentResponse>(
      `/employees/documents/${enc(documentId)}/verify`,
      input
    );
    return res.data;
  },

  async removeDocument(documentId: string): Promise<RemoveEmployeeDocumentResponse> {
    const res = await api.delete<RemoveEmployeeDocumentResponse>(`/employees/documents/${enc(documentId)}`);
    return res.data;
  },

  async listDocumentRequests(employeeId: string): Promise<ListEmployeeDocumentRequestsResponse> {
    const res = await api.get<ListEmployeeDocumentRequestsResponse>(
      `/employees/${enc(employeeId)}/document-requests`
    );
    return res.data;
  },

  async createDocumentRequest(
    employeeId: string,
    input: CreateEmployeeDocumentRequestDto
  ): Promise<CreateEmployeeDocumentRequestResponse> {
    const res = await api.post<CreateEmployeeDocumentRequestResponse>(
      `/employees/${enc(employeeId)}/document-requests`,
      input
    );
    return res.data;
  },

  async getPublicDocumentRequest(token: string): Promise<GetPublicEmployeeDocumentRequestResponse> {
    const res = await api.get<GetPublicEmployeeDocumentRequestResponse>(
      `/public/employee-document-requests/${enc(token)}`
    );
    return res.data;
  },

  async submitPublicDocumentRequest(
    token: string,
    input: SubmitEmployeeDocumentRequestDto
  ): Promise<SubmitPublicEmployeeDocumentRequestResponse> {
    const res = await api.post<SubmitPublicEmployeeDocumentRequestResponse>(
      `/public/employee-document-requests/${enc(token)}/submit`,
      input
    );
    return res.data;
  },
};
