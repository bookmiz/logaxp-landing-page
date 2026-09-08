"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/logaxp/components/ui/dialog";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import type {
  BillingPlan,
  BillingProvider,
  CreateBillingPlanDto,
  UpdateBillingPlanDto,
} from "@/logaxp/lib/billing/billing.types";

type Mode = "create" | "edit";

export function CreateEditBillingPlanDialog({
  open,
  onOpenChange,
  mode,
  value,
  busy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: Mode;
  value?: BillingPlan | null;
  busy?: boolean;
  onSubmit: (dto: CreateBillingPlanDto | UpdateBillingPlanDto) => Promise<void> | void;
}) {
  const [keyValue, setKeyValue] = React.useState("");
  const [name, setName] = React.useState("");
  const [currency, setCurrency] = React.useState("USD");
  const [amountCents, setAmountCents] = React.useState("");
  const [interval, setInterval] = React.useState<"month" | "year">("month");
  const [provider, setProvider] = React.useState<BillingProvider>("STRIPE");
  const [providerReference, setProviderReference] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);

  React.useEffect(() => {
    if (!open) return;

    if (mode === "edit" && value) {
      const detectedProvider: BillingProvider =
        value.stripePriceId ? "STRIPE" : value.paystackPlanId ? "PAYSTACK" : "STRIPE";

      setKeyValue(value.key ?? "");
      setName(value.name ?? "");
      setCurrency(value.currency ?? "USD");
      setAmountCents(String(value.amountCents ?? ""));
      setInterval((value.interval as "month" | "year") ?? "month");
      setProvider(detectedProvider);
      setProviderReference(
        detectedProvider === "STRIPE"
          ? value.stripePriceId ?? ""
          : value.paystackPlanId ?? ""
      );
      setIsActive(Boolean(value.isActive ?? true));
      return;
    }

    setKeyValue("");
    setName("");
    setCurrency("USD");
    setAmountCents("");
    setInterval("month");
    setProvider("STRIPE");
    setProviderReference("");
    setIsActive(true);
  }, [open, mode, value]);

  const title = mode === "create" ? "Create billing plan" : "Edit billing plan";

  const providerLabel = provider === "STRIPE" ? "Stripe Price ID" : "Paystack Plan ID";
  const providerPlaceholder = provider === "STRIPE" ? "price_..." : "PLN_...";

  const hasValidProviderReference = providerReference.trim().length > 0;

  const canSubmit =
    name.trim().length > 1 &&
    currency.trim().length > 0 &&
    Number.isFinite(Number(amountCents)) &&
    Number(amountCents) > 0 &&
    (mode === "edit" || keyValue.trim().length > 1) &&
    hasValidProviderReference;

  const handleSubmit = async () => {
    const base = {
      name: name.trim(),
      currency: currency.trim().toUpperCase(),
      amountCents: Number(amountCents),
      interval,
      isActive,
      stripePriceId: provider === "STRIPE" ? providerReference.trim() : undefined,
      paystackPlanId: provider === "PAYSTACK" ? providerReference.trim() : undefined,
    };

    if (mode === "create") {
      await onSubmit({
        key: keyValue.trim(),
        ...base,
      } satisfies CreateBillingPlanDto);
      return;
    }

    await onSubmit(base satisfies UpdateBillingPlanDto);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] rounded-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Configure plan name, pricing, billing interval, and choose the provider mapping for this plan.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Plan Key
            </label>
            <Input
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              placeholder="starter"
              disabled={mode === "edit"}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Plan Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Starter Plan"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Currency
            </label>
            <Input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="USD"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Amount (cents)
            </label>
            <Input
              type="number"
              value={amountCents}
              onChange={(e) => setAmountCents(e.target.value)}
              placeholder="1000"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Interval
            </label>
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value as "month" | "year")}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
            >
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </div>

          <label className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-800 dark:bg-slate-950">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded"
            />
            Active plan
          </label>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Provider
            </label>
            <select
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value as BillingProvider);
                setProviderReference("");
              }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
            >
              <option value="STRIPE">Stripe</option>
              <option value="PAYSTACK">Paystack</option>
            </select>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {providerLabel}
            </label>
            <Input
              value={providerReference}
              onChange={(e) => setProviderReference(e.target.value)}
              placeholder={providerPlaceholder}
            />
            {!hasValidProviderReference ? (
              <p className="text-xs text-red-600">
                {providerLabel} is required.
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
            type="button"
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={busy || !canSubmit}
            type="button"
          >
            {mode === "create" ? "Create plan" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}