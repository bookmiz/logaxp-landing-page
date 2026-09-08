"use client";

import * as React from "react";
import {
  Copy,
  KeyRound,
  RotateCw,
  Ban,
  Trash2,
  Pencil,
  Clock,
  CheckCircle2,
} from "lucide-react";

import { Card, CardContent } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { toast } from "@/logaxp/components/ui/toast";

import type { ApiKey } from "@/logaxp/lib/apiKeys/api-keys.types";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function isRevoked(k: ApiKey) {
  return !!k.revokedAt;
}

function isExpired(k: ApiKey) {
  if (!k.expiresAt) return false;
  return new Date(k.expiresAt).getTime() < Date.now();
}

function formatDate(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied");
  } catch {
    toast.error("Copy failed");
  }
}

export function ApiKeysTable({
  rows,
  loading,
  onEdit,
  onRotate,
  onRevoke,
  onDelete,
}: {
  rows: ApiKey[];
  loading?: boolean;
  onEdit: (k: ApiKey) => void;
  onRotate: (k: ApiKey) => void;
  onRevoke: (k: ApiKey) => void;
  onDelete: (k: ApiKey) => void;
}) {
  if (loading) {
    return (
      <Card className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <CardContent className="p-6 text-sm text-slate-500">Loading API keys...</CardContent>
      </Card>
    );
  }

  if (!rows.length) {
    return (
      <Card className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <CardContent className="p-6">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            No API keys yet. Create one to enable programmatic access.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Scopes</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Last used</th>
                <th className="px-4 py-3 text-left">Expires</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((k) => {
                const revoked = isRevoked(k);
                const expired = isExpired(k);
                const status = revoked ? "Revoked" : expired ? "Expired" : "Active";

                return (
                  <tr key={k.id} className="border-t border-slate-100 dark:border-slate-900">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 rounded-lg border border-slate-200 bg-white p-1.5 dark:border-slate-800 dark:bg-slate-950">
                          <KeyRound className="h-4 w-4 text-slate-700 dark:text-slate-200" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 dark:text-slate-50">{k.name}</div>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-mono">{k.id}</span>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50"
                              onClick={() => void copy(k.id)}
                              title="Copy id"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {(k.scopes ?? []).length ? (
                          k.scopes.map((s) => (
                            <Badge key={s} variant="muted" className="rounded-full font-mono text-[11px]">
                              {s}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <Badge
                        variant="muted"
                        className={cn(
                          "rounded-full",
                          revoked
                            ? "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200"
                            : expired
                            ? "border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200"
                            : "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/25 dark:text-emerald-200"
                        )}
                      >
                        {revoked ? <Ban className="mr-1 h-3.5 w-3.5" /> : expired ? <Clock className="mr-1 h-3.5 w-3.5" /> : <CheckCircle2 className="mr-1 h-3.5 w-3.5" />}
                        {status}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{formatDate(k.lastUsedAt)}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{formatDate(k.expiresAt)}</td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(k)}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>

                        <Button variant="outline" size="sm" onClick={() => onRotate(k)} disabled={revoked}>
                          <RotateCw className="h-4 w-4" />
                          Rotate
                        </Button>

                        <Button variant="outline" size="sm" onClick={() => onRevoke(k)} disabled={revoked}>
                          <Ban className="h-4 w-4" />
                          Revoke
                        </Button>

                        <Button variant="outline" size="sm" onClick={() => onDelete(k)}>
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}