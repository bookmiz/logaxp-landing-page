// "use client";

// import * as React from "react";
// import { useRouter } from "next/navigation";
// import {
//   ArrowLeft,
//   RefreshCcw,
//   Pencil,
//   Trash2,
//   RotateCcw,
//   ShieldCheck,
//   Plus,
//   CheckCircle2,
//   XCircle,
// } from "lucide-react";

// import { EmployeeSelect } from "@/logaxp/components/lookups/EmployeeSelect";
// import { useEmployeeManagement } from "@/logaxp/hooks/useEmployeeManagement";
// import { useOrgStructure } from "@/logaxp/hooks/useOrgStructure";
// import { LoadingSkeleton } from "@/logaxp/components/ui/loading-skeleton";

// import type {
//   EmployeeDetail,
//   EmployeeAssignment,
//   EmployeeAddress,
//   EmergencyContact,
//   Dependent,
//   EmployeeDocument,
//   ChangeEmployeeStatusDto,
//   CreateEmployeeAssignmentDto,
//   UpdateEmployeeAssignmentDto,
//   CreateEmployeeAddressDto,
//   UpdateEmployeeAddressDto,
//   CreateEmergencyContactDto,
//   UpdateEmergencyContactDto,
//   CreateDependentDto,
//   UpdateDependentDto,
//   CreateEmployeeDocumentDto,
//   VerifyEmployeeDocumentDto,
//   EmployeeStatus,
// } from "@/logaxp/lib/employee-management/employee-management.types";

// import { EMPLOYEE_STATUS_VALUES } from "@/logaxp/lib/employee-management/employee-management.types";

// import type {
//   ApiResponse,
//   ListData,
//   OrgUnit,
//   Location,
//   Position,
//   CostCenter,
// } from "@/logaxp/lib/orgStructure/orgStructure.types";

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/logaxp/components/ui/card";
// import { Button } from "@/logaxp/components/ui/button";
// import { Badge } from "@/logaxp/components/ui/badge";
// import { Input } from "@/logaxp/components/ui/input";
// import { Textarea } from "@/logaxp/components/ui/textarea";
// import { EmptyState } from "@/logaxp/components/ui/empty-state";
// import { toast } from "@/logaxp/components/ui/toast";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
//   TableWrapper,
// } from "@/logaxp/components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/logaxp/components/ui/dialog";
// import { FileIdPicker } from "@/logaxp/components/file/FileIdPicker";

// /* ---------------------------------------
//  * small utils
//  * -------------------------------------- */
// function safeIso(v?: string | null) {
//   if (!v) return "—";
//   const d = new Date(v);
//   if (Number.isNaN(d.getTime())) return "—";
//   return d.toLocaleString();
// }

// function unwrapApi<T>(res: ApiResponse<T> | T): T {
//   if (res && typeof res === "object" && "data" in res && "statusCode" in res) {
//     return (res as ApiResponse<T>).data;
//   }
//   return res as T;
// }

// function unwrapList<T>(data: ListData<T> | T[]): { items: T[] } {
//   if (!data) return { items: [] };
//   if (Array.isArray(data)) return { items: data as T[] };
//   if (typeof data === "object" && "items" in data && Array.isArray((data as any).items)) {
//     return { items: (data as any).items };
//   }
//   return { items: [] };
// }

// function human(s?: string | null) {
//   if (!s) return "—";
//   return String(s).replaceAll("_", " ");
// }

// function fullName(e?: EmployeeDetail | null) {
//   if (!e) return "—";
//   const n = `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim();
//   return n || "—";
// }

// function cn(...c: Array<string | false | null | undefined>) {
//   return c.filter(Boolean).join(" ");
// }

// function isDeleted(e?: EmployeeDetail | null) {
//   return Boolean(e?.deletedAt);
// }

// function StatusBadge({ status, deleted }: { status?: string; deleted?: boolean }) {
//   if (deleted) return <Badge variant="warning">DELETED</Badge>;
//   const s = String(status ?? "—").toUpperCase();

//   if (s === "ACTIVE") return <Badge variant="success">ACTIVE</Badge>;
//   if (s === "ONBOARDING") return <Badge variant="muted">ONBOARDING</Badge>;
//   if (s === "ON_LEAVE") return <Badge variant="default">ON LEAVE</Badge>;
//   if (s === "SUSPENDED") return <Badge variant="warning">SUSPENDED</Badge>;
//   if (s === "TERMINATED") return <Badge variant="destructive">TERMINATED</Badge>;
//   if (s === "INACTIVE") return <Badge variant="muted">INACTIVE</Badge>;

//   return <Badge variant="muted">{s}</Badge>;
// }

// function SelectField({
//   label,
//   value,
//   onChange,
//   children,
// }: {
//   label: string;
//   value: string;
//   onChange: (v: string) => void;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="space-y-1">
//       <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
//         {label}
//       </label>
//       <select
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
//       >
//         {children}
//       </select>
//     </div>
//   );
// }

// /* ---------------------------------------
//  * Tabs
//  * -------------------------------------- */
// type TabKey =
//   | "profile"
//   | "assignments"
//   | "addresses"
//   | "emergency"
//   | "dependents"
//   | "documents";

// const TABS: Array<{ key: TabKey; label: string }> = [
//   { key: "profile", label: "Profile" },
//   { key: "assignments", label: "Assignments" },
//   { key: "addresses", label: "Addresses" },
//   { key: "emergency", label: "Emergency" },
//   { key: "dependents", label: "Dependents" },
//   { key: "documents", label: "Documents" },
// ];

// type BusyAction = "refresh" | "delete" | "restore" | "status" | "panel" | null;

// /* ---------------------------------------
//  * Shared layout: panel shell (Locations-style)
//  * -------------------------------------- */
// function PanelShell({
//   title,
//   description,
//   right,
//   children,
// }: {
//   title: string;
//   description?: string;
//   right?: React.ReactNode;
//   children: React.ReactNode;
// }) {
//   return (
//     <section className="overflow-hidden rounded-xl border bg-white dark:bg-slate-950">
//       <div className="border-b bg-gradient-to-b from-slate-50 to-white px-4 py-3 dark:from-slate-950 dark:to-slate-950">
//         <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
//           <div>
//             <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
//               {title}
//             </div>
//             {description ? (
//               <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
//                 {description}
//               </div>
//             ) : null}
//           </div>
//           {right ? <div className="flex items-center gap-2">{right}</div> : null}
//         </div>
//       </div>

//       <div className="p-4 md:p-5">{children}</div>
//     </section>
//   );
// }

// function TabPills({
//   value,
//   onChange,
// }: {
//   value: TabKey;
//   onChange: (k: TabKey) => void;
// }) {
//   return (
//     <div className="flex flex-wrap gap-2">
//       {TABS.map((t) => (
//         <button
//           key={t.key}
//           type="button"
//           onClick={() => onChange(t.key)}
//           className={cn(
//             "h-9 rounded-xl px-3 text-sm border transition",
//             value === t.key
//               ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
//               : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
//           )}
//         >
//           {t.label}
//         </button>
//       ))}
//     </div>
//   );
// }

// /* ---------------------------------------
//  * Main: Employee Detail Manager (Locations-style shell)
//  * -------------------------------------- */
// export function EmployeeDetailManager({ employeeId }: { employeeId: string }) {
//   const router = useRouter();
//   const api = useEmployeeManagement();
//   const { orgUnits: orgUnitsApi, locations: locationsApi, positions: positionsApi, costCenters: costCentersApi } =
//   useOrgStructure();

//   const [employee, setEmployee] = React.useState<EmployeeDetail | null>(null);
//   const [initialLoading, setInitialLoading] = React.useState(true);

//   const [tab, setTab] = React.useState<TabKey>("profile");
//   const [busyAction, setBusyAction] = React.useState<BusyAction>(null);

//   // dialogs
//   const [removeOpen, setRemoveOpen] = React.useState(false);
//   const [restoreOpen, setRestoreOpen] = React.useState(false);
//   const [statusOpen, setStatusOpen] = React.useState(false);

//   // lookups for assignment dialogs
//   const [orgUnits, setOrgUnits] = React.useState<OrgUnit[]>([]);
//   const [locations, setLocations] = React.useState<Location[]>([]);
//   const [positions, setPositions] = React.useState<Position[]>([]);
//   const [costCenters, setCostCenters] = React.useState<CostCenter[]>([]);

//   const deleted = isDeleted(employee);
//   const busyAny = Boolean(busyAction);

//   React.useEffect(() => {
//     setEmployee(null);
//     setInitialLoading(true);
//     setBusyAction(null);
//     setRemoveOpen(false);
//     setRestoreOpen(false);
//     setStatusOpen(false);
//     setTab("profile");
//   }, [employeeId]);

//   const load = React.useCallback(
//     async (opts?: { silent?: boolean }) => {
//       try {
//         setBusyAction("refresh");
//         const res = await api.employees.get(employeeId);
//         setEmployee(unwrapApi(res) as EmployeeDetail);
//       } catch (e) {
//         console.error(e);
//         if (!opts?.silent) toast.error("Failed to load employee");
//       } finally {
//         setInitialLoading(false);
//         setBusyAction(null);
//       }
//     },
//     [api.employees, employeeId]
//   );

//   React.useEffect(() => {
//     void load({ silent: true });
//   }, [load]);

//   // org structure lookups once
//  React.useEffect(() => {
//   let mounted = true;

//   (async () => {
//     try {
//       const [ou, lo, po, cc] = await Promise.all([
//         orgUnitsApi.list({ includeDeleted: false }),
//         locationsApi.list({ includeDeleted: false }),
//         positionsApi.list({ includeDeleted: false }),
//         costCentersApi.list({ includeDeleted: false }),
//       ]);

//       const ouItems = unwrapList<OrgUnit>(unwrapApi(ou)).items;
//       const loItems = unwrapList<Location>(unwrapApi(lo)).items;
//       const poItems = unwrapList<Position>(unwrapApi(po)).items;
//       const ccItems = unwrapList<CostCenter>(unwrapApi(cc)).items;

//       if (!mounted) return;

//       setOrgUnits(ouItems);
//       setLocations(loItems);
//       setPositions(poItems);
//       setCostCenters(ccItems);
//     } catch (e) {
//       console.warn("Org structure lookups failed", e);
//     }
//   })();

//   return () => {
//     mounted = false;
//   };
// }, [orgUnitsApi, locationsApi, positionsApi, costCentersApi]);

//   const doDelete = async () => {
//     if (!employee?.id) return;
//     try {
//       setBusyAction("delete");
//       await api.employees.softDelete(employee.id);
//       toast.success("Employee deleted");
//       setRemoveOpen(false);
//       await load({ silent: true });
//     } catch (e) {
//       console.error(e);
//       toast.error("Failed to delete employee");
//     } finally {
//       setBusyAction(null);
//     }
//   };

//   const doRestore = async () => {
//     if (!employee?.id) return;
//     try {
//       setBusyAction("restore");
//       await api.employees.restore(employee.id);
//       toast.success("Employee restored");
//       setRestoreOpen(false);
//       await load({ silent: true });
//     } catch (e) {
//       console.error(e);
//       toast.error("Failed to restore employee");
//     } finally {
//       setBusyAction(null);
//     }
//   };

//   const doChangeStatus = async (dto: ChangeEmployeeStatusDto) => {
//     if (!employee?.id) return;
//     try {
//       setBusyAction("status");
//       await api.employees.changeStatus(employee.id, dto);
//       toast.success("Status updated");
//       setStatusOpen(false);
//       await load({ silent: true });
//     } catch (e) {
//       console.error(e);
//       toast.error("Failed to update status");
//     } finally {
//       setBusyAction(null);
//     }
//   };

//   const topActions = (
//     <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
//       <div className="flex items-center gap-2">
//         <Badge variant="secondary" className="rounded-full">
//           {initialLoading ? "Loading…" : employee ? "Loaded" : "Not found"}
//         </Badge>

//         {deleted ? (
//           <Badge variant="outline" className="rounded-full">
//             Deleted
//           </Badge>
//         ) : null}
//       </div>

//       <div className="flex flex-wrap items-center gap-2">
//         <Button variant="outline" onClick={() => router.back()} disabled={busyAny}>
//           <ArrowLeft className="h-4 w-4" />
//           Back
//         </Button>

//         <Button variant="outline" onClick={() => void load()} disabled={busyAny}>
//           <RefreshCcw className="h-4 w-4" />
//           Refresh
//         </Button>

//         <Button
//           variant="outline"
//           onClick={() => router.push(`/portal/employees/${employeeId}/edit`)}
//           disabled={busyAny || !employee}
//         >
//           <Pencil className="h-4 w-4" />
//           Edit
//         </Button>

//         <Button
//           variant="outline"
//           onClick={() => setStatusOpen(true)}
//           disabled={busyAny || !employee || deleted}
//           title={deleted ? "Restore to change status" : undefined}
//         >
//           <ShieldCheck className="h-4 w-4" />
//           Status
//         </Button>

//         {deleted ? (
//           <Button onClick={() => setRestoreOpen(true)} disabled={busyAny || !employee}>
//             <RotateCcw className="h-4 w-4" />
//             Restore
//           </Button>
//         ) : (
//           <Button
//             variant="destructive"
//             onClick={() => setRemoveOpen(true)}
//             disabled={busyAny || !employee}
//           >
//             <Trash2 className="h-4 w-4" />
//             Delete
//           </Button>
//         )}
//       </div>
//     </div>
//   );

//   return (
//     <div className="space-y-5">
//       {/* Top shell header (LocationsPage style) */}
//       <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
//         <div className="space-y-1 min-w-0">
//           <h1 className="text-xl font-semibold tracking-tight">Employee</h1>
//           <p className="text-sm text-slate-600 dark:text-slate-300 truncate">
//             {employee ? (
//               <>
//                 <span className="font-semibold">{fullName(employee)}</span>
//                 {employee.employeeNumber ? (
//                   <span className="ml-2 text-slate-500 dark:text-slate-400">
//                     #{String(employee.employeeNumber)}
//                   </span>
//                 ) : null}
//                 <span className="ml-2 text-slate-500 dark:text-slate-400">•</span>
//                 <span className="ml-2 text-slate-600 dark:text-slate-300">
//                   {human(employee.employmentType ?? "—")}
//                 </span>
//               </>
//             ) : initialLoading ? (
//               "Loading employee record…"
//             ) : (
//               "Employee record not found or access restricted."
//             )}
//           </p>

//           <div className="mt-2 flex items-center gap-2">
//             {employee ? (
//               <StatusBadge status={employee.status} deleted={deleted} />
//             ) : null}
//             {employee?.workEmail ? (
//               <Badge variant="muted" className="rounded-full">
//                 {employee.workEmail}
//               </Badge>
//             ) : null}
//           </div>
//         </div>

//         {topActions}
//       </div>

//       {/* Main content card (Directory style) */}
//       <Card className="overflow-hidden">
//         <CardHeader className="border-b bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-950">
//           <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
//             <div>
//               <CardTitle className="text-base">Directory</CardTitle>
//               <CardDescription>
//                 Review employee data, assignments, addresses, emergency contacts, dependents, and documents.
//               </CardDescription>
//             </div>

//             {/* “Quick jump” instead of search */}
//             <div className="w-full md:w-[420px]">
//               <div className="rounded-xl border bg-white p-2 dark:border-slate-800 dark:bg-slate-950">
//                 <div className="flex flex-wrap gap-2">
//                   {TABS.map((t) => (
//                     <button
//                       key={t.key}
//                       type="button"
//                       onClick={() => setTab(t.key)}
//                       className={cn(
//                         "h-9 rounded-xl px-3 text-sm border transition",
//                         tab === t.key
//                           ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
//                           : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
//                       )}
//                     >
//                       {t.label}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//               <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
//                 <span>Tip: Use tabs to manage records quickly</span>
//                 <button
//                   type="button"
//                   className="hover:text-slate-700 dark:hover:text-slate-200"
//                   onClick={() => setTab("profile")}
//                 >
//                   Go to Profile
//                 </button>
//               </div>
//             </div>
//           </div>
//         </CardHeader>

//         <CardContent className="space-y-4 p-4 md:p-6">
//           {initialLoading ? (
//             <div className="rounded-xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
//               <LoadingSkeleton lines={10} />
//             </div>
//           ) : !employee ? (
//             <div className="rounded-xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
//               <EmptyState
//                 title="Employee not found"
//                 description="This record may have been removed or you lack access."
//               />
//             </div>
//           ) : tab === "profile" ? (
//             <PanelShell title="Profile" description="Overview and HR metadata.">
//               <ProfileTab employee={employee} />
//             </PanelShell>
//           ) : tab === "assignments" ? (
//             <PanelShell
//               title="Assignments"
//               description="Manage org unit, position, location, cost center, and manager."
//             >
//               <AssignmentsTab
//                 employee={employee}
//                 api={api}
//                 busyAny={busyAny}
//                 setBusyAction={setBusyAction}
//                 lookups={{ orgUnits, locations, positions, costCenters }}
//                 onRefresh={() => void load({ silent: true })}
//               />
//             </PanelShell>
//           ) : tab === "addresses" ? (
//             <PanelShell title="Addresses" description="Addresses on file for this employee.">
//               <AddressesTab
//                 employee={employee}
//                 api={api}
//                 busyAny={busyAny}
//                 setBusyAction={setBusyAction}
//                 onRefresh={() => void load({ silent: true })}
//               />
//             </PanelShell>
//           ) : tab === "emergency" ? (
//             <PanelShell title="Emergency" description="Emergency contacts for safety and HR.">
//               <EmergencyTab
//                 employee={employee}
//                 api={api}
//                 busyAny={busyAny}
//                 setBusyAction={setBusyAction}
//                 onRefresh={() => void load({ silent: true })}
//               />
//             </PanelShell>
//           ) : tab === "dependents" ? (
//             <PanelShell title="Dependents" description="Dependent records for benefits and HR.">
//               <DependentsTab
//                 employee={employee}
//                 api={api}
//                 busyAny={busyAny}
//                 setBusyAction={setBusyAction}
//                 onRefresh={() => void load({ silent: true })}
//               />
//             </PanelShell>
//           ) : (
//             <PanelShell title="Documents" description="Upload and verify employee documents.">
//               <DocumentsTab
//                 employee={employee}
//                 api={api}
//                 busyAny={busyAny}
//                 setBusyAction={setBusyAction}
//                 onRefresh={() => void load({ silent: true })}
//               />
//             </PanelShell>
//           )}
//         </CardContent>
//       </Card>

//       {/* Delete confirm */}
//       <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Delete employee</DialogTitle>
//             <DialogDescription>
//               Soft-delete <span className="font-semibold">{fullName(employee)}</span>. You can restore later.
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setRemoveOpen(false)} disabled={busyAny}>
//               Cancel
//             </Button>
//             <Button variant="destructive" onClick={() => void doDelete()} loading={busyAction === "delete"}>
//               Confirm delete
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Restore confirm */}
//       <Dialog open={restoreOpen} onOpenChange={setRestoreOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Restore employee</DialogTitle>
//             <DialogDescription>
//               Restore <span className="font-semibold">{fullName(employee)}</span> back to active records.
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setRestoreOpen(false)} disabled={busyAny}>
//               Cancel
//             </Button>
//             <Button onClick={() => void doRestore()} loading={busyAction === "restore"}>
//               <RotateCcw className="h-4 w-4" />
//               Restore
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Status dialog */}
//       <EmployeeChangeStatusDialog
//         open={statusOpen}
//         onOpenChange={setStatusOpen}
//         employee={employee}
//         busyAny={busyAny}
//         onSubmit={doChangeStatus}
//       />
//     </div>
//   );
// }

// /* ---------------------------------------
//  * Profile Tab
//  * -------------------------------------- */
// function ProfileTab({ employee }: { employee: EmployeeDetail }) {
//   const deleted = isDeleted(employee);

//   const left = [
//     { k: "Employee #", v: employee.employeeNumber ?? "—" },
//     { k: "Status", v: deleted ? "DELETED" : human(employee.status ?? "—") },
//     { k: "Employment Type", v: human(employee.employmentType ?? "—") },
//     { k: "Work Email", v: employee.workEmail ?? "—" },
//     { k: "Personal Email", v: employee.personalEmail ?? "—" },
//     { k: "Work Phone", v: employee.workPhone ?? "—" },
//     { k: "Personal Phone", v: employee.personalPhone ?? "—" },
//   ];

//   const right = [
//     { k: "Gender", v: human(employee.gender ?? "—") },
//     { k: "Marital Status", v: human(employee.maritalStatus ?? "—") },
//     { k: "DOB", v: employee.dob ?? "—" },
//     { k: "Hire Date", v: employee.hireDate ?? "—" },
//     { k: "Start Date", v: employee.startDate ?? "—" },
//     { k: "Updated", v: safeIso(employee.updatedAt) },
//   ];

//   return (
//     <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
//       <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
//         <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Overview</div>
//         <div className="mt-3 space-y-2">
//           {left.map((x) => (
//             <RowKV key={x.k} k={x.k} v={x.v} />
//           ))}
//         </div>
//       </section>

//       <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
//         <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Details</div>
//         <div className="mt-3 space-y-2">
//           {right.map((x) => (
//             <RowKV key={x.k} k={x.k} v={x.v} />
//           ))}
//         </div>
//       </section>

//       <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
//         <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Metadata</div>
//         <div className="mt-3">
//           <pre className="max-h-[260px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
//             {JSON.stringify(employee.metadata ?? {}, null, 2)}
//           </pre>
//         </div>
//       </section>
//     </div>
//   );
// }

// function RowKV({ k, v }: { k: string; v: string | number | null | undefined }) {
//   return (
//     <div className="flex items-start justify-between gap-4">
//       <div className="text-xs font-medium text-slate-500">{k}</div>
//       <div className="text-sm text-slate-900 dark:text-slate-50 text-right">
//         {String(v ?? "—")}
//       </div>
//     </div>
//   );
// }

// /* ---------------------------------------
//  * Assignments Tab
//  * -------------------------------------- */
// function AssignmentsTab({
//   employee,
//   api,
//   busyAny,
//   setBusyAction,
//   lookups,
//   onRefresh,
// }: {
//   employee: EmployeeDetail;
//   api: ReturnType<typeof useEmployeeManagement>;
//   busyAny: boolean;
//   setBusyAction: (v: BusyAction) => void;
//   lookups: { orgUnits: OrgUnit[]; locations: Location[]; positions: Position[]; costCenters: CostCenter[] };
//   onRefresh: () => void;
// }) {
//   const employeeId = employee.id;

//   const [rows, setRows] = React.useState<EmployeeAssignment[]>([]);
//   const [initialLoading, setInitialLoading] = React.useState(true);

//   const [createOpen, setCreateOpen] = React.useState(false);
//   const [edit, setEdit] = React.useState<EmployeeAssignment | null>(null);
//   const [removeTarget, setRemoveTarget] = React.useState<EmployeeAssignment | null>(null);
//   const [endTarget, setEndTarget] = React.useState<EmployeeAssignment | null>(null);
//   const [setPrimaryTarget, setSetPrimaryTarget] = React.useState<EmployeeAssignment | null>(null);

//   const load = React.useCallback(
//     async (opts?: { silent?: boolean }) => {
//       try {
//         setBusyAction("panel");
//         const res = await api.assignments.list(employeeId);
//         setRows(unwrapApi(res) as EmployeeAssignment[]);
//       } catch (e) {
//         console.error(e);
//         if (!opts?.silent) toast.error("Failed to load assignments");
//       } finally {
//         setInitialLoading(false);
//         setBusyAction(null);
//       }
//     },
//     [api.assignments, employeeId, setBusyAction]
//   );

//   React.useEffect(() => {
//     void load({ silent: true });
//   }, [load]);

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-wrap items-center justify-between gap-2">
//         <div className="text-sm text-slate-600 dark:text-slate-300">
//           Manage org unit, location, position, cost center assignments.
//         </div>
//         <div className="flex gap-2">
//           <Button variant="outline" onClick={() => void load()} disabled={busyAny}>
//             <RefreshCcw className="h-4 w-4" />
//             Refresh
//           </Button>
//           <Button onClick={() => setCreateOpen(true)} disabled={busyAny}>
//             <Plus className="h-4 w-4" />
//             Add assignment
//           </Button>
//         </div>
//       </div>

//       {initialLoading ? (
//         <div className="rounded-xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
//           <LoadingSkeleton lines={6} />
//         </div>
//       ) : rows.length === 0 ? (
//         <div className="rounded-xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
//           <EmptyState
//             title="No assignments"
//             description="Add an assignment to attach org structure, position, and location."
//             action={<Button onClick={() => setCreateOpen(true)}>Add assignment</Button>}
//           />
//         </div>
//       ) : (
//         <div className="overflow-hidden rounded-xl border bg-white dark:border-slate-800 dark:bg-slate-950">
//           <TableWrapper>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Primary</TableHead>
//                   <TableHead>Org Unit</TableHead>
//                   <TableHead>Position</TableHead>
//                   <TableHead>Location</TableHead>
//                   <TableHead>Cost Center</TableHead>
//                   <TableHead>Effective</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>

//               <TableBody>
//                 {rows.map((a) => (
//                   <TableRow key={a.id}>
//                     <TableCell>
//                       {a.isPrimary ? <Badge variant="success">PRIMARY</Badge> : <Badge variant="muted">—</Badge>}
//                     </TableCell>
//                     <TableCell>{a.orgUnit?.name ?? "—"}</TableCell>
//                     <TableCell>{a.position?.title ?? "—"}</TableCell>
//                     <TableCell>{a.location?.name ?? "—"}</TableCell>
//                     <TableCell>{a.costCenter?.name ?? "—"}</TableCell>
//                     <TableCell className="text-xs">
//                       <div>From: {a.effectiveFrom ?? "—"}</div>
//                       <div>To: {a.effectiveTo ?? "—"}</div>
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex flex-wrap justify-end gap-2">
//                         {!a.isPrimary ? (
//                           <Button size="sm" variant="outline" onClick={() => setSetPrimaryTarget(a)} disabled={busyAny}>
//                             Make primary
//                           </Button>
//                         ) : null}
//                         <Button size="sm" variant="outline" onClick={() => setEdit(a)} disabled={busyAny}>
//                           Edit
//                         </Button>
//                         <Button size="sm" variant="outline" onClick={() => setEndTarget(a)} disabled={busyAny}>
//                           End
//                         </Button>
//                         <Button size="sm" variant="destructive" onClick={() => setRemoveTarget(a)} disabled={busyAny}>
//                           Remove
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableWrapper>
//         </div>
//       )}

//       {/* dialogs */}
//       <AssignmentCreateEditDialog
//         open={createOpen}
//         onOpenChange={setCreateOpen}
//         mode="create"
//         lookups={lookups}
//         initial={null}
//         onSubmit={async (dto) => {
//           await api.assignments.create(employeeId, dto);
//           toast.success("Assignment created");
//           setCreateOpen(false);
//           await load({ silent: true });
//           onRefresh();
//         }}
//         busyAny={busyAny}
//       />

//       <AssignmentCreateEditDialog
//         open={Boolean(edit)}
//         onOpenChange={(o) => !o && setEdit(null)}
//         mode="edit"
//         lookups={lookups}
//         initial={edit}
//         onSubmit={async (dto) => {
//           if (!edit) return;
//           await api.assignments.update(edit.id, dto);
//           toast.success("Assignment updated");
//           setEdit(null);
//           await load({ silent: true });
//           onRefresh();
//         }}
//         busyAny={busyAny}
//       />

//       <ConfirmDialog
//         open={Boolean(setPrimaryTarget)}
//         onOpenChange={(o) => !o && setSetPrimaryTarget(null)}
//         title="Set primary assignment"
//         description="This will mark this assignment as the employee's primary assignment."
//         confirmText="Set primary"
//         busyAny={busyAny}
//         onConfirm={async () => {
//           if (!setPrimaryTarget) return;
//           await api.assignments.setPrimary(setPrimaryTarget.id);
//           toast.success("Primary assignment updated");
//           setSetPrimaryTarget(null);
//           await load({ silent: true });
//           onRefresh();
//         }}
//       />

//       <AssignmentEndDialog
//         open={Boolean(endTarget)}
//         onOpenChange={(o) => !o && setEndTarget(null)}
//         busyAny={busyAny}
//         onConfirm={async (effectiveTo) => {
//           if (!endTarget) return;
//           await api.assignments.end(endTarget.id, effectiveTo);
//           toast.success("Assignment ended");
//           setEndTarget(null);
//           await load({ silent: true });
//           onRefresh();
//         }}
//       />

//       <ConfirmDialog
//         open={Boolean(removeTarget)}
//         onOpenChange={(o) => !o && setRemoveTarget(null)}
//         title="Remove assignment"
//         description="This will remove the assignment record."
//         confirmText="Remove"
//         destructive
//         busyAny={busyAny}
//         onConfirm={async () => {
//           if (!removeTarget) return;
//           await api.assignments.remove(removeTarget.id);
//           toast.success("Assignment removed");
//           setRemoveTarget(null);
//           await load({ silent: true });
//           onRefresh();
//         }}
//       />
//     </div>
//   );
// }

// /* ---------------------------------------
//  * Addresses Tab
//  * -------------------------------------- */
// function AddressesTab({
//   employee,
//   api,
//   busyAny,
//   setBusyAction,
//   onRefresh,
// }: {
//   employee: EmployeeDetail;
//   api: ReturnType<typeof useEmployeeManagement>;
//   busyAny: boolean;
//   setBusyAction: (v: BusyAction) => void;
//   onRefresh: () => void;
// }) {
//   const employeeId = employee.id;

//   const [rows, setRows] = React.useState<EmployeeAddress[]>([]);
//   const [initialLoading, setInitialLoading] = React.useState(true);

//   const [createOpen, setCreateOpen] = React.useState(false);
//   const [edit, setEdit] = React.useState<EmployeeAddress | null>(null);
//   const [removeTarget, setRemoveTarget] = React.useState<EmployeeAddress | null>(null);
//   const [primaryTarget, setPrimaryTarget] = React.useState<EmployeeAddress | null>(null);

//   const load = React.useCallback(
//     async (opts?: { silent?: boolean }) => {
//       try {
//         setBusyAction("panel");
//         const res = await api.addresses.list(employeeId);
//         setRows(unwrapApi(res) as EmployeeAddress[]);
//       } catch (e) {
//         console.error(e);
//         if (!opts?.silent) toast.error("Failed to load addresses");
//       } finally {
//         setInitialLoading(false);
//         setBusyAction(null);
//       }
//     },
//     [api.addresses, employeeId, setBusyAction]
//   );

//   React.useEffect(() => {
//     void load({ silent: true });
//   }, [load]);

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-wrap items-center justify-between gap-2">
//         <div className="text-sm text-slate-600 dark:text-slate-300">Addresses on file.</div>
//         <div className="flex gap-2">
//           <Button variant="outline" onClick={() => void load()} disabled={busyAny}>
//             <RefreshCcw className="h-4 w-4" />
//             Refresh
//           </Button>
//           <Button onClick={() => setCreateOpen(true)} disabled={busyAny}>
//             <Plus className="h-4 w-4" />
//             Add address
//           </Button>
//         </div>
//       </div>

//       {initialLoading ? (
//         <div className="rounded-xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
//           <LoadingSkeleton lines={6} />
//         </div>
//       ) : rows.length === 0 ? (
//         <div className="rounded-xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
//           <EmptyState
//             title="No addresses"
//             description="Add an address (home, mailing, work)."
//             action={<Button onClick={() => setCreateOpen(true)}>Add address</Button>}
//           />
//         </div>
//       ) : (
//         <div className="overflow-hidden rounded-xl border bg-white dark:border-slate-800 dark:bg-slate-950">
//           <TableWrapper>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Primary</TableHead>
//                   <TableHead>Type</TableHead>
//                   <TableHead>Address</TableHead>
//                   <TableHead>Updated</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {rows.map((a) => (
//                   <TableRow key={a.id}>
//                     <TableCell>
//                       {a.isPrimary ? <Badge variant="success">PRIMARY</Badge> : <Badge variant="muted">—</Badge>}
//                     </TableCell>
//                     <TableCell>
//                       <Badge variant="muted">{human(a.type)}</Badge>
//                     </TableCell>
//                     <TableCell className="text-sm">
//                       {[a.line1, a.line2, a.city, a.state, a.postalCode, a.country]
//                         .filter(Boolean)
//                         .join(", ") || "—"}
//                     </TableCell>
//                     <TableCell>{safeIso(a.updatedAt ?? null)}</TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex flex-wrap justify-end gap-2">
//                         {!a.isPrimary ? (
//                           <Button size="sm" variant="outline" onClick={() => setPrimaryTarget(a)} disabled={busyAny}>
//                             Set primary
//                           </Button>
//                         ) : null}
//                         <Button size="sm" variant="outline" onClick={() => setEdit(a)} disabled={busyAny}>
//                           Edit
//                         </Button>
//                         <Button size="sm" variant="destructive" onClick={() => setRemoveTarget(a)} disabled={busyAny}>
//                           Remove
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableWrapper>
//         </div>
//       )}

//       <AddressCreateEditDialog
//         open={createOpen}
//         onOpenChange={setCreateOpen}
//         mode="create"
//         initial={null}
//         busyAny={busyAny}
//         onSubmit={async (dto) => {
//           await api.addresses.create(employeeId, dto as CreateEmployeeAddressDto);
//           toast.success("Address created");
//           setCreateOpen(false);
//           await load({ silent: true });
//           onRefresh();
//         }}
//       />

//       <AddressCreateEditDialog
//         open={Boolean(edit)}
//         onOpenChange={(o) => !o && setEdit(null)}
//         mode="edit"
//         initial={edit}
//         busyAny={busyAny}
//         onSubmit={async (dto) => {
//           if (!edit) return;
//           await api.addresses.update(edit.id, dto as UpdateEmployeeAddressDto);
//           toast.success("Address updated");
//           setEdit(null);
//           await load({ silent: true });
//           onRefresh();
//         }}
//       />

//       <ConfirmDialog
//         open={Boolean(primaryTarget)}
//         onOpenChange={(o) => !o && setPrimaryTarget(null)}
//         title="Set primary address"
//         description="This will mark this address as the primary address."
//         confirmText="Set primary"
//         busyAny={busyAny}
//         onConfirm={async () => {
//           if (!primaryTarget) return;
//           await api.addresses.setPrimary(primaryTarget.id);
//           toast.success("Primary address updated");
//           setPrimaryTarget(null);
//           await load({ silent: true });
//           onRefresh();
//         }}
//       />

//       <ConfirmDialog
//         open={Boolean(removeTarget)}
//         onOpenChange={(o) => !o && setRemoveTarget(null)}
//         title="Remove address"
//         description="This will remove the address record."
//         confirmText="Remove"
//         destructive
//         busyAny={busyAny}
//         onConfirm={async () => {
//           if (!removeTarget) return;
//           await api.addresses.remove(removeTarget.id);
//           toast.success("Address removed");
//           setRemoveTarget(null);
//           await load({ silent: true });
//           onRefresh();
//         }}
//       />
//     </div>
//   );
// }

// /* ---------------------------------------
//  * Emergency Tab
//  * -------------------------------------- */
// function EmergencyTab({
//   employee,
//   api,
//   busyAny,
//   setBusyAction,
//   onRefresh,
// }: {
//   employee: EmployeeDetail;
//   api: ReturnType<typeof useEmployeeManagement>;
//   busyAny: boolean;
//   setBusyAction: (v: BusyAction) => void;
//   onRefresh: () => void;
// }) {
//   const employeeId = employee.id;

//   const [rows, setRows] = React.useState<EmergencyContact[]>([]);
//   const [initialLoading, setInitialLoading] = React.useState(true);

//   const [createOpen, setCreateOpen] = React.useState(false);
//   const [edit, setEdit] = React.useState<EmergencyContact | null>(null);
//   const [removeTarget, setRemoveTarget] = React.useState<EmergencyContact | null>(null);
//   const [primaryTarget, setPrimaryTarget] = React.useState<EmergencyContact | null>(null);

//   const load = React.useCallback(
//     async (opts?: { silent?: boolean }) => {
//       try {
//         setBusyAction("panel");
//         const res = await api.emergencyContacts.list(employeeId);
//         setRows(unwrapApi(res) as EmergencyContact[]);
//       } catch (e) {
//         console.error(e);
//         if (!opts?.silent) toast.error("Failed to load emergency contacts");
//       } finally {
//         setInitialLoading(false);
//         setBusyAction(null);
//       }
//     },
//     [api.emergencyContacts, employeeId, setBusyAction]
//   );

//   React.useEffect(() => {
//     void load({ silent: true });
//   }, [load]);

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-wrap items-center justify-between gap-2">
//         <div className="text-sm text-slate-600 dark:text-slate-300">Emergency contacts on file.</div>
//         <div className="flex gap-2">
//           <Button variant="outline" onClick={() => void load()} disabled={busyAny}>
//             <RefreshCcw className="h-4 w-4" />
//             Refresh
//           </Button>
//           <Button onClick={() => setCreateOpen(true)} disabled={busyAny}>
//             <Plus className="h-4 w-4" />
//             Add contact
//           </Button>
//         </div>
//       </div>

//       {initialLoading ? (
//         <div className="rounded-xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
//           <LoadingSkeleton lines={6} />
//         </div>
//       ) : rows.length === 0 ? (
//         <div className="rounded-xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
//           <EmptyState
//             title="No emergency contacts"
//             description="Add at least one emergency contact for the employee."
//             action={<Button onClick={() => setCreateOpen(true)}>Add contact</Button>}
//           />
//         </div>
//       ) : (
//         <div className="overflow-hidden rounded-xl border bg-white dark:border-slate-800 dark:bg-slate-950">
//           <TableWrapper>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Primary</TableHead>
//                   <TableHead>Name</TableHead>
//                   <TableHead>Relationship</TableHead>
//                   <TableHead>Phone</TableHead>
//                   <TableHead>Email</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {rows.map((c) => (
//                   <TableRow key={c.id}>
//                     <TableCell>
//                       {c.isPrimary ? <Badge variant="success">PRIMARY</Badge> : <Badge variant="muted">—</Badge>}
//                     </TableCell>
//                     <TableCell className="font-semibold">{c.name ?? "—"}</TableCell>
//                     <TableCell>{c.relationship ?? "—"}</TableCell>
//                     <TableCell>{c.phone ?? "—"}</TableCell>
//                     <TableCell>{c.email ?? "—"}</TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex flex-wrap justify-end gap-2">
//                         {!c.isPrimary ? (
//                           <Button size="sm" variant="outline" onClick={() => setPrimaryTarget(c)} disabled={busyAny}>
//                             Set primary
//                           </Button>
//                         ) : null}
//                         <Button size="sm" variant="outline" onClick={() => setEdit(c)} disabled={busyAny}>
//                           Edit
//                         </Button>
//                         <Button size="sm" variant="destructive" onClick={() => setRemoveTarget(c)} disabled={busyAny}>
//                           Remove
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableWrapper>
//         </div>
//       )}

//       <EmergencyContactCreateEditDialog
//         open={createOpen}
//         onOpenChange={setCreateOpen}
//         mode="create"
//         initial={null}
//         busyAny={busyAny}
//         onSubmit={async (dto) => {
//           await api.emergencyContacts.create(employeeId, dto as CreateEmergencyContactDto);
//           toast.success("Contact created");
//           setCreateOpen(false);
//           await load({ silent: true });
//           onRefresh();
//         }}
//       />

//       <EmergencyContactCreateEditDialog
//         open={Boolean(edit)}
//         onOpenChange={(o) => !o && setEdit(null)}
//         mode="edit"
//         initial={edit}
//         busyAny={busyAny}
//         onSubmit={async (dto) => {
//           if (!edit) return;
//           await api.emergencyContacts.update(edit.id, dto);
//           toast.success("Contact updated");
//           setEdit(null);
//           await load({ silent: true });
//           onRefresh();
//         }}
//       />

//       <ConfirmDialog
//         open={Boolean(primaryTarget)}
//         onOpenChange={(o) => !o && setPrimaryTarget(null)}
//         title="Set primary emergency contact"
//         description="This will mark this emergency contact as the primary contact."
//         confirmText="Set primary"
//         busyAny={busyAny}
//         onConfirm={async () => {
//           if (!primaryTarget) return;
//           await api.emergencyContacts.setPrimary(primaryTarget.id);
//           toast.success("Primary contact updated");
//           setPrimaryTarget(null);
//           await load({ silent: true });
//           onRefresh();
//         }}
//       />

//       <ConfirmDialog
//         open={Boolean(removeTarget)}
//         onOpenChange={(o) => !o && setRemoveTarget(null)}
//         title="Remove emergency contact"
//         description="This will remove the contact record."
//         confirmText="Remove"
//         destructive
//         busyAny={busyAny}
//         onConfirm={async () => {
//           if (!removeTarget) return;
//           await api.emergencyContacts.remove(removeTarget.id);
//           toast.success("Contact removed");
//           setRemoveTarget(null);
//           await load({ silent: true });
//           onRefresh();
//         }}
//       />
//     </div>
//   );
// }

// /* ---------------------------------------
//  * Dependents Tab
//  * -------------------------------------- */
// function DependentsTab({
//   employee,
//   api,
//   busyAny,
//   setBusyAction,
//   onRefresh,
// }: {
//   employee: EmployeeDetail;
//   api: ReturnType<typeof useEmployeeManagement>;
//   busyAny: boolean;
//   setBusyAction: (v: BusyAction) => void;
//   onRefresh: () => void;
// }) {
//   const employeeId = employee.id;

//   const [rows, setRows] = React.useState<Dependent[]>([]);
//   const [initialLoading, setInitialLoading] = React.useState(true);

//   const [createOpen, setCreateOpen] = React.useState(false);
//   const [edit, setEdit] = React.useState<Dependent | null>(null);
//   const [removeTarget, setRemoveTarget] = React.useState<Dependent | null>(null);

//   const load = React.useCallback(
//     async (opts?: { silent?: boolean }) => {
//       try {
//         setBusyAction("panel");
//         const res = await api.dependents.list(employeeId);
//         setRows(unwrapApi(res) as Dependent[]);
//       } catch (e) {
//         console.error(e);
//         if (!opts?.silent) toast.error("Failed to load dependents");
//       } finally {
//         setInitialLoading(false);
//         setBusyAction(null);
//       }
//     },
//     [api.dependents, employeeId, setBusyAction]
//   );

//   React.useEffect(() => {
//     void load({ silent: true });
//   }, [load]);

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-wrap items-center justify-between gap-2">
//         <div className="text-sm text-slate-600 dark:text-slate-300">Dependents on file.</div>
//         <div className="flex gap-2">
//           <Button variant="outline" onClick={() => void load()} disabled={busyAny}>
//             <RefreshCcw className="h-4 w-4" />
//             Refresh
//           </Button>
//           <Button onClick={() => setCreateOpen(true)} disabled={busyAny}>
//             <Plus className="h-4 w-4" />
//             Add dependent
//           </Button>
//         </div>
//       </div>

//       {initialLoading ? (
//         <div className="rounded-xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
//           <LoadingSkeleton lines={6} />
//         </div>
//       ) : rows.length === 0 ? (
//         <div className="rounded-xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
//           <EmptyState
//             title="No dependents"
//             description="Add dependent records for benefits and HR tracking."
//             action={<Button onClick={() => setCreateOpen(true)}>Add dependent</Button>}
//           />
//         </div>
//       ) : (
//         <div className="overflow-hidden rounded-xl border bg-white dark:border-slate-800 dark:bg-slate-950">
//           <TableWrapper>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Name</TableHead>
//                   <TableHead>Relationship</TableHead>
//                   <TableHead>DOB</TableHead>
//                   <TableHead>Updated</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {rows.map((d) => (
//                   <TableRow key={d.id}>
//                     <TableCell className="font-semibold">{d.name ?? "—"}</TableCell>
//                     <TableCell>{d.relationship ?? "—"}</TableCell>
//                     <TableCell>{d.dob ?? "—"}</TableCell>
//                     <TableCell>{safeIso(d.updatedAt ?? null)}</TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex flex-wrap justify-end gap-2">
//                         <Button size="sm" variant="outline" onClick={() => setEdit(d)} disabled={busyAny}>
//                           Edit
//                         </Button>
//                         <Button size="sm" variant="destructive" onClick={() => setRemoveTarget(d)} disabled={busyAny}>
//                           Remove
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableWrapper>
//         </div>
//       )}

//       <DependentCreateEditDialog
//         open={createOpen}
//         onOpenChange={setCreateOpen}
//         mode="create"
//         initial={null}
//         busyAny={busyAny}
//         onSubmit={async (dto) => {
//           await api.dependents.create(employeeId, dto as CreateDependentDto);
//           toast.success("Dependent created");
//           setCreateOpen(false);
//           await load({ silent: true });
//           onRefresh();
//         }}
//       />

//       <DependentCreateEditDialog
//         open={Boolean(edit)}
//         onOpenChange={(o) => !o && setEdit(null)}
//         mode="edit"
//         initial={edit}
//         busyAny={busyAny}
//         onSubmit={async (dto) => {
//           if (!edit) return;
//           await api.dependents.update(edit.id, dto);
//           toast.success("Dependent updated");
//           setEdit(null);
//           await load({ silent: true });
//           onRefresh();
//         }}
//       />

//       <ConfirmDialog
//         open={Boolean(removeTarget)}
//         onOpenChange={(o) => !o && setRemoveTarget(null)}
//         title="Remove dependent"
//         description="This will remove the dependent record."
//         confirmText="Remove"
//         destructive
//         busyAny={busyAny}
//         onConfirm={async () => {
//           if (!removeTarget) return;
//           await api.dependents.remove(removeTarget.id);
//           toast.success("Dependent removed");
//           setRemoveTarget(null);
//           await load({ silent: true });
//           onRefresh();
//         }}
//       />
//     </div>
//   );
// }

// /* ---------------------------------------
//  * Documents Tab
//  * -------------------------------------- */
// function DocumentsTab({
//   employee,
//   api,
//   busyAny,
//   setBusyAction,
//   onRefresh,
// }: {
//   employee: EmployeeDetail;
//   api: ReturnType<typeof useEmployeeManagement>;
//   busyAny: boolean;
//   setBusyAction: (v: BusyAction) => void;
//   onRefresh: () => void;
// }) {
//   const employeeId = employee.id;

//   const [rows, setRows] = React.useState<EmployeeDocument[]>([]);
//   const [initialLoading, setInitialLoading] = React.useState(true);

//   const [createOpen, setCreateOpen] = React.useState(false);
//   const [verifyTarget, setVerifyTarget] = React.useState<EmployeeDocument | null>(null);
//   const [removeTarget, setRemoveTarget] = React.useState<EmployeeDocument | null>(null);

//   const load = React.useCallback(
//     async (opts?: { silent?: boolean }) => {
//       try {
//         setBusyAction("panel");
//         const res = await api.documents.list(employeeId);
//         setRows(unwrapApi(res) as EmployeeDocument[]);
//       } catch (e) {
//         console.error(e);
//         if (!opts?.silent) toast.error("Failed to load documents");
//       } finally {
//         setInitialLoading(false);
//         setBusyAction(null);
//       }
//     },
//     [api.documents, employeeId, setBusyAction]
//   );

//   React.useEffect(() => {
//     void load({ silent: true });
//   }, [load]);

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-wrap items-center justify-between gap-2">
//         <div className="text-sm text-slate-600 dark:text-slate-300">Employee documents.</div>
//         <div className="flex gap-2">
//           <Button variant="outline" onClick={() => void load()} disabled={busyAny}>
//             <RefreshCcw className="h-4 w-4" />
//             Refresh
//           </Button>
//           <Button onClick={() => setCreateOpen(true)} disabled={busyAny}>
//             <Plus className="h-4 w-4" />
//             Add document
//           </Button>
//         </div>
//       </div>

//       {initialLoading ? (
//         <div className="rounded-xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
//           <LoadingSkeleton lines={6} />
//         </div>
//       ) : rows.length === 0 ? (
//         <div className="rounded-xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
//           <EmptyState
//             title="No documents"
//             description="Upload documents like ID, passport, contract, offer letter."
//             action={<Button onClick={() => setCreateOpen(true)}>Add document</Button>}
//           />
//         </div>
//       ) : (
//         <div className="overflow-hidden rounded-xl border bg-white dark:border-slate-800 dark:bg-slate-950">
//           <TableWrapper>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Kind</TableHead>
//                   <TableHead>Title</TableHead>
//                   <TableHead>Issued</TableHead>
//                   <TableHead>Expires</TableHead>
//                   <TableHead>Verified</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {rows.map((d) => {
//                   const verified = Boolean(d.verifiedAt);
//                   return (
//                     <TableRow key={d.id}>
//                       <TableCell>
//                         <Badge variant="muted">{human(d.kind)}</Badge>
//                       </TableCell>
//                       <TableCell className="font-semibold">{d.title ?? "—"}</TableCell>
//                       <TableCell>{d.issuedAt ?? "—"}</TableCell>
//                       <TableCell>{d.expiresAt ?? "—"}</TableCell>
//                       <TableCell>
//                         {verified ? (
//                           <span className="inline-flex items-center gap-1 text-sm">
//                             <CheckCircle2 className="h-4 w-4" /> Verified
//                           </span>
//                         ) : (
//                           <span className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
//                             <XCircle className="h-4 w-4" /> Not verified
//                           </span>
//                         )}
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <div className="flex flex-wrap justify-end gap-2">
//                           <Button size="sm" variant="outline" onClick={() => setVerifyTarget(d)} disabled={busyAny}>
//                             Verify
//                           </Button>
//                           <Button size="sm" variant="destructive" onClick={() => setRemoveTarget(d)} disabled={busyAny}>
//                             Remove
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })}
//               </TableBody>
//             </Table>
//           </TableWrapper>
//         </div>
//       )}

//       <DocumentCreateDialog
//         open={createOpen}
//         onOpenChange={setCreateOpen}
//         busyAny={busyAny}
//         onSubmit={async (dto) => {
//           await api.documents.create(employeeId, dto);
//           toast.success("Document created");
//           setCreateOpen(false);
//           await load({ silent: true });
//           onRefresh();
//         }}
//       />

//       <DocumentVerifyDialog
//         open={Boolean(verifyTarget)}
//         onOpenChange={(o) => !o && setVerifyTarget(null)}
//         doc={verifyTarget}
//         busyAny={busyAny}
//         onSubmit={async (dto) => {
//           if (!verifyTarget) return;
//           await api.documents.verify(verifyTarget.id, dto);
//           toast.success("Document verification updated");
//           setVerifyTarget(null);
//           await load({ silent: true });
//           onRefresh();
//         }}
//       />

//       <ConfirmDialog
//         open={Boolean(removeTarget)}
//         onOpenChange={(o) => !o && setRemoveTarget(null)}
//         title="Remove document"
//         description="This will remove the document record."
//         confirmText="Remove"
//         destructive
//         busyAny={busyAny}
//         onConfirm={async () => {
//           if (!removeTarget) return;
//           await api.documents.remove(removeTarget.id);
//           toast.success("Document removed");
//           setRemoveTarget(null);
//           await load({ silent: true });
//           onRefresh();
//         }}
//       />
//     </div>
//   );
// }

// /* ---------------------------------------
//  * Shared Confirm Dialog
//  * -------------------------------------- */
// function ConfirmDialog({
//   open,
//   onOpenChange,
//   title,
//   description,
//   confirmText,
//   destructive,
//   busyAny,
//   onConfirm,
// }: {
//   open: boolean;
//   onOpenChange: (o: boolean) => void;
//   title: string;
//   description: string;
//   confirmText: string;
//   destructive?: boolean;
//   busyAny: boolean;
//   onConfirm: () => Promise<void> | void;
// }) {
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>{title}</DialogTitle>
//           <DialogDescription>{description}</DialogDescription>
//         </DialogHeader>
//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busyAny}>
//             Cancel
//           </Button>
//           <Button
//             variant={destructive ? "destructive" : "default"}
//             onClick={() => void onConfirm()}
//             disabled={busyAny}
//           >
//             {confirmText}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// /* ---------------------------------------
//  * Status Dialog
//  * -------------------------------------- */
// function EmployeeChangeStatusDialog({
//   open,
//   onOpenChange,
//   employee,
//   busyAny,
//   onSubmit,
// }: {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   employee: EmployeeDetail | null;
//   busyAny: boolean;
//   onSubmit: (dto: ChangeEmployeeStatusDto) => Promise<void> | void;
// }) {
//   const current = String(employee?.status ?? "ACTIVE") as EmployeeStatus;

//   const [status, setStatus] = React.useState<EmployeeStatus>(current);
//   const [terminationDate, setTerminationDate] = React.useState("");
//   const [terminationReason, setTerminationReason] = React.useState("");

//   React.useEffect(() => {
//     if (!open) return;
//     const cur = String(employee?.status ?? "ACTIVE") as EmployeeStatus;
//     setStatus(cur);
//     setTerminationDate("");
//     setTerminationReason("");
//   }, [open, employee]);

//   const needsTermination = status === "TERMINATED";
//   const canSave = !busyAny && (!needsTermination || Boolean(terminationDate.trim()));

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[560px]">
//         <DialogHeader>
//           <DialogTitle>Change employee status</DialogTitle>
//           <DialogDescription>
//             Update status for <span className="font-semibold">{fullName(employee)}</span>.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-3">
//           <SelectField label="Status" value={status} onChange={(v) => setStatus(v as EmployeeStatus)}>
//             {EMPLOYEE_STATUS_VALUES.map((s) => (
//               <option key={s} value={s}>
//                 {human(s)}
//               </option>
//             ))}
//           </SelectField>

//           {needsTermination ? (
//             <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
//               <div className="space-y-1">
//                 <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
//                   Termination date *
//                 </label>
//                 <input
//                   type="date"
//                   value={terminationDate}
//                   onChange={(e) => setTerminationDate(e.target.value)}
//                   className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
//                 />
//                 <div className="text-[11px] text-slate-500">Required when terminating.</div>
//               </div>

//               <Input
//                 label="Reason (optional)"
//                 value={terminationReason}
//                 onChange={(e) => setTerminationReason(e.target.value)}
//                 placeholder="e.g. Resignation"
//               />
//             </div>
//           ) : null}
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busyAny}>
//             Cancel
//           </Button>
//           <Button
//             onClick={() =>
//               void onSubmit({
//                 status,
//                 ...(needsTermination
//                   ? { terminationDate, terminationReason: terminationReason || undefined }
//                   : {}),
//               })
//             }
//             disabled={!canSave}
//           >
//             <ShieldCheck className="h-4 w-4" />
//             Save
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// /* ---------------------------------------
//  * Assignment dialogs
//  * -------------------------------------- */
// function AssignmentCreateEditDialog({
//   open,
//   onOpenChange,
//   mode,
//   initial,
//   lookups,
//   busyAny,
//   onSubmit,
// }: {
//   open: boolean;
//   onOpenChange: (o: boolean) => void;
//   mode: "create" | "edit";
//   initial: EmployeeAssignment | null;
//   lookups: { orgUnits: OrgUnit[]; locations: Location[]; positions: Position[]; costCenters: CostCenter[] };
//   busyAny: boolean;
//   onSubmit: (dto: CreateEmployeeAssignmentDto | UpdateEmployeeAssignmentDto) => Promise<void> | void;
// }) {
//   const [orgUnitId, setOrgUnitId] = React.useState("");
//   const [locationId, setLocationId] = React.useState("");
//   const [positionId, setPositionId] = React.useState("");
//   const [costCenterId, setCostCenterId] = React.useState("");
//   const [managerId, setManagerId] = React.useState("");
//   const [effectiveFrom, setEffectiveFrom] = React.useState("");
//   const [effectiveTo, setEffectiveTo] = React.useState("");
//   const [notes, setNotes] = React.useState("");

//   React.useEffect(() => {
//     if (!open) return;
//     setOrgUnitId(String(initial?.orgUnitId ?? ""));
//     setLocationId(String(initial?.locationId ?? ""));
//     setPositionId(String(initial?.positionId ?? ""));
//     setCostCenterId(String(initial?.costCenterId ?? ""));
//     setManagerId(String(initial?.managerId ?? ""));
//     setEffectiveFrom(String(initial?.effectiveFrom ?? ""));
//     setEffectiveTo(String(initial?.effectiveTo ?? ""));
//     setNotes(String(initial?.notes ?? ""));
//   }, [open, initial]);

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[720px]">
//         <DialogHeader>
//           <DialogTitle>{mode === "create" ? "Add assignment" : "Edit assignment"}</DialogTitle>
//           <DialogDescription>Attach org structure and job placement information.</DialogDescription>
//         </DialogHeader>

//         <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
//           <SelectField label="Org Unit" value={orgUnitId} onChange={setOrgUnitId}>
//             <option value="">—</option>
//             {lookups.orgUnits.map((x) => (
//               <option key={x.id} value={x.id}>
//                 {String(x.name ?? "—")}
//               </option>
//             ))}
//           </SelectField>

//           <SelectField label="Location" value={locationId} onChange={setLocationId}>
//             <option value="">—</option>
//             {lookups.locations.map((x) => (
//               <option key={x.id} value={x.id}>
//                 {String(x.name ?? "—")}
//               </option>
//             ))}
//           </SelectField>

//           <SelectField label="Position" value={positionId} onChange={setPositionId}>
//             <option value="">—</option>
//             {lookups.positions.map((x: any) => (
//               <option key={x.id} value={x.id}>
//                 {String(x.title ?? x.name ?? "—")}
//               </option>
//             ))}
//           </SelectField>

//           <SelectField label="Cost Center" value={costCenterId} onChange={setCostCenterId}>
//             <option value="">—</option>
//             {lookups.costCenters.map((x) => (
//               <option key={x.id} value={x.id}>
//                 {String(x.name ?? "—")}
//               </option>
//             ))}
//           </SelectField>

//           <EmployeeSelect
//             label="Manager (optional)"
//             value={managerId}
//             onChange={setManagerId}
//             placeholder="Search manager…"
//           />

//           <div className="grid grid-cols-2 gap-3">
//             <div className="space-y-1">
//               <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Effective From</label>
//               <input
//                 type="date"
//                 value={effectiveFrom}
//                 onChange={(e) => setEffectiveFrom(e.target.value)}
//                 className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
//               />
//             </div>

//             <div className="space-y-1">
//               <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Effective To</label>
//               <input
//                 type="date"
//                 value={effectiveTo}
//                 onChange={(e) => setEffectiveTo(e.target.value)}
//                 className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
//               />
//             </div>
//           </div>

//           <div className="md:col-span-2">
//             <Textarea
//               label="Notes (optional)"
//               value={notes}
//               onChange={(e) => setNotes(e.target.value)}
//               resize="y"
//               size="sm"
//               className="min-h-[96px]"
//               placeholder="Assignment notes..."
//             />
//           </div>
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busyAny}>
//             Cancel
//           </Button>
//           <Button
//             onClick={() =>
//               void onSubmit({
//                 orgUnitId: orgUnitId || null,
//                 locationId: locationId || null,
//                 positionId: positionId || null,
//                 costCenterId: costCenterId || null,
//                 managerId: managerId || null,
//                 effectiveFrom: effectiveFrom || undefined,
//                 effectiveTo: effectiveTo || null,
//                 notes: notes || null,
//               })
//             }
//             disabled={busyAny}
//           >
//             Save
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// function AssignmentEndDialog({
//   open,
//   onOpenChange,
//   busyAny,
//   onConfirm,
// }: {
//   open: boolean;
//   onOpenChange: (o: boolean) => void;
//   busyAny: boolean;
//   onConfirm: (effectiveTo: string) => Promise<void> | void;
// }) {
//   const [effectiveTo, setEffectiveTo] = React.useState("");

//   React.useEffect(() => {
//     if (!open) return;
//     setEffectiveTo("");
//   }, [open]);

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[520px]">
//         <DialogHeader>
//           <DialogTitle>End assignment</DialogTitle>
//           <DialogDescription>Provide an effective end date for this assignment.</DialogDescription>
//         </DialogHeader>

//         <div className="space-y-1">
//           <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Effective To</label>
//           <input
//             type="date"
//             value={effectiveTo}
//             onChange={(e) => setEffectiveTo(e.target.value)}
//             className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
//           />
//           <div className="text-[11px] text-slate-500">Required.</div>
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busyAny}>
//             Cancel
//           </Button>
//           <Button onClick={() => void onConfirm(effectiveTo)} disabled={busyAny || !effectiveTo.trim()}>
//             End assignment
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// /* ---------------------------------------
//  * Address dialogs
//  * -------------------------------------- */
// function AddressCreateEditDialog({
//   open,
//   onOpenChange,
//   mode,
//   initial,
//   busyAny,
//   onSubmit,
// }: {
//   open: boolean;
//   onOpenChange: (o: boolean) => void;
//   mode: "create" | "edit";
//   initial: EmployeeAddress | null;
//   busyAny: boolean;
//   onSubmit: (dto: CreateEmployeeAddressDto | UpdateEmployeeAddressDto) => Promise<void> | void;
// }) {
//   const [type, setType] = React.useState(String(initial?.type ?? "HOME"));
//   const [line1, setLine1] = React.useState("");
//   const [line2, setLine2] = React.useState("");
//   const [city, setCity] = React.useState("");
//   const [state, setState] = React.useState("");
//   const [postalCode, setPostalCode] = React.useState("");
//   const [country, setCountry] = React.useState("");

//   React.useEffect(() => {
//     if (!open) return;
//     setType(String(initial?.type ?? "HOME"));
//     setLine1(String(initial?.line1 ?? ""));
//     setLine2(String(initial?.line2 ?? ""));
//     setCity(String(initial?.city ?? ""));
//     setState(String(initial?.state ?? ""));
//     setPostalCode(String(initial?.postalCode ?? ""));
//     setCountry(String(initial?.country ?? ""));
//   }, [open, initial]);

//   const canSave = line1.trim().length > 0 || city.trim().length > 0;

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[720px]">
//         <DialogHeader>
//           <DialogTitle>{mode === "create" ? "Add address" : "Edit address"}</DialogTitle>
//           <DialogDescription>Store employee address information.</DialogDescription>
//         </DialogHeader>

//         <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
//           <SelectField label="Type" value={type} onChange={setType}>
//             <option value="HOME">Home</option>
//             <option value="MAILING">Mailing</option>
//             <option value="WORK">Work</option>
//             <option value="OTHER">Other</option>
//           </SelectField>

//           <Input label="Line 1" value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="Street address" />
//           <Input label="Line 2" value={line2} onChange={(e) => setLine2(e.target.value)} placeholder="Apt, suite, etc." />
//           <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
//           <Input label="State" value={state} onChange={(e) => setState(e.target.value)} />
//           <Input label="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
//           <Input label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busyAny}>
//             Cancel
//           </Button>
//           <Button
//             onClick={() =>
//               void onSubmit({
//                 type: (type || "HOME") as "HOME" | "MAILING" | "WORK" | "OTHER",
//                 line1: line1 || (mode === "edit" ? null : undefined),
//                 line2: line2 || (mode === "edit" ? null : undefined),
//                 city: city || (mode === "edit" ? null : undefined),
//                 state: state || (mode === "edit" ? null : undefined),
//                 postalCode: postalCode || (mode === "edit" ? null : undefined),
//                 country: country || (mode === "edit" ? null : undefined),
//               })
//             }
//             disabled={busyAny || !canSave}
//           >
//             Save
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// /* ---------------------------------------
//  * Emergency dialogs
//  * -------------------------------------- */
// function EmergencyContactCreateEditDialog({
//   open,
//   onOpenChange,
//   mode,
//   initial,
//   busyAny,
//   onSubmit,
// }: {
//   open: boolean;
//   onOpenChange: (o: boolean) => void;
//   mode: "create" | "edit";
//   initial: EmergencyContact | null;
//   busyAny: boolean;
//   onSubmit: (dto: CreateEmergencyContactDto | UpdateEmergencyContactDto) => Promise<void> | void;
// }) {
//   const [name, setName] = React.useState("");
//   const [relationship, setRelationship] = React.useState("");
//   const [phone, setPhone] = React.useState("");
//   const [email, setEmail] = React.useState("");
//   const [address, setAddress] = React.useState("");

//   React.useEffect(() => {
//     if (!open) return;
//     setName(String(initial?.name ?? ""));
//     setRelationship(String(initial?.relationship ?? ""));
//     setPhone(String(initial?.phone ?? ""));
//     setEmail(String(initial?.email ?? ""));
//     setAddress(String(initial?.address ?? ""));
//   }, [open, initial]);

//   const canSave = name.trim().length >= 2;

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[720px]">
//         <DialogHeader>
//           <DialogTitle>{mode === "create" ? "Add emergency contact" : "Edit emergency contact"}</DialogTitle>
//           <DialogDescription>Emergency contact details for HR and safety procedures.</DialogDescription>
//         </DialogHeader>

//         <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
//           <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
//           <Input label="Relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} />
//           <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
//           <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
//           <div className="md:col-span-2">
//             <Input label="Address (optional)" value={address} onChange={(e) => setAddress(e.target.value)} />
//           </div>
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busyAny}>
//             Cancel
//           </Button>
//           <Button
//             onClick={() =>
//               void onSubmit({
//                 name: name || (mode === "edit" ? undefined : ""),
//                 relationship: relationship || (mode === "edit" ? null : undefined),
//                 phone: phone || (mode === "edit" ? null : undefined),
//                 email: email || (mode === "edit" ? null : undefined),
//                 address: address || (mode === "edit" ? null : undefined),
//               })
//             }
//             disabled={busyAny || !canSave}
//           >
//             Save
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// /* ---------------------------------------
//  * Dependent dialogs
//  * -------------------------------------- */
// function DependentCreateEditDialog({
//   open,
//   onOpenChange,
//   mode,
//   initial,
//   busyAny,
//   onSubmit,
// }: {
//   open: boolean;
//   onOpenChange: (o: boolean) => void;
//   mode: "create" | "edit";
//   initial: Dependent | null;
//   busyAny: boolean;
//   onSubmit: (dto: CreateDependentDto | UpdateDependentDto) => Promise<void> | void;
// }) {
//   const [name, setName] = React.useState("");
//   const [relationship, setRelationship] = React.useState("");
//   const [dob, setDob] = React.useState("");

//   React.useEffect(() => {
//     if (!open) return;
//     setName(String(initial?.name ?? ""));
//     setRelationship(String(initial?.relationship ?? ""));
//     setDob(String(initial?.dob ?? ""));
//   }, [open, initial]);

//   const canSave = name.trim().length >= 2;

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[720px]">
//         <DialogHeader>
//           <DialogTitle>{mode === "create" ? "Add dependent" : "Edit dependent"}</DialogTitle>
//           <DialogDescription>Dependent data for benefits and HR tracking.</DialogDescription>
//         </DialogHeader>

//         <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
//           <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
//           <Input label="Relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} />
//           <div className="space-y-1">
//             <label className="text-xs font-medium text-slate-700 dark:text-slate-300">DOB (optional)</label>
//             <input
//               type="date"
//               value={dob}
//               onChange={(e) => setDob(e.target.value)}
//               className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
//             />
//           </div>
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busyAny}>
//             Cancel
//           </Button>
//           <Button
//             onClick={() =>
//               void onSubmit({
//                 name: name || (mode === "edit" ? undefined : ""),
//                 relationship: relationship || (mode === "edit" ? null : undefined),
//                 dob: dob || (mode === "edit" ? null : undefined),
//               } as CreateDependentDto | UpdateDependentDto)
//             }
//             disabled={busyAny || !canSave}
//           >
//             Save
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// /* ---------------------------------------
//  * Document dialogs
//  * -------------------------------------- */
// function DocumentCreateDialog({
//   open,
//   onOpenChange,
//   busyAny,
//   onSubmit,
// }: {
//   open: boolean;
//   onOpenChange: (o: boolean) => void;
//   busyAny: boolean;
//   onSubmit: (dto: CreateEmployeeDocumentDto) => Promise<void> | void;
// }) {
//   const [kind, setKind] = React.useState("ID_CARD");
//   const [title, setTitle] = React.useState("");
//   const [fileId, setFileId] = React.useState("");
//   const [issuedAt, setIssuedAt] = React.useState("");
//   const [expiresAt, setExpiresAt] = React.useState("");

//   React.useEffect(() => {
//     if (!open) return;
//     setKind("ID_CARD");
//     setTitle("");
//     setFileId("");
//     setIssuedAt("");
//     setExpiresAt("");
//   }, [open]);

//   const canSave = fileId.trim().length > 0;

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[720px]">
//         <DialogHeader>
//           <DialogTitle>Upload employee document</DialogTitle>
//           <DialogDescription>
//             Upload employee documents like ID, passport, contract, offer letter.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
//           <SelectField label="Kind" value={kind} onChange={setKind}>
//             {["ID_CARD","PASSPORT","CONTRACT","OFFER_LETTER","CV_RESUME","CERTIFICATION","OTHER"].map((k) => (
//               <option key={k} value={k}>{human(k)}</option>
//             ))}
//           </SelectField>

//           <Input
//             label="Title (optional)"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             placeholder="e.g. Passport Bio Page"
//           />

//         <FileIdPicker
//             label="Document file"
//             value={fileId}
//             onChange={setFileId}
//             enableCloudinaryUpload
//             cloudinaryOptions={{ folder: "logaxp/employees/documents", tags: ["employee-doc"] }}
//             store="dbId"   // ✅ new meaning (see below)
//             density="compact"
//             showPreview
//           />

//           <div className="grid grid-cols-2 gap-3">
//             <div className="space-y-1">
//               <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Issued At</label>
//               <input
//                 type="date"
//                 value={issuedAt}
//                 onChange={(e) => setIssuedAt(e.target.value)}
//                 className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
//               />
//             </div>
//             <div className="space-y-1">
//               <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Expires At</label>
//               <input
//                 type="date"
//                 value={expiresAt}
//                 onChange={(e) => setExpiresAt(e.target.value)}
//                 className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
//               />
//             </div>
//           </div>
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busyAny}>
//             Cancel
//           </Button>
//           <Button
//             onClick={() =>
//               void onSubmit({
//                 kind: kind as any,
//                 title: title || undefined,
//                 fileId: fileId.trim(),
//                 issuedAt: issuedAt || undefined,
//                 expiresAt: expiresAt || undefined,
//               })
//             }
//             disabled={busyAny || !canSave}
//           >
//             Save
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// function DocumentVerifyDialog({
//   open,
//   onOpenChange,
//   doc,
//   busyAny,
//   onSubmit,
// }: {
//   open: boolean;
//   onOpenChange: (o: boolean) => void;
//   doc: EmployeeDocument | null;
//   busyAny: boolean;
//   onSubmit: (dto: VerifyEmployeeDocumentDto) => Promise<void> | void;
// }) {
//   const [verified, setVerified] = React.useState(true);

//   React.useEffect(() => {
//     if (!open) return;
//     setVerified(true);
//   }, [open]);

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[520px]">
//         <DialogHeader>
//           <DialogTitle>Verify document</DialogTitle>
//           <DialogDescription>
//             Update verification for <span className="font-semibold">{doc?.title ?? human(doc?.kind ?? "Document")}</span>.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-2">
//           <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950">
//             <input
//               type="checkbox"
//               checked={verified}
//               onChange={(e) => setVerified(e.target.checked)}
//               className="h-4 w-4 rounded"
//             />
//             Mark as verified
//           </label>
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busyAny}>
//             Cancel
//           </Button>
//           <Button onClick={() => void onSubmit({ verified })} disabled={busyAny}>
//             Save
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }