/**
 * Employee Invitation Types
 * Frontend-safe
 */

import type { ApiResponse, Id, EmployeeAccessStatus } from "./employee-management.types";

export const INVITE_STATUS_VALUES = [
  "PENDING",
  "ACCEPTED",
  "EXPIRED",
  "REVOKED",
] as const;
export type InviteStatus = (typeof INVITE_STATUS_VALUES)[number];

export const INVITATION_PURPOSE_VALUES = [
  "TENANT_ACCESS",
  "EMPLOYEE_ACCESS",
] as const;
export type InvitationPurpose = (typeof INVITATION_PURPOSE_VALUES)[number];

export type EmployeeInvitation = {
  id: Id;
  tenantId?: Id;
  employeeId?: Id | null;

  email: string;
  status: InviteStatus;
  purpose: InvitationPurpose;

  title?: string | null;
  roleKeys?: string[];

  expiresAt: string;
  acceptedAt?: string | null;
  revokedAt?: string | null;
  revokedReason?: string | null;

  createdAt: string;
  updatedAt?: string;
};

export type EmployeeInvitationDetail = EmployeeInvitation & {
  employee?: {
    id: Id;
    userId?: Id | null;
    firstName: string;
    lastName: string;
    preferredName?: string | null;
    workEmail?: string | null;
    personalEmail?: string | null;
    accessStatus?: EmployeeAccessStatus;
  } | null;
};

export type EmployeeInvitationListData = {
  items: EmployeeInvitation[];
  total: number;
};

export type InviteEmployeeAccessDto = {
  email?: string;
  title?: string;
  roleKeys: string[];
  expiresInDays?: number;
  sendEmail?: boolean;
};

export type ResendEmployeeInvitationDto = {
  email?: string;
  title?: string;
  roleKeys?: string[];
  expiresInDays?: number;
  sendEmail?: boolean;
};

export type RevokeEmployeeInvitationDto = {
  reason?: string;
};

export type EmployeeInvitationListQueryDto = {
  status?: InviteStatus;
  includeExpired?: boolean;
  onlyLatest?: boolean;
};

export type DisableEmployeeAccessDto = {
  reason?: string;
  revokePendingInvitations?: boolean;
};

export type EnableEmployeeAccessDto = {
  createNewInvitation?: boolean;
  email?: string;
  title?: string;
  roleKeys?: string[];
  expiresInDays?: number;
  sendEmail?: boolean;
};

export type InviteEmployeeAccessResult = {
  ok: boolean;
  message: string;
  invitation: {
    id: Id;
    employeeId: Id;
    email: string;
    status: InviteStatus;
    purpose: InvitationPurpose;
    expiresAt: string;
    title?: string | null;
    roleKeys: string[];
    createdAt: string;
  };
  acceptUrl?: string;
};

export type RevokeEmployeeInvitationResult = {
  ok: boolean;
  message: string;
  invitationId: Id;
  status: InviteStatus;
};

export type DisableEmployeeAccessResult = {
  ok: boolean;
  message: string;
  employeeId: Id;
  accessStatus: EmployeeAccessStatus;
};

export type EnableEmployeeAccessReactivatedResult = {
  ok: boolean;
  message: string;
  employeeId: Id;
  accessStatus: EmployeeAccessStatus;
  mode: "reactivated";
};

export type EnableEmployeeAccessInvitedResult = InviteEmployeeAccessResult;

export type EnableEmployeeAccessResult =
  | EnableEmployeeAccessReactivatedResult
  | EnableEmployeeAccessInvitedResult;

// API response wrappers
export type InviteEmployeeAccessResponse = ApiResponse<InviteEmployeeAccessResult>;
export type ListEmployeeInvitationsResponse = ApiResponse<EmployeeInvitationListData>;
export type GetEmployeeInvitationResponse = ApiResponse<EmployeeInvitationDetail>;
export type ResendEmployeeInvitationResponse = ApiResponse<InviteEmployeeAccessResult>;
export type RevokeEmployeeInvitationResponse = ApiResponse<RevokeEmployeeInvitationResult>;
export type DisableEmployeeAccessResponse = ApiResponse<DisableEmployeeAccessResult>;
export type EnableEmployeeAccessResponse = ApiResponse<EnableEmployeeAccessResult>;