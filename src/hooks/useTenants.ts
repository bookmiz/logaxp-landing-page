// src/hooks/useTenants.ts
"use client";

import { useCallback, useMemo, useState } from "react";
import { tenantService } from "@/logaxp/lib/tenants/tenantService";
import type {
  AddTenantDomainInput,
  CreateTenantInput,
  InviteMemberInput,
  ListDomainsQuery,
  ListInvitationsQuery,
  UpdateTenantInput,
  UpdateTenantSettingsInput,
  CreateTenantMemberInput,
  UploadTenantMembersInput,
} from "@/logaxp/lib/tenants/tenant.types";
import { useAuthStore } from "@/logaxp/stores/useAuthStore"

export function useTenants() {
  const activeTenantId = useAuthStore((s) => s.tenant?.id ?? null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrap = useCallback(async <T,>(fn: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string } }; message?: string } | Error;
      const msg = (error && 'response' in error ? error.response?.data?.message : undefined) || (error instanceof Error ? error.message : "Something went wrong") || "Something went wrong";
      setError(String(msg));
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------
  // Site admin
  // -----------------------------
  const listTenants = useCallback(() => wrap(() => tenantService.listTenants()), [wrap]);
  const createTenant = useCallback((dto: CreateTenantInput) => wrap(() => tenantService.createTenant(dto)), [wrap]);
  const updateTenant = useCallback(
    (tenantId: string, dto: UpdateTenantInput) => wrap(() => tenantService.updateTenant(tenantId, dto)),
    [wrap]
  );
  const activateTenant = useCallback((tenantId: string) => wrap(() => tenantService.activateTenant(tenantId)), [wrap]);
  const suspendTenant = useCallback((tenantId: string) => wrap(() => tenantService.suspendTenant(tenantId)), [wrap]);
  const softDeleteTenant = useCallback((tenantId: string) => wrap(() => tenantService.softDeleteTenant(tenantId)), [wrap]);

  // -----------------------------
  // Tenant admin (permission-based)
  // -----------------------------
  const getSettings = useCallback(
    (tenantId?: string) => {
      const tid = tenantId ?? activeTenantId;
      if (!tid) throw new Error("No tenantId available");
      return wrap(() => tenantService.getSettings(tid));
    },
    [wrap, activeTenantId]
  );

  const updateSettings = useCallback(
    (dto: UpdateTenantSettingsInput, tenantId?: string) => {
      const tid = tenantId ?? activeTenantId;
      if (!tid) throw new Error("No tenantId available");
      return wrap(() => tenantService.updateSettings(tid, dto));
    },
    [wrap, activeTenantId]
  );

  const addDomain = useCallback(
    (dto: AddTenantDomainInput, tenantId?: string) => {
      const tid = tenantId ?? activeTenantId;
      if (!tid) throw new Error("No tenantId available");
      return wrap(() => tenantService.addDomain(tid, dto));
    },
    [wrap, activeTenantId]
  );
    const listDomains = useCallback(
    (query?: ListDomainsQuery, tenantId?: string) => {
      const tid = tenantId ?? activeTenantId;
      if (!tid) throw new Error("No tenantId available");
      return wrap(() => tenantService.listDomains(tid, query));
    },
    [wrap, activeTenantId]
  );

  const setPrimaryDomain = useCallback(
    (domainId: string, tenantId?: string) => {
      const tid = tenantId ?? activeTenantId;
      if (!tid) throw new Error("No tenantId available");
      return wrap(() => tenantService.setPrimaryDomain(tid, domainId));
    },
    [wrap, activeTenantId]
  );

  const verifyDomain = useCallback(
    (domainId: string, tenantId?: string) => {
      const tid = tenantId ?? activeTenantId;
      if (!tid) throw new Error("No tenantId available");
      return wrap(() => tenantService.verifyDomain(tid, domainId));
    },
    [wrap, activeTenantId]
  );

  const removeDomain = useCallback(
    (domainId: string, tenantId?: string) => {
      const tid = tenantId ?? activeTenantId;
      if (!tid) throw new Error("No tenantId available");
      return wrap(() => tenantService.removeDomain(tid, domainId));
    },
    [wrap, activeTenantId]
  );

  const inviteMember = useCallback(
    (dto: InviteMemberInput, tenantId?: string) => {
      const tid = tenantId ?? activeTenantId;
      if (!tid) throw new Error("No tenantId available");
      return wrap(() => tenantService.inviteMember(tid, dto));
    },
    [wrap, activeTenantId]
  );

    const listInvitations = useCallback(
    (query?: ListInvitationsQuery, tenantId?: string) => {
      const tid = tenantId ?? activeTenantId;
      if (!tid) throw new Error("No tenantId available");
      return wrap(() => tenantService.listInvitations(tid, query));
    },
    [wrap, activeTenantId]
  );

  const revokeInvitation = useCallback(
    (invitationId: string, tenantId?: string) => {
      const tid = tenantId ?? activeTenantId;
      if (!tid) throw new Error("No tenantId available");
      return wrap(() => tenantService.revokeInvitation(tid, invitationId));
    },
    [wrap, activeTenantId]
  );

  const resendInvitation = useCallback(
    (invitationId: string, tenantId?: string) => {
      const tid = tenantId ?? activeTenantId;
      if (!tid) throw new Error("No tenantId available");
      return wrap(() => tenantService.resendInvitation(tid, invitationId));
    },
    [wrap, activeTenantId]
  );

  const listMemberships = useCallback(
    (tenantId?: string) => {
      const tid = tenantId ?? activeTenantId;
      if (!tid) throw new Error("No tenantId available");
      return wrap(() => tenantService.listMemberships(tid));
    },
    [wrap, activeTenantId]
  );

  const suspendMembership = useCallback(
    (membershipId: string, tenantId?: string) => {
      const tid = tenantId ?? activeTenantId;
      if (!tid) throw new Error("No tenantId available");
      return wrap(() => tenantService.suspendMembership(tid, membershipId));
    },
    [wrap, activeTenantId]
  );

  const activateMembership = useCallback(
    (membershipId: string, tenantId?: string) => {
      const tid = tenantId ?? activeTenantId;
      if (!tid) throw new Error("No tenantId available");
      return wrap(() => tenantService.activateMembership(tid, membershipId));
    },
    [wrap, activeTenantId]
  );

  const removeMembership = useCallback(
    (membershipId: string, tenantId?: string) => {
      const tid = tenantId ?? activeTenantId;
      if (!tid) throw new Error("No tenantId available");
      return wrap(() => tenantService.removeMembership(tid, membershipId));
    },
    [wrap, activeTenantId]
  );

  const createMember = useCallback(
    (dto: CreateTenantMemberInput, tenantId?: string) => {
      const tid = tenantId ?? activeTenantId;
      if (!tid) throw new Error("No tenantId available");
      return wrap(() => tenantService.createMember(tid, dto));
    },
    [wrap, activeTenantId]
  );

  const uploadMembers = useCallback(
    (input: UploadTenantMembersInput | FormData, tenantId?: string) => {
      const tid = tenantId ?? activeTenantId;
      if (!tid) throw new Error("No tenantId available");
      return wrap(() => tenantService.uploadMembers(tid, input));
    },
    [wrap, activeTenantId]
  );

  // -----------------------------
  // RBAC bootstrap + roles
  // -----------------------------
  const bootstrapRbac = useCallback(
    (tenantId?: string) => {
      const tid = tenantId ?? activeTenantId;
      if (!tid) throw new Error("No tenantId available");
      return wrap(() => tenantService.bootstrapRbac(tid));
    },
    [wrap, activeTenantId]
  );

  const listRoles = useCallback(
    (tenantId?: string) => {
      const tid = tenantId ?? activeTenantId;
      if (!tid) throw new Error("No tenantId available");
      return wrap(() => tenantService.listRoles(tid));
    },
    [wrap, activeTenantId]
  );

  const listPermissions = useCallback(
    (tenantId?: string) => {
      const tid = tenantId ?? activeTenantId;
      if (!tid) throw new Error("No tenantId available");
      return wrap(() => tenantService.listPermissions(tid));
    },
    [wrap, activeTenantId]
  );

  const assignRole = useCallback(
    (membershipId: string, roleId: string, tenantId?: string) => {
      const tid = tenantId ?? activeTenantId;
      if (!tid) throw new Error("No tenantId available");
      return wrap(() => tenantService.assignRole(tid, membershipId, roleId));
    },
    [wrap, activeTenantId]
  );

  const unassignRole = useCallback(
    (membershipId: string, roleId: string, tenantId?: string) => {
      const tid = tenantId ?? activeTenantId;
      if (!tid) throw new Error("No tenantId available");
      return wrap(() => tenantService.unassignRole(tid, membershipId, roleId));
    },
    [wrap, activeTenantId]
  );

  return useMemo(
    () => ({
      activeTenantId,
      loading,
      error,
      wrap,

      // Site admin
      listTenants,
      createTenant,
      updateTenant,
      activateTenant,
      suspendTenant,
      softDeleteTenant,

      // Tenant admin
      getSettings,
      updateSettings,

      addDomain,
      listDomains,
      setPrimaryDomain,
      verifyDomain,
      removeDomain,

      inviteMember,
      listInvitations,
      revokeInvitation,
      resendInvitation,
      listMemberships,
      createMember,
      uploadMembers,
      suspendMembership,
      activateMembership,
      removeMembership,

      // RBAC
      bootstrapRbac,
      listRoles,
      listPermissions,
      assignRole,
      unassignRole,
    }),
    [
      activeTenantId,
      loading,
      error,
      wrap,

      listTenants,
      createTenant,
      updateTenant,
      activateTenant,
      suspendTenant,
      softDeleteTenant,

      getSettings,
      updateSettings,

      addDomain,
      listDomains,
      setPrimaryDomain,
      verifyDomain,
      removeDomain,

      inviteMember,
      listInvitations,
      revokeInvitation,
      resendInvitation,
      listMemberships,
      createMember,
      uploadMembers,
      suspendMembership,
      activateMembership,
      removeMembership,

      bootstrapRbac,
      listRoles,
      listPermissions,
      assignRole,
      unassignRole,
    ]
  );
}