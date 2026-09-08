// src/logaxp/components/site-admin/tenants/advanced/TenantFeatureFlagsEditor.tsx
"use client";

import * as React from "react";
import { Wand2, Save, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/logaxp/components/ui/card";
import { Textarea } from "@/logaxp/components/ui/textarea";
import { Button } from "@/logaxp/components/ui/button";
import { toast } from "@/logaxp/components/ui/toast";
import { parseJsonObject, safePrettyJson } from "./tenant-admin.helpers";

export function TenantFeatureFlagsEditor({
  value,
  onSave,
  loading,
}: {
  value: Record<string, unknown> | null;
  onSave: (next: Record<string, unknown>) => Promise<void> | void;
  loading?: boolean;
}) {
  const [json, setJson] = React.useState<string>(safePrettyJson(value));
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setJson(safePrettyJson(value));
    setError(null);
  }, [value]);

  const handleFormat = () => {
    const parsed = parseJsonObject(json);
    if (!parsed.ok) {
      setError(parsed.error);
      toast.error("Invalid JSON");
      return;
    }
    setJson(JSON.stringify(parsed.value, null, 2));
    setError(null);
    toast.success("JSON formatted");
  };

  const handleSave = async () => {
    const parsed = parseJsonObject(json);
    if (!parsed.ok) {
      setError(parsed.error);
      toast.error("Fix JSON before saving");
      return;
    }

    setError(null);
    await onSave(parsed.value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Flags</CardTitle>
        <CardDescription>
          Manage tenant-scoped feature toggles as JSON object (e.g. billing, chat, payroll modules).
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Textarea
          value={json}
          onChange={(e) => {
            setJson(e.target.value);
            if (error) setError(null);
          }}
          size="lg"
          resize="y"
          className="font-mono text-xs"
          error={error ?? undefined}
          hint="JSON object only. Example: { &quot;modules.chat&quot;: true, &quot;beta.newUI&quot;: false }"
        />
      </CardContent>

      <CardFooter className="justify-between">
        <div className="flex gap-2">
          <Button variant="outline" type="button" onClick={handleFormat}>
            <Wand2 className="h-4 w-4" />
            Format JSON
          </Button>
          <Button
            variant="ghost"
            type="button"
            onClick={() => {
              setJson(safePrettyJson(value));
              setError(null);
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        <Button type="button" onClick={() => void handleSave()} loading={loading}>
          <Save className="h-4 w-4" />
          Save Flags
        </Button>
      </CardFooter>
    </Card>
  );
}