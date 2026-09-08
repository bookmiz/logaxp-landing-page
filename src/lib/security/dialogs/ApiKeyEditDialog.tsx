"use client";

import * as React from "react";
import { Pencil } from "lucide-react";

import { toast } from "@/logaxp/components/ui/toast";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/logaxp/components/ui/dialog";

import type { ApiKey } from "@/logaxp/lib/apiKeys/api-keys.types";  
import { useUpdateApiKey } from "@/logaxp/hooks/useApiKeys";

function parseScopes(input: string) {
  return input
    .split(/[,\n]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ApiKeyEditDialog({
  open,
  apiKey,
  onOpenChange,
}: {
  open: boolean;
  apiKey: ApiKey | null;
  onOpenChange: (v: boolean) => void;
}) {
  const m = useUpdateApiKey();

  const [name, setName] = React.useState("");
  const [scopesText, setScopesText] = React.useState("");
  const [expiresAt, setExpiresAt] = React.useState(""); // date input string

  React.useEffect(() => {
    if (open && apiKey) {
      setName(apiKey.name ?? "");
      setScopesText((apiKey.scopes ?? []).join(", "));
      setExpiresAt(apiKey.expiresAt ? new Date(apiKey.expiresAt).toISOString().slice(0, 10) : "");
      m.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, apiKey]);

  const submit = async () => {
    if (!apiKey) return;
    if (!name.trim()) return toast.error("Name is required");

    const scopes = parseScopes(scopesText);

    try {
      await m.mutateAsync({
        id: apiKey.id,
        payload: {
          name: name.trim(),
          scopes,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null, // clear if empty
        },
      });

      toast.success("API key updated");
      onOpenChange(false);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to update API key");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Edit API key
          </DialogTitle>
          <DialogDescription>Update name, scopes and expiration.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Scopes"
            value={scopesText}
            onChange={(e) => setScopesText(e.target.value)}
            hint="Comma or newline separated."
          />
          <Input
            label="Expires at"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            hint="Leave blank to remove expiration."
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={m.isPending}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} loading={m.isPending}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}