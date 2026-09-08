// src/app/portal/org-structure/positions/page.tsx (example path)
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
  Position,
  PositionsListFilterDto,
} from "@/logaxp/lib/orgStructure/orgStructure.types";
import { PositionsFiltersBar } from "@/logaxp/components/orgStructure/positions/PositionsFiltersBar";
import { PositionsTable } from "@/logaxp/components/orgStructure/positions/PositionsTable";
import { CreateEditPositionModal } from "@/logaxp/components/orgStructure/positions/CreateEditPositionModal";
import { DeleteRestorePositionDialog } from "@/logaxp/components/orgStructure/positions/DeleteRestorePositionDialog";
import { toast } from "@/logaxp/components/ui/toast";

// Optional UI primitives (remove if you don't have them)
import { Badge } from "@/logaxp/components/ui/badge";
import { Skeleton } from "@/logaxp/components/ui/skeleton";
import { Input } from "@/logaxp/components/ui/input";
import {
  Briefcase,
  RefreshCcw,
  Plus,
  Search,
  ListFilter,
} from "lucide-react";

export default function PositionsPage() {
  const { positions, loading } = useOrgStructure();

  // ✅ Prefer ONE canonical permission key style long-term.
  // If you truly support multiple keys, keep array — but gate and hasPermission must match.
  const canWrite = useHasPermission(["positions.write", "position.write"] as any);
  const canRead = useHasPermission(["positions.read", "position.read"] as any);

  const [filter, setFilter] = useState<PositionsListFilterDto>({
    includeDeleted: false,
    search: "",
  });

  const debouncedSearch = useDebouncedValue(filter.search ?? "", 250);
  const effectiveFilter = useMemo(
    () => ({ ...filter, search: debouncedSearch }),
    [filter, debouncedSearch]
  );

  const [items, setItems] = useState<Position[]>([]);
  const [fetching, setFetching] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [active, setActive] = useState<Position | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<"delete" | "restore">("delete");
  const [confirmItem, setConfirmItem] = useState<Position | null>(null);

  const load = useCallback(async () => {
    if (!canRead) {
      setItems([]);
      return;
    }

    setFetching(true);
    try {
      // ✅ returns DATA (not axios response)
      const data = await positions.list(effectiveFilter);

      // ✅ unwrap the payload directly (no .data)
      const { items } = unwrapList(data as any);
      setItems(items as Position[]);
    } catch {
      toast.error("Failed to load positions");
      setItems([]);
    } finally {
      setFetching(false);
    }
  }, [canRead, positions, effectiveFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setModalMode("create");
    setActive(null);
    setModalOpen(true);
  };

  const openEdit = (p: Position) => {
    setModalMode("edit");
    setActive(p);
    setModalOpen(true);
  };

  const openDelete = (p: Position) => {
    setConfirmMode("delete");
    setConfirmItem(p);
    setConfirmOpen(true);
  };

  const openRestore = (p: Position) => {
    setConfirmMode("restore");
    setConfirmItem(p);
    setConfirmOpen(true);
  };

  const submit = async (dto: any) => {
    try {
      if (modalMode === "create") {
        await positions.create(dto);
        toast.success("Position created");
      } else {
        await positions.update(active!.id, dto);
        toast.success("Position updated");
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
        await positions.remove(confirmItem.id);
        toast.success("Position deleted");
      } else {
        await positions.restore(confirmItem.id);
        toast.success("Position restored");
      }
      await load();
    } catch {
      toast.error("Operation failed");
    }
  };

  const total = items.length;

  return (
    <div className="space-y-5">
      {/* Page header (more professional than putting everything inside CardHeader) */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-300 mr-2" />
              {fetching ? "Loading…" : `${total} position${total === 1 ? "" : "s"}`}
            </Badge>

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

          <PermissionGate permission={["positions.write", "position.write"] as any}>
            <Button onClick={openCreate} className="gap-2" type="button">
              <Plus className="h-4 w-4" />
              Create Position
            </Button>
          </PermissionGate>
        </div>
      </div>

      <Card className="overflow-hidden">
        {/* Card header */}
        <CardHeader className="border-b bg-gradient-to-b from-slate-50 to-white">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">Directory</CardTitle>
              <CardDescription>
                Filter, search, and maintain your position definitions.
              </CardDescription>
            </div>

            {/* Quick search (optional, complements your FiltersBar) */}
            <div className="w-full md:max-w-[420px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  value={filter.search ?? ""}
                  onChange={(e) => setFilter((p) => ({ ...p, search: e.target.value }))}
                  placeholder="Quick search positions…"
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
            <PositionsFiltersBar value={filter} onChange={setFilter} />
          </div>

          {!canRead ? (
            <div className="rounded-xl border bg-white p-6">
              <EmptyState
                title="No access"
                description="You don't have permission to view positions."
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
                title="No positions yet"
                description="Create your first position to get started."
                action={
                  canWrite ? (
                    <Button onClick={openCreate} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Position
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="rounded-xl border bg-white">
              <PositionsTable
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

      <CreateEditPositionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        value={active}
        loading={loading}
        onSubmit={submit}
      />

      <DeleteRestorePositionDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        mode={confirmMode}
        item={confirmItem}
        onConfirm={confirm}
      />
    </div>
  );
}