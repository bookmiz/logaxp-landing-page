"use client";

import * as React from "react";
import { Building2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Tenant, CreateTenantInput, UpdateTenantInput } from "@/logaxp/lib/tenants/tenant.types";
import { useTenants } from "@/logaxp/hooks/useTenants";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Skeleton } from "@/logaxp/components/ui/skeleton";
import { Pagination } from "@/logaxp/components/ui/pagination";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Button } from "@/logaxp/components/ui/button";
import { toast } from "@/logaxp/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/logaxp/components/ui/dialog";

import { TenantStatsCards } from "./TenantStatsCards";
import { TenantFiltersBar, type TenantStatusFilter } from "./TenantFiltersBar";
import { TenantTable } from "./TenantTable";
import { TenantCreateEditDialog } from "./TenantCreateEditDialog";
import { TenantDetailsDrawer } from "./TenantDetailsDrawer";
import type { TenantDetailsTab } from "./tenant-details.types";


function sortTenants(rows: Tenant[]) {
  return [...rows].sort((a, b) => {
    const bd = new Date(b.createdAt).getTime();
    const ad = new Date(a.createdAt).getTime();
    if (!Number.isNaN(bd) && !Number.isNaN(ad) && bd !== ad) return bd - ad;
    return a.name.localeCompare(b.name);
  });
}

export default function TenantManagementPanel() {
  const {
    listTenants,
    createTenant,
    updateTenant,
    activateTenant,
    suspendTenant,
    softDeleteTenant,
    loading,
    error,
  } = useTenants();

  const router = useRouter();

  const [tenants, setTenants] = React.useState<Tenant[]>([]);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [busyTenantId, setBusyTenantId] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<TenantStatusFilter>("ALL");
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTenant, setEditTenant] = React.useState<Tenant | null>(null);
  const [submittingDialog, setSubmittingDialog] = React.useState(false);

  const [deleteTarget, setDeleteTarget] = React.useState<Tenant | null>(null);

  // Details drawer state
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [detailsTenant, setDetailsTenant] = React.useState<Tenant | null>(null);
  const [detailsTab, setDetailsTab] = React.useState<TenantDetailsTab>("overview");

  const loadTenants = React.useCallback(async () => {
    try {
      const data = await listTenants();
      const sorted = sortTenants(data);
      setTenants(sorted);

      // keep details tenant fresh if already open
      setDetailsTenant((prev) => {
        if (!prev) return prev;
        return sorted.find((t) => t.id === prev.id) ?? prev;
      });
    } catch (e) {
      console.error(e);
    } finally {
      setInitialLoading(false);
    }
  }, [listTenants]);

  React.useEffect(() => {
    void loadTenants();
  }, [loadTenants]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();

    return tenants.filter((t) => {
      const statusMatch = statusFilter === "ALL" ? true : t.status === statusFilter;
      if (!statusMatch) return false;

      if (!q) return true;

      return (
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        (t.planKey ?? "").toLowerCase().includes(q) ||
        t.timezone.toLowerCase().includes(q) ||
        t.locale.toLowerCase().includes(q) ||
        t.currency.toLowerCase().includes(q)
      );
    });
  }, [tenants, search, statusFilter]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(currentPage, totalPages);

  const pagedRows = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const patchTenantInState = React.useCallback((updated: Tenant) => {
    setTenants((prev) => sortTenants(prev.map((t) => (t.id === updated.id ? updated : t))));
    setDetailsTenant((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev));
    setEditTenant((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev));
  }, []);

  const patchDetailsTenant = React.useCallback((updated: Tenant) => {
    setDetailsTenant(updated);
    // only patch list row fields that exist there
    setTenants((prev) =>
      sortTenants(prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)))
    );
  }, []);

  const handleOpenDetails = React.useCallback((tenant: Tenant, tab: TenantDetailsTab = "overview") => {
  router.push(`/site-admin/tenants/${tenant.id}?tab=${tab}`);
}, [router]);

  const handleCreate = async (payload: CreateTenantInput) => {
    try {
      setSubmittingDialog(true);
      const created = await createTenant(payload);
      setTenants((prev) => sortTenants([created, ...prev]));
      setCreateOpen(false);
      toast.success("Tenant created successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to create tenant");
    } finally {
      setSubmittingDialog(false);
    }
  };

  const handleUpdate = async (tenantId: string, payload: UpdateTenantInput) => {
    try {
      setSubmittingDialog(true);
      const updated = await updateTenant(tenantId, payload);
      patchTenantInState(updated);
      setEditTenant(null);
      toast.success("Tenant updated successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update tenant");
    } finally {
      setSubmittingDialog(false);
    }
  };

  const runTenantAction = async (
    tenant: Tenant,
    action: "activate" | "suspend" | "delete"
  ) => {
    try {
      setBusyTenantId(tenant.id);

      let updated: Tenant;
      if (action === "activate") {
        updated = await activateTenant(tenant.id);
        toast.success(`Tenant "${tenant.name}" activated`);
      } else if (action === "suspend") {
        updated = await suspendTenant(tenant.id);
        toast.success(`Tenant "${tenant.name}" suspended`);
      } else {
        updated = await softDeleteTenant(tenant.id);
        toast.success(`Tenant "${tenant.name}" deleted`);
      }

      patchTenantInState(updated);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to ${action} tenant`);
    } finally {
      setBusyTenantId(null);
      if (action === "delete") setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="admin-page-heading"><div className="admin-kicker">Workspace / Organizations</div><h1>Tenants</h1><p className="mt-2 text-sm text-slate-500">Manage organizations and the people who work in them.</p></div><div>
          <TenantFiltersBar
            search={search}
            onSearchChange={setSearch}
            status={statusFilter}
            onStatusChange={setStatusFilter}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            onRefresh={() => void loadTenants()}
            onCreate={() => setCreateOpen(true)}
            loading={loading}
          /></div>
      {/* Stats */}
      {initialLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[96px] rounded-2xl" />
          ))}
        </div>
      ) : (
        <TenantStatsCards tenants={tenants} />
      )}

      {/* Errors */}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        </div>
      ) : null}

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tenants</CardTitle>
          <CardDescription>
            Showing {filtered.length} result{filtered.length === 1 ? "" : "s"} ({tenants.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {initialLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Building2 className="h-8 w-8" />}
              title="No tenants found"
              description={
                tenants.length === 0
                  ? "You haven’t created any tenants yet."
                  : "Try adjusting your search or filters."
              }
              action={
                tenants.length === 0 ? (
                  <Button onClick={() => setCreateOpen(true)}>Create first tenant</Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <TenantTable
                rows={pagedRows}
                busyTenantId={busyTenantId}
                onView={handleOpenDetails}
                onEdit={(tenant) => setEditTenant(tenant)}
                onActivate={(tenant) => void runTenantAction(tenant, "activate")}
                onSuspend={(tenant) => void runTenantAction(tenant, "suspend")}
                onDelete={(tenant) => setDeleteTarget(tenant)}
              />

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                disabled={loading}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Details Drawer / Modal */}
      <TenantDetailsDrawer
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        tenant={detailsTenant}
        initialTab={detailsTab}
        onTenantChange={patchDetailsTenant}
      />

      {/* Create Dialog */}
      <TenantCreateEditDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        tenant={null}
        submitting={submittingDialog}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      {/* Edit Dialog */}
      <TenantCreateEditDialog
        open={Boolean(editTenant)}
        onOpenChange={(open) => {
          if (!open) setEditTenant(null);
        }}
        tenant={editTenant}
        submitting={submittingDialog}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      {/* Delete confirm */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tenant</DialogTitle>
            <DialogDescription>
              This performs a soft delete for <span className="font-semibold">{deleteTarget?.name}</span>.
              The tenant will be marked as deleted and hidden from normal operations.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={busyTenantId === deleteTarget?.id}
              onClick={() => {
                if (deleteTarget) void runTenantAction(deleteTarget, "delete");
              }}
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}