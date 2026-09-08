"use client";

import * as React from "react";
import {
  Plus,
  RefreshCcw,
  Pencil,
  Trash2,
  Archive,
  RotateCcw,
  Upload,
  Eye,
  Star,
  StarOff,
  FolderTree,
  Image as ImageIcon,
  Video,
  FileText,
  Globe,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Badge } from "@/logaxp/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/logaxp/components/ui/dialog";

import {
  useAdminShowcase,
  useAdminShowcases,
  useAddShowcaseMedia,
  useArchiveShowcase,
  useCreateShowcase,
  useDeleteShowcase,
  usePublishShowcase,
  useReorderShowcaseMedia,
  useRemoveShowcaseMedia,
  useRestoreShowcase,
  useShowcaseCategories,
  useShowcaseTags,
  useUnpublishShowcase,
  useUpdateShowcase,
  useCreateShowcaseCategory,
  useCreateShowcaseTag,
  useUpdateShowcaseCategory,
  useUpdateShowcaseTag,
  useDeleteShowcaseCategory,
  useDeleteShowcaseTag,
} from "@/logaxp/hooks/useShowcase";

import type {
  AddMediaDto,
  AdminListShowcasesDto,
  CreateShowcaseProjectDto,
  PublishDto,
  ReorderMediaDto,
  ShowcaseCategory,
  ShowcaseMediaType,
  ShowcaseProject,
  ShowcaseProjectMedia,
  ShowcaseStatus,
  ShowcaseTag,
  UpdateShowcaseProjectDto,
} from "@/logaxp/lib/showcase/showcase.types";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function fieldClassName() {
  return "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-lime-300 focus:ring-2 focus:ring-lime-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-lime-700 dark:focus:ring-lime-950/40";
}

function textareaClassName() {
  return "min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-lime-300 focus:ring-2 focus:ring-lime-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-lime-700 dark:focus:ring-lime-950/40";
}

function labelClassName() {
  return "text-sm font-medium text-slate-700 dark:text-slate-300";
}

function parseJsonOrUndefined(value: string, fieldName: string) {
  const text = value.trim();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(`${fieldName} must be valid JSON.`);
  }
}

function prettyJson(value: unknown) {
  if (!value) return "";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function statusTone(status?: ShowcaseStatus | null) {
  switch (status) {
    case "PUBLISHED":
      return "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200";
    case "ARCHIVED":
      return "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200";
    default:
      return "border-slate-200 bg-slate-100 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200";
  }
}

function mediaIcon(type?: ShowcaseMediaType | null) {
  if (type === "VIDEO") return <Video className="h-4 w-4" />;
  if (type === "DOCUMENT") return <FileText className="h-4 w-4" />;
  return <ImageIcon className="h-4 w-4" />;
}

type ProjectFormState = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  featured: boolean;
  sortOrder: number;
  heroFileId: string;
  heroUrl: string;
  categories: string[];
  tags: string[];
  linksJson: string;
  contentJson: string;
};

function createEmptyProjectForm(): ProjectFormState {
  return {
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    seoTitle: "",
    seoDescription: "",
    featured: false,
    sortOrder: 0,
    heroFileId: "",
    heroUrl: "",
    categories: [],
    tags: [],
    linksJson: "",
    contentJson: "",
  };
}

function mapProjectToForm(project: ShowcaseProject): ProjectFormState {
  return {
    title: project.title ?? "",
    slug: project.slug ?? "",
    shortDescription: project.shortDescription ?? "",
    description: project.description ?? "",
    seoTitle: project.seoTitle ?? "",
    seoDescription: project.seoDescription ?? "",
    featured: Boolean(project.featured),
    sortOrder: Number(project.sortOrder ?? 0),
    heroFileId: project.heroFileId ?? "",
    heroUrl: project.heroUrl ?? "",
    categories: project.categories?.map((c) => c.categoryId!).filter(Boolean) ?? [],
    tags: project.tags?.map((t) => t.tagId!).filter(Boolean) ?? [],
    linksJson: prettyJson(project.links),
    contentJson: prettyJson(project.content),
  };
}

type TaxonomyFormState = {
  title: string;
  slug: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
};

function createEmptyTaxonomyForm(): TaxonomyFormState {
  return {
    title: "",
    slug: "",
    description: "",
    sortOrder: 0,
    isActive: true,
  };
}

type MediaFormState = {
  type: ShowcaseMediaType;
  fileId: string;
  url: string;
  title: string;
  alt: string;
  sortOrder: number;
  metadataJson: string;
};

function createEmptyMediaForm(): MediaFormState {
  return {
    type: "IMAGE",
    fileId: "",
    url: "",
    title: "",
    alt: "",
    sortOrder: 0,
    metadataJson: "",
  };
}

function SectionTitle({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="admin-page-heading flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        ) : null}
      </div>
      {right}
    </div>
  );
}

function ShowcaseEditorDialog({
  open,
  onOpenChange,
  mode,
  value,
  categories,
  tags,
  busy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  value: ProjectFormState;
  categories: ShowcaseCategory[];
  tags: ShowcaseTag[];
  busy?: boolean;
  onSubmit: (payload: CreateShowcaseProjectDto | UpdateShowcaseProjectDto) => Promise<void>;
}) {
  const [form, setForm] = React.useState<ProjectFormState>(value);
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    if (open) {
      setForm(value);
      setError("");
    }
  }, [open, value]);

  const toggleArrayValue = (key: "categories" | "tags", id: string) => {
    setForm((prev) => {
      const exists = prev[key].includes(id);
      return {
        ...prev,
        [key]: exists ? prev[key].filter((v) => v !== id) : [...prev[key], id],
      };
    });
  };

  const handleSubmit = async () => {
    try {
      setError("");

      const links = parseJsonOrUndefined(form.linksJson, "Links");
      const content = parseJsonOrUndefined(form.contentJson, "Content");
    const payload: CreateShowcaseProjectDto | UpdateShowcaseProjectDto = {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      shortDescription: form.shortDescription.trim() || null,
      description: form.description.trim() || null,
      seoTitle: form.seoTitle.trim() || null,
      seoDescription: form.seoDescription.trim() || null,
      featured: form.featured,
      sortOrder: Number(form.sortOrder || 0),
      heroFileId: form.heroFileId.trim() || null,
      heroUrl: form.heroUrl.trim() || null,
      categoryIds: form.categories,
      tagIds: form.tags,
      links,
      content,
    };

      if (!payload.title && mode === "create") {
        throw new Error("Title is required.");
      }

      await onSubmit(payload);
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message ?? "Unable to save showcase.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {mode === "create" ? "Create showcase project" : "Edit showcase project"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-2 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className={labelClassName()}>Title</label>
              <input
                className={fieldClassName()}
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="GatherPlux"
              />
            </div>

            <div>
              <label className={labelClassName()}>Slug</label>
              <input
                className={fieldClassName()}
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="gatherplux"
              />
            </div>

            <div>
              <label className={labelClassName()}>Short description</label>
              <textarea
                className={textareaClassName()}
                value={form.shortDescription}
                onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))}
                placeholder="Short teaser for cards and hero sections"
              />
            </div>

            <div>
              <label className={labelClassName()}>Full description</label>
              <textarea
                className={textareaClassName()}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Longer product story"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClassName()}>SEO title</label>
                <input
                  className={fieldClassName()}
                  value={form.seoTitle}
                  onChange={(e) => setForm((p) => ({ ...p, seoTitle: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelClassName()}>SEO description</label>
                <input
                  className={fieldClassName()}
                  value={form.seoDescription}
                  onChange={(e) => setForm((p) => ({ ...p, seoDescription: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClassName()}>Hero URL</label>
                <input
                  className={fieldClassName()}
                  value={form.heroUrl}
                  onChange={(e) => setForm((p) => ({ ...p, heroUrl: e.target.value }))}
                  placeholder="/videos/1.mp4 or https://..."
                />
              </div>

              <div>
                <label className={labelClassName()}>Hero File ID</label>
                <input
                  className={fieldClassName()}
                  value={form.heroFileId}
                  onChange={(e) => setForm((p) => ({ ...p, heroFileId: e.target.value }))}
                  placeholder="Optional registered file ID"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClassName()}>Sort order</label>
                <input
                  type="number"
                  className={fieldClassName()}
                  value={form.sortOrder}
                  onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value || 0) }))}
                />
              </div>

              <label className="mt-7 inline-flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-800">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                />
                Featured showcase
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClassName()}>Categories</label>
              <div className="mt-2 grid max-h-52 gap-2 overflow-auto rounded-2xl border border-slate-200 p-3 dark:border-slate-800 sm:grid-cols-2">
                {categories.map((cat) => {
                  const checked = form.categories.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      className={cx(
                        "flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition",
                        checked
                          ? "border-lime-300 bg-lime-50 dark:border-lime-800 dark:bg-lime-950/30"
                          : "border-slate-200 dark:border-slate-800"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleArrayValue("categories", cat.id)}
                      />
                      <span className="truncate">{cat.title}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={labelClassName()}>Tags</label>
              <div className="mt-2 grid max-h-52 gap-2 overflow-auto rounded-2xl border border-slate-200 p-3 dark:border-slate-800 sm:grid-cols-2">
                {tags.map((tag) => {
                  const checked = form.tags.includes(tag.id);
                  return (
                    <label
                      key={tag.id}
                      className={cx(
                        "flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition",
                        checked
                          ? "border-lime-300 bg-lime-50 dark:border-lime-800 dark:bg-lime-950/30"
                          : "border-slate-200 dark:border-slate-800"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleArrayValue("tags", tag.id)}
                      />
                      <span className="truncate">{tag.title}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={labelClassName()}>Links JSON</label>
              <textarea
                className={cx(textareaClassName(), "min-h-[140px] font-mono text-xs")}
                value={form.linksJson}
                onChange={(e) => setForm((p) => ({ ...p, linksJson: e.target.value }))}
                placeholder={`{\n  "website": "https://...",\n  "demo": "https://..."\n}`}
              />
            </div>

            <div>
              <label className={labelClassName()}>Content JSON</label>
              <textarea
                className={cx(textareaClassName(), "min-h-[180px] font-mono text-xs")}
                value={form.contentJson}
                onChange={(e) => setForm((p) => ({ ...p, contentJson: e.target.value }))}
                placeholder={`{\n  "blocks": [],\n  "video": "/videos/1.mp4",\n  "fallbackImage": "/images/showcase-1.jpg"\n}`}
              />
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={busy}>
            {busy ? "Saving..." : mode === "create" ? "Create showcase" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TaxonomyDialog({
  open,
  onOpenChange,
  categories,
  tags,
  onCreateCategory,
  onCreateTag,
  onUpdateCategory,
  onUpdateTag,
  onDeleteCategory,
  onDeleteTag,
  busyCategoryCreate,
  busyTagCreate,
  busyCategoryUpdate,
  busyTagUpdate,
  busyCategoryDelete,
  busyTagDelete,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categories: ShowcaseCategory[];
  tags: ShowcaseTag[];

  onCreateCategory: (payload: {
  title: string;
  slug?: string;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}) => Promise<unknown>;

onCreateTag: (payload: {
  title: string;
  slug?: string;
  sortOrder?: number;
  isActive?: boolean;
}) => Promise<unknown>;

onUpdateCategory: (
  id: string,
  payload: {
    title: string;
    slug?: string;
    description?: string | null;
    sortOrder?: number;
    isActive?: boolean;
  }
) => Promise<unknown>;

onUpdateTag: (
  id: string,
  payload: {
    title: string;
    slug?: string;
    sortOrder?: number;
    isActive?: boolean;
  }
) => Promise<unknown>;

onDeleteCategory: (id: string) => Promise<unknown>;
onDeleteTag: (id: string) => Promise<unknown>;

  busyCategoryCreate?: boolean;
  busyTagCreate?: boolean;
  busyCategoryUpdate?: boolean;
  busyTagUpdate?: boolean;
  busyCategoryDelete?: boolean;
  busyTagDelete?: boolean;
}) {
  const [categoryForm, setCategoryForm] = React.useState(createEmptyTaxonomyForm());
  const [tagForm, setTagForm] = React.useState(createEmptyTaxonomyForm());
  const [editingCategoryId, setEditingCategoryId] = React.useState<string | null>(null);
  const [editingTagId, setEditingTagId] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setCategoryForm(createEmptyTaxonomyForm());
      setTagForm(createEmptyTaxonomyForm());
      setEditingCategoryId(null);
      setEditingTagId(null);
      setError("");
    }
  }, [open]);

  const categoryBusy =
    Boolean(busyCategoryCreate) || Boolean(busyCategoryUpdate) || Boolean(busyCategoryDelete);

  const tagBusy =
    Boolean(busyTagCreate) || Boolean(busyTagUpdate) || Boolean(busyTagDelete);

  const resetCategoryForm = () => {
    setCategoryForm(createEmptyTaxonomyForm());
    setEditingCategoryId(null);
  };

  const resetTagForm = () => {
    setTagForm(createEmptyTaxonomyForm());
    setEditingTagId(null);
  };

  const startEditCategory = (cat: ShowcaseCategory) => {
    setError("");
    setEditingCategoryId(cat.id);
    setCategoryForm({
      title: cat.title ?? "",
      slug: cat.slug ?? "",
      description: cat.description ?? "",
      sortOrder: Number(cat.sortOrder ?? 0),
      isActive: Boolean(cat.isActive),
    });
  };

  const startEditTag = (tag: ShowcaseTag) => {
    setError("");
    setEditingTagId(tag.id);
    setTagForm({
      title: tag.title ?? "",
      slug: tag.slug ?? "",
      description: "",
      sortOrder: Number(tag.sortOrder ?? 0),
      isActive: Boolean(tag.isActive),
    });
  };

  const submitCategory = async () => {
    try {
      setError("");

      const payload = {
        title: categoryForm.title.trim(),
        slug: categoryForm.slug.trim() || undefined,
        description: categoryForm.description.trim() || null,
        sortOrder: categoryForm.sortOrder,
        isActive: categoryForm.isActive,
      };

      if (!payload.title) throw new Error("Category title is required.");

      if (editingCategoryId) {
        await onUpdateCategory(editingCategoryId, payload);
      } else {
        await onCreateCategory(payload);
      }

      resetCategoryForm();
    } catch (err: any) {
      setError(err?.message ?? "Unable to save category.");
    }
  };

  const submitTag = async () => {
    try {
      setError("");

      const payload = {
        title: tagForm.title.trim(),
        slug: tagForm.slug.trim() || undefined,
        sortOrder: tagForm.sortOrder,
        isActive: tagForm.isActive,
      };

      if (!payload.title) throw new Error("Tag title is required.");

      if (editingTagId) {
        await onUpdateTag(editingTagId, payload);
      } else {
        await onCreateTag(payload);
      }

      resetTagForm();
    } catch (err: any) {
      setError(err?.message ?? "Unable to save tag.");
    }
  };

  const removeCategory = async (cat: ShowcaseCategory) => {
    try {
      setError("");
      const ok = window.confirm(`Delete category "${cat.title}"?`);
      if (!ok) return;

      await onDeleteCategory(cat.id);

      if (editingCategoryId === cat.id) resetCategoryForm();
    } catch (err: any) {
      setError(err?.message ?? "Unable to delete category.");
    }
  };

  const removeTag = async (tag: ShowcaseTag) => {
    try {
      setError("");
      const ok = window.confirm(`Delete tag "${tag.title}"?`);
      if (!ok) return;

      await onDeleteTag(tag.id);

      if (editingTagId === tag.id) resetTagForm();
    } catch (err: any) {
      setError(err?.message ?? "Unable to delete tag.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-6xl overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Showcase taxonomy</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-base">
                {editingCategoryId ? "Edit category" : "Categories"}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <input
                  className={fieldClassName()}
                  placeholder="Category title"
                  value={categoryForm.title}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, title: e.target.value }))}
                />

                <input
                  className={fieldClassName()}
                  placeholder="Slug"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, slug: e.target.value }))}
                />

                <textarea
                  className={textareaClassName()}
                  placeholder="Description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="number"
                    className={fieldClassName()}
                    placeholder="Sort order"
                    value={categoryForm.sortOrder}
                    onChange={(e) =>
                      setCategoryForm((p) => ({
                        ...p,
                        sortOrder: Number(e.target.value || 0),
                      }))
                    }
                  />

                  <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-800">
                    <input
                      type="checkbox"
                      checked={categoryForm.isActive}
                      onChange={(e) =>
                        setCategoryForm((p) => ({ ...p, isActive: e.target.checked }))
                      }
                    />
                    Active
                  </label>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={submitCategory} disabled={categoryBusy}>
                    {editingCategoryId
                      ? busyCategoryUpdate
                        ? "Updating..."
                        : "Update category"
                      : busyCategoryCreate
                        ? "Saving..."
                        : "Save category"}
                  </Button>

                  {editingCategoryId ? (
                    <Button variant="outline" onClick={resetCategoryForm} disabled={categoryBusy}>
                      Cancel edit
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 dark:text-slate-50">
                        {cat.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        /{cat.slug} • sort {cat.sortOrder}
                      </div>
                      {cat.description ? (
                        <div className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                          {cat.description}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className="rounded-full" variant="muted">
                        {cat.isActive ? "Active" : "Inactive"}
                      </Badge>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditCategory(cat)}
                        disabled={categoryBusy}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-950/20"
                        onClick={() => removeCategory(cat)}
                        disabled={categoryBusy}
                      >
                        {busyCategoryDelete ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-base">
                {editingTagId ? "Edit tag" : "Tags"}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <input
                  className={fieldClassName()}
                  placeholder="Tag title"
                  value={tagForm.title}
                  onChange={(e) => setTagForm((p) => ({ ...p, title: e.target.value }))}
                />

                <input
                  className={fieldClassName()}
                  placeholder="Slug"
                  value={tagForm.slug}
                  onChange={(e) => setTagForm((p) => ({ ...p, slug: e.target.value }))}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="number"
                    className={fieldClassName()}
                    placeholder="Sort order"
                    value={tagForm.sortOrder}
                    onChange={(e) =>
                      setTagForm((p) => ({
                        ...p,
                        sortOrder: Number(e.target.value || 0),
                      }))
                    }
                  />

                  <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-800">
                    <input
                      type="checkbox"
                      checked={tagForm.isActive}
                      onChange={(e) =>
                        setTagForm((p) => ({ ...p, isActive: e.target.checked }))
                      }
                    />
                    Active
                  </label>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={submitTag} disabled={tagBusy}>
                    {editingTagId
                      ? busyTagUpdate
                        ? "Updating..."
                        : "Update tag"
                      : busyTagCreate
                        ? "Saving..."
                        : "Save tag"}
                  </Button>

                  {editingTagId ? (
                    <Button variant="outline" onClick={resetTagForm} disabled={tagBusy}>
                      Cancel edit
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 dark:text-slate-50">
                        {tag.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        /{tag.slug} • sort {tag.sortOrder}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className="rounded-full" variant="muted">
                        {tag.isActive ? "Active" : "Inactive"}
                      </Badge>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditTag(tag)}
                        disabled={tagBusy}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-950/20"
                        onClick={() => removeTag(tag)}
                        disabled={tagBusy}
                      >
                        {busyTagDelete ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ShowcaseMediaDialog({
  open,
  onOpenChange,
  projectId,
  project,
  busyAdd,
  busyReorder,
  busyRemove,
  onAdd,
  onRemove,
  onReorder,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectId?: string | null;
  project?: ShowcaseProject | undefined;
  busyAdd?: boolean;
  busyReorder?: boolean;
  busyRemove?: boolean;
  onAdd: (payload: AddMediaDto) => Promise<void>;
  onRemove: (mediaId: string) => Promise<void>;
  onReorder: (payload: ReorderMediaDto) => Promise<void>;
}) {
  const [form, setForm] = React.useState<MediaFormState>(createEmptyMediaForm());
  const [sortMap, setSortMap] = React.useState<Record<string, number>>({});
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setForm(createEmptyMediaForm());
    setError("");
    const next: Record<string, number> = {};
    (project?.media ?? []).forEach((m: ShowcaseProjectMedia) => {
      next[m.id] = Number(m.sortOrder ?? 0);
    });
    setSortMap(next);
  }, [open, project?.media]);

  const submitMedia = async () => {
    try {
      setError("");
      const metadata = parseJsonOrUndefined(form.metadataJson, "Metadata");
      await onAdd({
        type: form.type,
        fileId: form.fileId.trim() || null,
        url: form.url.trim() || null,
        title: form.title.trim() || null,
        alt: form.alt.trim() || null,
        sortOrder: Number(form.sortOrder || 0),
        metadata,
      });
      setForm(createEmptyMediaForm());
    } catch (err: any) {
      setError(err?.message ?? "Unable to add media.");
    }
  };

  const saveOrder = async () => {
    try {
      setError("");
      const items = Object.entries(sortMap).map(([id, sortOrder]) => ({
        id,
        sortOrder: Number(sortOrder || 0),
      }));
      await onReorder({ items });
    } catch (err: any) {
      setError(err?.message ?? "Unable to reorder media.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-6xl overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Manage showcase media{project?.title ? ` • ${project.title}` : ""}
          </DialogTitle>
        </DialogHeader>

        {!projectId ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
            Select a showcase first.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-base">Add media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <select
                  className={fieldClassName()}
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as ShowcaseMediaType }))}
                >
                  <option value="IMAGE">IMAGE</option>
                  <option value="VIDEO">VIDEO</option>
                  <option value="EMBED">EMBED</option>
                  <option value="DOCUMENT">DOCUMENT</option>
                </select>

                <input
                  className={fieldClassName()}
                  placeholder="URL (supports /videos/1.mp4 and fallback images)"
                  value={form.url}
                  onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                />

                <input
                  className={fieldClassName()}
                  placeholder="Registered file ID (optional)"
                  value={form.fileId}
                  onChange={(e) => setForm((p) => ({ ...p, fileId: e.target.value }))}
                />

                <input
                  className={fieldClassName()}
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                />

                <input
                  className={fieldClassName()}
                  placeholder="Alt text"
                  value={form.alt}
                  onChange={(e) => setForm((p) => ({ ...p, alt: e.target.value }))}
                />

                <input
                  type="number"
                  className={fieldClassName()}
                  placeholder="Sort order"
                  value={form.sortOrder}
                  onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value || 0) }))}
                />

                <textarea
                  className={cx(textareaClassName(), "min-h-[140px] font-mono text-xs")}
                  placeholder={`{\n  "poster": "/images/fallback.jpg"\n}`}
                  value={form.metadataJson}
                  onChange={(e) => setForm((p) => ({ ...p, metadataJson: e.target.value }))}
                />

                <Button onClick={submitMedia} disabled={busyAdd} className="w-full">
                  {busyAdd ? "Adding..." : "Add media"}
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Current media</CardTitle>
                <Button variant="outline" onClick={saveOrder} disabled={busyReorder}>
                  {busyReorder ? "Saving..." : "Save sort order"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {(project?.media ?? []).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    No media yet.
                  </div>
                ) : (
                  project!.media!.map((media: ShowcaseProjectMedia) => (
                    <div
                      key={media.id}
                      className="grid gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 md:grid-cols-[1fr_auto_auto]"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                            {mediaIcon(media.type)}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate font-medium text-slate-900 dark:text-slate-50">
                              {media.title || media.alt || media.url || media.file?.originalName || media.id}
                            </div>
                            <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                              {media.type} • {media.url || media.file?.url || media.fileId || "No source"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <input
                        type="number"
                        className={cx(fieldClassName(), "w-28")}
                        value={sortMap[media.id] ?? media.sortOrder ?? 0}
                        onChange={(e) =>
                          setSortMap((prev) => ({
                            ...prev,
                            [media.id]: Number(e.target.value || 0),
                          }))
                        }
                      />

                      <Button
                        variant="outline"
                        className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-950/20"
                        onClick={() => onRemove(media.id)}
                        disabled={busyRemove}
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ShowcaseCard({
  item,
  onEdit,
  onMedia,
  onPublish,
  onUnpublish,
  onArchive,
  onRestore,
  onDelete,
  busy,
}: {
  item: ShowcaseProject;
  onEdit: (item: ShowcaseProject) => void;
  onMedia: (item: ShowcaseProject) => void;
  onPublish: (item: ShowcaseProject) => void;
  onUnpublish: (item: ShowcaseProject) => void;
  onArchive: (item: ShowcaseProject) => void;
  onRestore: (item: ShowcaseProject) => void;
  onDelete: (item: ShowcaseProject) => void;
  busy?: boolean;
}) {
  const hero = item.heroUrl || item.heroFile?.url || item.media?.[0]?.url || item.media?.[0]?.file?.url;
  const isVideo = Boolean(hero && /\.(mp4|webm|ogg)$/i.test(hero));
  const categoryNames = item.categories?.map((c: { category: { title: string } }) => c.category.title) ?? [];
  const tagNames = item.tags?.map((t: { tag: { title: string } }) => t.tag.title) ?? [];

  return (
    <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="relative aspect-[16/8] overflow-hidden border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
        {hero ? (
          isVideo ? (
            <video
              src={hero}
              className="h-full w-full object-cover"
              muted
              playsInline
              loop
              autoPlay
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={hero} alt={item.title} className="h-full w-full object-cover" />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <ImageIcon className="h-10 w-10" />
          </div>
        )}

        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <Badge className={cx("rounded-full border", statusTone(item.status))}>{item.status}</Badge>
          {item.featured ? (
            <Badge className="rounded-full border border-lime-200 bg-lime-50 text-lime-900 dark:border-lime-900/40 dark:bg-lime-950/30 dark:text-lime-200">
              Featured
            </Badge>
          ) : null}
        </div>
      </div>

      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold text-slate-900 dark:text-slate-50">
              {item.title}
            </div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">/{item.slug}</div>
          </div>

          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs dark:border-slate-800 dark:bg-slate-950">
            sort {item.sortOrder ?? 0}
          </div>
        </div>

        <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
          {item.shortDescription || item.description || "No description yet."}
        </p>

        <div className="flex flex-wrap gap-2">
          {categoryNames.slice(0, 3).map((name: string) => (
            <span
              key={name}
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {name}
            </span>
          ))}
          {tagNames.slice(0, 3).map((name: string) => (
            <span
              key={name}
              className="rounded-full border border-lime-200 bg-lime-50 px-2.5 py-1 text-xs text-lime-800 dark:border-lime-900/40 dark:bg-lime-950/30 dark:text-lime-200"
            >
              #{name}
            </span>
          ))}
        </div>

        <div className="grid gap-2 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2">
          <div className="inline-flex items-center gap-2">
            <Clock3 className="h-3.5 w-3.5" />
            Created {formatDateTime(item.createdAt)}
          </div>
          <div className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Published {formatDateTime(item.publishedAt)}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(item)} disabled={busy}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>

          <Button variant="outline" size="sm" onClick={() => onMedia(item)} disabled={busy}>
            <Upload className="mr-2 h-4 w-4" />
            Media
          </Button>

          {item.status === "PUBLISHED" ? (
            <Button variant="outline" size="sm" onClick={() => onUnpublish(item)} disabled={busy}>
              <Eye className="mr-2 h-4 w-4" />
              Unpublish
            </Button>
          ) : (
            <Button size="sm" onClick={() => onPublish(item)} disabled={busy}>
              <Globe className="mr-2 h-4 w-4" />
              Publish
            </Button>
          )}

          {item.featured ? (
            <span className="inline-flex items-center gap-2 rounded-xl border border-lime-200 bg-lime-50 px-3 py-2 text-xs font-medium text-lime-800 dark:border-lime-900/40 dark:bg-lime-950/30 dark:text-lime-200">
              <Star className="h-4 w-4" />
              Featured
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <StarOff className="h-4 w-4" />
              Standard
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          {item.status !== "ARCHIVED" ? (
            <Button variant="outline" size="sm" onClick={() => onArchive(item)} disabled={busy}>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => onRestore(item)} disabled={busy}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-950/20"
            onClick={() => onDelete(item)}
            disabled={busy}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SiteAdminShowcasePage() {
  const [filters, setFilters] = React.useState<AdminListShowcasesDto>({
    q: "",
    status: undefined,
    featured: undefined,
    includeDeleted: false,
    page: 1,
    pageSize: 12,
  });

  const [editorOpen, setEditorOpen] = React.useState(false);
  const [taxonomyOpen, setTaxonomyOpen] = React.useState(false);
  const [mediaOpen, setMediaOpen] = React.useState(false);

  const [editing, setEditing] = React.useState<ShowcaseProject | null>(null);
  const [mediaProject, setMediaProject] = React.useState<ShowcaseProject | null>(null);
  const [publishAt, setPublishAt] = React.useState("");

  const listQ = useAdminShowcases(filters);
  const categoriesQ = useShowcaseCategories();
  const tagsQ = useShowcaseTags();
  const detailQ = useAdminShowcase(mediaProject?.id);

  const createM = useCreateShowcase();
  const updateM = useUpdateShowcase();
  const publishM = usePublishShowcase();
  const unpublishM = useUnpublishShowcase();
  const archiveM = useArchiveShowcase();
  const restoreM = useRestoreShowcase();
  const deleteM = useDeleteShowcase();

  const addMediaM = useAddShowcaseMedia();
  const removeMediaM = useRemoveShowcaseMedia();
  const reorderMediaM = useReorderShowcaseMedia();

  const createCategoryM = useCreateShowcaseCategory();
  const createTagM = useCreateShowcaseTag();

  const updateCategoryM = useUpdateShowcaseCategory();
  const updateTagM = useUpdateShowcaseTag();

  const deleteCategoryM = useDeleteShowcaseCategory();
  const deleteTagM = useDeleteShowcaseTag();

  const rows = listQ.data?.items ?? [];
  const meta = listQ.data ?? { page: 1, pageSize: 12, total: 0 };

  const editorInitial = React.useMemo(
    () => (editing ? mapProjectToForm(editing) : createEmptyProjectForm()),
    [editing]
  );

  const handleCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const handleEdit = (project: ShowcaseProject) => {
    setEditing(project);
    setEditorOpen(true);
  };

  const handleMedia = (project: ShowcaseProject) => {
    setMediaProject(project);
    setMediaOpen(true);
  };

  const handleSaveProject = async (payload: CreateShowcaseProjectDto | UpdateShowcaseProjectDto) => {
    if (editing?.id) {
      await updateM.mutateAsync({ id: editing.id, payload: payload as UpdateShowcaseProjectDto });
    } else {
      await createM.mutateAsync(payload as CreateShowcaseProjectDto);
    }
  };

  const handlePublish = async (project: ShowcaseProject) => {
    const payload: PublishDto = { publishAt: publishAt || null };
    await publishM.mutateAsync({ id: project.id, payload });
  };

  const handleUnpublish = async (project: ShowcaseProject) => {
    await unpublishM.mutateAsync(project.id);
  };

  const handleArchive = async (project: ShowcaseProject) => {
    await archiveM.mutateAsync(project.id);
  };

  const handleRestore = async (project: ShowcaseProject) => {
    await restoreM.mutateAsync(project.id);
  };

  const handleDelete = async (project: ShowcaseProject) => {
    const ok = window.confirm(`Delete "${project.title}"?`);
    if (!ok) return;
    await deleteM.mutateAsync(project.id);
  };

  const busy =
  listQ.isFetching ||
  createM.isPending ||
  updateM.isPending ||
  publishM.isPending ||
  unpublishM.isPending ||
  archiveM.isPending ||
  restoreM.isPending ||
  deleteM.isPending ||
  addMediaM.isPending ||
  removeMediaM.isPending ||
  reorderMediaM.isPending ||
  createCategoryM.isPending ||
  createTagM.isPending ||
  updateCategoryM.isPending ||
  updateTagM.isPending ||
  deleteCategoryM.isPending ||
  deleteTagM.isPending;


  return (
    <div className="space-y-6">
      <SectionTitle
        title="Publishing"
        subtitle="Manage articles, product stories and the media that brings them to life."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => listQ.refetch()} disabled={busy}>
              <RefreshCcw className={cx("mr-2 h-4 w-4", listQ.isFetching && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => setTaxonomyOpen(true)}>
              <FolderTree className="mr-2 h-4 w-4" />
              Taxonomy
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New showcase
            </Button>
          </div>
        }
      />

      <Card className="rounded-3xl">
        <CardContent className="grid gap-4 p-5 lg:grid-cols-[1.2fr_repeat(4,0.7fr)_auto]">
          <input
            className={fieldClassName()}
            placeholder="Search title, slug, description..."
            value={filters.q ?? ""}
            onChange={(e) =>
              setFilters((p) => ({
                ...p,
                q: e.target.value,
                page: 1,
              }))
            }
          />

          <select
            className={fieldClassName()}
            value={filters.status ?? "__all__"}
            onChange={(e) =>
              setFilters((p) => ({
                ...p,
                status: e.target.value === "__all__" ? undefined : (e.target.value as ShowcaseStatus),
                page: 1,
              }))
            }
          >
            <option value="__all__">Status: All</option>
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>

          <select
            className={fieldClassName()}
            value={
              filters.featured === undefined ? "__all__" : filters.featured ? "featured" : "not_featured"
            }
            onChange={(e) =>
              setFilters((p) => ({
                ...p,
                featured:
                  e.target.value === "__all__"
                    ? undefined
                    : e.target.value === "featured",
                page: 1,
              }))
            }
          >
            <option value="__all__">Featured: All</option>
            <option value="featured">Featured only</option>
            <option value="not_featured">Not featured</option>
          </select>

          <select
            className={fieldClassName()}
            value={filters.includeDeleted ? "with_deleted" : "without_deleted"}
            onChange={(e) =>
              setFilters((p) => ({
                ...p,
                includeDeleted: e.target.value === "with_deleted",
                page: 1,
              }))
            }
          >
            <option value="without_deleted">Hide deleted</option>
            <option value="with_deleted">Include deleted</option>
          </select>

          <select
            className={fieldClassName()}
            value={String(filters.pageSize ?? 12)}
            onChange={(e) =>
              setFilters((p) => ({
                ...p,
                pageSize: Number(e.target.value),
                page: 1,
              }))
            }
          >
            <option value="12">12 / page</option>
            <option value="24">24 / page</option>
            <option value="48">48 / page</option>
          </select>

          <Button
            variant="outline"
            onClick={() =>
              setFilters((p: AdminListShowcasesDto) => ({
                q: "",
                status: undefined,
                featured: undefined,
                includeDeleted: false,
                page: 1,
                pageSize: 12,
              }))
            }
          >
            Reset
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-3xl">
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Total</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">{meta.total ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Published</div>
            <div className="mt-2 text-3xl font-semibold text-emerald-700 dark:text-emerald-300">
              {rows.filter((r: ShowcaseProject) => r.status === "PUBLISHED").length}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Draft</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">
              {rows.filter((r: ShowcaseProject) => r.status === "DRAFT").length}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Featured</div>
            <div className="mt-2 text-3xl font-semibold text-lime-700 dark:text-lime-300">
              {rows.filter((r: ShowcaseProject) => r.featured).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-base">Publish scheduling helper</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="datetime-local"
              className={fieldClassName()}
              value={publishAt}
              onChange={(e) => setPublishAt(e.target.value)}
            />
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Leave empty to publish immediately.
            </div>
          </div>
        </CardHeader>
      </Card>

      {listQ.isLoading ? (
        <Card className="rounded-3xl">
          <CardContent className="p-10 text-sm text-slate-500 dark:text-slate-400">
            Loading showcases...
          </CardContent>
        </Card>
      ) : rows.length === 0 ? (
        <Card className="rounded-3xl">
          <CardContent className="p-12 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300">
              <FolderTree className="h-6 w-6" />
            </div>
            <div className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-50">
              No showcase projects found
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Create your first showcase project, then later plug it into the public showcase design.
            </p>
            <div className="mt-5">
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create first showcase
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
          {rows.map((item) => (
            <ShowcaseCard
              key={item.id}
              item={item}
              busy={busy}
              onEdit={handleEdit}
              onMedia={handleMedia}
              onPublish={handlePublish}
              onUnpublish={handleUnpublish}
              onArchive={handleArchive}
              onRestore={handleRestore}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Page <span className="font-semibold text-slate-700 dark:text-slate-200">{meta.page ?? 1}</span> of{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {Math.max(1, Math.ceil((meta.total ?? 0) / (meta.pageSize ?? 12)))}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={(meta.page ?? 1) <= 1}
            onClick={() =>
              setFilters((p) => ({
                ...p,
                page: Math.max(1, (p.page ?? 1) - 1),
              }))
            }
          >
            Prev
          </Button>
          <Button
            variant="outline"
            disabled={(meta.page ?? 1) >= Math.ceil((meta.total ?? 0) / (meta.pageSize ?? 12) || 1)}
            onClick={() =>
              setFilters((p) => ({
                ...p,
                page: (p.page ?? 1) + 1,
              }))
            }
          >
            Next
          </Button>
        </div>
      </div>

      <ShowcaseEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        mode={editing ? "edit" : "create"}
        value={editorInitial}
        categories={categoriesQ.data ?? []}
        tags={tagsQ.data ?? []}
        busy={createM.isPending || updateM.isPending}
        onSubmit={handleSaveProject}
      />

      <TaxonomyDialog
        open={taxonomyOpen}
        onOpenChange={setTaxonomyOpen}
        categories={categoriesQ.data ?? []}
        tags={tagsQ.data ?? []}
        busyCategoryCreate={createCategoryM.isPending}
        busyTagCreate={createTagM.isPending}
        busyCategoryUpdate={updateCategoryM.isPending}
        busyTagUpdate={updateTagM.isPending}
        busyCategoryDelete={deleteCategoryM.isPending}
        busyTagDelete={deleteTagM.isPending}
        onCreateCategory={(payload) => createCategoryM.mutateAsync(payload)}
        onCreateTag={(payload) => createTagM.mutateAsync(payload)}
        onUpdateCategory={(id, payload) => updateCategoryM.mutateAsync({ id, payload })}
        onUpdateTag={(id, payload) => updateTagM.mutateAsync({ id, payload })}
        onDeleteCategory={(id) => deleteCategoryM.mutateAsync(id)}
        onDeleteTag={(id) => deleteTagM.mutateAsync(id)}
        />

      <ShowcaseMediaDialog
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        projectId={mediaProject?.id}
        project={detailQ.data}
        busyAdd={addMediaM.isPending}
        busyRemove={removeMediaM.isPending}
        busyReorder={reorderMediaM.isPending}
        onAdd={async (payload) => {
          await addMediaM.mutateAsync({ projectId: mediaProject!.id, payload });
        }}
        onRemove={async (mediaId) => {
          await removeMediaM.mutateAsync({ projectId: mediaProject!.id, mediaId });
        }}
        onReorder={async (payload) => {
          await reorderMediaM.mutateAsync({ projectId: mediaProject!.id, payload });
        }}
      />
    </div>
  );
}