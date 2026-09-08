"use client";

import * as React from "react";
import { Ban } from "lucide-react";

import { toast } from "@/logaxp/components/ui/toast";
import { Button } from "@/logaxp/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/logaxp/components/ui/dialog";

import type { ApiKey } from "@/logaxp/lib/apiKeys/api-keys.types";
import { useRevokeApiKey } from "@/logaxp/hooks/useApiKeys";

export function ApiKeyRevokeDialog({
  open,
  apiKey,
  onOpenChange,
}: {
  open: boolean;
  apiKey: ApiKey | null;
  onOpenChange: (v: boolean) => void;
}) {
  const m = useRevokeApiKey();

  const revoke = async () => {
    if (!apiKey) return;
    try {
      const res = await m.mutateAsync(apiKey.id);
      toast.success(res.alreadyRevoked ? "Already revoked" : "API key revoked");
      onOpenChange(false);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to revoke API key");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="h-4 w-4" />
            Revoke API key
          </DialogTitle>
          <DialogDescription>
            This will immediately disable the key. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={m.isPending}>
            Cancel
          </Button>
          <Button onClick={() => void revoke()} loading={m.isPending}>
            Revoke
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}