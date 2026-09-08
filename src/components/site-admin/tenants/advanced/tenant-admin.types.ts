// src/logaxp/components/site-admin/tenants/advanced/tenant-admin.types.ts

export type TenantAuditEvent = {
  id: string;
  action: string; // e.g. "tenant.updated", "domain.verified"
  summary?: string | null;
  actorName?: string | null;
  actorEmail?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
};

export type BillingStatus =
  | "ACTIVE"
  | "TRIALING"
  | "PAST_DUE"
  | "CANCELED"
  | "INCOMPLETE"
  | "PAUSED"
  | "UNKNOWN";

export type TenantBillingSnapshot = {
  tenantId: string;
  provider?: "STRIPE" | "PAYSTACK" | "MANUAL" | "NONE" | string;
  planKey?: string | null;
  status: BillingStatus;
  currency?: string | null;
  amount?: number | null; // amount in major unit for UI display (e.g., 49.99)
  interval?: "monthly" | "yearly" | "weekly" | "daily" | string | null;
  nextBillingAt?: string | null;
  trialEndsAt?: string | null;
  lastPaymentAt?: string | null;
  delinquent?: boolean;
  seatCount?: number | null;
  usageSummary?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
};