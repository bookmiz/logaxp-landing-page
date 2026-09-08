// src/hooks/useEmployeeManagement.ts
"use client";

import { useCallback, useMemo, useState } from "react";
import { employeeManagementService } from "@/logaxp/lib/employee-management/employeeManagementService";
import type {
  EmployeeListFilterDto,
  PaginationDto,

  CreateEmployeeDto,
  UpdateEmployeeDto,
  ChangeEmployeeStatusDto,

  CreateEmployeeAssignmentDto,
  UpdateEmployeeAssignmentDto,

  CreateEmployeeAddressDto,
  UpdateEmployeeAddressDto,

  CreateEmergencyContactDto,
  UpdateEmergencyContactDto,

  CreateDependentDto,
  UpdateDependentDto,

  CreateEmployeeDocumentDto,
  VerifyEmployeeDocumentDto,
  EmployeeDocumentFolderQueryDto,
  CreateEmployeeDocumentRequestDto,
  SubmitEmployeeDocumentRequestDto,
  SendEmployeeDocumentExpiryRemindersDto,
} from "@/logaxp/lib/employee-management/employee-management.types";

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

    // sometimes backend sends message array
    if (Array.isArray(apiMsg) && apiMsg.length > 0) {
      const first = apiMsg.find((x) => typeof x === "string");
      if (typeof first === "string" && first.trim()) return first;
    }

    const msg = e.message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }

  return "Something went wrong";
}

type EmployeeListQuery = EmployeeListFilterDto & PaginationDto;

export function useEmployeeManagement() {
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
   * Employees
   * ======================================= */

  const listEmployees = useCallback(
    (query?: EmployeeListQuery) => wrap(() => employeeManagementService.listEmployees(query)),
    [wrap]
  );

  const getEmployee = useCallback(
    (id: string) => wrap(() => employeeManagementService.getEmployee(id)),
    [wrap]
  );

  const createEmployee = useCallback(
    (input: CreateEmployeeDto) => wrap(() => employeeManagementService.createEmployee(input)),
    [wrap]
  );

  const updateEmployee = useCallback(
    (id: string, input: UpdateEmployeeDto) => wrap(() => employeeManagementService.updateEmployee(id, input)),
    [wrap]
  );

  const changeEmployeeStatus = useCallback(
    (id: string, input: ChangeEmployeeStatusDto) =>
      wrap(() => employeeManagementService.changeEmployeeStatus(id, input)),
    [wrap]
  );

  const softDeleteEmployee = useCallback(
    (id: string) => wrap(() => employeeManagementService.softDeleteEmployee(id)),
    [wrap]
  );

  const restoreEmployee = useCallback(
    (id: string) => wrap(() => employeeManagementService.restoreEmployee(id)),
    [wrap]
  );

  /* =========================================
   * Assignments
   * ======================================= */

  const listAssignments = useCallback(
    (employeeId: string) => wrap(() => employeeManagementService.listAssignments(employeeId)),
    [wrap]
  );

  const createAssignment = useCallback(
    (employeeId: string, input: CreateEmployeeAssignmentDto) =>
      wrap(() => employeeManagementService.createAssignment(employeeId, input)),
    [wrap]
  );

  const updateAssignment = useCallback(
    (assignmentId: string, input: UpdateEmployeeAssignmentDto) =>
      wrap(() => employeeManagementService.updateAssignment(assignmentId, input)),
    [wrap]
  );

  const setPrimaryAssignment = useCallback(
    (assignmentId: string) => wrap(() => employeeManagementService.setPrimaryAssignment(assignmentId)),
    [wrap]
  );

  const endAssignment = useCallback(
    (assignmentId: string, effectiveTo: string) =>
      wrap(() => employeeManagementService.endAssignment(assignmentId, effectiveTo)),
    [wrap]
  );

  const removeAssignment = useCallback(
    (assignmentId: string) => wrap(() => employeeManagementService.removeAssignment(assignmentId)),
    [wrap]
  );

  /* =========================================
   * Addresses
   * ======================================= */

  const listAddresses = useCallback(
    (employeeId: string) => wrap(() => employeeManagementService.listAddresses(employeeId)),
    [wrap]
  );

  const createAddress = useCallback(
    (employeeId: string, input: CreateEmployeeAddressDto) =>
      wrap(() => employeeManagementService.createAddress(employeeId, input)),
    [wrap]
  );

  const updateAddress = useCallback(
    (addressId: string, input: UpdateEmployeeAddressDto) =>
      wrap(() => employeeManagementService.updateAddress(addressId, input)),
    [wrap]
  );

  const setPrimaryAddress = useCallback(
    (addressId: string) => wrap(() => employeeManagementService.setPrimaryAddress(addressId)),
    [wrap]
  );

  const removeAddress = useCallback(
    (addressId: string) => wrap(() => employeeManagementService.removeAddress(addressId)),
    [wrap]
  );

  /* =========================================
   * Emergency Contacts
   * ======================================= */

  const listEmergencyContacts = useCallback(
    (employeeId: string) => wrap(() => employeeManagementService.listEmergencyContacts(employeeId)),
    [wrap]
  );

  const createEmergencyContact = useCallback(
    (employeeId: string, input: CreateEmergencyContactDto) =>
      wrap(() => employeeManagementService.createEmergencyContact(employeeId, input)),
    [wrap]
  );

  const updateEmergencyContact = useCallback(
    (contactId: string, input: UpdateEmergencyContactDto) =>
      wrap(() => employeeManagementService.updateEmergencyContact(contactId, input)),
    [wrap]
  );

  const setPrimaryEmergencyContact = useCallback(
    (contactId: string) => wrap(() => employeeManagementService.setPrimaryEmergencyContact(contactId)),
    [wrap]
  );

  const removeEmergencyContact = useCallback(
    (contactId: string) => wrap(() => employeeManagementService.removeEmergencyContact(contactId)),
    [wrap]
  );

  /* =========================================
   * Dependents
   * ======================================= */

  const listDependents = useCallback(
    (employeeId: string) => wrap(() => employeeManagementService.listDependents(employeeId)),
    [wrap]
  );

  const createDependent = useCallback(
    (employeeId: string, input: CreateDependentDto) =>
      wrap(() => employeeManagementService.createDependent(employeeId, input)),
    [wrap]
  );

  const updateDependent = useCallback(
    (dependentId: string, input: UpdateDependentDto) =>
      wrap(() => employeeManagementService.updateDependent(dependentId, input)),
    [wrap]
  );

  const removeDependent = useCallback(
    (dependentId: string) => wrap(() => employeeManagementService.removeDependent(dependentId)),
    [wrap]
  );

  /* =========================================
   * Documents
   * ======================================= */

  const listDocuments = useCallback(
    (employeeId: string) => wrap(() => employeeManagementService.listDocuments(employeeId)),
    [wrap]
  );

  const listDocumentFolders = useCallback(
    (query?: EmployeeDocumentFolderQueryDto) =>
      wrap(() => employeeManagementService.listDocumentFolders(query)),
    [wrap]
  );

  const listExpiringDocuments = useCallback(
    (query?: EmployeeDocumentFolderQueryDto) =>
      wrap(() => employeeManagementService.listExpiringDocuments(query)),
    [wrap]
  );

  const sendDocumentExpiryReminders = useCallback(
    (input?: SendEmployeeDocumentExpiryRemindersDto) =>
      wrap(() => employeeManagementService.sendDocumentExpiryReminders(input)),
    [wrap]
  );

  const getDocumentFolder = useCallback(
    (employeeId: string, query?: EmployeeDocumentFolderQueryDto) =>
      wrap(() => employeeManagementService.getDocumentFolder(employeeId, query)),
    [wrap]
  );

  const createDocument = useCallback(
    (employeeId: string, input: CreateEmployeeDocumentDto) =>
      wrap(() => employeeManagementService.createDocument(employeeId, input)),
    [wrap]
  );

  const verifyDocument = useCallback(
    (documentId: string, input: VerifyEmployeeDocumentDto) =>
      wrap(() => employeeManagementService.verifyDocument(documentId, input)),
    [wrap]
  );

  const removeDocument = useCallback(
    (documentId: string) => wrap(() => employeeManagementService.removeDocument(documentId)),
    [wrap]
  );

  const listDocumentRequests = useCallback(
    (employeeId: string) => wrap(() => employeeManagementService.listDocumentRequests(employeeId)),
    [wrap]
  );

  const createDocumentRequest = useCallback(
    (employeeId: string, input: CreateEmployeeDocumentRequestDto) =>
      wrap(() => employeeManagementService.createDocumentRequest(employeeId, input)),
    [wrap]
  );

  const getPublicDocumentRequest = useCallback(
    (token: string) => wrap(() => employeeManagementService.getPublicDocumentRequest(token)),
    [wrap]
  );

  const submitPublicDocumentRequest = useCallback(
    (token: string, input: SubmitEmployeeDocumentRequestDto) =>
      wrap(() => employeeManagementService.submitPublicDocumentRequest(token, input)),
    [wrap]
  );

  const employees = useMemo(
    () => ({
      list: listEmployees,
      get: getEmployee,
      create: createEmployee,
      update: updateEmployee,
      changeStatus: changeEmployeeStatus,
      softDelete: softDeleteEmployee,
      restore: restoreEmployee,
    }),
    [
      listEmployees,
      getEmployee,
      createEmployee,
      updateEmployee,
      changeEmployeeStatus,
      softDeleteEmployee,
      restoreEmployee,
    ]
  );

  const assignments = useMemo(
    () => ({
      list: listAssignments,
      create: createAssignment,
      update: updateAssignment,
      setPrimary: setPrimaryAssignment,
      end: endAssignment,
      remove: removeAssignment,
    }),
    [
      listAssignments,
      createAssignment,
      updateAssignment,
      setPrimaryAssignment,
      endAssignment,
      removeAssignment,
    ]
  );

  const addresses = useMemo(
    () => ({
      list: listAddresses,
      create: createAddress,
      update: updateAddress,
      setPrimary: setPrimaryAddress,
      remove: removeAddress,
    }),
    [listAddresses, createAddress, updateAddress, setPrimaryAddress, removeAddress]
  );

  const emergencyContacts = useMemo(
    () => ({
      list: listEmergencyContacts,
      create: createEmergencyContact,
      update: updateEmergencyContact,
      setPrimary: setPrimaryEmergencyContact,
      remove: removeEmergencyContact,
    }),
    [
      listEmergencyContacts,
      createEmergencyContact,
      updateEmergencyContact,
      setPrimaryEmergencyContact,
      removeEmergencyContact,
    ]
  );

  const dependents = useMemo(
    () => ({
      list: listDependents,
      create: createDependent,
      update: updateDependent,
      remove: removeDependent,
    }),
    [listDependents, createDependent, updateDependent, removeDependent]
  );

  const documents = useMemo(
    () => ({
      list: listDocuments,
      listFolders: listDocumentFolders,
      listExpiring: listExpiringDocuments,
      sendExpiryReminders: sendDocumentExpiryReminders,
      getFolder: getDocumentFolder,
      create: createDocument,
      verify: verifyDocument,
      remove: removeDocument,
      listRequests: listDocumentRequests,
      createRequest: createDocumentRequest,
      getPublicRequest: getPublicDocumentRequest,
      submitPublicRequest: submitPublicDocumentRequest,
    }),
    [
      listDocuments,
      listDocumentFolders,
      listExpiringDocuments,
      sendDocumentExpiryReminders,
      getDocumentFolder,
      createDocument,
      verifyDocument,
      removeDocument,
      listDocumentRequests,
      createDocumentRequest,
      getPublicDocumentRequest,
      submitPublicDocumentRequest,
    ]
  );

  return {
    loading,
    error,
    clearError,
    wrap,

    // grouped APIs
    employees,
    assignments,
    addresses,
    emergencyContacts,
    dependents,
    documents,

    // flat APIs (optional convenience)
    listEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    changeEmployeeStatus,
    softDeleteEmployee,
    restoreEmployee,

    listAssignments,
    createAssignment,
    updateAssignment,
    setPrimaryAssignment,
    endAssignment,
    removeAssignment,

    listAddresses,
    createAddress,
    updateAddress,
    setPrimaryAddress,
    removeAddress,

    listEmergencyContacts,
    createEmergencyContact,
    updateEmergencyContact,
    setPrimaryEmergencyContact,
    removeEmergencyContact,

    listDependents,
    createDependent,
    updateDependent,
    removeDependent,

    listDocuments,
    listDocumentFolders,
    listExpiringDocuments,
    sendDocumentExpiryReminders,
    getDocumentFolder,
    createDocument,
    verifyDocument,
    removeDocument,
    listDocumentRequests,
    createDocumentRequest,
    getPublicDocumentRequest,
    submitPublicDocumentRequest,
  };
}
