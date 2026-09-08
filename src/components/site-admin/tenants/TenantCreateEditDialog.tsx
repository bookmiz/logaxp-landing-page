"use client";

import * as React from "react";
import { Building2, Globe2, Languages, Clock3 } from "lucide-react";
import type { Tenant, CreateTenantInput, UpdateTenantInput } from "@/logaxp/lib/tenants/tenant.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/logaxp/components/ui/dialog";
import { Input } from "@/logaxp/components/ui/input";
import { Button } from "@/logaxp/components/ui/button";

type FormState = {
  name: string;
  slug: string;
  timezone: string;
  locale: string;
  currency: string;
};

function toFormState(tenant?: Tenant | null): FormState {
  return {
    name: tenant?.name ?? "",
    slug: tenant?.slug ?? "",
    timezone: tenant?.timezone ?? "UTC",
    locale: tenant?.locale ?? "en-US",
    currency: tenant?.currency ?? "USD",
  };
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function TenantCreateEditDialog({
  open,
  onOpenChange,
  tenant,
  submitting,
  onCreate,
  onUpdate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant?: Tenant | null;
  submitting?: boolean;
  onCreate: (payload: CreateTenantInput) => Promise<void> | void;
  onUpdate: (tenantId: string, payload: UpdateTenantInput) => Promise<void> | void;
}) {
  const isEdit = Boolean(tenant?.id);

  const [form, setForm] = React.useState<FormState>(toFormState(tenant));
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({});

  React.useEffect(() => {
    if (!open) return;
    setForm(toFormState(tenant));
    setErrors({});
  }, [open, tenant]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};

    if (!form.name.trim()) next.name = "Tenant name is required";
    if (!isEdit && !form.slug.trim()) next.slug = "Slug is required";
    if (!form.timezone.trim()) next.timezone = "Timezone is required";
    if (!form.locale.trim()) next.locale = "Locale is required";
    if (!form.currency.trim()) next.currency = "Currency is required";

    // minimal format guards
    if (!isEdit && form.slug && !/^[a-z0-9-]+$/.test(form.slug)) {
      next.slug = "Use lowercase letters, numbers, and hyphens only";
    }

    if (form.currency && form.currency.length !== 3) {
      next.currency = "Use 3-letter currency code (e.g., USD, NGN)";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit && tenant) {
      await onUpdate(tenant.id, {
        name: form.name.trim(),
        timezone: form.timezone.trim(),
        locale: form.locale.trim(),
        currency: form.currency.trim().toUpperCase(),
      });
      return;
    }

    await onCreate({
      name: form.name.trim(),
      slug: form.slug.trim(),
      timezone: form.timezone.trim(),
      locale: form.locale.trim(),
      currency: form.currency.trim().toUpperCase(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Tenant" : "Create Tenant"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update tenant identity and regional settings."
              : "Create a new tenant organization for the platform."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Tenant Name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              error={errors.name}
              placeholder="Acme Corp"
              leftIcon={<Building2 className="h-4 w-4" />}
            />

            <Input
              label="Slug"
              value={form.slug}
              onChange={(e) => setField("slug", slugify(e.target.value))}
              error={errors.slug}
              placeholder="acme-corp"
              disabled={isEdit}
              hint={isEdit ? "Slug is typically immutable after creation" : "Lowercase letters, numbers, hyphens"}
              leftIcon={<Globe2 className="h-4 w-4" />}
            />

            <Input
              label="Timezone"
              value={form.timezone}
              onChange={(e) => setField("timezone", e.target.value)}
              error={errors.timezone}
              placeholder="America/Chicago"
              leftIcon={<Clock3 className="h-4 w-4" />}
            />

            <Input
              label="Locale"
              value={form.locale}
              onChange={(e) => setField("locale", e.target.value)}
              error={errors.locale}
              placeholder="en-US"
              leftIcon={<Languages className="h-4 w-4" />}
            />

            <Input
              label="Currency"
              value={form.currency}
              onChange={(e) => setField("currency", e.target.value.toUpperCase())}
              error={errors.currency}
              placeholder="USD"
              className="uppercase"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {isEdit ? "Save Changes" : "Create Tenant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}