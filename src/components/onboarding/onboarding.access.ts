// src/components/onboarding/onboarding.access.ts
"use client";

import { useAuthStore } from "@/logaxp/stores/useAuthStore";

export type OnboardingAction =
  | "onboarding.templates.read"
  | "onboarding.templates.write"
  | "onboarding.steps.write"
  | "onboarding.instances.read"
  | "onboarding.instances.write"
  | "onboarding.stepInstances.write"
  | "files.upload";

type MembershipAccess = {
  roles?: string[];          // sometimes backend puts role keys here
  roleKeys?: string[];       // ✅ add this (your code references it)
  permissions?: string[];
  perms?: string[];
};

type Membership = {
  roles?: string[];
  access?: MembershipAccess; // ✅ typed access
  roleKeys?: string[];
  permissions?: string[];
  perms?: string[];
  isOwner?: boolean;
};

type Snapshot = {
  membership: Membership | null;
  isOwner: boolean;
  roleKeys: string[];
  perms: string[];
};

function getRoleKeys(membership: Membership | null): string[] {
  const roles =
    membership?.roleKeys ??
    membership?.access?.roleKeys ??
    membership?.roles ??
    membership?.access?.roles ??
    [];

  return Array.isArray(roles) ? roles.filter((r) => typeof r === "string" && r.trim()) : [];
}

function getPerms(membership: Membership | null): string[] {
  const perms =
    membership?.permissions ??
    membership?.perms ??
    membership?.access?.permissions ??
    membership?.access?.perms ??
    [];

  return Array.isArray(perms) ? perms.filter((p) => typeof p === "string" && p.trim()) : [];
}

export function useOnboardingAccess() {
  const snap = useAuthStore((s) => {
    const membership = (s.membership ?? null) as Membership | null;

    return {
      membership,
      isOwner: Boolean(membership?.isOwner),
      roleKeys: getRoleKeys(membership),
      perms: getPerms(membership),
    } satisfies Snapshot;
  });

  const can = (action: OnboardingAction) => {
    if (snap.isOwner) return true;
    return snap.perms.includes(action);
  };

  const canReadTemplates = can("onboarding.templates.read");
  const canWriteTemplates = can("onboarding.templates.write");
  const canWriteSteps = can("onboarding.steps.write");

  const canReadInstances = can("onboarding.instances.read");
  const canWriteInstances = can("onboarding.instances.write");

  const canWriteStepInstances = can("onboarding.stepInstances.write");

  const canUploadFiles = can("files.upload");

  return {
    membership: snap.membership,
    isOwner: snap.isOwner,
    roleKeys: snap.roleKeys,
    perms: snap.perms,

    canReadTemplates,
    canWriteTemplates,
    canWriteSteps,

    canReadInstances,
    canWriteInstances,

    canWriteStepInstances,
    canUploadFiles,

    can,
  };
}