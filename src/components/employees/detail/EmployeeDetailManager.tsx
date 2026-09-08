"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import type {
  EmployeeDetail,
  ChangeEmployeeStatusDto,
} from "@/logaxp/lib/employee-management/employee-management.types";

import type {
  OrgUnit,
  Location,
  Position,
  CostCenter,
} from "@/logaxp/lib/orgStructure/orgStructure.types";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { toast } from "@/logaxp/components/ui/toast";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { LoadingSkeleton } from "@/logaxp/components/ui/loading-skeleton";

import { useEmployeeManagement } from "@/logaxp/hooks/useEmployeeManagement";
import { useOrgStructure } from "@/logaxp/hooks/useOrgStructure";

import {
  BusyAction,
  TabKey,
  unwrapApi,
  unwrapList,
  fullName,
  isDeleted,
} from "./employee-detail.utils";

import { EmployeeDetailHeader } from "./EmployeeDetailHeader";
import { EmployeeDetailTabs } from "./EmployeeDetailTabs";
import { EmployeeProfileTab } from "./EmployeeProfileTab";
import { EmployeeStatusDialog } from "./EmployeeStatusDialog";
import { ConfirmDialog, PanelShell } from "./EmployeeSharedDialogs";

import { EmployeeAssignmentsTab } from "./EmployeeAssignmentsTab";
import { EmployeeAddressesTab } from "./EmployeeAddressesTab";
import { EmployeeEmergencyTab } from "./EmployeeEmergencyTab";
import { EmployeeDependentsTab } from "./EmployeeDependentsTab";
import { EmployeeDocumentsTab } from "./EmployeeDocumentsTab";

import { EmployeePayrollProfileTab } from "./EmployeePayrollProfileTab";
import { EmployeeCompensationsTab } from "./EmployeeCompensationsTab";
import { EmployeePaymentMethodsTab } from "./EmployeePaymentMethodsTab";
import { EmployeePaymentSplitsTab } from "./EmployeePaymentSplitsTab";

export function EmployeeDetailManager({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const api = useEmployeeManagement();
  const {
    orgUnits: orgUnitsApi,
    locations: locationsApi,
    positions: positionsApi,
    costCenters: costCentersApi,
  } = useOrgStructure();

  const [employee, setEmployee] = React.useState<EmployeeDetail | null>(null);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [tab, setTab] = React.useState<TabKey>("profile");
  const [busyAction, setBusyAction] = React.useState<BusyAction>(null);

  const [removeOpen, setRemoveOpen] = React.useState(false);
  const [restoreOpen, setRestoreOpen] = React.useState(false);
  const [statusOpen, setStatusOpen] = React.useState(false);

  const [orgUnits, setOrgUnits] = React.useState<OrgUnit[]>([]);
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [positions, setPositions] = React.useState<Position[]>([]);
  const [costCenters, setCostCenters] = React.useState<CostCenter[]>([]);
  const [lookupsReady, setLookupsReady] = React.useState(false);
  const [lookupError, setLookupError] = React.useState<string | null>(null);

  const deleted = isDeleted(employee);
  const busyAny = Boolean(busyAction);

  React.useEffect(() => {
    setEmployee(null);
    setInitialLoading(true);
    setBusyAction(null);
    setRemoveOpen(false);
    setRestoreOpen(false);
    setStatusOpen(false);
    setTab("profile");
  }, [employeeId]);

  const load = React.useCallback(
    async (opts?: { silent?: boolean }) => {
      try {
        setBusyAction("refresh");
        const res = await api.employees.get(employeeId);
        setEmployee(unwrapApi(res) as EmployeeDetail);
      } catch (e) {
        console.error(e);
        if (!opts?.silent) toast.error("Failed to load employee");
      } finally {
        setInitialLoading(false);
        setBusyAction(null);
      }
    },
    [api.employees, employeeId]
  );

  React.useEffect(() => {
    void load({ silent: true });
  }, [load]);

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLookupsReady(false);
        setLookupError(null);

        const [ou, lo, po, cc] = await Promise.all([
          orgUnitsApi.list({ includeDeleted: false }),
          locationsApi.list({ includeDeleted: false }),
          positionsApi.list({ includeDeleted: false }),
          costCentersApi.list({ includeDeleted: false }),
        ]);

        const ouItems = unwrapList<OrgUnit>(unwrapApi(ou)).items;
        const loItems = unwrapList<Location>(unwrapApi(lo)).items;
        const poItems = unwrapList<Position>(unwrapApi(po)).items;
        const ccItems = unwrapList<CostCenter>(unwrapApi(cc)).items;

        if (!mounted) return;

        setOrgUnits(ouItems);
        setLocations(loItems);
        setPositions(poItems);
        setCostCenters(ccItems);
        setLookupsReady(true);
      } catch (e) {
        console.warn("Org structure lookups failed", e);
        if (!mounted) return;
        setLookupError("Some org structure lookups failed to load.");
        setLookupsReady(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [orgUnitsApi, locationsApi, positionsApi, costCentersApi]);

  const doDelete = async () => {
    if (!employee?.id) return;
    try {
      setBusyAction("delete");
      await api.employees.softDelete(employee.id);
      toast.success("Employee deleted");
      setRemoveOpen(false);
      await load({ silent: true });
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete employee");
    } finally {
      setBusyAction(null);
    }
  };

  const doRestore = async () => {
    if (!employee?.id) return;
    try {
      setBusyAction("restore");
      await api.employees.restore(employee.id);
      toast.success("Employee restored");
      setRestoreOpen(false);
      await load({ silent: true });
    } catch (e) {
      console.error(e);
      toast.error("Failed to restore employee");
    } finally {
      setBusyAction(null);
    }
  };

  const doChangeStatus = async (dto: ChangeEmployeeStatusDto) => {
    if (!employee?.id) return;
    try {
      setBusyAction("status");
      await api.employees.changeStatus(employee.id, dto);
      toast.success("Status updated");
      setStatusOpen(false);
      await load({ silent: true });
    } catch (e) {
      console.error(e);
      toast.error("Failed to update status");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="space-y-5">
      <EmployeeDetailHeader
        employee={employee}
        initialLoading={initialLoading}
        busyAny={busyAny}
        onBack={() => router.back()}
        onRefresh={() => void load()}
        onEdit={() => router.push(`/portal/employees/${employeeId}/edit`)}
        onStatus={() => setStatusOpen(true)}
        onDelete={() => setRemoveOpen(true)}
        onRestore={() => setRestoreOpen(true)}
      />

      {!lookupsReady ? (
        <Card className="overflow-hidden rounded-2xl">
          <CardContent className="p-5">
            <LoadingSkeleton lines={3} />
          </CardContent>
        </Card>
      ) : null}

      {lookupError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
          {lookupError}
        </div>
      ) : null}

      <Card className="overflow-hidden rounded-2xl">
        <CardHeader className="border-b bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-950">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="text-base">Employee workspace</CardTitle>
              <CardDescription>
                Review employee data, assignments, addresses, emergency contacts, dependents,
                documents, payroll setup, compensation, payment methods, and payout splits.
              </CardDescription>
            </div>

            <div className="w-full md:w-[820px]">
              <EmployeeDetailTabs value={tab} onChange={setTab} />
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Switch tabs to manage this employee in-place</span>
                <button
                  type="button"
                  className="hover:text-slate-700 dark:hover:text-slate-200"
                  onClick={() => setTab("profile")}
                >
                  Jump to profile
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-4 md:p-6">
          {initialLoading ? (
            <div className="rounded-xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
              <LoadingSkeleton lines={10} />
            </div>
          ) : !employee ? (
            <div className="rounded-xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
              <EmptyState
                title="Employee not found"
                description="This record may have been removed or you lack access."
              />
            </div>
          ) : tab === "profile" ? (
            <PanelShell title="Profile" description="Overview, HR metadata, and primary placement snapshot.">
              <EmployeeProfileTab employee={employee} />
            </PanelShell>
          ) : tab === "assignments" ? (
            <PanelShell title="Assignments" description="Manage org unit, position, location, cost center, and manager.">
              <EmployeeAssignmentsTab
                employee={employee}
                api={api}
                busyAny={busyAny}
                setBusyAction={setBusyAction}
                lookups={{ orgUnits, locations, positions, costCenters }}
                onRefresh={() => void load({ silent: true })}
              />
            </PanelShell>
          ) : tab === "addresses" ? (
            <PanelShell title="Addresses" description="Addresses on file for this employee.">
              <EmployeeAddressesTab
                employee={employee}
                api={api}
                busyAny={busyAny}
                setBusyAction={setBusyAction}
                onRefresh={() => void load({ silent: true })}
              />
            </PanelShell>
          ) : tab === "emergency" ? (
            <PanelShell title="Emergency" description="Emergency contacts for safety and HR.">
              <EmployeeEmergencyTab
                employee={employee}
                api={api}
                busyAny={busyAny}
                setBusyAction={setBusyAction}
                onRefresh={() => void load({ silent: true })}
              />
            </PanelShell>
          ) : tab === "dependents" ? (
            <PanelShell title="Dependents" description="Dependent records for benefits and HR.">
              <EmployeeDependentsTab
                employee={employee}
                api={api}
                busyAny={busyAny}
                setBusyAction={setBusyAction}
                onRefresh={() => void load({ silent: true })}
              />
            </PanelShell>
          ) : tab === "documents" ? (
            <PanelShell title="Documents" description="Manage the employee document cabinet, requests, and verification.">
              <EmployeeDocumentsTab
                employee={employee}
                api={api}
                busyAny={busyAny}
                setBusyAction={setBusyAction}
                onRefresh={() => void load({ silent: true })}
              />
            </PanelShell>
          ) : tab === "payroll-profile" ? (
            <PanelShell title="Payroll Profile" description="Configure payroll defaults, status, and work/pay basis.">
              <EmployeePayrollProfileTab employee={employee} onRefresh={() => void load({ silent: true })} />
            </PanelShell>
          ) : tab === "compensations" ? (
            <PanelShell title="Compensations" description="Manage effective-dated salary, hourly, daily, and commission records.">
              <EmployeeCompensationsTab employee={employee} />
            </PanelShell>
          ) : tab === "payment-methods" ? (
            <PanelShell title="Payment Methods" description="Configure where payroll payouts are sent.">
              <EmployeePaymentMethodsTab employee={employee} />
            </PanelShell>
          ) : (
            <PanelShell title="Payment Splits" description="Configure fixed, percentage, and remainder payout rules.">
              <EmployeePaymentSplitsTab employee={employee} />
            </PanelShell>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        title="Delete employee"
        description={`Soft-delete ${fullName(employee)}. You can restore later.`}
        confirmText="Confirm delete"
        destructive
        busyAny={busyAny}
        onConfirm={doDelete}
      />

      <ConfirmDialog
        open={restoreOpen}
        onOpenChange={setRestoreOpen}
        title="Restore employee"
        description={`Restore ${fullName(employee)} back to active records.`}
        confirmText="Restore"
        busyAny={busyAny}
        onConfirm={doRestore}
      />

      <EmployeeStatusDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        employee={employee}
        busyAny={busyAny}
        onSubmit={doChangeStatus}
      />
    </div>
  );
}
