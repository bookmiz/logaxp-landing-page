"use client";

import * as React from "react";
import { Shield, RefreshCw, Save } from "lucide-react";
import type { Tenant, TenantSettings, UpdateTenantSettingsInput } from "@/logaxp/lib/tenants/tenant.types";
import { useTenants } from "@/logaxp/hooks/useTenants";
import { toast } from "@/logaxp/components/ui/toast";
import { Button } from "@/logaxp/components/ui/button";
import { Textarea } from "@/logaxp/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";

type Props = {
  tenant: Tenant;
  onSettingsChange?: (settings: TenantSettings | null) => void;
};

type FormState = {
  enforceMfa: boolean;
  allowPasswordAuth: boolean;
  requireEmailVerify: boolean;

  passwordPolicyText: string;
  featureFlagsText: string;
  brandingText: string;
  retentionPolicyText: string;
};

function prettyJson(value: Record<string, unknown> | null | undefined) {
  if (!value) return "";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

function buildForm(settings: TenantSettings | null): FormState {
  return {
    enforceMfa: settings?.enforceMfa ?? false,
    allowPasswordAuth: settings?.allowPasswordAuth ?? true,
    requireEmailVerify: settings?.requireEmailVerify ?? true,
    passwordPolicyText: prettyJson(settings?.passwordPolicy),
    featureFlagsText: prettyJson(settings?.featureFlags),
    brandingText: prettyJson(settings?.branding),
    retentionPolicyText: prettyJson(settings?.retentionPolicy),
  };
}

function parseOptionalJson(text: string, label: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (parsed === null) return null;
    if (typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error(`${label} must be a JSON object`);
    }
    return parsed as Record<string, unknown>;
  } catch (e) {
    if (e instanceof Error && e.message.includes("must be a JSON object")) throw e;
    throw new Error(`${label} contains invalid JSON`);
  }
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="space-y-1">
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">{label}</div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          "relative mt-0.5 inline-flex h-6 w-11 items-center rounded-full transition-colors",
          checked ? "bg-slate-900 dark:bg-slate-100" : "bg-slate-300 dark:bg-slate-700",
        ].join(" ")}
      >
        <span
          className={[
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform dark:bg-slate-900",
            checked ? "translate-x-5" : "translate-x-0.5",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

export function TenantSettingsManager({ tenant, onSettingsChange }: Props) {
  const { getSettings, updateSettings } = useTenants();

  // ✅ CRITICAL: store callback in a ref so it doesn't trigger load/effect re-runs
  const onSettingsChangeRef = React.useRef(onSettingsChange);
  React.useEffect(() => {
    onSettingsChangeRef.current = onSettingsChange;
  }, [onSettingsChange]);

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [currentSettings, setCurrentSettings] = React.useState<TenantSettings | null>(tenant.settings ?? null);
  const [form, setForm] = React.useState<FormState>(buildForm(tenant.settings ?? null));

  // ✅ load depends ONLY on stable deps
  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);

      const data = await getSettings(tenant.id);

      setCurrentSettings(data);
      setForm(buildForm(data));

      // ✅ notify parent without causing hook dependency loop
      onSettingsChangeRef.current?.(data);
    } catch (e) {
      console.error(e);
      setLoadError("Failed to load tenant settings");
    } finally {
      setLoading(false);
    }
  }, [getSettings, tenant.id]);

  // ✅ reload when tenant.id changes
  React.useEffect(() => {
    void load();
  }, [load]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setForm(buildForm(currentSettings));
    toast.info("Form reset to last loaded values");
  };

  const handleSave = async () => {
    let payload: UpdateTenantSettingsInput;

    try {
      payload = {
        enforceMfa: form.enforceMfa,
        allowPasswordAuth: form.allowPasswordAuth,
        requireEmailVerify: form.requireEmailVerify,
        passwordPolicy: parseOptionalJson(form.passwordPolicyText, "Password policy"),
        featureFlags: parseOptionalJson(form.featureFlagsText, "Feature flags"),
        branding: parseOptionalJson(form.brandingText, "Branding"),
        retentionPolicy: parseOptionalJson(form.retentionPolicyText, "Retention policy"),
      };
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Invalid settings input");
      return;
    }

    try {
      setSaving(true);

      const updated = await updateSettings(payload, tenant.id);

      setCurrentSettings(updated);
      setForm(buildForm(updated));

      // ✅ notify parent without loop
      onSettingsChangeRef.current?.(updated);

      toast.success("Tenant settings saved");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save tenant settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Security & Authentication Settings
          </CardTitle>
          <CardDescription>Configure tenant-level auth behavior and policy objects.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">Loading settings...</div>
          ) : loadError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {loadError}
            </div>
          ) : (
            <>
              <ToggleRow
                label="Enforce MFA"
                description="Require multi-factor authentication for users in this tenant."
                checked={form.enforceMfa}
                onChange={(v) => setField("enforceMfa", v)}
              />

              <ToggleRow
                label="Allow Password Authentication"
                description="Allow local username/password sign-in for this tenant."
                checked={form.allowPasswordAuth}
                onChange={(v) => setField("allowPasswordAuth", v)}
              />

              <ToggleRow
                label="Require Email Verification"
                description="Users must verify their email before accessing tenant resources."
                checked={form.requireEmailVerify}
                onChange={(v) => setField("requireEmailVerify", v)}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Policy JSON</CardTitle>
          <CardDescription>
            Advanced settings objects. Leave blank to store <code>null</code>.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Textarea
            label="Password Policy"
            value={form.passwordPolicyText}
            onChange={(e) => setField("passwordPolicyText", e.target.value)}
            placeholder={`{\n  "minLength": 12,\n  "requireUppercase": true\n}`}
            resize="y"
            size="md"
            disabled={loading || saving}
          />

          <Textarea
            label="Feature Flags"
            value={form.featureFlagsText}
            onChange={(e) => setField("featureFlagsText", e.target.value)}
            placeholder={`{\n  "betaDashboard": true,\n  "advancedReports": false\n}`}
            resize="y"
            size="md"
            disabled={loading || saving}
          />

          <Textarea
            label="Branding"
            value={form.brandingText}
            onChange={(e) => setField("brandingText", e.target.value)}
            placeholder={`{\n  "primaryColor": "#0f172a",\n  "logoUrl": "https://..."\n}`}
            resize="y"
            size="md"
            disabled={loading || saving}
          />

          <Textarea
            label="Retention Policy"
            value={form.retentionPolicyText}
            onChange={(e) => setField("retentionPolicyText", e.target.value)}
            placeholder={`{\n  "auditLogsDays": 365,\n  "softDeleteDays": 30\n}`}
            resize="y"
            size="md"
            disabled={loading || saving}
          />

          <div className="xl:col-span-2 flex flex-wrap items-center justify-end gap-2">
            <Button variant="outline" onClick={() => void load()} disabled={saving}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload
            </Button>

            <Button variant="outline" onClick={handleReset} disabled={loading || saving}>
              Reset form
            </Button>

            <Button onClick={handleSave} loading={saving} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              Save settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}