"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { useOrgStructure } from "@/logaxp/hooks/useOrgStructure";
import { unwrapList } from "@/logaxp/components/orgStructure/shared/listUtils";
import { useDebouncedValue } from "@/logaxp/components/orgStructure/shared/useDebouncedValue";
import { PermissionGate } from "@/logaxp/components/auth/PermissionGate";
import { useHasPermission } from "@/logaxp/hooks/useHasPermission";
import type {
  CostCenter,
  CostCentersListFilterDto,
} from "@/logaxp/lib/orgStructure/orgStructure.types";
import { CostCentersFiltersBar } from "@/logaxp/components/orgStructure/costCenters/CostCentersFiltersBar";
import { CostCentersTable } from "@/logaxp/components/orgStructure/costCenters/CostCentersTable";
import { CreateEditCostCenterModal } from "@/logaxp/components/orgStructure/costCenters/CreateEditCostCenterModal";
import { DeleteRestoreCostCenterDialog } from "@/logaxp/components/orgStructure/costCenters/DeleteRestoreCostCenterDialog";
import { toast } from "@/logaxp/components/ui/toast";

// Optional UI (remove if you don’t have these)
import { Badge } from "@/logaxp/components/ui/badge";
import { Skeleton } from "@/logaxp/components/ui/skeleton";
import { Input } from "@/logaxp/components/ui/input";
import { DollarSign, RefreshCcw, Plus, Search, ListFilter } from "lucide-react";

export default function CostCentersPage() {
  const { costCenters, loading } = useOrgStructure();

  const canWrite = useHasPermission(
    ["cost_centers.write", "cost-centers.write"] as any
  );
  const canRead = useHasPermission(
    ["cost_centers.read", "cost-centers.read"] as any
  );

  const [filter, setFilter] = useState<CostCentersListFilterDto>({
    includeDeleted: false,
    search: "",
  });

  const debouncedSearch = useDebouncedValue(filter.search ?? "", 250);
  const effectiveFilter = useMemo(
  () => ({ ...filter, search: debouncedSearch, includeOwner: true }),
  [filter, debouncedSearch]
);

  const [items, setItems] = useState<CostCenter[]>([]);
  const [fetching, setFetching] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [active, setActive] = useState<CostCenter | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<"delete" | "restore">("delete");
  const [confirmItem, setConfirmItem] = useState<CostCenter | null>(null);

  const load = useCallback(async () => {
    if (!canRead) {
      setItems([]);
      return;
    }

    setFetching(true);
    try {
      // ✅ IMPORTANT: your service already returns "data"
      const data = await costCenters.list(effectiveFilter);

      // ✅ unwrap the ACTUAL payload (NOT data.data)
      const unwrapped = unwrapList(data as any);
      setItems((unwrapped.items ?? []) as CostCenter[]);
    } catch {
      toast.error("Failed to load cost centers");
      setItems([]);
    } finally {
      setFetching(false);
    }
  }, [canRead, costCenters, effectiveFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setModalMode("create");
    setActive(null);
    setModalOpen(true);
  };

  const openEdit = (p: CostCenter) => {
    setModalMode("edit");
    setActive(p);
    setModalOpen(true);
  };

  const openDelete = (p: CostCenter) => {
    setConfirmMode("delete");
    setConfirmItem(p);
    setConfirmOpen(true);
  };

  const openRestore = (p: CostCenter) => {
    setConfirmMode("restore");
    setConfirmItem(p);
    setConfirmOpen(true);
  };

  const submit = async (dto: any) => {
    try {
      if (modalMode === "create") {
        await costCenters.create(dto);
        toast.success("Cost center created");
      } else {
        await costCenters.update(active!.id, dto);
        toast.success("Cost center updated");
      }
      setModalOpen(false);
      await load();
    } catch {
      toast.error("Operation failed");
    }
  };

  const confirm = async () => {
    if (!confirmItem) return;

    try {
      if (confirmMode === "delete") {
        await costCenters.remove(confirmItem.id);
        toast.success("Cost center deleted");
      } else {
        await costCenters.restore(confirmItem.id);
        toast.success("Cost center restored");
      }
      await load();
    } catch {
      toast.error("Operation failed");
    }
  };

  const total = items.length;

  return (
    <div className="space-y-5">
      {/* Page header (cleaner + more “product” feeling) */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              <DollarSign className="h-3 w-3 text-emerald-600 dark:text-emerald-300 mr-2" />
              {fetching ? "Loading…" : `${total} cost center${total === 1 ? "" : "s"}`}             
            </Badge>
              <p className="text-sm text-slate-600">
                Financial buckets for budgeting, reporting, and cost tracking.
              </p>
            {effectiveFilter.includeDeleted ? (
              <Badge className="rounded-full" variant="outline">
                Including deleted
              </Badge>
            ) : null}

            {effectiveFilter.search ? (
              <Badge className="rounded-full" variant="outline">
                Search: “{effectiveFilter.search}”
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            onClick={load}
            disabled={fetching}
            className="gap-2"
            type="button"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>

          <PermissionGate
            permission={["cost_centers.write", "cost-centers.write"] as any}
          >
            <Button onClick={openCreate} className="gap-2" type="button">
              <Plus className="h-4 w-4" />
              Create Cost Center
            </Button>
          </PermissionGate>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-b from-slate-50 to-white">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">Directory</CardTitle>
              <CardDescription>
                Filter, search, and maintain your cost centers.
              </CardDescription>
            </div>

            {/* Quick search (optional) */}
            <div className="w-full md:max-w-[420px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  value={filter.search ?? ""}
                  onChange={(e) =>
                    setFilter((p) => ({ ...p, search: e.target.value }))
                  }
                  placeholder="Quick search cost centers…"
                  className="pl-9"
                />
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                <ListFilter className="h-3.5 w-3.5" />
                <span>Advanced filters are below.</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-4 md:p-6">
          {/* Your full filters bar */}
          <div className="rounded-xl border bg-white p-3 md:p-4">
            <CostCentersFiltersBar value={filter} onChange={setFilter} />
          </div>

          {!canRead ? (
            <div className="rounded-xl border bg-white p-6">
              <EmptyState
                title="No access"
                description="You don't have permission to view cost centers."
              />
            </div>
          ) : fetching && items.length === 0 ? (
            <div className="space-y-3">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border bg-white p-6">
              <EmptyState
                title="No cost centers yet"
                description="Create your first cost center to begin tracking costs."
                action={
                  canWrite ? (
                    <Button onClick={openCreate} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Cost Center
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="rounded-xl border bg-white">
              <CostCentersTable
                items={items}
                canWrite={canWrite}
                onEdit={openEdit}
                onDelete={openDelete}
                onRestore={openRestore}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <CreateEditCostCenterModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        value={active}
        loading={loading}
        onSubmit={submit}
      />

      <DeleteRestoreCostCenterDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        mode={confirmMode}
        item={confirmItem}
        onConfirm={confirm}
      />
    </div>
  );
}