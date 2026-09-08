"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

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
import { useDeleteApiKey } from "@/logaxp/hooks/useApiKeys";

export function ApiKeyDeleteDialog({
  open,
  apiKey,
  onOpenChange,
}: {
  open: boolean;
  apiKey: ApiKey | null;
  onOpenChange: (v: boolean) => void;
}) {
  const m = useDeleteApiKey();

  const remove = async () => {
    if (!apiKey) return;
    try {
      await m.mutateAsync(apiKey.id);
      toast.success("API key deleted");
      onOpenChange(false);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to delete API key");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Delete API key
          </DialogTitle>
          <DialogDescription>
            This permanently deletes the key record. If you just want to disable it, use revoke.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={m.isPending}>
            Cancel
          </Button>
          <Button onClick={() => void remove()} loading={m.isPending}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}