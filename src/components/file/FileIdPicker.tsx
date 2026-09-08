"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import { toast } from "@/logaxp/components/ui/toast";
import { useRegisterFile } from "@/logaxp/hooks/uploads.hooks";
import {
  type CloudinaryUploadOptions,
  uploadFileWithProgress,
} from "@/logaxp/lib/uploads/cloudinary.client";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type UploadedFileMeta = {
  url: string;
  publicId?: string;
  bytes?: number;
  format?: string;
  width?: number;
  height?: number;
  originalName?: string;
  mimeType?: string;
  resourceType?: string;
};

function acceptOnlyImages(accept: string) {
  const tokens = accept
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);

  return (
    tokens.length > 0 &&
    tokens.every((token) => token === "image/*" || token.startsWith("image/"))
  );
}

function looksLikeImageUrl(url: string) {
  return /\.(avif|bmp|gif|ico|jpe?g|png|svg|webp)(?:[?#].*)?$/i.test(url);
}

export function FileIdPicker({
  label = "Document",
  value,
  onChange,
  fileUrl,
  onOpenUploader,
  enableCloudinaryUpload = true,
  cloudinaryOptions,
  accept = "image/*",
  maxSizeMB = 10,
  disabled,
  hint,
  error,
  density = "compact",
  showPreview = true,
  showMeta = false,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  fileUrl?: string | null;
  onOpenUploader?: () => void;
  enableCloudinaryUpload?: boolean;
  cloudinaryOptions?: CloudinaryUploadOptions;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  hint?: string;
  error?: string;
  density?: "compact" | "cozy";
  showPreview?: boolean;
  showMeta?: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  const { register, loading: registering } = useRegisterFile();

  const [dragOver, setDragOver] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const [localPreview, setLocalPreview] = React.useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = React.useState<string | null>(null);
  const [uploadedMeta, setUploadedMeta] = React.useState<UploadedFileMeta | null>(null);
  const [metaOpen, setMetaOpen] = React.useState(false);

  const resolvedUrl = fileUrl ?? uploadedMeta?.url ?? localPreview ?? null;
  const compact = density === "compact";
  const busy = uploading || registering;
  const imageOnly = acceptOnlyImages(accept);

  const previewIsImage =
    (Boolean(localPreview) && Boolean(selectedMimeType?.startsWith("image/"))) ||
    Boolean(uploadedMeta?.mimeType?.startsWith("image/")) ||
    uploadedMeta?.resourceType === "image" ||
    (resolvedUrl ? looksLikeImageUrl(resolvedUrl) : false);

  const pickFile = () => inputRef.current?.click();

  React.useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const validateFile = (file: File) => {
    if (imageOnly && !file.type.startsWith("image/")) {
      throw new Error("Only image files are allowed.");
    }

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new Error(`File is too large. Max is ${maxSizeMB}MB.`);
    }
  };

  const handleFile = async (file: File) => {
    try {
      validateFile(file);

      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }

      setLocalPreview(URL.createObjectURL(file));
      setSelectedMimeType(file.type || null);

      if (!enableCloudinaryUpload) {
        toast.info("Upload disabled - paste a DB fileId manually.");
        return;
      }

      setUploading(true);
      setProgress(0);
      setUploadedMeta(null);

      const ac = new AbortController();
      abortRef.current = ac;

      const result = await uploadFileWithProgress(
        file,
        cloudinaryOptions,
        (pct) => setProgress(pct),
        ac.signal
      );

      setUploadedMeta({
        url: result.secure_url,
        publicId: result.public_id,
        bytes: result.bytes,
        format: result.format,
        width: result.width,
        height: result.height,
        originalName: result.original_filename,
        mimeType: file.type,
        resourceType: result.resource_type,
      });

      const created = await register({
        provider: "CLOUDINARY",
        publicId: result.public_id ?? null,
        url: result.secure_url,
        bytes: result.bytes,
        format: result.format,
        width: result.width,
        height: result.height,
        originalName: result.original_filename,
      });

      onChange(created.id);
      toast.success("Uploaded");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || "Failed to upload";

      if (String(message).toLowerCase().includes("aborted")) {
        toast.info("Upload cancelled");
      } else {
        toast.error(message);
      }
    } finally {
      setUploading(false);
      setProgress(0);
      abortRef.current = null;
    }
  };

  const onDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);

    if (disabled || busy) return;

    const file = event.dataTransfer.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const onPaste = async (event: React.ClipboardEvent) => {
    if (disabled || busy) return;

    const file =
      Array.from(event.clipboardData?.items || [])
        .map((item) => item.getAsFile())
        .find(
          (candidate): candidate is File =>
            candidate instanceof File &&
            (!imageOnly || candidate.type.startsWith("image/"))
        ) ?? null;

    if (!file) return;

    event.preventDefault();
    await handleFile(file);
  };

  const cancelUpload = () => abortRef.current?.abort();

  const copyValue = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const clear = () => {
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }

    setLocalPreview(null);
    setSelectedMimeType(null);
    setUploadedMeta(null);
    onChange("");
  };

  return (
    <div className="space-y-2" onPaste={onPaste}>
      <div
        className={cn(
          "rounded-xl border transition",
          compact ? "p-2" : "p-3",
          dragOver
            ? "border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-900/30"
            : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950",
          disabled ? "opacity-60" : ""
        )}
        onDragEnter={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!disabled && !busy) setDragOver(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!disabled && !busy) setDragOver(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setDragOver(false);
        }}
        onDrop={onDrop}
      >
        <div className={cn("flex gap-2", compact ? "items-center" : "items-start")}>
          <div className="min-w-0 flex-1">
            <Input
              label={label}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Paste DB fileId or upload"
              disabled={disabled || busy}
              hint={
                hint ??
                (compact
                  ? undefined
                  : imageOnly
                  ? "Drag and drop, click Upload, or paste an image."
                  : "Drag and drop or click Upload to attach a file.")
              }
              error={error}
            />
          </div>

          <div className={cn("flex flex-wrap gap-2", compact ? "pt-6" : "pt-7")}>
            {enableCloudinaryUpload ? (
              <>
                <input
                  ref={inputRef}
                  type="file"
                  accept={accept}
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleFile(file);
                    }
                    event.currentTarget.value = "";
                  }}
                  disabled={disabled || busy}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={pickFile}
                  disabled={disabled || busy}
                  className={compact ? "h-8 px-2" : undefined}
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UploadCloud className="h-4 w-4" />
                  )}
                  {compact ? "" : busy ? "Uploading..." : "Upload"}
                </Button>

                {busy ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={cancelUpload}
                    disabled={disabled}
                    className={compact ? "h-8 px-2" : undefined}
                    title="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                ) : null}
              </>
            ) : null}

            {onOpenUploader ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenUploader}
                disabled={disabled || busy}
                className={compact ? "h-8 px-2" : undefined}
                title="Open picker"
              >
                <UploadCloud className="h-4 w-4" />
              </Button>
            ) : null}

            {value ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void copyValue(value)}
                disabled={disabled || busy}
                className={compact ? "h-8 px-2" : undefined}
                title="Copy"
              >
                <Copy className="h-4 w-4" />
              </Button>
            ) : null}

            {value ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clear}
                disabled={disabled || busy}
                className={compact ? "h-8 px-2" : undefined}
                title="Clear"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>

        {uploading ? (
          <div className="mt-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-1.5 rounded-full bg-slate-900 dark:bg-slate-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            {!compact ? (
              <div className="mt-1 text-[11px] text-slate-500">{progress}%</div>
            ) : null}
          </div>
        ) : null}

        {showPreview && resolvedUrl ? (
          <div className="mt-2 flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/30">
              {previewIsImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolvedUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-500 dark:text-slate-300">
                  <FileText className="h-5 w-5" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                {previewIsImage ? (
                  <ImageIcon className="h-3.5 w-3.5" />
                ) : (
                  <FileText className="h-3.5 w-3.5" />
                )}
                <span className="truncate">{value || resolvedUrl}</span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <a
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs",
                    "hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
                  )}
                  href={resolvedUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open
                </a>

                {showMeta || uploadedMeta ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50"
                    onClick={() => setMetaOpen((state) => !state)}
                  >
                    {metaOpen ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                    Details
                  </button>
                ) : null}
              </div>

              {metaOpen && uploadedMeta ? (
                <div className="mt-2 text-[11px] text-slate-500">
                  <div>public_id: {uploadedMeta.publicId ?? "-"}</div>
                  <div>
                    {typeof uploadedMeta.bytes === "number"
                      ? `${Math.round(uploadedMeta.bytes / 1024)} KB`
                      : "-"}
                    {uploadedMeta.width && uploadedMeta.height
                      ? ` | ${uploadedMeta.width}x${uploadedMeta.height}`
                      : ""}
                    {uploadedMeta.format ? ` | ${uploadedMeta.format}` : ""}
                    {uploadedMeta.mimeType ? ` | ${uploadedMeta.mimeType}` : ""}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {compact ? (
          <div className="mt-2 text-[10.5px] text-slate-500">
            {imageOnly
              ? "Drag and drop or paste an image to upload."
              : "Drag and drop or choose a file to upload."}
          </div>
        ) : null}
      </div>
    </div>
  );
}
