"use client";

import { useCallback, useMemo, useState } from "react";
import { employeePayrollManagementService } from "@/logaxp/lib/employee-management/employeePayrollManagementService";
import type {
  CreateEmployeeCompensationDto,
  CreateEmployeePaymentMethodDto,
  CreateEmployeePaymentSplitDto,
  ListEmployeeCompensationsQueryDto,
  ListEmployeePaymentMethodsQueryDto,
  ListEmployeePaymentSplitsQueryDto,
  UpdateEmployeeCompensationDto,
  UpdateEmployeePaymentMethodDto,
  UpdateEmployeePaymentSplitDto,
  UpsertEmployeePayrollProfileDto,
} from "@/logaxp/lib/employee-management/employee-payroll.types";

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
      const first = apiMsg.find((x) => typeof x === "string");
      if (typeof first === "string" && first.trim()) return first;
    }

    const msg = e.message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }

  return "Something went wrong";
}

export function useEmployeePayrollManagement() {
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

  const getPayrollProfile = useCallback(
    (employeeId: string) => wrap(() => employeePayrollManagementService.getPayrollProfile(employeeId)),
    [wrap]
  );

  const upsertPayrollProfile = useCallback(
    (employeeId: string, input: UpsertEmployeePayrollProfileDto) =>
      wrap(() => employeePayrollManagementService.upsertPayrollProfile(employeeId, input)),
    [wrap]
  );

  const listCompensations = useCallback(
    (employeeId: string, query?: ListEmployeeCompensationsQueryDto) =>
      wrap(() => employeePayrollManagementService.listCompensations(employeeId, query)),
    [wrap]
  );

  const getCompensation = useCallback(
    (compensationId: string) => wrap(() => employeePayrollManagementService.getCompensation(compensationId)),
    [wrap]
  );

  const createCompensation = useCallback(
    (employeeId: string, input: CreateEmployeeCompensationDto) =>
      wrap(() => employeePayrollManagementService.createCompensation(employeeId, input)),
    [wrap]
  );

  const updateCompensation = useCallback(
    (compensationId: string, input: UpdateEmployeeCompensationDto) =>
      wrap(() => employeePayrollManagementService.updateCompensation(compensationId, input)),
    [wrap]
  );

  const removeCompensation = useCallback(
    (compensationId: string) =>
      wrap(() => employeePayrollManagementService.removeCompensation(compensationId)),
    [wrap]
  );

  const listPaymentMethods = useCallback(
    (employeeId: string, query?: ListEmployeePaymentMethodsQueryDto) =>
      wrap(() => employeePayrollManagementService.listPaymentMethods(employeeId, query)),
    [wrap]
  );

  const getPaymentMethod = useCallback(
    (paymentMethodId: string) =>
      wrap(() => employeePayrollManagementService.getPaymentMethod(paymentMethodId)),
    [wrap]
  );

  const createPaymentMethod = useCallback(
    (employeeId: string, input: CreateEmployeePaymentMethodDto) =>
      wrap(() => employeePayrollManagementService.createPaymentMethod(employeeId, input)),
    [wrap]
  );

  const updatePaymentMethod = useCallback(
    (paymentMethodId: string, input: UpdateEmployeePaymentMethodDto) =>
      wrap(() => employeePayrollManagementService.updatePaymentMethod(paymentMethodId, input)),
    [wrap]
  );

  const setPrimaryPaymentMethod = useCallback(
    (paymentMethodId: string) =>
      wrap(() => employeePayrollManagementService.setPrimaryPaymentMethod(paymentMethodId)),
    [wrap]
  );

  const removePaymentMethod = useCallback(
    (paymentMethodId: string) =>
      wrap(() => employeePayrollManagementService.removePaymentMethod(paymentMethodId)),
    [wrap]
  );

  const listPaymentSplits = useCallback(
    (employeeId: string, query?: ListEmployeePaymentSplitsQueryDto) =>
      wrap(() => employeePayrollManagementService.listPaymentSplits(employeeId, query)),
    [wrap]
  );

  const getPaymentSplit = useCallback(
    (paymentSplitId: string) =>
      wrap(() => employeePayrollManagementService.getPaymentSplit(paymentSplitId)),
    [wrap]
  );

  const createPaymentSplit = useCallback(
    (employeeId: string, input: CreateEmployeePaymentSplitDto) =>
      wrap(() => employeePayrollManagementService.createPaymentSplit(employeeId, input)),
    [wrap]
  );

  const updatePaymentSplit = useCallback(
    (paymentSplitId: string, input: UpdateEmployeePaymentSplitDto) =>
      wrap(() => employeePayrollManagementService.updatePaymentSplit(paymentSplitId, input)),
    [wrap]
  );

  const removePaymentSplit = useCallback(
    (paymentSplitId: string) =>
      wrap(() => employeePayrollManagementService.removePaymentSplit(paymentSplitId)),
    [wrap]
  );

  const payrollProfile = useMemo(
    () => ({
      get: getPayrollProfile,
      upsert: upsertPayrollProfile,
    }),
    [getPayrollProfile, upsertPayrollProfile]
  );

  const compensations = useMemo(
    () => ({
      list: listCompensations,
      get: getCompensation,
      create: createCompensation,
      update: updateCompensation,
      remove: removeCompensation,
    }),
    [listCompensations, getCompensation, createCompensation, updateCompensation, removeCompensation]
  );

  const paymentMethods = useMemo(
    () => ({
      list: listPaymentMethods,
      get: getPaymentMethod,
      create: createPaymentMethod,
      update: updatePaymentMethod,
      setPrimary: setPrimaryPaymentMethod,
      remove: removePaymentMethod,
    }),
    [
      listPaymentMethods,
      getPaymentMethod,
      createPaymentMethod,
      updatePaymentMethod,
      setPrimaryPaymentMethod,
      removePaymentMethod,
    ]
  );

  const paymentSplits = useMemo(
    () => ({
      list: listPaymentSplits,
      get: getPaymentSplit,
      create: createPaymentSplit,
      update: updatePaymentSplit,
      remove: removePaymentSplit,
    }),
    [listPaymentSplits, getPaymentSplit, createPaymentSplit, updatePaymentSplit, removePaymentSplit]
  );

  return {
    loading,
    error,
    clearError,
    wrap,

    payrollProfile,
    compensations,
    paymentMethods,
    paymentSplits,

    getPayrollProfile,
    upsertPayrollProfile,

    listCompensations,
    getCompensation,
    createCompensation,
    updateCompensation,
    removeCompensation,

    listPaymentMethods,
    getPaymentMethod,
    createPaymentMethod,
    updatePaymentMethod,
    setPrimaryPaymentMethod,
    removePaymentMethod,

    listPaymentSplits,
    getPaymentSplit,
    createPaymentSplit,
    updatePaymentSplit,
    removePaymentSplit,
  };
}

export type UseEmployeePayrollManagementReturn = ReturnType<typeof useEmployeePayrollManagement>;