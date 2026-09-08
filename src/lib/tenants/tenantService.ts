// src/lib/tenants/tenantService.ts
"use client";

import { api } from "@/logaxp/lib/api/apiClient";
import type {
  AddTenantDomainInput,
  CreateTenantInput,
  InviteMemberInput,
  ListDomainsQuery,
  ListInvitationsQuery,
  CreateTenantMemberInput,
  CreateTenantMemberResult,
  UploadTenantMembersInput,
  UploadTenantMembersResult,
  Membership,
  PaginatedResult,
  Permission,
  Role,
  Tenant,
  TenantDomain,
  TenantInvitation,
  TenantInvitationActionResponse,
  TenantSettings,
  UpdateTenantInput,
  UpdateTenantSettingsInput,
} from "./tenant.types";

export const tenantService = {
  // -----------------------------
  // SITE ADMIN ONLY
  // -----------------------------
  async listTenants() {
    const res = await api.get<Tenant[]>("/tenants");
    return res.data;
  },

  async createTenant(input: CreateTenantInput) {
    const res = await api.post<Tenant>("/tenants", input);
    return res.data;
  },

  async updateTenant(tenantId: string, input: UpdateTenantInput) {
    const res = await api.patch<Tenant>(`/tenants/${tenantId}`, input);
    return res.data;
  },

  async activateTenant(tenantId: string) {
    const res = await api.post<Tenant>(`/tenants/${tenantId}/activate`);
    return res.data;
  },

  async suspendTenant(tenantId: string) {
    const res = await api.post<Tenant>(`/tenants/${tenantId}/suspend`);
    return res.data;
  },

  async softDeleteTenant(tenantId: string) {
    const res = await api.delete<Tenant>(`/tenants/${tenantId}`);
    return res.data;
  },

  // -----------------------------
  // TENANT ADMIN (permission-based)
  // -----------------------------
  async getSettings(tenantId: string) {
    const res = await api.get<TenantSettings | null>(`/tenants/${tenantId}/settings`);
    return res.data;
  },

  async updateSettings(tenantId: string, input: UpdateTenantSettingsInput) {
    const res = await api.patch<TenantSettings>(`/tenants/${tenantId}/settings`, input);
    return res.data;
  },

  // ---- Domains ----
  async addDomain(tenantId: string, input: AddTenantDomainInput) {
    const res = await api.post<TenantDomain>(`/tenants/${tenantId}/domains`, input);
    return res.data;
  },

  async setPrimaryDomain(tenantId: string, domainId: string) {
    const res = await api.post<TenantDomain>(`/tenants/${tenantId}/domains/${domainId}/primary`);
    return res.data;
  },

  async verifyDomain(tenantId: string, domainId: string) {
    const res = await api.post<TenantDomain>(`/tenants/${tenantId}/domains/${domainId}/verify`);
    return res.data;
  },

  async removeDomain(tenantId: string, domainId: string) {
    const res = await api.delete<TenantDomain>(`/tenants/${tenantId}/domains/${domainId}`);
    return res.data;
  },
    async listDomains(tenantId: string, query?: ListDomainsQuery) {
    const res = await api.get<PaginatedResult<TenantDomain>>(`/tenants/${tenantId}/domains`, {
      params: query,
    });
    return res.data;
  },

  // ---- Invitations ----
  async inviteMember(tenantId: string, input: InviteMemberInput) {
    const res = await api.post<{ invitationId: string; inviteToken?: string }>(
      `/tenants/${tenantId}/invitations`,
      input
    );
    return res.data;
  },
    async listInvitations(tenantId: string, query?: ListInvitationsQuery) {
    const res = await api.get<PaginatedResult<TenantInvitation>>(
      `/tenants/${tenantId}/invitations`,
      { params: query }
    );
    return res.data;
  },

  async revokeInvitation(tenantId: string, invitationId: string) {
    const res = await api.post<TenantInvitationActionResponse>(
      `/tenants/${tenantId}/invitations/${invitationId}/revoke`
    );
    return res.data;
  },

  async resendInvitation(tenantId: string, invitationId: string) {
    const res = await api.post<TenantInvitationActionResponse>(
      `/tenants/${tenantId}/invitations/${invitationId}/resend`
    );
    return res.data;
  },

  // ---- Memberships ----
 async listMemberships(tenantId: string) {
  const res = await api.get<PaginatedResult<Membership> | Membership[]>(
    `/tenants/${tenantId}/memberships`
  );

  const data = res.data;
  return Array.isArray(data) ? data : (data.items ?? []);
},

  async suspendMembership(tenantId: string, membershipId: string) {
    const res = await api.post<Membership>(`/tenants/${tenantId}/memberships/${membershipId}/suspend`);
    return res.data;
  },

  async activateMembership(tenantId: string, membershipId: string) {
    const res = await api.post<Membership>(`/tenants/${tenantId}/memberships/${membershipId}/activate`);
    return res.data;
  },

  async removeMembership(tenantId: string, membershipId: string) {
    const res = await api.delete<Membership>(`/tenants/${tenantId}/memberships/${membershipId}`);
    return res.data;
  },

   // ---- Direct member creation (optional backend flow) ----
  async createMember(tenantId: string, input: CreateTenantMemberInput) {
    const res = await api.post<CreateTenantMemberResult>(`/tenants/${tenantId}/members`, input);
    return res.data;
  },

  // ---- Bulk upload members (CSV/XLSX) ----
  async uploadMembers(tenantId: string, input: UploadTenantMembersInput | FormData) {
    const formData =
      input instanceof FormData
        ? input
        : (() => {
            const fd = new FormData();
            fd.append("file", input.file);
            if (typeof input.dryRun === "boolean") fd.append("dryRun", String(input.dryRun));
            if (typeof input.sendInvites === "boolean") fd.append("sendInvites", String(input.sendInvites));
            if (input.defaultRoleIds?.length) {
              input.defaultRoleIds.forEach((id) => fd.append("defaultRoleIds[]", id));
            }
            return fd;
          })();

    const res = await api.post<UploadTenantMembersResult>(`/tenants/${tenantId}/members/upload`, formData);
    return res.data;
  },

  // -----------------------------
  // RBAC BOOTSTRAP + ROLES
  // -----------------------------
  async bootstrapRbac(tenantId: string) {
    const res = await api.post<{ ok?: boolean }>(`/tenants/${tenantId}/rbac/bootstrap`);
    return res.data;
  },

  async listRoles(tenantId: string) {
    const res = await api.get<Role[]>(`/tenants/${tenantId}/roles`);
    return res.data;
  },

  async listPermissions(tenantId: string) {
    const res = await api.get<Permission[]>(`/tenants/${tenantId}/permissions`);
    return res.data;
  },

  async assignRole(tenantId: string, membershipId: string, roleId: string) {
    const res = await api.post(`/tenants/${tenantId}/memberships/${membershipId}/roles/${roleId}`);
    return res.data;
  },

  async unassignRole(tenantId: string, membershipId: string, roleId: string) {
    const res = await api.delete(`/tenants/${tenantId}/memberships/${membershipId}/roles/${roleId}`);
    return res.data;
  },
};