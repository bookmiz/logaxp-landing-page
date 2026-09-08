"use client";

import * as React from "react";
import {
  Plus,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  FolderOpen,
  BellRing,
} from "lucide-react";

import { LoadingSkeleton } from "@/logaxp/components/ui/loading-skeleton";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Input } from "@/logaxp/components/ui/input";
import { Textarea } from "@/logaxp/components/ui/textarea";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { toast } from "@/logaxp/components/ui/toast";
import { FileIdPicker } from "@/logaxp/components/file/FileIdPicker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper,
} from "@/logaxp/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/logaxp/components/ui/dialog";

import type {
  EmployeeDetail,
  EmployeeDocument,
  EmployeeDocumentFolder,
  EmployeeDocumentRequest,
  CreateEmployeeDocumentDto,
  CreateEmployeeDocumentRequestDto,
  VerifyEmployeeDocumentDto,
  EmployeeDocumentExpiryStatus,
  EmployeeDocumentRequestStatus,
} from "@/logaxp/lib/employee-management/employee-management.types";

import { unwrapApi, human, BusyAction, safeDate } from "./employee-detail.utils";
import { ConfirmDialog } from "./EmployeeSharedDialogs";

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
      >
        {children}
      </select>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "warning" | "destructive" | "success";
}) {
  return (
    <div className="rounded-xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div
        className={[
          "mt-2 text-2xl font-bold",
          tone === "warning"
            ? "text-amber-700 dark:text-amber-300"
            : tone === "destructive"
            ? "text-red-700 dark:text-red-300"
            : tone === "success"
            ? "text-emerald-700 dark:text-emerald-300"
            : "text-slate-900 dark:text-slate-50",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

function expiryBadgeVariant(status?: EmployeeDocumentExpiryStatus) {
  if (status === "expired") return "destructive" as const;
  if (status === "expiring") return "warning" as const;
  return "secondary" as const;
}

function requestBadgeVariant(status?: EmployeeDocumentRequestStatus) {
  if (status === "SUBMITTED") return "success" as const;
  if (status === "EXPIRED") return "destructive" as const;
  if (status === "CANCELED") return "secondary" as const;
  return "warning" as const;
}

function plusDaysInputValue(days: number) {
  const next = new Date();
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function EmployeeDocumentsTab({
  employee,
  api,
  busyAny,
  setBusyAction,
  onRefresh,
}: {
  employee: EmployeeDetail;
  api: ReturnType<typeof import("@/logaxp/hooks/useEmployeeManagement").useEmployeeManagement>;
  busyAny: boolean;
  setBusyAction: (v: BusyAction) => void;
  onRefresh: () => void;
}) {
  const employeeId = employee.id;

  const [folderData, setFolderData] = React.useState<EmployeeDocumentFolder | null>(null);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [daysAhead, setDaysAhead] = React.useState(30);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [requestOpen, setRequestOpen] = React.useState(false);
  const [verifyTarget, setVerifyTarget] = React.useState<EmployeeDocument | null>(null);
  const [removeTarget, setRemoveTarget] = React.useState<EmployeeDocument | null>(null);

  const rows = folderData?.documents ?? [];
  const requests = folderData?.requests ?? [];

  const load = React.useCallback(
    async (opts?: { silent?: boolean }) => {
      try {
        setBusyAction("panel");
        const res = await api.documents.getFolder(employeeId, { daysAhead });
        setFolderData(unwrapApi(res) as EmployeeDocumentFolder);
      } catch (e) {
        console.error(e);
        if (!opts?.silent) toast.error("Failed to load employee document folder");
      } finally {
        setInitialLoading(false);
        setBusyAction(null);
      }
    },
    [api.documents, daysAhead, employeeId, setBusyAction]
  );

  React.useEffect(() => {
    void load({ silent: true });
  }, [load]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Digital document cabinet
          </div>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Track employee documents, request missing files, and review expiry health.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SelectField
            label="Expiry window"
            value={String(daysAhead)}
            onChange={(v) => setDaysAhead(Number(v))}
          >
            <option value="14">14 days</option>
            <option value="30">30 days</option>
            <option value="60">60 days</option>
            <option value="90">90 days</option>
          </SelectField>

          <Button variant="outline" onClick={() => void load()} disabled={busyAny}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>

          <Button variant="outline" onClick={() => setRequestOpen(true)} disabled={busyAny}>
            <BellRing className="h-4 w-4" />
            Request document
          </Button>

          <Button onClick={() => setCreateOpen(true)} disabled={busyAny}>
            <Plus className="h-4 w-4" />
            Add document
          </Button>
        </div>
      </div>

      {folderData ? (
        <div className="rounded-xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                <FolderOpen className="h-4 w-4" />
                {folderData.folder.name}
              </div>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {folderData.folder.path}
              </div>
            </div>

            <div className="text-sm text-slate-600 dark:text-slate-300">
              Last activity: {safeDate(folderData.summary.lastActivityAt)}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
            <SummaryCard label="Documents" value={folderData.summary.documentCount} />
            <SummaryCard label="Pending Requests" value={folderData.summary.pendingRequestCount} tone="warning" />
            <SummaryCard label="Expiring Soon" value={folderData.summary.expiringCount} tone="warning" />
            <SummaryCard label="Expired" value={folderData.summary.expiredCount} tone="destructive" />
          </div>
        </div>
      ) : null}

      {initialLoading ? (
        <div className="rounded-xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <LoadingSkeleton lines={8} />
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Documents</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Stored files attached to this employee cabinet.
                </div>
              </div>
            </div>

            {rows.length === 0 ? (
              <div className="rounded-xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
                <EmptyState
                  title="No documents"
                  description="Upload documents like ID, passport, contract, or offer letter."
                  action={<Button onClick={() => setCreateOpen(true)}>Add document</Button>}
                />
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border bg-white dark:border-slate-800 dark:bg-slate-950">
                <TableWrapper>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kind</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Issued</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {rows.map((d) => {
                        const verified = Boolean(d.verifiedAt);
                        return (
                          <TableRow key={d.id}>
                            <TableCell>
                              <Badge variant="muted">{human(d.kind)}</Badge>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {d.title ?? d.documentLabel ?? "-"}
                            </TableCell>
                            <TableCell>{safeDate(d.issuedAt)}</TableCell>
                            <TableCell>{safeDate(d.expiresAt)}</TableCell>
                            <TableCell>
                              <Badge variant={expiryBadgeVariant(d.expiryStatus)}>
                                {human(d.expiryStatus ?? "current")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {verified ? (
                                <span className="inline-flex items-center gap-1 text-sm text-emerald-700 dark:text-emerald-300">
                                  <CheckCircle2 className="h-4 w-4" /> Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                                  <XCircle className="h-4 w-4" /> Not verified
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-wrap justify-end gap-2">
                                <Button size="sm" variant="outline" onClick={() => setVerifyTarget(d)} disabled={busyAny}>
                                  Verify
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => setRemoveTarget(d)} disabled={busyAny}>
                                  Remove
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableWrapper>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Document requests</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Outbound requests for missing or refreshed employee documents.
                </div>
              </div>
            </div>

            {requests.length === 0 ? (
              <div className="rounded-xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
                <EmptyState
                  title="No document requests"
                  description="Send a request when you need the employee to upload or refresh a document."
                  action={
                    <Button variant="outline" onClick={() => setRequestOpen(true)}>
                      Request document
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border bg-white dark:border-slate-800 dark:bg-slate-950">
                <TableWrapper>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kind</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Request Expires</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {requests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant="outline">{human(request.kind)}</Badge>
                              {request.title ? (
                                <div className="text-xs text-slate-500 dark:text-slate-400">{request.title}</div>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{request.recipientEmail}</TableCell>
                          <TableCell>{safeDate(request.dueAt)}</TableCell>
                          <TableCell>{safeDate(request.expiresAt)}</TableCell>
                          <TableCell>
                            <Badge variant={requestBadgeVariant(request.status)}>
                              {human(request.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>{safeDate(request.submittedAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableWrapper>
              </div>
            )}
          </div>
        </>
      )}

      <DocumentCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        busyAny={busyAny}
        onSubmit={async (dto) => {
          await api.documents.create(employeeId, dto);
          toast.success("Document created");
          setCreateOpen(false);
          await load({ silent: true });
          onRefresh();
        }}
      />

      <DocumentRequestCreateDialog
        open={requestOpen}
        onOpenChange={setRequestOpen}
        busyAny={busyAny}
        onSubmit={async (dto) => {
          const res = await api.documents.createRequest(employeeId, dto);
          const created = unwrapApi(res) as EmployeeDocumentRequest;
          const copied = created.publicLink ? await copyToClipboard(created.publicLink) : false;

          toast.success(
            copied
              ? "Document request created and public link copied"
              : "Document request created"
          );
          setRequestOpen(false);
          await load({ silent: true });
          onRefresh();
        }}
      />

      <DocumentVerifyDialog
        open={Boolean(verifyTarget)}
        onOpenChange={(o) => !o && setVerifyTarget(null)}
        doc={verifyTarget}
        busyAny={busyAny}
        onSubmit={async (dto) => {
          if (!verifyTarget) return;
          await api.documents.verify(verifyTarget.id, dto);
          toast.success("Document verification updated");
          setVerifyTarget(null);
          await load({ silent: true });
          onRefresh();
        }}
      />

      <ConfirmDialog
        open={Boolean(removeTarget)}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        title="Remove document"
        description="This will remove the document record."
        confirmText="Remove"
        destructive
        busyAny={busyAny}
        onConfirm={async () => {
          if (!removeTarget) return;
          await api.documents.remove(removeTarget.id);
          toast.success("Document removed");
          setRemoveTarget(null);
          await load({ silent: true });
          onRefresh();
        }}
      />
    </div>
  );
}

function DocumentCreateDialog({
  open,
  onOpenChange,
  busyAny,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  busyAny: boolean;
  onSubmit: (dto: CreateEmployeeDocumentDto) => Promise<void> | void;
}) {
  const [kind, setKind] = React.useState("ID_CARD");
  const [title, setTitle] = React.useState("");
  const [fileId, setFileId] = React.useState("");
  const [issuedAt, setIssuedAt] = React.useState("");
  const [expiresAt, setExpiresAt] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setKind("ID_CARD");
    setTitle("");
    setFileId("");
    setIssuedAt("");
    setExpiresAt("");
  }, [open]);

  const canSave = fileId.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Upload employee document</DialogTitle>
          <DialogDescription>
            Add a file directly into the employee document cabinet.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <SelectField label="Kind" value={kind} onChange={setKind}>
            {["ID_CARD", "PASSPORT", "CONTRACT", "OFFER_LETTER", "CV_RESUME", "CERTIFICATION", "OTHER"].map((k) => (
              <option key={k} value={k}>
                {human(k)}
              </option>
            ))}
          </SelectField>

          <Input
            label="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Passport Bio Page"
          />

          <FileIdPicker
            label="Document file"
            value={fileId}
            onChange={setFileId}
            enableCloudinaryUpload
            cloudinaryOptions={{ folder: "logaxp/employees/documents", tags: ["employee-doc"] }}
            accept=".pdf,image/*"
            maxSizeMB={15}
            density="compact"
            showPreview
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Issued At</label>
              <input
                type="date"
                value={issuedAt}
                onChange={(e) => setIssuedAt(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Expires At</label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busyAny}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              void onSubmit({
                kind: kind as CreateEmployeeDocumentDto["kind"],
                title: title || undefined,
                fileId: fileId.trim(),
                issuedAt: issuedAt || undefined,
                expiresAt: expiresAt || undefined,
              })
            }
            disabled={busyAny || !canSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DocumentRequestCreateDialog({
  open,
  onOpenChange,
  busyAny,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  busyAny: boolean;
  onSubmit: (dto: CreateEmployeeDocumentRequestDto) => Promise<void> | void;
}) {
  const [kind, setKind] = React.useState("ID_CARD");
  const [title, setTitle] = React.useState("");
  const [recipientEmail, setRecipientEmail] = React.useState("");
  const [dueAt, setDueAt] = React.useState("");
  const [requestExpiresAt, setRequestExpiresAt] = React.useState(plusDaysInputValue(14));
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setKind("ID_CARD");
    setTitle("");
    setRecipientEmail("");
    setDueAt("");
    setRequestExpiresAt(plusDaysInputValue(14));
    setNotes("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Create document request</DialogTitle>
          <DialogDescription>
            Send a secure public upload link so the employee can submit the requested file.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <SelectField label="Requested document" value={kind} onChange={setKind}>
            {["ID_CARD", "PASSPORT", "CONTRACT", "OFFER_LETTER", "CV_RESUME", "CERTIFICATION", "OTHER"].map((k) => (
              <option key={k} value={k}>
                {human(k)}
              </option>
            ))}
          </SelectField>

          <Input
            label="Recipient email (optional)"
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="Leave blank to use employee email"
          />

          <Input
            label="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Updated work permit"
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Due At</label>
              <input
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Request Expires</label>
              <input
                type="date"
                value={requestExpiresAt}
                onChange={(e) => setRequestExpiresAt(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <Textarea
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add extra context or instructions for the employee."
              resize="none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busyAny}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              void onSubmit({
                kind: kind as CreateEmployeeDocumentRequestDto["kind"],
                title: title || undefined,
                recipientEmail: recipientEmail.trim() || undefined,
                dueAt: dueAt || undefined,
                requestExpiresAt: requestExpiresAt || undefined,
                notes: notes.trim() || undefined,
              })
            }
            disabled={busyAny}
          >
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DocumentVerifyDialog({
  open,
  onOpenChange,
  doc,
  busyAny,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  doc: EmployeeDocument | null;
  busyAny: boolean;
  onSubmit: (dto: VerifyEmployeeDocumentDto) => Promise<void> | void;
}) {
  const [verified, setVerified] = React.useState(true);

  React.useEffect(() => {
    if (!open) return;
    setVerified(true);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Verify document</DialogTitle>
          <DialogDescription>
            Update verification for{" "}
            <span className="font-semibold">{doc?.title ?? doc?.documentLabel ?? human(doc?.kind ?? "Document")}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950">
            <input
              type="checkbox"
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
              className="h-4 w-4 rounded"
            />
            Mark as verified
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busyAny}>
            Cancel
          </Button>
          <Button onClick={() => void onSubmit({ verified })} disabled={busyAny}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
