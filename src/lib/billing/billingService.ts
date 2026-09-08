// src/lib/billing/billingService.ts
"use client";

import { api } from "@/logaxp/lib/api/apiClient";
import type {
  PlansFilterDto,
  CreateBillingPlanDto,
  UpdateBillingPlanDto,
  CreateTenantCheckoutDto,
  CancelSubscriptionDto,

  GetCurrentTenantSubscriptionResponse,
  CreateTenantCheckoutResponse,
  CancelTenantSubscriptionResponse,

  ListBillingPlansResponse,
  CreateBillingPlanResponse,
  UpdateBillingPlanResponse,
  RemoveBillingPlanResponse,
  GetBillingPlanResponse,
} from "./billing.types";

function cleanParams<T extends Record<string, unknown>>(obj?: T): Record<string, unknown> | undefined {
  if (!obj) return undefined;

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null) out[k] = v;
  }
  return out;
}

function enc(v: string) {
  return encodeURIComponent(v);
}

export const billingService = {
  /** ======================================
   * Tenant subscription
   * ===================================== */
  tenantSubscription: {
    async getCurrent(): Promise<GetCurrentTenantSubscriptionResponse> {
      const res = await api.get<GetCurrentTenantSubscriptionResponse>("/billing/subscription");
      return res.data;
    },

    async listPlans(): Promise<ListBillingPlansResponse> {
      const res = await api.get<ListBillingPlansResponse>("/billing/subscription/plans");
      return res.data;
    },

    async getPlan(key: string): Promise<GetBillingPlanResponse> {
      const res = await api.get<GetBillingPlanResponse>(`/billing/subscription/plans/${enc(key)}`);
      return res.data;
    },

    async createCheckout(dto: CreateTenantCheckoutDto): Promise<CreateTenantCheckoutResponse> {
      const res = await api.post<CreateTenantCheckoutResponse>("/billing/subscription/checkout", dto);
      return res.data;
    },

    async cancel(dto: CancelSubscriptionDto): Promise<CancelTenantSubscriptionResponse> {
      const res = await api.post<CancelTenantSubscriptionResponse>("/billing/subscription/cancel", dto);
      return res.data;
    },
  },

  /** ======================================
   * Site-admin billing plans
   * ===================================== */
  plans: {
    async list(filter?: PlansFilterDto): Promise<ListBillingPlansResponse> {
      const res = await api.get<ListBillingPlansResponse>("/billing/plans", {
        params: cleanParams(filter as Record<string, unknown> | undefined),
      });
      return res.data;
    },

    async create(dto: CreateBillingPlanDto): Promise<CreateBillingPlanResponse> {
      const res = await api.post<CreateBillingPlanResponse>("/billing/plans", dto);
      return res.data;
    },

    async update(id: string, dto: UpdateBillingPlanDto): Promise<UpdateBillingPlanResponse> {
      const res = await api.patch<UpdateBillingPlanResponse>(`/billing/plans/${enc(id)}`, dto);
      return res.data;
    },

    async remove(id: string): Promise<RemoveBillingPlanResponse> {
      const res = await api.delete<RemoveBillingPlanResponse>(`/billing/plans/${enc(id)}`);
      return res.data;
    },
  },
};