"use client";

import { api } from "@/logaxp/lib/api/apiClient";
import type {
  DisableEmployeeAccessDto,
  DisableEmployeeAccessResponse,
  EmployeeInvitationListQueryDto,
  EnableEmployeeAccessDto,
  EnableEmployeeAccessResponse,
  GetEmployeeInvitationResponse,
  InviteEmployeeAccessDto,
  InviteEmployeeAccessResponse,
  ListEmployeeInvitationsResponse,
  ResendEmployeeInvitationDto,
  ResendEmployeeInvitationResponse,
  RevokeEmployeeInvitationDto,
  RevokeEmployeeInvitationResponse,
} from "./employee-invitation.types";

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

export const employeeInvitationService = {
  async inviteEmployeeAccess(
    employeeId: string,
    input: InviteEmployeeAccessDto
  ): Promise<InviteEmployeeAccessResponse> {
    const res = await api.post<InviteEmployeeAccessResponse>(
      `/employee-invitations/employees/${enc(employeeId)}`,
      input
    );
    return res.data;
  },

  async listEmployeeInvitations(
    employeeId: string,
    query?: EmployeeInvitationListQueryDto
  ): Promise<ListEmployeeInvitationsResponse> {
    const res = await api.get<ListEmployeeInvitationsResponse>(
      `/employee-invitations/employees/${enc(employeeId)}`,
      {
        params: cleanParams(query),
      }
    );
    return res.data;
  },

  async getEmployeeInvitation(
    invitationId: string
  ): Promise<GetEmployeeInvitationResponse> {
    const res = await api.get<GetEmployeeInvitationResponse>(
      `/employee-invitations/${enc(invitationId)}`
    );
    return res.data;
  },

  async resendEmployeeInvitation(
    invitationId: string,
    input: ResendEmployeeInvitationDto
  ): Promise<ResendEmployeeInvitationResponse> {
    const res = await api.post<ResendEmployeeInvitationResponse>(
      `/employee-invitations/${enc(invitationId)}/resend`,
      input
    );
    return res.data;
  },

  async revokeEmployeeInvitation(
    invitationId: string,
    input: RevokeEmployeeInvitationDto
  ): Promise<RevokeEmployeeInvitationResponse> {
    const res = await api.post<RevokeEmployeeInvitationResponse>(
      `/employee-invitations/${enc(invitationId)}/revoke`,
      input
    );
    return res.data;
  },

  async disableEmployeeAccess(
    employeeId: string,
    input: DisableEmployeeAccessDto
  ): Promise<DisableEmployeeAccessResponse> {
    const res = await api.post<DisableEmployeeAccessResponse>(
      `/employee-invitations/employees/${enc(employeeId)}/disable-access`,
      input
    );
    return res.data;
  },

  async enableEmployeeAccess(
    employeeId: string,
    input: EnableEmployeeAccessDto
  ): Promise<EnableEmployeeAccessResponse> {
    const res = await api.post<EnableEmployeeAccessResponse>(
      `/employee-invitations/employees/${enc(employeeId)}/enable-access`,
      input
    );
    return res.data;
  },
};