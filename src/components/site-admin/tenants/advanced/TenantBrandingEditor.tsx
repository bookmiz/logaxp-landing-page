"use client";

import * as React from "react";
import {
  Palette,
  Save,
  RotateCcw,
  Wand2,
  AlertTriangle,
  Image as ImageIcon,
  UploadCloud,
  Copy,
  X,
  ExternalLink,
  Sparkles,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/logaxp/components/ui/card";
import { Input } from "@/logaxp/components/ui/input";
import { Textarea } from "@/logaxp/components/ui/textarea";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { toast } from "@/logaxp/components/ui/toast";

import { parseJsonObject, safePrettyJson } from "./tenant-admin.helpers";
import { uploadImage } from "@/logaxp/utils/cloudinary";

type BrandingShape = {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string; // stored in payload
  appName?: string;
  [key: string]: unknown;
};

function isColorLike(value?: string) {
  if (!value) return true;
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
}

function safeColor(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  return isColorLike(value) ? value.trim() : fallback;
}

function normalizeBrandingPayload(payload: BrandingShape, extras: Record<string, unknown>) {
  const obj = {
    ...extras,
    ...(payload.appName ? { appName: payload.appName } : {}),
    ...(payload.logoUrl ? { logoUrl: payload.logoUrl } : {}),
    ...(payload.primaryColor ? { primaryColor: payload.primaryColor } : {}),
    ...(payload.secondaryColor ? { secondaryColor: payload.secondaryColor } : {}),
  };
  return JSON.stringify(obj, Object.keys(obj).sort());
}

function bytesToMb(n: number) {
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function fileLooksLikeImage(file: File) {
  return Boolean(file.type?.startsWith("image/"));
}

export function TenantBrandingEditor({
  value,
  onSave,
  loading,
}: {
  value: Record<string, unknown> | null;
  onSave: (next: Record<string, unknown>) => Promise<void> | void;
  loading?: boolean;
}) {
  const initial = React.useMemo<BrandingShape>(() => {
    const v = (value ?? {}) as BrandingShape;
    return {
      ...v,
      primaryColor: typeof v.primaryColor === "string" ? v.primaryColor : "",
      secondaryColor: typeof v.secondaryColor === "string" ? v.secondaryColor : "",
      logoUrl: typeof v.logoUrl === "string" ? v.logoUrl : "",
      appName: typeof v.appName === "string" ? v.appName : "",
    };
  }, [value]);

  const initialExtrasJson = React.useMemo(() => {
    const extras: Record<string, unknown> = { ...initial };
    delete extras.primaryColor;
    delete extras.secondaryColor;
    delete extras.logoUrl;
    delete extras.appName;
    return safePrettyJson(extras);
  }, [initial]);

  const [form, setForm] = React.useState<BrandingShape>(initial);
  const [extraJson, setExtraJson] = React.useState<string>(initialExtrasJson);
  const [error, setError] = React.useState<string | null>(null);

  // logo preview handling
  const [logoPreviewFailed, setLogoPreviewFailed] = React.useState(false);
  const [localLogoPreviewUrl, setLocalLogoPreviewUrl] = React.useState<string | null>(null);

  // upload state
  const [uploading, setUploading] = React.useState(false);
  const [uploadHint, setUploadHint] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const dropRef = React.useRef<HTMLDivElement | null>(null);

  // cleanup object URL on unmount
  React.useEffect(() => {
    return () => {
      if (localLogoPreviewUrl) URL.revokeObjectURL(localLogoPreviewUrl);
    };
  }, [localLogoPreviewUrl]);

  React.useEffect(() => {
    setForm(initial);
    setExtraJson(initialExtrasJson);
    setError(null);
    setLogoPreviewFailed(false);

    // The dedicated preview effect revokes the previous object URL.
    setLocalLogoPreviewUrl(null);
    setUploadHint(null);
    setUploading(false);
  }, [initial, initialExtrasJson]);

  const parsedExtras = React.useMemo(() => parseJsonObject(extraJson), [extraJson]);

  const primaryColorError = React.useMemo(() => {
    if (!form.primaryColor) return null;
    return isColorLike(form.primaryColor) ? null : "Use hex color like #0f172a";
  }, [form.primaryColor]);

  const secondaryColorError = React.useMemo(() => {
    if (!form.secondaryColor) return null;
    return isColorLike(form.secondaryColor) ? null : "Use hex color like #22c55e";
  }, [form.secondaryColor]);

  const combinedError = React.useMemo(() => {
    if (!parsedExtras.ok) return parsedExtras.error;
    if (primaryColorError) return primaryColorError;
    if (secondaryColorError) return secondaryColorError;
    return null;
  }, [parsedExtras, primaryColorError, secondaryColorError]);

  const isDirty = React.useMemo(() => {
    const extrasCurrent = parsedExtras.ok ? parsedExtras.value : {};
    const extrasInitialParsed = parseJsonObject(initialExtrasJson);
    const extrasInitial = extrasInitialParsed.ok ? extrasInitialParsed.value : {};
    const current = normalizeBrandingPayload(form, extrasCurrent);
    const initialNormalized = normalizeBrandingPayload(initial, extrasInitial);
    return current !== initialNormalized;
  }, [form, parsedExtras, initial, initialExtrasJson]);

  const primary = safeColor(form.primaryColor as string | undefined, "#0f172a");
  const secondary = safeColor(form.secondaryColor as string | undefined, "#22c55e");
  const appName = (form.appName as string | undefined) || "Tenant Workspace";

  // effective logo prefers remote unless preview fails; show local while uploading
  const effectiveLogo =
    (form.logoUrl && !logoPreviewFailed ? form.logoUrl : null) || localLogoPreviewUrl || null;

  const handleFormatExtras = () => {
    const parsed = parseJsonObject(extraJson);
    if (!parsed.ok) {
      setError(parsed.error);
      toast.error("Advanced branding JSON is invalid");
      return;
    }
    setExtraJson(JSON.stringify(parsed.value, null, 2));
    setError(null);
    toast.success("Advanced branding JSON formatted");
  };

  const handleReset = () => {
    setForm(initial);
    setExtraJson(initialExtrasJson);
    setError(null);
    setLogoPreviewFailed(false);
    setUploadHint(null);
    setUploading(false);

    if (localLogoPreviewUrl) {
      URL.revokeObjectURL(localLogoPreviewUrl);
      setLocalLogoPreviewUrl(null);
    }

    toast.success("Branding editor reset");
  };

  const handleSave = async () => {
    const parsed = parseJsonObject(extraJson);
    if (!parsed.ok) {
      setError(parsed.error);
      toast.error("Branding extra JSON is invalid");
      return;
    }

    if (primaryColorError || secondaryColorError) {
      setError(primaryColorError || secondaryColorError);
      toast.error("Please fix validation errors before saving");
      return;
    }

    const payload: Record<string, unknown> = {
      ...parsed.value,
      ...(form.appName ? { appName: form.appName } : {}),
      ...(form.logoUrl ? { logoUrl: form.logoUrl } : {}),
      ...(form.primaryColor ? { primaryColor: form.primaryColor } : {}),
      ...(form.secondaryColor ? { secondaryColor: form.secondaryColor } : {}),
    };

    setError(null);
    await onSave(payload);
    toast.success("Branding saved");
  };

  // Ctrl/Cmd+S
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isSave = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s";
      if (!isSave) return;
      e.preventDefault();
      if (!loading && !uploading && !combinedError && isDirty) {
        void handleSave();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [loading, uploading, combinedError, isDirty]);

  const validateLogoFile = (file: File) => {
    if (!fileLooksLikeImage(file)) return "Please select an image file (png/jpg/webp/svg).";
    const maxMb = 8;
    if (file.size > maxMb * 1024 * 1024) return `File too large (${bytesToMb(file.size)}). Max ${maxMb}MB.`;
    return null;
  };

  const startLogoUpload = async (file: File) => {
    const validation = validateLogoFile(file);
    if (validation) {
      toast.error(validation);
      return;
    }

    // local preview while uploading
    if (localLogoPreviewUrl) URL.revokeObjectURL(localLogoPreviewUrl);
    const local = URL.createObjectURL(file);
    setLocalLogoPreviewUrl(local);
    setLogoPreviewFailed(false);

    try {
      setUploading(true);
      setUploadHint("Uploading logo to Cloudinary...");

      const url = await uploadImage(file, {
        folder: "tenant-branding/logos",
        tags: ["tenant-branding", "logo"],
      });

      setForm((p) => ({ ...p, logoUrl: url }));
      setUploadHint("Upload complete");
      toast.success("Logo uploaded");
    } catch (e: unknown) {
      console.error(e);
      const msg = (e as { message?: string })?.message ?? "Failed to upload logo";
      setUploadHint(null);
      toast.error(msg);
    } finally {
      setUploading(false);
      // keep local preview until remote loads; preview will switch naturally
    }
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const handleRemoveLogo = () => {
    setForm((p) => ({ ...p, logoUrl: "" }));
    setLogoPreviewFailed(false);
    setUploadHint(null);

    if (localLogoPreviewUrl) {
      URL.revokeObjectURL(localLogoPreviewUrl);
      setLocalLogoPreviewUrl(null);
    }

    toast.info("Logo removed (remember to save)");
  };

  const handleCopyLogoUrl = async () => {
    if (!form.logoUrl) return;
    try {
      await navigator.clipboard.writeText(form.logoUrl);
      toast.success("Logo URL copied");
    } catch {
      toast.error("Failed to copy");
    }
  };

  // Drag & drop
  React.useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      el.classList.add("ring-2", "ring-slate-400", "dark:ring-slate-700");
    };

    const onDragLeave = () => {
      el.classList.remove("ring-2", "ring-slate-400", "dark:ring-slate-700");
    };

    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      el.classList.remove("ring-2", "ring-slate-400", "dark:ring-slate-700");
      const file = e.dataTransfer?.files?.[0];
      if (file) void startLogoUpload(file);
    };

    el.addEventListener("dragover", onDragOver);
    el.addEventListener("dragleave", onDragLeave);
    el.addEventListener("drop", onDrop);

    return () => {
      el.removeEventListener("dragover", onDragOver);
      el.removeEventListener("dragleave", onDragLeave);
      el.removeEventListener("drop", onDrop);
    };
  }, [localLogoPreviewUrl]);

  const showWarning = Boolean(combinedError || error);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Branding
            </CardTitle>
            <CardDescription>
              Upload a logo, set brand colors, and optionally add advanced JSON keys. Includes a premium live preview.
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant={showWarning ? "warning" : "success"}>
              {showWarning ? "Needs attention" : "Ready"}
            </Badge>
            {uploading ? <Badge variant="muted">Uploading…</Badge> : null}
            {isDirty ? <Badge variant="default">Unsaved changes</Badge> : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {combinedError ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Validation issue</p>
                <p className="whitespace-pre-wrap break-words">{combinedError}</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* ----------------------------- */}
        {/* Fields */}
        {/* ----------------------------- */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="App Name"
            value={form.appName ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, appName: e.target.value }))}
            placeholder="Acme Workspace"
          />

          <div className="space-y-2">
            <Input
              label="Primary Color"
              value={form.primaryColor ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
              placeholder="#0f172a"
              error={primaryColorError ?? undefined}
            />
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={safeColor(form.primaryColor as string | undefined, "#0f172a")}
                onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
                className="h-8 w-10 cursor-pointer rounded border border-slate-200 bg-transparent p-1 dark:border-slate-800"
                aria-label="Pick primary color"
              />
              <div className="text-xs text-slate-500">Color picker</div>
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Input
              label="Secondary Color"
              value={form.secondaryColor ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, secondaryColor: e.target.value }))}
              placeholder="#22c55e"
              error={secondaryColorError ?? undefined}
            />
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={safeColor(form.secondaryColor as string | undefined, "#22c55e")}
                onChange={(e) => setForm((p) => ({ ...p, secondaryColor: e.target.value }))}
                className="h-8 w-10 cursor-pointer rounded border border-slate-200 bg-transparent p-1 dark:border-slate-800"
                aria-label="Pick secondary color"
              />
              <div className="text-xs text-slate-500">Color picker</div>
            </div>
          </div>
        </div>

        {/* ----------------------------- */}
        {/* Logo Upload ONLY */}
        {/* ----------------------------- */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <UploadCloud className="h-4 w-4" />
              Logo
              <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                upload-only
                <Sparkles className="h-3 w-3" />
              </span>
            </CardTitle>
            <CardDescription>
              Drag & drop or choose a file. We upload to Cloudinary and store the URL automatically.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0 space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void startLogoUpload(file);
                e.currentTarget.value = "";
              }}
            />

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_320px]">
              {/* Drop zone */}
              <div
                ref={dropRef}
                className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                      <ImageIcon className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Drop logo here</div>
                      <div className="text-xs text-slate-500">
                        PNG/JPG/WebP recommended. Max ~8MB.
                        {uploadHint ? (
                          <span className="ml-2 font-medium text-slate-700 dark:text-slate-200">• {uploadHint}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" onClick={openFilePicker} disabled={uploading || loading}>
                      <UploadCloud className="h-4 w-4" />
                      {form.logoUrl ? "Replace logo" : "Choose logo"}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleRemoveLogo}
                      disabled={uploading || loading || (!form.logoUrl && !localLogoPreviewUrl)}
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (form.logoUrl) window.open(form.logoUrl, "_blank");
                      }}
                      disabled={uploading || loading || !form.logoUrl}
                      title={!form.logoUrl ? "Upload a logo first" : undefined}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void handleCopyLogoUrl()}
                      disabled={uploading || loading || !form.logoUrl}
                      title={!form.logoUrl ? "Upload a logo first" : undefined}
                    >
                      <Copy className="h-4 w-4" />
                      Copy URL
                    </Button>
                  </div>
                </div>
              </div>

              {/* Logo preview panel */}
              <div
                className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
                style={{
                  boxShadow: `0 0 0 1px ${primary}14 inset`,
                }}
              >
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Current logo</div>

                <div className="mt-3 flex items-center gap-3">
                  <div
                    className="h-14 w-14 overflow-hidden rounded-2xl border bg-white grid place-items-center dark:bg-slate-900"
                    style={{ borderColor: `${primary}35` }}
                  >
                    {effectiveLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={effectiveLogo}
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                        onError={() => setLogoPreviewFailed(true)}
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{appName}</div>
                    <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {uploading ? "Uploading…" : form.logoUrl ? "Saved logo" : "No logo yet"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                  Tip: use a square logo for best results (512×512).
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ----------------------------- */}
        {/* Super Preview */}
        {/* ----------------------------- */}
        <Card className="rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Live Brand Preview</CardTitle>
            <CardDescription>Mock UI showing how your brand looks in the portal.</CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            <div
              className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${primary}18, ${secondary}18)`,
              }}
            >
              {/* Top Bar */}
              <div
                className="flex items-center justify-between gap-3 px-4 py-3 border-b"
                style={{
                  borderColor: `${primary}33`,
                  background: `linear-gradient(90deg, ${primary}15, ${secondary}10)`,
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="h-10 w-10 rounded-xl overflow-hidden border bg-white grid place-items-center"
                    style={{ borderColor: `${primary}40` }}
                  >
                    {effectiveLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={effectiveLogo}
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                        onError={() => setLogoPreviewFailed(true)}
                      />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="font-semibold truncate">{appName}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 truncate">
                      Primary {primary} • Secondary {secondary}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="h-6 w-6 rounded-full border"
                    style={{ background: primary, borderColor: `${primary}55` }}
                    title={`Primary: ${primary}`}
                  />
                  <span
                    className="h-6 w-6 rounded-full border"
                    style={{ background: secondary, borderColor: `${secondary}55` }}
                    title={`Secondary: ${secondary}`}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div
                  className="rounded-2xl border bg-white/70 dark:bg-slate-950/40 p-4"
                  style={{ borderColor: `${primary}22` }}
                >
                  <div className="text-xs text-slate-500">Primary action</div>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className="inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold text-white"
                      style={{ background: primary }}
                    >
                      Continue
                    </span>
                    <span className="text-xs text-slate-500">Buttons use primary</span>
                  </div>
                </div>

                <div
                  className="rounded-2xl border bg-white/70 dark:bg-slate-950/40 p-4"
                  style={{ borderColor: `${secondary}22` }}
                >
                  <div className="text-xs text-slate-500">Secondary accent</div>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className="inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold"
                      style={{
                        color: secondary,
                        background: `${secondary}1a`,
                        border: `1px solid ${secondary}33`,
                      }}
                    >
                      Explore
                    </span>
                    <span className="text-xs text-slate-500">Pills/badges use secondary</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 p-4">
                  <div className="text-xs text-slate-500">Neutral UI</div>
                  <div className="mt-2 text-sm font-semibold">Readable typography</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Colors tint the background lightly so text stays crisp.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced JSON */}
        <Textarea
          label="Advanced Branding JSON"
          value={extraJson}
          onChange={(e) => {
            setExtraJson(e.target.value);
            if (error) setError(null);
          }}
          onBlur={() => {
            const parsed = parseJsonObject(extraJson);
            if (!parsed.ok) setError(parsed.error);
            else if (error) setError(null);
          }}
          size="md"
          resize="y"
          className="min-h-[220px] font-mono text-xs"
          error={!parsedExtras.ok ? parsedExtras.error : undefined}
          hint="Extra branding keys only (the fields above are merged automatically)."
        />
      </CardContent>

      <CardFooter className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" type="button" onClick={handleFormatExtras}>
            <Wand2 className="h-4 w-4" />
            Format Extra JSON
          </Button>

          <Button variant="ghost" type="button" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        <Button
          type="button"
          onClick={() => void handleSave()}
          loading={Boolean(loading)}
          disabled={Boolean(loading) || uploading || Boolean(combinedError) || !isDirty}
          title={!isDirty ? "No changes to save" : uploading ? "Uploading logo..." : undefined}
        >
          <Save className="h-4 w-4" />
          Save Branding
        </Button>
      </CardFooter>
    </Card>
  );
}
