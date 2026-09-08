"use client";

import * as React from "react";
import {
  CreditCard,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CalendarDays,
  Ban,
  Wallet,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { useBilling } from "@/logaxp/hooks/useBilling";
import type {
  BillingPlan,
  BillingProvider,
  TenantSubscription,
} from "@/logaxp/lib/billing/billing.types";
import {
  unwrapApi,
  unwrapList,
  formatMoney,
  billingIntervalLabel,
  billingStatusTone,
  getPlanDisplayName,
  getSubscriptionPlan,
  safeDate,
  makeIdempotencyKey,
  hasStripe,
  hasPaystack,
} from "./billing.utils";

import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Input } from "@/logaxp/components/ui/input";
import { Label } from "@/logaxp/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/logaxp/components/ui/radio-group";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Skeleton } from "@/logaxp/components/ui/skeleton";
import { toast } from "@/logaxp/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/logaxp/components/ui/dialog";
import { Separator } from "@/logaxp/components/ui/separator";

import { cn } from "@/logaxp/lib/cn";

export function TenantSubscriptionManager() {
  const {
    getCurrentSubscription,
    listSubscriptionPlans,
    createSubscriptionCheckout,
    cancelSubscription,
    loading: billingLoading,
    error: billingError,
  } = useBilling();

  const [subscription, setSubscription] = React.useState<TenantSubscription | null>(null);
  const [plans, setPlans] = React.useState<BillingPlan[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [customerEmail, setCustomerEmail] = React.useState("");
  const [provider, setProvider] = React.useState<BillingProvider>("PAYSTACK");
  const [selectedPlanKey, setSelectedPlanKey] = React.useState("");
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = React.useState(true);

  const didInitRef = React.useRef(false);

  const load = React.useCallback(async (opts?: { silent?: boolean }) => {
    setLoading(true);
    try {
      const [subRes, plansRes] = await Promise.all([
        getCurrentSubscription(),
        listSubscriptionPlans(),
      ]);

      const sub = unwrapApi(subRes);
      const planList = unwrapList<BillingPlan>(unwrapApi(plansRes)).items ?? [];

      setSubscription(sub);
      setPlans(planList);

      if (!selectedPlanKey && planList.length > 0) {
        setSelectedPlanKey(planList[0].key);
      }
    } catch (err) {
      console.error(err);
      if (!opts?.silent) toast.error("Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  }, [getCurrentSubscription, listSubscriptionPlans, selectedPlanKey]);

  React.useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    void load({ silent: true });
  }, [load]);

  const currentPlan = getSubscriptionPlan(subscription);

  const onStartCheckout = async () => {
    if (!selectedPlanKey) return toast.error("Please select a plan");
    if (!customerEmail.trim()) return toast.error("Customer email is required");

    const plan = plans.find(p => p.key === selectedPlanKey);
    if (!plan) return toast.error("Selected plan not found");

    if (provider === "STRIPE" && !hasStripe(plan)) {
      return toast.error("This plan is not configured for Stripe");
    }
    if (provider === "PAYSTACK" && !hasPaystack(plan)) {
      return toast.error("This plan is not configured for Paystack");
    }

    try {
      const res = await createSubscriptionCheckout({
        planKey: selectedPlanKey,
        provider,
        customerEmail: customerEmail.trim(),
        idempotencyKey: makeIdempotencyKey(),
      });

      const data = unwrapApi(res);
      const url = data?.checkoutUrl;

      if (!url) throw new Error("No checkout URL returned");

      toast.success("Redirecting to secure checkout...");
      window.location.href = url;
    } catch (err) {
      console.error(err);
      toast.error(billingError || "Failed to start checkout");
    }
  };

  const onCancelSubscription = async () => {
    try {
      await cancelSubscription({ atPeriodEnd: cancelAtPeriodEnd });
      toast.success(
        cancelAtPeriodEnd
          ? "Subscription scheduled to cancel at period end"
          : "Subscription has been canceled"
      );
      setCancelOpen(false);
      await load({ silent: true });
    } catch (err) {
      console.error(err);
      toast.error(billingError || "Failed to cancel subscription");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Subscription</h1>
          </div>
            <p className="text-muted-foreground">
              Manage your organization&apos;s billing plan and payment method
            </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void load()}
          disabled={loading || billingLoading}
          className="gap-1.5"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-[340px] rounded-2xl" />
          <Skeleton className="h-[340px] rounded-2xl lg:col-span-2" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Current Subscription */}
          <Card className="rounded-2xl border-border/60 shadow-sm lg:row-span-2">
            <CardHeader className="pb-4">
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {subscription ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge
                      variant={billingStatusTone(subscription.status)}
                      className="text-xs font-medium"
                    >
                      {subscription.status || "Unknown"}
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-sm text-muted-foreground">Plan</div>
                    <div className="text-lg font-semibold">
                      {getPlanDisplayName(currentPlan) || "—"}
                    </div>
                    {currentPlan && (
                      <div className="text-sm text-muted-foreground">
                        {formatMoney(currentPlan.amountCents, currentPlan.currency)} •{" "}
                        {billingIntervalLabel(currentPlan.interval)}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-muted/50 p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Period Start
                      </div>
                      <div className="font-medium">
                        {safeDate(subscription.currentPeriodStart) || "—"}
                      </div>
                    </div>

                    <div className="rounded-xl bg-muted/50 p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Period End
                      </div>
                      <div className="font-medium">
                        {safeDate(subscription.currentPeriodEnd) || "—"}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Provider</span>
                      <span className="font-medium">{subscription.provider || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Cancel at period end</span>
                      <Badge variant={subscription.cancelAtPeriodEnd ? "outline" : "secondary"}>
                        {subscription.cancelAtPeriodEnd ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    className="w-full mt-4"
                    onClick={() => setCancelOpen(true)}
                    disabled={billingLoading || subscription.status === "canceled"}
                  >
                    Cancel Subscription
                  </Button>
                </>
              ) : (
                <EmptyState
                  title="No active subscription"
                  description="Choose a plan below to get started."
                  className="py-10"
                />
              )}
            </CardContent>
          </Card>

          {/* Plan Selector + Checkout */}
          <Card className="rounded-2xl border-border/60 shadow-sm lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle>Change or Start Subscription</CardTitle>
              <CardDescription>Select plan and payment provider</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {plans.length === 0 ? (
                <EmptyState
                  title="No plans available"
                  description="Contact your administrator to activate billing plans."
                  className="py-12"
                />
              ) : (
                <>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Billing email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="billing@yourcompany.com"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="provider">Payment Provider</Label>
                      <div className="flex border rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setProvider("PAYSTACK")}
                          className={cn(
                            "flex-1 py-3 px-4 text-sm font-medium transition",
                            provider === "PAYSTACK"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/80"
                          )}
                        >
                          Paystack
                        </button>
                        <button
                          type="button"
                          onClick={() => setProvider("STRIPE")}
                          className={cn(
                            "flex-1 py-3 px-4 text-sm font-medium transition",
                            provider === "STRIPE"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/80"
                          )}
                        >
                          Stripe
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan) => {
                      const isSelected = selectedPlanKey === plan.key;
                      const isReady = provider === "STRIPE" ? hasStripe(plan) : hasPaystack(plan);

                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlanKey(plan.key)}
                          disabled={!isReady}
                          className={cn(
                            "group relative rounded-2xl border p-5 text-left transition-all",
                            isSelected
                              ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                              : "border-border hover:border-primary/40 hover:bg-accent/40",
                            !isReady && "opacity-60 cursor-not-allowed"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-semibold">{plan.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{plan.key}</div>
                            </div>
                            {isReady && (
                              <CheckCircle2 className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>

                          <div className="mt-5">
                            <div className="text-2xl font-bold">
                              {formatMoney(plan.amountCents, plan.currency)}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {billingIntervalLabel(plan.interval)}
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {hasStripe(plan) && <Badge variant="outline">Stripe</Badge>}
                            {hasPaystack(plan) && <Badge variant="outline">Paystack</Badge>}
                            {plan.isActive && <Badge variant="secondary">Active</Badge>}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t">
                    <div className="text-sm">
                      Selected:{" "}
                      <span className="font-medium">
                        {plans.find(p => p.key === selectedPlanKey)?.name || "None"}
                      </span>
                    </div>

                    <Button
                      size="lg"
                      onClick={onStartCheckout}
                      disabled={billingLoading || !selectedPlanKey || !customerEmail.trim()}
                      className="gap-2 min-w-[180px]"
                    >
                      <Wallet className="h-4 w-4" />
                      Proceed to Checkout
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <DialogTitle>Cancel Subscription</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Are you sure you want to cancel your subscription?
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <RadioGroup
            value={cancelAtPeriodEnd ? "period-end" : "immediate"}
            onValueChange={(v: string) => setCancelAtPeriodEnd(v === "period-end")}
            className="space-y-4"
          >
            <div className="flex items-start space-x-3 rounded-xl border p-4 transition-colors hover:bg-accent/50">
              <RadioGroupItem value="period-end" id="period-end" className="mt-1" />
              <div className="space-y-1">
                <Label htmlFor="period-end" className="font-medium leading-none">
                  Cancel at end of billing period
                </Label>
                <p className="text-sm text-muted-foreground">
                  You&apos;ll keep access until the current period ends.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-xl border p-4 transition-colors hover:bg-accent/50">
              <RadioGroupItem value="immediate" id="immediate" className="mt-1" />
              <div className="space-y-1">
                <Label htmlFor="immediate" className="font-medium leading-none">
                  Cancel immediately
                </Label>
                <p className="text-sm text-muted-foreground">
                  Access will be revoked right away.
                </p>
              </div>
            </div>
          </RadioGroup>

          <DialogFooter className="gap-3 sm:gap-0 mt-6">
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Close
            </Button>
            <Button variant="destructive" onClick={onCancelSubscription}>
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
