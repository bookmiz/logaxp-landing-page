"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/logaxp/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { useOrgStructure } from "@/logaxp/hooks/useOrgStructure";
import type { OrgUnit, OrgUnitListFilterDto } from "@/logaxp/lib/orgStructure/orgStructure.types";
import { useDebouncedValue } from "@/logaxp/components/orgStructure/shared/useDebouncedValue";
import { PermissionGate } from "@/logaxp/components/auth/PermissionGate";
import { useHasPermission } from "@/logaxp/hooks/useHasPermission";
import { OrgUnitsFiltersBar } from "@/logaxp/components/orgStructure/orgUnits/OrgUnitsFiltersBar";
import { OrgUnitsTable } from "@/logaxp/components/orgStructure/orgUnits/OrgUnitsTable";
import { CreateEditOrgUnitModal } from "@/logaxp/components/orgStructure/orgUnits/CreateEditOrgUnitModal";
import { DeleteRestoreOrgUnitDialog } from "@/logaxp/components/orgStructure/orgUnits/DeleteRestoreOrgUnitDialog";
import { toast } from "@/logaxp/components/ui/toast";

// If you don't have these UI primitives, remove them + the small blocks that use them.
import { Input } from "@/logaxp/components/ui/input";
import { Badge } from "@/logaxp/components/ui/badge";
import { Skeleton } from "@/logaxp/components/ui/skeleton";

export default function OrgUnitsPage() {
  const { orgUnits, loading } = useOrgStructure();

  // ✅ match backend
  const canWrite = useHasPermission("org_units.write" as any);
  const canRead = useHasPermission("org_units.read" as any);

  const [filter, setFilter] = useState<OrgUnitListFilterDto>({
    includeDeleted: false,
    search: "",
  });

  const debouncedSearch = useDebouncedValue(filter.search ?? "", 250);
  const effectiveFilter = useMemo(
    () => ({ ...filter, search: debouncedSearch }),
    [filter, debouncedSearch]
  );

  const [items, setItems] = useState<OrgUnit[]>([]);
  const [fetching, setFetching] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [active, setActive] = useState<OrgUnit | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<"delete" | "restore">("delete");
  const [confirmUnit, setConfirmUnit] = useState<OrgUnit | null>(null);

  const load = useCallback(async () => {
    if (!canRead) {
      setItems([]);
      return;
    }

    setFetching(true);
    try {
      const res = await orgUnits.list(effectiveFilter);

      // backend returns array currently
      const list = Array.isArray(res) ? res : ((res as any)?.items ?? []);
      setItems(list as OrgUnit[]);
    } catch {
      toast.error("Failed to load org units");
      setItems([]);
    } finally {
      setFetching(false);
    }
  }, [canRead, orgUnits, effectiveFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setModalMode("create");
    setActive(null);
    setModalOpen(true);
  };

  const openEdit = (u: OrgUnit) => {
    setModalMode("edit");
    setActive(u);
    setModalOpen(true);
  };

  const openDelete = (u: OrgUnit) => {
    setConfirmMode("delete");
    setConfirmUnit(u);
    setConfirmOpen(true);
  };

  const openRestore = (u: OrgUnit) => {
    setConfirmMode("restore");
    setConfirmUnit(u);
    setConfirmOpen(true);
  };

  const submit = async (dto: any) => {
    try {
      if (modalMode === "create") {
        await orgUnits.create(dto);
        toast.success("Org unit created");
      } else {
        await orgUnits.update(active!.id, dto);
        toast.success("Org unit updated");
      }
      setModalOpen(false);
      await load();
    } catch {
      toast.error("Operation failed");
    }
  };

  const confirm = async () => {
    if (!confirmUnit) return;
    try {
      if (confirmMode === "delete") {
        await orgUnits.remove(confirmUnit.id);
        toast.success("Org unit deleted");
      } else {
        await orgUnits.restore(confirmUnit.id);
        toast.success("Org unit restored");
      }
      await load();
    } catch {
      toast.error("Operation failed");
    }
  };

  const total = items.length;
  const showingDeleted = Boolean(filter.includeDeleted);

  return (
    <div className="space-y-5">
      {/* Page shell */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              {fetching ? "Loading…" : `${total} unit${total === 1 ? "" : "s"}`}
            </Badge>
            {showingDeleted ? (
              <Badge variant="outline" className="rounded-full">
                Including deleted
              </Badge>
            ) : null}
          </div>

          <PermissionGate permission="org_units.write">
            <Button onClick={openCreate} className="gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Create 
            </Button>
          </PermissionGate>
          <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
            Tip: Start with divisions, then add departments and teams.
          </p>
        </div>
      </div>

      {/* Main card */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-b from-slate-50 to-white">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="text-base">Directory</CardTitle>
              <CardDescription>Search, review, and maintain your org structure.</CardDescription>
            </div>

            {/* Quick search (mirrors filter.search) */}
            <div className="w-full md:w-[360px]">
              <Input
                value={filter.search ?? ""}
                onChange={(e) => setFilter((p) => ({ ...p, search: e.target.value }))}
                placeholder="Search org units…"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Try “Marketing”, “Division”, “Team”, or a code</span>
                <button
                  type="button"
                  className="hover:text-slate-700"
                  onClick={() => setFilter((p) => ({ ...p, search: "" }))}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-4 md:p-6">
          {/* Filter bar container */}
          <div className="rounded-xl border bg-white p-3 md:p-4">
            <OrgUnitsFiltersBar value={filter} onChange={setFilter} />
          </div>

          {!canRead ? (
            <div className="rounded-xl border bg-white p-6">
              <EmptyState
                title="No access"
                description="You don't have permission to view org units."
              />
            </div>
          ) : fetching ? (
            <div className="rounded-xl border bg-white p-4">
              <div className="space-y-3">
                <Skeleton className="h-5 w-[220px]" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border bg-white p-6">
              <EmptyState
                title={filter.search ? "No matches" : "No org units yet"}
                description={
                  filter.search
                    ? "Try a different search term or clear the search."
                    : "Create your first division/department/team to start building your org structure."
                }
                action={
                  canWrite ? <Button onClick={openCreate}>Create Org Unit</Button> : undefined
                }
              />
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-white">
              <OrgUnitsTable
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

      {/* Modals */}
      <CreateEditOrgUnitModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        value={active}
        loading={loading}
        onSubmit={submit}
      />

      <DeleteRestoreOrgUnitDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        mode={confirmMode}
        unit={confirmUnit}
        onConfirm={confirm}
      />
    </div>
  );
}