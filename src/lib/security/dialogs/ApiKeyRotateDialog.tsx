"use client";

import * as React from "react";
import { Copy, RotateCw, ShieldAlert } from "lucide-react";

import { toast } from "@/logaxp/components/ui/toast";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/logaxp/components/ui/dialog";

import type { ApiKey, RotateApiKeyResponse } from "@/logaxp/lib/apiKeys/api-keys.types";
import { useRotateApiKey } from "@/logaxp/hooks/useApiKeys";

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied");
  } catch {
    toast.error("Copy failed");
  }
}

export function ApiKeyRotateDialog({
  open,
  apiKey,
  onOpenChange,
}: {
  open: boolean;
  apiKey: ApiKey | null;
  onOpenChange: (v: boolean) => void;
}) {
  const m = useRotateApiKey();
  const [result, setResult] = React.useState<RotateApiKeyResponse | null>(null);

  React.useEffect(() => {
    if (!open) {
      setResult(null);
      m.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const rotate = async () => {
    if (!apiKey) return;
    try {
      const resp = await m.mutateAsync(apiKey.id);
      setResult(resp);
      toast.success("API key rotated");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to rotate API key");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCw className="h-4 w-4" />
            Rotate API key
          </DialogTitle>
          <DialogDescription>
            Rotation invalidates the old secret and issues a new one.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5" />
              <div>
                <div className="font-medium">This will invalidate the previous key</div>
                <div className="text-xs opacity-80">
                  Any clients using the old key will stop working until updated.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-5 w-5" />
                <div>
                  <div className="font-medium">Copy your new raw key now</div>
                  <div className="text-xs opacity-80">This is shown only once.</div>
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={m.isPending}>
            {result ? "Close" : "Cancel"}
          </Button>
          {!result ? (
            <Button onClick={() => void rotate()} loading={m.isPending}>
              Rotate
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}