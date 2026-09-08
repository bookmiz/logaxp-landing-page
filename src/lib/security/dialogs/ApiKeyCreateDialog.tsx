"use client";

import * as React from "react";
import { Copy, KeyRound, ShieldAlert } from "lucide-react";

import { toast } from "@/logaxp/components/ui/toast";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import { Badge } from "@/logaxp/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/logaxp/components/ui/dialog";

import { useCreateApiKey } from "@/logaxp/hooks/useApiKeys";
import type { CreateApiKeyResponse } from "@/logaxp/lib/apiKeys/api-keys.types";

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied");
  } catch {
    toast.error("Copy failed");
  }
}

function parseScopes(input: string) {
  return input
    .split(/[,\n]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ApiKeyCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: (resp: CreateApiKeyResponse) => void;
}) {
  const m = useCreateApiKey();

  const [name, setName] = React.useState("");
  const [scopesText, setScopesText] = React.useState("");
  const [expiresAt, setExpiresAt] = React.useState(""); // ISO string or empty
  const [result, setResult] = React.useState<CreateApiKeyResponse | null>(null);

  React.useEffect(() => {
    if (!open) {
      setName("");
      setScopesText("");
      setExpiresAt("");
      setResult(null);
      m.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = async () => {
    if (!name.trim()) return toast.error("Name is required");

    const scopes = parseScopes(scopesText);
    try {
      const resp = await m.mutateAsync({
        name: name.trim(),
        ...(scopes.length ? { scopes } : {}),
        ...(expiresAt.trim() ? { expiresAt: new Date(expiresAt).toISOString() } : {}),
      });

      setResult(resp);
      onCreated?.(resp);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to create API key");
    }
  };

  const close = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Create API key
          </DialogTitle>
          <DialogDescription>
            Raw key will be shown <strong>one time only</strong>. Copy it immediately.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            <Input
              label="Name"
              placeholder="e.g. CI integration"
              value={name}
              onChange={(e) => setName(e.target.value)}
              hint="Human-friendly label."
            />

            <Input
              label="Scopes (optional)"
              placeholder="api_keys.read, api_keys.write"
              value={scopesText}
              onChange={(e) => setScopesText(e.target.value)}
              hint="Comma or newline separated."
            />

            <Input
              label="Expires at (optional)"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              hint="Leave blank for no expiration."
            />

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <div className="mb-1 font-medium">Preview</div>
              <pre className="overflow-x-auto">
                {JSON.stringify(
                  {
                    name: name.trim() || "(required)",
                    ...(parseScopes(scopesText).length ? { scopes: parseScopes(scopesText) } : {}),
                    ...(expiresAt ? { expiresAt } : {}),
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-5 w-5" />
                <div>
                  <div className="font-medium">Copy your raw key now</div>
                  <div className="text-xs opacity-80">
                    This is the only time you’ll see it. Store it securely.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-xs text-slate-500">rawKey</div>
                  <div className="mt-1 truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm dark:border-slate-800 dark:bg-slate-900">
                    {result.rawKey}
                  </div>
                </div>
                <Button variant="outline" onClick={() => void copy(result.rawKey)}>
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Badge variant="muted" className="rounded-full">
                  masked: <span className="ml-1 font-mono">{result.maskedKey}</span>
                </Badge>
                <Badge variant="muted" className="rounded-full">
                  id: <span className="ml-1 font-mono">{result.apiKey.id}</span>
                </Badge>
              </div>

              {result.warning ? (
                <div className="mt-3 text-xs text-slate-500">{result.warning}</div>
              ) : null}
            </div>
          </div>
        )}

        <DialogFooter>
          {!result ? (
            <>
              <Button variant="outline" onClick={close} disabled={m.isPending}>
                Cancel
              </Button>
              <Button onClick={() => void submit()} loading={m.isPending}>
                Create
              </Button>
            </>
          ) : (
            <Button onClick={close}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}