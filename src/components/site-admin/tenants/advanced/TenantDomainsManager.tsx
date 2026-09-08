"use client";

import * as React from "react";
import {
  Globe,
  Plus,
  CheckCircle2,
  Star,
  Trash2,
  ShieldCheck,
  Search,
  RefreshCcw,
  Copy,
  AlertTriangle,
  CircleHelp,
} from "lucide-react";
import type { Tenant, TenantDomain } from "@/logaxp/lib/tenants/tenant.types";
import { useTenants } from "@/logaxp/hooks/useTenants";
import { toast } from "@/logaxp/components/ui/toast";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import { Pagination } from "@/logaxp/components/ui/pagination";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Badge } from "@/logaxp/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/logaxp/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/logaxp/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper,
} from "@/logaxp/components/ui/table";

type Props = {
  tenant: Tenant;
  onDomainsChange?: (domains: TenantDomain[]) => void;
};

type VerificationFilter = "ALL" | "VERIFIED" | "PENDING";

function normalizeDomain(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "www.") // keep explicit www if user enters it
    .replace(/\/+$/, "")
    .replace(/\/.*$/, "") // strip any path accidentally pasted
    .replace(/:\d+$/, ""); // strip port if pasted
}

function isProbablyDomain(value: string) {
  const v = normalizeDomain(value);

  // basic but flexible for subdomains
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(v)) return false;

  // reject obvious invalid patterns
  if (v.includes("..")) return false;
  if (v.startsWith(".") || v.endsWith(".")) return false;
  if (v.startsWith("-") || v.endsWith("-")) return false;

  return true;
}

function sortDomains(domains: TenantDomain[]) {
  return [...domains].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;

    const av = a.verifiedAt ? 0 : 1;
    const bv = b.verifiedAt ? 0 : 1;
    if (av !== bv) return av - bv;

    return a.domain.localeCompare(b.domain);
  });
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export function TenantDomainsManager({ tenant, onDomainsChange }: Props) {
  const { listDomains, addDomain, setPrimaryDomain, verifyDomain, removeDomain } = useTenants();

  const [domains, setDomains] = React.useState<TenantDomain[]>(sortDomains(tenant.domains ?? []));
  const [domainInput, setDomainInput] = React.useState("");
  const [loadingDomains, setLoadingDomains] = React.useState(false);
  const [makePrimary, setMakePrimary] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [busyDomainId, setBusyDomainId] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [verificationFilter, setVerificationFilter] = React.useState<VerificationFilter>("ALL");
  const [page, setPage] = React.useState(1);
  const pageSize = 8;

  const [removeTarget, setRemoveTarget] = React.useState<TenantDomain | null>(null);

  const publishDomains = React.useCallback(
  (next: TenantDomain[]) => {
    const sorted = sortDomains(next);

    setDomains((prev) => (domainsEqual(prev, sorted) ? prev : sorted));

    // only notify parent when it truly differs from what parent currently holds
    const parentSorted = sortDomains(tenant.domains ?? []);
    if (!domainsEqual(parentSorted, sorted)) {
      onDomainsChange?.(sorted);
    }
  },
  [onDomainsChange, tenant.domains]
);


  const loadDomainsFromServer = React.useCallback(
      async (opts?: { silent?: boolean }) => {
        try {
          setLoadingDomains(true);

          // fetch enough rows for this UI (client-side filters/paging still active)
          const res = await listDomains(
            {
              page: 1,
              pageSize: 200,
              sortBy: "createdAt",
              sortDir: "desc",
            },
            tenant.id
          );

          // support both paginated and array-shaped responses just in case
          const items = Array.isArray(res) ? res : res?.items ?? [];
          publishDomains(items);
        } catch (e) {
          console.error(e);
          if (!opts?.silent) {
            toast.error("Failed to load domains");
          }
        } finally {
          setLoadingDomains(false);
        }
      },
      [listDomains, tenant.id, publishDomains]
    );


    function domainsEqual(a: TenantDomain[], b: TenantDomain[]) {
  if (a.length !== b.length) return false;

  // assume both are already sorted
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];

    if (x.id !== y.id) return false;
    if (x.domain !== y.domain) return false;
    if (Boolean(x.isPrimary) !== Boolean(y.isPrimary)) return false;
    if ((x.verifiedAt ?? null) !== (y.verifiedAt ?? null)) return false;
    if ((x.createdAt ?? null) !== (y.createdAt ?? null)) return false;
  }
  return true;
}
   // 1) Fetch domains ONLY when tenant changes
React.useEffect(() => {
  void loadDomainsFromServer({ silent: true });
}, [tenant.id, loadDomainsFromServer]);

// 2) If parent pushes domains (e.g. other tab updated), sync local list (no fetch!)
React.useEffect(() => {
  setDomains((prev) => {
    const next = sortDomains(tenant.domains ?? []);
    return domainsEqual(prev, next) ? prev : next;
  });
}, [tenant.domains]);

  const normalizedInput = React.useMemo(() => normalizeDomain(domainInput), [domainInput]);

  const inputError = React.useMemo(() => {
    if (!domainInput.trim()) return null;
    if (!normalizedInput) return "Please enter a domain";
    if (!isProbablyDomain(normalizedInput)) return "Enter a valid domain (e.g. app.example.com)";
    if (domains.some((d) => d.domain.toLowerCase() === normalizedInput)) return "This domain already exists";
    return null;
  }, [domainInput, normalizedInput, domains]);

  const handleAdd = async () => {
    const normalized = normalizedInput;

    if (!normalized) {
      toast.error("Please enter a domain");
      return;
    }
    if (!isProbablyDomain(normalized)) {
      toast.error("Please enter a valid domain (e.g. app.example.com)");
      return;
    }
    if (domains.some((d) => d.domain.toLowerCase() === normalized)) {
      toast.error("This domain already exists for the tenant");
      return;
    }

    try {
      setSubmitting(true);

      const created = await addDomain(
        { domain: normalized, isPrimary: makePrimary },
        tenant.id
      );

      let next = [...domains, created];
      if (created.isPrimary) {
        next = next.map((d) => ({ ...d, isPrimary: d.id === created.id }));
      }

      publishDomains(next);
      await loadDomainsFromServer({ silent: true });
      setDomainInput("");
      setMakePrimary(false);
      toast.success("Domain added");
    } catch (e) {
      console.error(e);
      toast.error("Failed to add domain");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetPrimary = async (row: TenantDomain) => {
    try {
      setBusyDomainId(row.id);
      const updated = await setPrimaryDomain(row.id, tenant.id);

      const next = domains.map((d) =>
        d.id === updated.id ? { ...d, ...updated, isPrimary: true } : { ...d, isPrimary: false }
      );

      publishDomains(next);
      await loadDomainsFromServer({ silent: true });
      toast.success(`"${row.domain}" is now primary`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to set primary domain");
    } finally {
      setBusyDomainId(null);
    }
  };

  const handleVerify = async (row: TenantDomain) => {
    try {
      setBusyDomainId(row.id);
      const updated = await verifyDomain(row.id, tenant.id);

      const next = domains.map((d) => (d.id === updated.id ? { ...d, ...updated } : d));
      publishDomains(next);
      await loadDomainsFromServer({ silent: true });

      toast.success(`Verification updated for "${row.domain}"`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to verify domain");
    } finally {
      setBusyDomainId(null);
    }
  };

  const confirmRemove = (row: TenantDomain) => {
    if (row.isPrimary && domains.length > 1) {
      toast.error("Set another primary domain before removing the current primary domain");
      return;
    }
    setRemoveTarget(row);
  };

  const handleRemoveConfirmed = async () => {
    const row = removeTarget;
    if (!row) return;

    try {
      setBusyDomainId(row.id);
      await removeDomain(row.id, tenant.id);

      const next = domains.filter((d) => d.id !== row.id);
      publishDomains(next);
      await loadDomainsFromServer({ silent: true });
      toast.success(`Removed "${row.domain}"`);
      setRemoveTarget(null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove domain");
    } finally {
      setBusyDomainId(null);
    }
  };

  const handleCopyDomain = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Domain copied");
    } catch (e) {
      console.error(e);
      toast.error("Failed to copy domain");
    }
  };

    const resetLocalFromTenant = async () => {
      setSearch("");
      setVerificationFilter("ALL");
      setPage(1);
      await loadDomainsFromServer();
      toast.success("Domain list refreshed");
    };

  const filteredDomains = React.useMemo(() => {
    const q = search.trim().toLowerCase();

    return domains.filter((d) => {
      if (verificationFilter === "VERIFIED" && !d.verifiedAt) return false;
      if (verificationFilter === "PENDING" && d.verifiedAt) return false;

      if (!q) return true;

      return (
        d.domain.toLowerCase().includes(q) ||
        (d.isPrimary ? "primary" : "secondary").includes(q) ||
        (d.verifiedAt ? "verified" : "pending").includes(q)
      );
    });
  }, [domains, search, verificationFilter]);

  React.useEffect(() => {
    setPage(1);
  }, [search, verificationFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredDomains.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pagedDomains = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDomains.slice(start, start + pageSize);
  }, [filteredDomains, currentPage]);

  const stats = React.useMemo(() => {
    const total = domains.length;
    const verified = domains.filter((d) => !!d.verifiedAt).length;
    const pending = total - verified;
    const primary = domains.find((d) => d.isPrimary) ?? null;

    return { total, verified, pending, primary };
  }, [domains]);

  const canSubmit = !submitting && !!domainInput.trim() && !inputError;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4" />
              Total Domains
            </CardTitle>
            <CardDescription>Configured for this tenant</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-2xl font-black">{stats.total}</CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Verified</CardTitle>
            <CardDescription>DNS verified domains</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-2xl font-black">{stats.verified}</CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
            <CardDescription>Awaiting verification</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-2xl font-black">{stats.pending}</CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4" />
              Primary Domain
            </CardTitle>
            <CardDescription>Current primary route</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-sm font-semibold">
            {stats.primary?.domain ?? "—"}
          </CardContent>
        </Card>
      </div>

      {/* Add Domain */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            Domain Management
          </CardTitle>
          <CardDescription>
            Add and manage custom domains for this tenant. Set one domain as primary.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_auto_auto] xl:items-end">
            <Input
              label="Domain"
              placeholder="app.example.com"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              hint={
                inputError
                  ? inputError
                  : normalizedInput && normalizedInput !== domainInput.trim()
                    ? `Normalized: ${normalizedInput}`
                    : "Do not include https:// (pasting full URL is okay)"
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSubmit) {
                  e.preventDefault();
                  void handleAdd();
                }
              }}
            />

            <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-800">
              <input
                type="checkbox"
                checked={makePrimary}
                onChange={(e) => setMakePrimary(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              Set as primary
            </label>

            <Button onClick={handleAdd} loading={submitting} disabled={!canSubmit || loadingDomains} className="h-10">
              <Plus className="mr-2 h-4 w-4" />
              Add domain
            </Button>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
            <div className="flex items-start gap-2">
              <CircleHelp className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="space-y-1">
                <p className="font-medium">Verification flow</p>
                <p>
                  Add the domain → point DNS to your platform → click <strong>Verify</strong>. If the
                  domain is already verified, you can click Verify again to re-check status.
                </p>
                <p>
                  If a primary domain exists and there are multiple domains, set another primary before
                  removing the current primary.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domain List */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base">Tenant Domains</CardTitle>
              <CardDescription>
                Showing {filteredDomains.length} result{filteredDomains.length === 1 ? "" : "s"} (
                {domains.length} total)
              </CardDescription>
            </div>

            <Button variant="outline" onClick={() => void resetLocalFromTenant()} disabled={loadingDomains}>
            <RefreshCcw className="h-4 w-4" />
            {loadingDomains ? "Refreshing..." : "Reset view"}
          </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_220px]">
            <Input
              placeholder="Search domain, primary, verified..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />

            <Select
              value={verificationFilter}
              onValueChange={(v) => setVerificationFilter(v as VerificationFilter)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="VERIFIED">Verified</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {domains.length === 0 ? (
            <EmptyState
              title="No domains added yet"
              description="Add a custom domain above to start routing this tenant through branded URLs."
              icon={<Globe className="h-8 w-8" />}
              action={
                <Button
                  onClick={() => {
                    const el = document.querySelector<HTMLInputElement>('input[placeholder="app.example.com"]');
                    el?.focus();
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add first domain
                </Button>
              }
            />
          ) : filteredDomains.length === 0 ? (
            <EmptyState
              title="No matching domains"
              description="Try changing your search or status filter."
              icon={<Search className="h-8 w-8" />}
            />
          ) : (
            <>
              <TableWrapper>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead>Primary</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {pagedDomains.map((row) => {
                      const busy = busyDomainId === row.id;
                      const disableRemove = row.isPrimary && domains.length > 1;

                      return (
                        <TableRow key={row.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs sm:text-sm">{row.domain}</span>
                              <button
                                type="button"
                                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                                onClick={() => void handleCopyDomain(row.domain)}
                                title="Copy domain"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </TableCell>

                          <TableCell>
                            {row.isPrimary ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                                <Star className="h-3.5 w-3.5" />
                                Primary
                              </span>
                            ) : (
                              <Badge variant="muted">Secondary</Badge>
                            )}
                          </TableCell>

                          <TableCell>
                            {row.verifiedAt ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                                Pending
                              </span>
                            )}
                          </TableCell>

                          <TableCell>{formatDate(row.createdAt)}</TableCell>

                          <TableCell className="text-right">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              {!row.isPrimary ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => void handleSetPrimary(row)}
                                  loading={busy}
                                >
                                  <Star className="mr-1 h-4 w-4" />
                                  Make primary
                                </Button>
                              ) : null}

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => void handleVerify(row)}
                                loading={busy}
                              >
                                <ShieldCheck className="mr-1 h-4 w-4" />
                                {row.verifiedAt ? "Re-verify" : "Verify"}
                              </Button>

                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => confirmRemove(row)}
                                loading={busy}
                                disabled={disableRemove}
                                title={
                                  disableRemove
                                    ? "Set another primary domain before removing this one"
                                    : undefined
                                }
                              >
                                <Trash2 className="mr-1 h-4 w-4" />
                                Remove
                              </Button>
                            </div>

                            {disableRemove ? (
                              <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="h-3 w-3" />
                                Primary locked until another domain becomes primary
                              </div>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableWrapper>

              {filteredDomains.length > pageSize ? (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  disabled={Boolean(busyDomainId) || submitting || loadingDomains}
                />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      {/* Remove Confirm */}
      <Dialog open={Boolean(removeTarget)} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Domain</DialogTitle>
            <DialogDescription>
              This will remove{" "}
              <span className="font-mono text-xs">{removeTarget?.domain}</span> from this tenant.
              {removeTarget?.isPrimary ? " It is currently the primary domain." : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
            Make sure DNS traffic is no longer pointing to this domain before removing it.
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleRemoveConfirmed()}
              loading={busyDomainId === removeTarget?.id}
            >
              Confirm Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}