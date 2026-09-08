"use client";

import { useCallback, useMemo, useState } from "react";
import { employeeInvitationService } from "@/logaxp/lib/employee-management/employeeInvitationService";
import type {
  DisableEmployeeAccessDto,
  EmployeeInvitationListQueryDto,
  EnableEmployeeAccessDto,
  InviteEmployeeAccessDto,
  ResendEmployeeInvitationDto,
  RevokeEmployeeInvitationDto,
} from "@/logaxp/lib/employee-management/employee-invitation.types";

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

export function useEmployeeInvitations() {
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

  const inviteEmployeeAccess = useCallback(
    (employeeId: string, input: InviteEmployeeAccessDto) =>
      wrap(() => employeeInvitationService.inviteEmployeeAccess(employeeId, input)),
    [wrap]
  );

  const listEmployeeInvitations = useCallback(
    (employeeId: string, query?: EmployeeInvitationListQueryDto) =>
      wrap(() => employeeInvitationService.listEmployeeInvitations(employeeId, query)),
    [wrap]
  );

  const getEmployeeInvitation = useCallback(
    (invitationId: string) =>
      wrap(() => employeeInvitationService.getEmployeeInvitation(invitationId)),
    [wrap]
  );

  const resendEmployeeInvitation = useCallback(
    (invitationId: string, input: ResendEmployeeInvitationDto) =>
      wrap(() => employeeInvitationService.resendEmployeeInvitation(invitationId, input)),
    [wrap]
  );

  const revokeEmployeeInvitation = useCallback(
    (invitationId: string, input: RevokeEmployeeInvitationDto) =>
      wrap(() => employeeInvitationService.revokeEmployeeInvitation(invitationId, input)),
    [wrap]
  );

  const disableEmployeeAccess = useCallback(
    (employeeId: string, input: DisableEmployeeAccessDto) =>
      wrap(() => employeeInvitationService.disableEmployeeAccess(employeeId, input)),
    [wrap]
  );

  const enableEmployeeAccess = useCallback(
    (employeeId: string, input: EnableEmployeeAccessDto) =>
      wrap(() => employeeInvitationService.enableEmployeeAccess(employeeId, input)),
    [wrap]
  );

  const invitations = useMemo(
    () => ({
      invite: inviteEmployeeAccess,
      list: listEmployeeInvitations,
      get: getEmployeeInvitation,
      resend: resendEmployeeInvitation,
      revoke: revokeEmployeeInvitation,
      disableAccess: disableEmployeeAccess,
      enableAccess: enableEmployeeAccess,
    }),
    [
      inviteEmployeeAccess,
      listEmployeeInvitations,
      getEmployeeInvitation,
      resendEmployeeInvitation,
      revokeEmployeeInvitation,
      disableEmployeeAccess,
      enableEmployeeAccess,
    ]
  );

  return {
    loading,
    error,
    clearError,
    wrap,

    invitations,

    inviteEmployeeAccess,
    listEmployeeInvitations,
    getEmployeeInvitation,
    resendEmployeeInvitation,
    revokeEmployeeInvitation,
    disableEmployeeAccess,
    enableEmployeeAccess,
  };
}