// src/features/showcase/types/showcase.types.ts

export type ShowcaseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type ShowcaseMediaType = "IMAGE" | "VIDEO" | "EMBED" | "DOCUMENT";

export interface FileObjectLite {
  id: string;
  url?: string | null;
  key?: string | null;
  mimeType?: string | null;
  originalName?: string | null;
  sizeBytes?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShowcaseCategory {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShowcaseTag {
  id: string;
  title: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShowcaseProjectCategoryLink {
  projectId?: string;
  categoryId?: string;
  category: ShowcaseCategory;
}

export interface ShowcaseProjectTagLink {
  projectId?: string;
  tagId?: string;
  tag: ShowcaseTag;
}

export interface ShowcaseProjectMedia {
  id: string;
  projectId: string;
  type: ShowcaseMediaType;
  fileId?: string | null;
  url?: string | null;
  title?: string | null;
  alt?: string | null;
  sortOrder: number;
  metadata?: Record<string, unknown> | null;
  file?: FileObjectLite | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShowcaseProjectListItem {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string | null;
  heroUrl?: string | null;
  heroFileId?: string | null;
  featured: boolean;
  publishedAt?: string | null;
  categories?: Array<{ category: Pick<ShowcaseCategory, "title" | "slug"> }>;
  tags?: Array<{ tag: Pick<ShowcaseTag, "title" | "slug"> }>;
}

export interface ShowcaseProject {
  id: string;
  title: string;
  slug: string;

  shortDescription?: string | null;
  description?: string | null;

  seoTitle?: string | null;
  seoDescription?: string | null;

  featured: boolean;
  sortOrder: number;

  status: ShowcaseStatus;
  publishedAt?: string | null;
  archivedAt?: string | null;
  deletedAt?: string | null;

  heroFileId?: string | null;
  heroUrl?: string | null;
  heroFile?: FileObjectLite | null;

  links?: Record<string, unknown> | null;
  content?: Record<string, unknown> | null;

  createdByUserId?: string | null;
  updatedByUserId?: string | null;

  categories?: ShowcaseProjectCategoryLink[];
  tags?: ShowcaseProjectTagLink[];
  media?: ShowcaseProjectMedia[];

  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

/** =========================
 * DTOs (frontend payloads)
 * ========================= */

export interface CreateShowcaseProjectDto {
  title: string;
  slug?: string;

  shortDescription?: string | null;
  description?: string | null;

  seoTitle?: string | null;
  seoDescription?: string | null;

  featured?: boolean;
  sortOrder?: number;

  heroFileId?: string | null;
  heroUrl?: string | null;

  categoryIds?: string[];
  tagIds?: string[];

  links?: Record<string, unknown>;
  content?: Record<string, unknown>;
}

export interface UpdateShowcaseProjectDto {
  title?: string;
  slug?: string;

  shortDescription?: string | null;
  description?: string | null;

  seoTitle?: string | null;
  seoDescription?: string | null;

  featured?: boolean;
  sortOrder?: number;

  heroFileId?: string | null;
  heroUrl?: string | null;

  categoryIds?: string[];
  tagIds?: string[];

  links?: Record<string, unknown>;
  content?: Record<string, unknown>;
}

export interface AdminListShowcasesDto {
  q?: string;
  status?: ShowcaseStatus;
  featured?: boolean;
  includeDeleted?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PublicListShowcasesDto {
  q?: string;
  category?: string;
  tag?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PublishDto {
  publishAt?: string | null; // ISO string
}

export interface AddMediaDto {
  type?: ShowcaseMediaType;
  fileId?: string | null;
  url?: string | null;
  title?: string | null;
  alt?: string | null;
  sortOrder?: number;
  metadata?: Record<string, unknown>;
}

export interface ReorderMediaDto {
  items: Array<{ id: string; sortOrder: number }>;
}

export interface UpsertCategoryDto {
  title: string;
  slug?: string;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpsertTagDto {
  title: string;
  slug?: string;
  sortOrder?: number;
  isActive?: boolean;
}