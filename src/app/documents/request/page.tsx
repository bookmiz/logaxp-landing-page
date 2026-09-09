"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileText,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";

import { Badge } from "@/logaxp/components/ui/badge";
import { Button } from "@/logaxp/components/ui/button";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Input } from "@/logaxp/components/ui/input";
import { LoadingSkeleton } from "@/logaxp/components/ui/loading-skeleton";
import { toast } from "@/logaxp/components/ui/toast";
import { useEmployeeManagement } from "@/logaxp/hooks/useEmployeeManagement";
import {
  type ApiResult,
  type PublicEmployeeDocumentRequest,
} from "@/logaxp/lib/employee-management/employee-management.types";
import { api as httpApi } from "@/logaxp/lib/api/apiClient";

function unwrapApi<T>(result: ApiResult<T>): T {
  if (
    result &&
    typeof result === "object" &&
    "data" in result &&
    "statusCode" in result
  ) {
    return result.data as T;
  }

  return result as T;
}

function getErrorMessage(error: unknown) {
  if (typeof error === "string") return error;

  if (error && typeof error === "object") {
    const message = (error as { response?: { data?: { message?: unknown } } }).response?.data?.message;
    if (typeof message === "string" && message.trim()) return message;
    if (Array.isArray(message)) {
      const first = message.find((item) => typeof item === "string" && item.trim());
      if (typeof first === "string") return first;
    }

    const fallback = (error as { message?: unknown }).message;
    if (typeof fallback === "string" && fallback.trim()) return fallback;
  }

  return "Something went wrong";
}

function formatDate(value?: string | null) {
  if (!value) return "Not set";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
}

function formatEmployeeName(request: PublicEmployeeDocumentRequest) {
  const preferred = request.employee.preferredName?.trim();
  if (preferred) return preferred;

  const full = `${request.employee.firstName} ${request.employee.lastName}`.trim();
  return full || request.employee.employeeNumber || "Employee";
}

function requestStatusVariant(status?: PublicEmployeeDocumentRequest["status"]) {
  if (status === "SUBMITTED") return "success" as const;
  if (status === "EXPIRED") return "destructive" as const;
  if (status === "CANCELED") return "secondary" as const;
  return "warning" as const;
}

function PublicEmployeeDocumentRequestPageInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const api = useEmployeeManagement();

  const [request, setRequest] = React.useState<PublicEmployeeDocumentRequest | null>(null);
  const [loading, setLoading] = React.useState(Boolean(token));
  const [loadError, setLoadError] = React.useState<string | null>(
    token ? null : "Missing request token."
  );

  const [title, setTitle] = React.useState("");
  const [issuedAt, setIssuedAt] = React.useState("");
  const [expiresAt, setExpiresAt] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const [submitting, setSubmitting] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (!token) {
      setLoading(false);
      setLoadError("Missing request token.");
      return;
    }

    let cancelled = false;

    const loadRequest = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const response = await api.documents.getPublicRequest(token);
        const data = unwrapApi(response);

        if (cancelled) return;

        setRequest(data);
        setTitle(data.title ?? "");
      } catch (error) {
        if (cancelled) return;
        setLoadError(getErrorMessage(error));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadRequest();

    return () => {
      cancelled = true;
    };
  }, [api.documents, token]);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !request?.canSubmit) return;
    if (!selectedFile) {
      toast.error("Choose a file before submitting.");
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);

    try {
      const form = new FormData();
      form.append('file', selectedFile);
      const uploadResponse = await httpApi.post('/files/document-request/' + encodeURIComponent(token), form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: event => setUploadProgress(Math.round(100 * event.loaded / (event.total || selectedFile.size))),
      });
      const upload = uploadResponse.data.data ?? uploadResponse.data;
      await api.documents.submitPublicRequest(token, {
        title: title.trim() || undefined, issuedAt: issuedAt || undefined, expiresAt: expiresAt || undefined,
        fileId: upload.id,
      });

      setSubmitted(true);
      setRequest((current) =>
        current
          ? {
              ...current,
              canSubmit: false,
              status: "SUBMITTED",
              submittedAt: new Date().toISOString(),
            }
          : current
      );
      toast.success("Document submitted successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(163,217,0,0.18),_transparent_36%),linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_100%)] px-4 py-10 dark:bg-[radial-gradient(circle_at_top_left,_rgba(163,217,0,0.16),_transparent_32%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] sm:px-6">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[28px] border border-black/10 bg-white/85 p-6 shadow-[0_28px_80px_-42px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure document upload
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Submit requested employee document
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            This link lets you upload the requested file directly into the employee
            document cabinet. The request stays limited to this document and this
            employee.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-black/5 bg-white/75 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Request status
              </p>
              <div className="mt-3">
                <Badge variant={requestStatusVariant(request?.status)}>
                  {request?.status ?? "Loading"}
                </Badge>
              </div>
            </div>

            <div className="rounded-2xl border border-black/5 bg-white/75 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Due date
              </p>
              <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                {formatDate(request?.dueAt)}
              </p>
            </div>

            <div className="rounded-2xl border border-black/5 bg-white/75 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Request expires
              </p>
              <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                {formatDate(request?.expiresAt)}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200/80 bg-slate-50/90 p-5 dark:border-slate-800 dark:bg-slate-950/70">
            {loading ? (
              <LoadingSkeleton lines={7} />
            ) : loadError ? (
              <EmptyState
                compact
                icon={<CircleAlert className="h-5 w-5" />}
                title="Unable to load request"
                description={loadError}
              />
            ) : request ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Requested for
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    {formatEmployeeName(request)}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {request.tenant.name ?? "Your organization"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-2xl bg-slate-100 p-2 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Requested document
                      </p>
                      <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                        {request.documentLabel}
                      </p>
                      {request.notes ? (
                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {request.notes}
                        </p>
                      ) : (
                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          Upload a clear PDF or image copy of the requested document.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    This upload link is token-based. If it has expired or the request was
                    already completed, the submit form will lock automatically.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-[28px] border border-black/10 bg-white/92 p-6 shadow-[0_28px_80px_-42px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 sm:p-8">
          {loading ? (
            <LoadingSkeleton lines={9} />
          ) : loadError ? (
            <EmptyState
              icon={<CircleAlert className="h-5 w-5" />}
              title="Request unavailable"
              description={loadError}
            />
          ) : submitted || request?.status === "SUBMITTED" ? (
            <EmptyState
              icon={<CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />}
              title="Document submitted"
              description="The requested file has been received. You can close this page now."
            />
          ) : request && !request.canSubmit ? (
            <EmptyState
              icon={<CircleAlert className="h-6 w-6 text-amber-600 dark:text-amber-300" />}
              title="Submission unavailable"
              description="This request can no longer accept uploads. Ask your HR team for a new link if needed."
            />
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  <UploadCloud className="h-3.5 w-3.5" />
                  Upload requested file
                </div>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Send your document
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Choose the file and add dates if they apply to the document.
                </p>
              </div>

              <Input
                label="Document title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Optional title for the uploaded file"
                disabled={submitting}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Issued at
                  </label>
                  <input
                    type="date"
                    value={issuedAt}
                    onChange={(event) => setIssuedAt(event.target.value)}
                    disabled={submitting}
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors outline-none focus-visible:border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-900/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus-visible:border-slate-700 dark:focus-visible:ring-slate-50/15"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Expires at
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(event) => setExpiresAt(event.target.value)}
                    disabled={submitting}
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors outline-none focus-visible:border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-900/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus-visible:border-slate-700 dark:focus-visible:ring-slate-50/15"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  File upload
                </label>
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/50">
                  <input
                    type="file"
                    accept="application/pdf,image/png,image/jpeg"
                    onChange={onFileChange}
                    disabled={submitting}
                    className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-slate-800 dark:text-slate-200 dark:file:bg-slate-100 dark:file:text-slate-900 dark:hover:file:bg-slate-200"
                  />
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Supported upload types for this flow: PDF and common image formats.
                  </p>
                  {selectedFile ? (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                      {selectedFile.name} ({Math.max(1, Math.round(selectedFile.size / 1024))} KB)
                    </div>
                  ) : null}
                </div>
              </div>

              {submitting ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-700 dark:text-slate-200">
                    <span>Uploading document</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-slate-900 transition-[width] dark:bg-slate-100"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : null}

              <Button
                type="submit"
                size="lg"
                fullWidth
                loading={submitting}
                disabled={!selectedFile || !request?.canSubmit}
              >
                Submit document
              </Button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

export default function PublicEmployeeDocumentRequestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:px-6">
          <div className="mx-auto max-w-5xl rounded-[28px] border border-black/10 bg-white/90 p-8 dark:border-white/10 dark:bg-white/5">
            <LoadingSkeleton lines={10} />
          </div>
        </div>
      }
    >
      <PublicEmployeeDocumentRequestPageInner />
    </Suspense>
  );
}
