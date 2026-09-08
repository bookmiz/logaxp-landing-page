// src/hooks/useBilling.ts
"use client";

import { useCallback, useMemo, useState } from "react";
import { billingService } from "@/logaxp/lib/billing/billingService";
import type {
  PlansFilterDto,
  CreateBillingPlanDto,
  UpdateBillingPlanDto,
  CreateTenantCheckoutDto,
  CancelSubscriptionDto,
} from "@/logaxp/lib/billing/billing.types";

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

    if (Array.isArray(apiMsg) && apiMsg.length) {
      const first = apiMsg.find((x) => typeof x === "string" && x.trim());
      if (typeof first === "string") return first;
    }

    const msg = e.message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }

  return "Something went wrong";
}

export function useBilling() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrap = useCallback(async <T,>(fn: () => Promise<T>) => {
    setLoading(true);
    setError(null);

    try {
      return await fn();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  /** ======================================
   * Tenant subscription
   * ===================================== */
  const getCurrentSubscription = useCallback(
    () => wrap(() => billingService.tenantSubscription.getCurrent()),
    [wrap]
  );

  const listSubscriptionPlans = useCallback(
    () => wrap(() => billingService.tenantSubscription.listPlans()),
    [wrap]
  );

  const getSubscriptionPlan = useCallback(
    (key: string) => wrap(() => billingService.tenantSubscription.getPlan(key)),
    [wrap]
  );

  const createSubscriptionCheckout = useCallback(
    (dto: CreateTenantCheckoutDto) =>
      wrap(() => billingService.tenantSubscription.createCheckout(dto)),
    [wrap]
  );

  const cancelSubscription = useCallback(
    (dto: CancelSubscriptionDto) =>
      wrap(() => billingService.tenantSubscription.cancel(dto)),
    [wrap]
  );

  /** ======================================
   * Billing plans (site-admin)
   * ===================================== */
  const listBillingPlans = useCallback(
    (filter?: PlansFilterDto) => wrap(() => billingService.plans.list(filter)),
    [wrap]
  );

  const createBillingPlan = useCallback(
    (dto: CreateBillingPlanDto) => wrap(() => billingService.plans.create(dto)),
    [wrap]
  );

  const updateBillingPlan = useCallback(
    (id: string, dto: UpdateBillingPlanDto) =>
      wrap(() => billingService.plans.update(id, dto)),
    [wrap]
  );

  const removeBillingPlan = useCallback(
    (id: string) => wrap(() => billingService.plans.remove(id)),
    [wrap]
  );

  const tenant = useMemo(
    () => ({
      getCurrentSubscription,
      listSubscriptionPlans,
      getSubscriptionPlan,
      createSubscriptionCheckout,
      cancelSubscription,
    }),
    [
      getCurrentSubscription,
      listSubscriptionPlans,
      getSubscriptionPlan,
      createSubscriptionCheckout,
      cancelSubscription,
    ]
  );

  const plans = useMemo(
    () => ({
      list: listBillingPlans,
      create: createBillingPlan,
      update: updateBillingPlan,
      remove: removeBillingPlan,
    }),
    [listBillingPlans, createBillingPlan, updateBillingPlan, removeBillingPlan]
  );

  return useMemo(
    () => ({
      loading,
      error,
      clearError,
      wrap,

      tenant,
      plans,

      getCurrentSubscription,
      listSubscriptionPlans,
      getSubscriptionPlan,
      createSubscriptionCheckout,
      cancelSubscription,

      listBillingPlans,
      createBillingPlan,
      updateBillingPlan,
      removeBillingPlan,
    }),
    [
      loading,
      error,
      clearError,
      wrap,
      tenant,
      plans,
      getCurrentSubscription,
      listSubscriptionPlans,
      getSubscriptionPlan,
      createSubscriptionCheckout,
      cancelSubscription,
      listBillingPlans,
      createBillingPlan,
      updateBillingPlan,
      removeBillingPlan,
    ]
  );
}