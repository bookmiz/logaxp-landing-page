// src/lib/billing/billing.types.ts

/** ----------------------------------------
 * Generic API envelope
 * --------------------------------------- */
export type ApiResponse<T = unknown> = {
  statusCode: number;
  message: string;
  data: T;
};

export type Maybe<T> = T | null;

export type ListMeta = {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
};

export type ListData<T> =
  | T[]
  | {
      items: T[];
      meta?: ListMeta;
      [key: string]: unknown;
    };

/** ----------------------------------------
 * Enums (frontend-safe mirrors)
 * --------------------------------------- */
export type BillingProvider = "STRIPE" | "PAYSTACK";

export type SubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "UNPAID"
  | "INCOMPLETE"
  | "PAUSED"
  | string;

/** ----------------------------------------
 * Core entities
 * --------------------------------------- */
export interface BillingPlan {
  id: string;
  key: string;
  name: string;

  currency: string;
  amountCents: number;
  interval: "month" | "year" | string;

  stripePriceId?: string | null;
  paystackPlanId?: string | null;

  isActive?: boolean;
  metadata?: unknown;

  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface TenantSubscription {
  id: string;
  tenantId: string;

  provider: BillingProvider;
  status: SubscriptionStatus;

  planId?: string | null;
  plan?: BillingPlan | null;

  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;

  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;

  cancelAtPeriodEnd?: boolean;
  canceledAt?: string | null;
  trialEndsAt?: string | null;

  metadata?: unknown;

  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/** ----------------------------------------
 * Tenant subscription DTOs
 * --------------------------------------- */
export interface CreateTenantCheckoutDto {
  planKey: string;
  provider: BillingProvider;
  idempotencyKey: string;
  customerEmail?: string;
}

export interface CancelSubscriptionDto {
  atPeriodEnd: boolean;
}

/** ----------------------------------------
 * Billing plans DTOs
 * --------------------------------------- */
export interface CreateBillingPlanDto {
  key: string;
  name: string;

  provider?: BillingProvider; // intent/filter only
  currency: string;
  amountCents: number;
  interval: "month" | "year";

  stripePriceId?: string;
  paystackPlanId?: string;

  isActive?: boolean;
  metadata?: unknown;
}

export interface UpdateBillingPlanDto {
  name?: string;
  currency?: string;
  amountCents?: number;
  interval?: "month" | "year" | string;

  stripePriceId?: string;
  paystackPlanId?: string;

  isActive?: boolean;
  metadata?: unknown;
}

export interface PlansFilterDto {
  activeOnly?: boolean;
}

/** ----------------------------------------
 * Checkout result
 * --------------------------------------- */
export interface CheckoutResult {
  provider: BillingProvider | string;
  checkoutUrl: string;
  sessionId?: string; // Stripe
  reference?: string; // Paystack
  [key: string]: unknown;
}

/** ----------------------------------------
 * Response aliases
 * --------------------------------------- */
export type GetCurrentTenantSubscriptionResponse = ApiResponse<TenantSubscription | null>;
export type CreateTenantCheckoutResponse = ApiResponse<CheckoutResult>;
export type CancelTenantSubscriptionResponse = ApiResponse<TenantSubscription | { ok?: true }>;

export type ListBillingPlansResponse = ApiResponse<ListData<BillingPlan>>;
export type GetBillingPlanResponse = ApiResponse<BillingPlan>;
export type CreateBillingPlanResponse = ApiResponse<BillingPlan>;
export type UpdateBillingPlanResponse = ApiResponse<BillingPlan>;
export type RemoveBillingPlanResponse = ApiResponse<BillingPlan | { ok?: true }>;
