// src/features/showcase/services/showcase.service.ts

import type {
  AddMediaDto,
  AdminListShowcasesDto,
  CreateShowcaseProjectDto,
  PaginatedResult,
  PublicListShowcasesDto,
  PublishDto,
  ReorderMediaDto,
  ShowcaseCategory,
  ShowcaseProject,
  ShowcaseProjectListItem,
  ShowcaseProjectMedia,
  ShowcaseTag,
  UpdateShowcaseProjectDto,
  UpsertCategoryDto,
  UpsertTagDto,
} from "./showcase.types";

import { api } from "@/logaxp/lib/api/apiClient";

function cleanParams<T extends Record<string, unknown>>(params?: T): Record<string, unknown> | undefined {
  if (!params) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") out[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

/** =========================
 * Public Showcase API
 * ========================= */
export const showcasePublicService = {
  async list(params?: PublicListShowcasesDto): Promise<PaginatedResult<ShowcaseProjectListItem>> {
    const { data } = await api.get("/showcases", {
      params: cleanParams(params as Record<string, unknown>),
    });
    return data;
  },

  async getBySlug(slug: string): Promise<ShowcaseProject> {
    const { data } = await api.get(`/showcases/${encodeURIComponent(slug)}`);
    return data;
  },
};

/** =========================
 * Admin Showcase API
 * ========================= */
export const showcaseAdminService = {
  async list(params?: AdminListShowcasesDto): Promise<PaginatedResult<ShowcaseProject>> {
    const { data } = await api.get("/admin/showcases", {
      params: cleanParams(params as Record<string, unknown>),
    });
    return data;
  },

  async getById(id: string): Promise<ShowcaseProject> {
    const { data } = await api.get(`/admin/showcases/${id}`);
    return data;
  },

  async create(payload: CreateShowcaseProjectDto): Promise<ShowcaseProject> {
    const { data } = await api.post("/admin/showcases", payload);
    return data;
  },

  async update(id: string, payload: UpdateShowcaseProjectDto): Promise<ShowcaseProject> {
    const { data } = await api.patch(`/admin/showcases/${id}`, payload);
    return data;
  },

  async publish(id: string, payload: PublishDto = {}): Promise<ShowcaseProject> {
    const { data } = await api.post(`/admin/showcases/${id}/publish`, payload);
    return data;
  },

  async unpublish(id: string): Promise<ShowcaseProject> {
    const { data } = await api.post(`/admin/showcases/${id}/unpublish`);
    return data;
  },

  async archive(id: string): Promise<ShowcaseProject> {
    const { data } = await api.post(`/admin/showcases/${id}/archive`);
    return data;
  },

  async restore(id: string): Promise<ShowcaseProject | { ok: true }> {
    const { data } = await api.post(`/admin/showcases/${id}/restore`);
    return data;
  },

  async remove(id: string): Promise<{ ok: true }> {
    const { data } = await api.delete(`/admin/showcases/${id}`);
    return data;
  },

  // MEDIA
  async addMedia(projectId: string, payload: AddMediaDto): Promise<ShowcaseProjectMedia> {
    const { data } = await api.post(`/admin/showcases/${projectId}/media`, payload);
    return data;
  },

  async removeMedia(projectId: string, mediaId: string): Promise<{ ok: true }> {
    const { data } = await api.delete(`/admin/showcases/${projectId}/media/${mediaId}`);
    return data;
  },

  async reorderMedia(projectId: string, payload: ReorderMediaDto): Promise<{ ok: true }> {
    const { data } = await api.post(`/admin/showcases/${projectId}/media/reorder`, payload);
    return data;
  },
  // TAXONOMY
  async listCategories(): Promise<ShowcaseCategory[]> {
    const { data } = await api.get("/admin/showcases/taxonomy/categories");
    return data;
  },

  async listTags(): Promise<ShowcaseTag[]> {
    const { data } = await api.get("/admin/showcases/taxonomy/tags");
    return data;
  },

  async createCategory(payload: UpsertCategoryDto): Promise<ShowcaseCategory> {
    const { data } = await api.post("/admin/showcases/taxonomy/categories", payload);
    return data;
  },

  async createTag(payload: UpsertTagDto): Promise<ShowcaseTag> {
    const { data } = await api.post("/admin/showcases/taxonomy/tags", payload);
    return data;
  },

  async updateCategory(id: string, payload: UpsertCategoryDto): Promise<ShowcaseCategory> {
    const { data } = await api.patch(`/admin/showcases/taxonomy/categories/${encodeURIComponent(id)}`, payload);
    return data;
  },

  async updateTag(id: string, payload: UpsertTagDto): Promise<ShowcaseTag> {
    const { data } = await api.patch(`/admin/showcases/taxonomy/tags/${encodeURIComponent(id)}`, payload);
    return data;
  },

  async deleteCategory(id: string): Promise<{ ok: true }> {
    const { data } = await api.delete(`/admin/showcases/taxonomy/categories/${encodeURIComponent(id)}`);
    return data;
  },

  async deleteTag(id: string): Promise<{ ok: true }> {
    const { data } = await api.delete(`/admin/showcases/taxonomy/tags/${encodeURIComponent(id)}`);
    return data;
  },
};