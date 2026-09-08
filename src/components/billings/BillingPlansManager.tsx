"use client";

import * as React from "react";
import {
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  CreditCard,
  BadgeDollarSign,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

import { useBilling } from "@/logaxp/hooks/useBilling";
import type {
  BillingPlan,
  CreateBillingPlanDto,
  UpdateBillingPlanDto,
} from "@/logaxp/lib/billing/billing.types";
import {
  unwrapApi,
  unwrapList,
  formatMoney,
  billingIntervalLabel,
  hasStripe,
  hasPaystack,
} from "@/logaxp/components/billings/billing.utils";

import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
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

import { CreateEditBillingPlanDialog } from "@/logaxp/components/billings/CreateEditBillingPlanDialog";

import { cn } from "@/logaxp/lib/cn";

export function BillingPlansManager() {
  const {
    listBillingPlans,
    createBillingPlan,
    updateBillingPlan,
    removeBillingPlan,
    loading: globalLoading,
    error: apiError,
  } = useBilling();

  const [plans, setPlans] = React.useState<BillingPlan[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<BillingPlan | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<BillingPlan | null>(null);

  const didInit = React.useRef(false);

  const loadPlans = React.useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await listBillingPlans();
      const items = unwrapList<BillingPlan>(unwrapApi(res)).items ?? [];
      setPlans(items);
    } catch (err) {
      console.error(err);
      if (!silent) toast.error("Could not load billing plans");
    } finally {
      setLoading(false);
    }
  }, [listBillingPlans]);

  React.useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    void loadPlans(true);
  }, [loadPlans]);

  const handleCreate = async (dto: CreateBillingPlanDto | UpdateBillingPlanDto) => {
    if (!("key" in dto) || typeof dto.key !== "string" || !dto.key.trim()) {
      toast.error("Plan key is required");
      return;
    }
    try {
      await createBillingPlan(dto);
      toast.success("Plan created successfully");
      setCreateOpen(false);
      await loadPlans(true);
    } catch (err) {
      toast.error(apiError || "Failed to create plan");
    }
  };

  const handleUpdate = async (dto: CreateBillingPlanDto | UpdateBillingPlanDto) => {
    if (!editTarget?.id) return;
    try {
      await updateBillingPlan(editTarget.id, dto);
      toast.success("Plan updated");
      setEditTarget(null);
      await loadPlans(true);
    } catch (err) {
      toast.error(apiError || "Failed to update plan");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await removeBillingPlan(deleteTarget.id);
      toast.success("Plan removed");
      setDeleteTarget(null);
      await loadPlans(true);
    } catch (err) {
      toast.error(apiError || "Failed to remove plan");
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="admin-page-heading flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <BadgeDollarSign className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Billing Plans</h1>
          </div>
          <p className="text-muted-foreground">
            Manage subscription plans available to organizations and tenants
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadPlans()}
            disabled={loading || globalLoading}
            className="gap-1.5"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>

          <Button
            onClick={() => setCreateOpen(true)}
            disabled={globalLoading}
            className="gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Plan
          </Button>
        </div>
      </div>

      {/* Main content */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[264px] rounded-2xl" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <Card className="border-dashed py-16 text-center">
          <CardContent className="space-y-4 pt-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <BadgeDollarSign className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No billing plans yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Create your first plan to start offering subscriptions to your customers.
            </p>
            <Button onClick={() => setCreateOpen(true)} className="mt-2">
              Create First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isBusy={globalLoading}
              onEdit={() => setEditTarget(plan)}
              onDelete={() => setDeleteTarget(plan)}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateEditBillingPlanDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        busy={globalLoading}
        onSubmit={handleCreate}
      />

      <CreateEditBillingPlanDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        mode="edit"
        value={editTarget ?? undefined}
        busy={globalLoading}
        onSubmit={handleUpdate}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle>Delete Billing Plan</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              You are about to <span className="font-medium text-foreground">permanently remove</span>{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span>.
              <br />
              <span className="text-xs mt-2 block text-muted-foreground">
                This action cannot be undone. Existing subscriptions may be affected.
              </span>
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <DialogFooter className="gap-3 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={globalLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={globalLoading}
              className="gap-1.5"
            >
              {globalLoading ? "Removing..." : "Delete Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlanCard({
  plan,
  isBusy,
  onEdit,
  onDelete,
}: {
  plan: BillingPlan;
  isBusy: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const active = plan.isActive;
  const hasStr = hasStripe(plan);
  const hasPsk = hasPaystack(plan);

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl border transition-all duration-200",
        active
          ? "border-primary/30 shadow-sm hover:shadow-md hover:border-primary/50"
          : "border-border/60 opacity-75 hover:opacity-90"
      )}
    >
      <CardHeader className="pb-4 pt-5 px-6 bg-gradient-to-b from-muted/40 to-transparent">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold leading-tight">
              {plan.name}
            </CardTitle>
            <div className="text-xs text-muted-foreground font-mono">{plan.key}</div>
          </div>

          <Badge
            variant={active ? "default" : "secondary"}
            className={cn(
              "mt-0.5 text-xs font-medium",
              active ? "bg-primary/90 hover:bg-primary" : ""
            )}
          >
            {active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-2 space-y-5">
        {/* Price */}
        <div className="space-y-1">
          <div className="text-3xl font-bold tracking-tight">
            {formatMoney(plan.amountCents, plan.currency)}
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            {billingIntervalLabel(plan.interval)}
          </div>
        </div>

        {/* Payment gateways */}
        <div className="flex flex-wrap gap-2">
          <GatewayBadge active={hasStr} label="Stripe" icon={hasStr ? CheckCircle2 : XCircle} />
          <GatewayBadge active={hasPsk} label="Paystack" icon={hasPsk ? CheckCircle2 : XCircle} />
        </div>

        {/* Currency & meta */}
        <div className="rounded-xl bg-muted/60 px-4 py-3 text-sm space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            <span>Currency:</span>
            <span className="font-medium text-foreground">{plan.currency}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 rounded-xl"
            onClick={onEdit}
            disabled={isBusy}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl"
            onClick={onDelete}
            disabled={isBusy}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function GatewayBadge({
  active,
  label,
  icon: Icon,
}: {
  active: boolean;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 text-xs font-medium",
        active
          ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300"
          : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
