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
import { unwrapList } from "@/logaxp/components/orgStructure/shared/listUtils";
import { useDebouncedValue } from "@/logaxp/components/orgStructure/shared/useDebouncedValue";
import { PermissionGate } from "@/logaxp/components/auth/PermissionGate";
import { useHasPermission } from "@/logaxp/hooks/useHasPermission";
import type {
  Location,
  LocationsListFilterDto,
} from "@/logaxp/lib/orgStructure/orgStructure.types";
import { LocationsFiltersBar } from "@/logaxp/components/orgStructure/locations/LocationsFiltersBar";
import { LocationsTable } from "@/logaxp/components/orgStructure/locations/LocationsTable";
import { CreateEditLocationModal } from "@/logaxp/components/orgStructure/locations/CreateEditLocationModal";
import { DeleteRestoreLocationDialog } from "@/logaxp/components/orgStructure/locations/DeleteRestoreLocationDialog";
import { toast } from "@/logaxp/components/ui/toast";

// If you have these (shadcn-style) components in your UI layer, keep them.
// If not, remove these imports and the small blocks that use them.
import { Input } from "@/logaxp/components/ui/input";
import { Badge } from "@/logaxp/components/ui/badge";
import { Skeleton } from "@/logaxp/components/ui/skeleton";
import { Briefcase } from "lucide-react";

export default function LocationsPage() {
  const { locations, loading } = useOrgStructure();

  const canWrite = useHasPermission("locations.write" as any);
  const canRead = useHasPermission("locations.read" as any);

  const [filter, setFilter] = useState<LocationsListFilterDto>({
    includeDeleted: false,
    search: "",
  });

  const debouncedSearch = useDebouncedValue(filter.search ?? "", 250);
  const effectiveFilter = useMemo(
    () => ({ ...filter, search: debouncedSearch }),
    [filter, debouncedSearch]
  );

  const [items, setItems] = useState<Location[]>([]);
  const [fetching, setFetching] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [active, setActive] = useState<Location | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<"delete" | "restore">("delete");
  const [confirmItem, setConfirmItem] = useState<Location | null>(null);

  const load = useCallback(async () => {
    if (!canRead) return;

    setFetching(true);
    try {
      const data = await locations.list(effectiveFilter);
      const unwrapped = unwrapList(data as any);
      setItems((unwrapped.items ?? []) as Location[]);
    } catch {
      toast.error("Failed to load locations");
      setItems([]);
    } finally {
      setFetching(false);
    }
  }, [canRead, locations, effectiveFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setModalMode("create");
    setActive(null);
    setModalOpen(true);
  };

  const openEdit = (p: Location) => {
    setModalMode("edit");
    setActive(p);
    setModalOpen(true);
  };

  const openDelete = (p: Location) => {
    setConfirmMode("delete");
    setConfirmItem(p);
    setConfirmOpen(true);
  };

  const openRestore = (p: Location) => {
    setConfirmMode("restore");
    setConfirmItem(p);
    setConfirmOpen(true);
  };

  const submit = async (dto: any) => {
    try {
      if (modalMode === "create") {
        await locations.create(dto);
        toast.success("Location created");
      } else {
        await locations.update(active!.id, dto);
        toast.success("Location updated");
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
        await locations.remove(confirmItem.id);
        toast.success("Location deleted");
      } else {
        await locations.restore(confirmItem.id);
        toast.success("Location restored");
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
      {/* Top shell header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
       

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
               <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-300 mr-2" />
              {fetching ? "Loading…" : `${total} location${total === 1 ? "" : "s"}`}
            </Badge>
            {showingDeleted ? (
              <Badge variant="outline" className="rounded-full">
                Including deleted
              </Badge>
            ) : null}
          </div>

          <PermissionGate permission="locations.write">
            <Button onClick={openCreate} className="gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Create
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Main content card */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-b from-slate-50 to-white">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="text-base">Directory</CardTitle>
              <CardDescription>
                Search, review, and maintain your location records.
              </CardDescription>
            </div>

            {/* Quick search (kept in sync with your filter bar) */}
            <div className="w-full md:w-[360px]">
              <Input
                value={filter.search ?? ""}
                onChange={(e) =>
                  setFilter((p) => ({ ...p, search: e.target.value }))
                }
                placeholder="Search locations…"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Tip: try “HQ”, “Remote”, “Branch”, or a city name</span>
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
          {/* Full filter bar (your existing component) */}
          <div className="rounded-xl border bg-white p-3 md:p-4">
            <LocationsFiltersBar value={filter} onChange={setFilter} />
          </div>

          {!canRead ? (
            <div className="rounded-xl border bg-white p-6">
              <EmptyState
                title="No access"
                description="You don't have permission to view locations."
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
                title={filter.search ? "No matches" : "No locations yet"}
                description={
                  filter.search
                    ? "Try a different search term or clear the search."
                    : "Create your first location to start organizing branches and teams."
                }
                action={
                  canWrite ? (
                    <Button onClick={openCreate}>Create Location</Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-white">
              <LocationsTable
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
      <CreateEditLocationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        value={active}
        loading={loading}
        onSubmit={submit}
      />

      <DeleteRestoreLocationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        mode={confirmMode}
        item={confirmItem}
        onConfirm={confirm}
      />
    </div>
  );
}