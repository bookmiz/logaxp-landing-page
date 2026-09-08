// src/features/showcase/hooks/useShowcase.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showcaseAdminService, showcasePublicService } from "@/logaxp/lib/showcase/showcase.service";
import type {
  AddMediaDto,
  AdminListShowcasesDto,
  CreateShowcaseProjectDto,
  PublicListShowcasesDto,
  PublishDto,
  ReorderMediaDto,
  UpdateShowcaseProjectDto,
  UpsertCategoryDto,
  UpsertTagDto,
} from "@/logaxp/lib/showcase/showcase.types";

/** =========================
 * Query Keys
 * ========================= */
export const showcaseKeys = {
  all: ["showcase"] as const,

  public: () => [...showcaseKeys.all, "public"] as const,
  publicList: (params?: PublicListShowcasesDto) =>
    [...showcaseKeys.public(), "list", params ?? {}] as const,
  publicDetail: (slug?: string) => [...showcaseKeys.public(), "detail", slug] as const,

  admin: () => [...showcaseKeys.all, "admin"] as const,
  adminList: (params?: AdminListShowcasesDto) =>
    [...showcaseKeys.admin(), "list", params ?? {}] as const,
  adminDetail: (id?: string) => [...showcaseKeys.admin(), "detail", id] as const,

  taxonomy: () => [...showcaseKeys.admin(), "taxonomy"] as const,
  categories: () => [...showcaseKeys.taxonomy(), "categories"] as const,
  tags: () => [...showcaseKeys.taxonomy(), "tags"] as const,
};

/** =========================
 * Public hooks
 * ========================= */
export function usePublicShowcases(params?: PublicListShowcasesDto) {
  return useQuery({
    queryKey: showcaseKeys.publicList(params),
    queryFn: () => showcasePublicService.list(params),
  });
}

export function usePublicShowcase(slug?: string) {
  return useQuery({
    queryKey: showcaseKeys.publicDetail(slug),
    queryFn: () => showcasePublicService.getBySlug(slug as string),
    enabled: !!slug,
  });
}

/** =========================
 * Admin hooks
 * ========================= */
export function useAdminShowcases(params?: AdminListShowcasesDto) {
  return useQuery({
    queryKey: showcaseKeys.adminList(params),
    queryFn: () => showcaseAdminService.list(params),
  });
}

export function useAdminShowcase(id?: string) {
  return useQuery({
    queryKey: showcaseKeys.adminDetail(id),
    queryFn: () => showcaseAdminService.getById(id as string),
    enabled: !!id,
  });
}

export function useShowcaseCategories() {
  return useQuery({
    queryKey: showcaseKeys.categories(),
    queryFn: () => showcaseAdminService.listCategories(),
  });
}

export function useShowcaseTags() {
  return useQuery({
    queryKey: showcaseKeys.tags(),
    queryFn: () => showcaseAdminService.listTags(),
  });
}

/** =========================
 * Admin Mutations
 * ========================= */
export function useCreateShowcase() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateShowcaseProjectDto) => showcaseAdminService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: showcaseKeys.admin() });
      qc.invalidateQueries({ queryKey: showcaseKeys.public() });
    },
  });
}

export function useUpdateShowcase() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateShowcaseProjectDto }) =>
      showcaseAdminService.update(id, payload),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: showcaseKeys.admin() });
      qc.invalidateQueries({ queryKey: showcaseKeys.public() });
      qc.invalidateQueries({ queryKey: showcaseKeys.adminDetail(variables.id) });
      if (data?.slug) {
        qc.invalidateQueries({ queryKey: showcaseKeys.publicDetail(data.slug) });
      }
    },
  });
}

export function usePublishShowcase() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: PublishDto }) =>
      showcaseAdminService.publish(id, payload ?? {}),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: showcaseKeys.admin() });
      qc.invalidateQueries({ queryKey: showcaseKeys.public() });
      qc.invalidateQueries({ queryKey: showcaseKeys.adminDetail(variables.id) });
      if (data?.slug) qc.invalidateQueries({ queryKey: showcaseKeys.publicDetail(data.slug) });
    },
  });
}

export function useUnpublishShowcase() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => showcaseAdminService.unpublish(id),
    onSuccess: (data, id) => {
      qc.invalidateQueries({ queryKey: showcaseKeys.admin() });
      qc.invalidateQueries({ queryKey: showcaseKeys.public() });
      qc.invalidateQueries({ queryKey: showcaseKeys.adminDetail(id) });
      if (data?.slug) qc.invalidateQueries({ queryKey: showcaseKeys.publicDetail(data.slug) });
    },
  });
}

export function useArchiveShowcase() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => showcaseAdminService.archive(id),
    onSuccess: (data, id) => {
      qc.invalidateQueries({ queryKey: showcaseKeys.admin() });
      qc.invalidateQueries({ queryKey: showcaseKeys.public() });
      qc.invalidateQueries({ queryKey: showcaseKeys.adminDetail(id) });
      if (data?.slug) qc.invalidateQueries({ queryKey: showcaseKeys.publicDetail(data.slug) });
    },
  });
}

export function useRestoreShowcase() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => showcaseAdminService.restore(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: showcaseKeys.admin() });
      qc.invalidateQueries({ queryKey: showcaseKeys.public() });
      qc.invalidateQueries({ queryKey: showcaseKeys.adminDetail(id) });
    },
  });
}

export function useDeleteShowcase() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => showcaseAdminService.remove(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: showcaseKeys.admin() });
      qc.invalidateQueries({ queryKey: showcaseKeys.public() });
      qc.removeQueries({ queryKey: showcaseKeys.adminDetail(id) });
    },
  });
}

/** =========================
 * Media hooks
 * ========================= */
export function useAddShowcaseMedia() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: AddMediaDto }) =>
      showcaseAdminService.addMedia(projectId, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: showcaseKeys.adminDetail(vars.projectId) });
      qc.invalidateQueries({ queryKey: showcaseKeys.admin() });
      qc.invalidateQueries({ queryKey: showcaseKeys.public() });
    },
  });
}

export function useRemoveShowcaseMedia() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, mediaId }: { projectId: string; mediaId: string }) =>
      showcaseAdminService.removeMedia(projectId, mediaId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: showcaseKeys.adminDetail(vars.projectId) });
      qc.invalidateQueries({ queryKey: showcaseKeys.admin() });
      qc.invalidateQueries({ queryKey: showcaseKeys.public() });
    },
  });
}

export function useReorderShowcaseMedia() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: ReorderMediaDto }) =>
      showcaseAdminService.reorderMedia(projectId, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: showcaseKeys.adminDetail(vars.projectId) });
      qc.invalidateQueries({ queryKey: showcaseKeys.admin() });
      qc.invalidateQueries({ queryKey: showcaseKeys.public() });
    },
  });
}

/** =========================
 * Taxonomy hooks
 * ========================= */
export function useCreateShowcaseCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertCategoryDto) => showcaseAdminService.createCategory(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: showcaseKeys.categories() });
      qc.invalidateQueries({ queryKey: showcaseKeys.admin() });
      qc.invalidateQueries({ queryKey: showcaseKeys.public() });
    },
  });
}

export function useCreateShowcaseTag() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertTagDto) => showcaseAdminService.createTag(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: showcaseKeys.tags() });
      qc.invalidateQueries({ queryKey: showcaseKeys.admin() });
      qc.invalidateQueries({ queryKey: showcaseKeys.public() });
    },
  });
}

export function useUpdateShowcaseCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpsertCategoryDto }) =>
      showcaseAdminService.updateCategory(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: showcaseKeys.categories() });
      qc.invalidateQueries({ queryKey: showcaseKeys.admin() });
      qc.invalidateQueries({ queryKey: showcaseKeys.public() });
    },
  });
}

export function useUpdateShowcaseTag() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpsertTagDto }) =>
      showcaseAdminService.updateTag(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: showcaseKeys.tags() });
      qc.invalidateQueries({ queryKey: showcaseKeys.admin() });
      qc.invalidateQueries({ queryKey: showcaseKeys.public() });
    },
  });
}

export function useDeleteShowcaseCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => showcaseAdminService.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: showcaseKeys.categories() });
      qc.invalidateQueries({ queryKey: showcaseKeys.admin() });
      qc.invalidateQueries({ queryKey: showcaseKeys.public() });
    },
  });
}

export function useDeleteShowcaseTag() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => showcaseAdminService.deleteTag(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: showcaseKeys.tags() });
      qc.invalidateQueries({ queryKey: showcaseKeys.admin() });
      qc.invalidateQueries({ queryKey: showcaseKeys.public() });
    },
  });
}