"use client";

import * as React from "react";
import { KeyRound, Search, ShieldAlert } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import { toast } from "@/logaxp/components/ui/toast";

import { useApiKeys } from "@/logaxp/hooks/useApiKeys";
import type { ApiKey } from "@/logaxp/lib/apiKeys/api-keys.types";
import { ApiKeyCreateDialog } from "./dialogs/ApiKeyCreateDialog";
import { ApiKeyEditDialog } from "./dialogs/ApiKeyEditDialog";
import { ApiKeyRotateDialog } from "./dialogs/ApiKeyRotateDialog";
import { ApiKeyRevokeDialog } from "./dialogs/ApiKeyRevokeDialog";
import { ApiKeyDeleteDialog } from "./dialogs/ApiKeyDeleteDialog";
import { ApiKeysTable } from "./ApiKeysTable";

function isRevoked(k: ApiKey) {
  return !!k.revokedAt;
}

function isExpired(k: ApiKey) {
  if (!k.expiresAt) return false;
  return new Date(k.expiresAt).getTime() < Date.now();
}

export function ApiKeysManager() {
  const [q, setQ] = React.useState("");
  const { data, isLoading, isError, refetch } = useApiKeys({ q: q.trim() || undefined });

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<ApiKey | null>(null);
  const [rotateTarget, setRotateTarget] = React.useState<ApiKey | null>(null);
  const [revokeTarget, setRevokeTarget] = React.useState<ApiKey | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<ApiKey | null>(null);

  // global events from page buttons
  React.useEffect(() => {
    const onRefresh = () => void refetch();
    const onCreate = () => setCreateOpen(true);

    window.addEventListener("apiKeys:refresh", onRefresh);
    window.addEventListener("apiKeys:create", onCreate);

    return () => {
      window.removeEventListener("apiKeys:refresh", onRefresh);
      window.removeEventListener("apiKeys:create", onCreate);
    };
  }, [refetch]);

  const keys = data ?? [];

  const counts = React.useMemo(() => {
    let active = 0;
    let revoked = 0;
    let expired = 0;

    for (const k of keys) {
      if (isRevoked(k)) revoked++;
      else if (isExpired(k)) expired++;
      else active++;
    }
    return { active, revoked, expired, total: keys.length };
  }, [keys]);

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4" />
            Keys
          </CardTitle>
          <CardDescription>
            Active: <span className="font-medium">{counts.active}</span> • Expired:{" "}
            <span className="font-medium">{counts.expired}</span> • Revoked:{" "}
            <span className="font-medium">{counts.revoked}</span> • Total:{" "}
            <span className="font-medium">{counts.total}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:max-w-md">
            <Input
              label="Search"
              placeholder="Search by name or scope…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              hint="Type to filter keys (server-side)."
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => void refetch()}>
              Refresh
            </Button>
            <Button onClick={() => setCreateOpen(true)}>Create API key</Button>
          </div>
        </CardContent>
      </Card>

      {isError ? (
        <Card className="rounded-2xl border border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/30">
          <CardContent className="flex items-start gap-3 p-4 text-sm text-rose-800 dark:text-rose-200">
            <ShieldAlert className="h-5 w-5" />
            <div className="space-y-1">
              <div className="font-medium">Failed to load API keys</div>
              <div className="text-xs opacity-80">Check permissions (api_keys.read) and try again.</div>
            </div>
            <div className="ml-auto">
              <Button variant="outline" onClick={() => void refetch()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <ApiKeysTable
        rows={keys}
        loading={isLoading}
        onEdit={(k) => setEditTarget(k)}
        onRotate={(k) => setRotateTarget(k)}
        onRevoke={(k) => setRevokeTarget(k)}
        onDelete={(k) => setDeleteTarget(k)}
      />

      {/* dialogs */}
      <ApiKeyCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(resp) => {
          toast.success("API key created");
          // show raw key dialog immediately
          toast.info(resp.warning || "Copy the raw key now — it won’t be shown again.");
        }}
      />

      <ApiKeyEditDialog open={!!editTarget} apiKey={editTarget} onOpenChange={() => setEditTarget(null)} />
      <ApiKeyRotateDialog open={!!rotateTarget} apiKey={rotateTarget} onOpenChange={() => setRotateTarget(null)} />
      <ApiKeyRevokeDialog open={!!revokeTarget} apiKey={revokeTarget} onOpenChange={() => setRevokeTarget(null)} />
      <ApiKeyDeleteDialog open={!!deleteTarget} apiKey={deleteTarget} onOpenChange={() => setDeleteTarget(null)} />
    </div>
  );
}