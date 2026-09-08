// src/logaxp/lib/uploads/uploads.types.ts

export type UploadVisibility = "PRIVATE" | "TENANT" | "PUBLIC";

export type UploadStatus =
  | "PENDING"
  | "UPLOADING"
  | "READY"
  | "FAILED"
  | "ARCHIVED";

export type UploadProvider = "LOCAL" | "S3" | "CLOUDINARY" | "OTHER";

export type UploadRecord = {
  id: string;

  // tenant-scoped (most likely)
  tenantId?: string | null;

  // who created it
  createdByUserId?: string | null;

  // display/meta
  name: string;
  originalName?: string | null;
  mimeType?: string | null;
  size?: number | null;

  // storage
  provider?: UploadProvider | null;
  url?: string | null; // direct URL (if you store it)
  key?: string | null; // storage key/path (S3 object key, etc.)

  // optional
  visibility?: UploadVisibility | null;
  status?: UploadStatus | null;

  // timestamps
  createdAt?: string;
  updatedAt?: string;
};

export type RegisterUploadDto = {
  // what FE sends to "register"
  name: string;

  originalName?: string | null;
  mimeType?: string | null;
  size?: number | null;

  provider?: UploadProvider | null;
  url?: string | null;
  key?: string | null;

  visibility?: UploadVisibility | null;
};

export type RegisterUploadResponse = UploadRecord;

export type UploadListQuery = {
  q?: string;
  page?: number;
  limit?: number;
  status?: UploadStatus;
  visibility?: UploadVisibility;
};

export type Paginated<T> = {
  items: T[];
  page?: number;
  limit?: number;
  total?: number;
};

// src/logaxp/lib/uploads/uploads.types.ts

export type FileObject = {
  id: string;
  tenantId?: string | null;

  provider?: string | null; // e.g. "cloudinary"
  publicId?: string | null;
  url: string;

  bytes?: number | null;
  format?: string | null;
  width?: number | null;
  height?: number | null;

  originalName?: string | null;

  createdAt?: string;
  updatedAt?: string;
};

export type RegisterFileRequest = {
  provider?: "cloudinary" | string;
  publicId?: string | null;
  url: string;

  bytes?: number;
  format?: string;
  width?: number;
  height?: number;

  originalName?: string;
};

export type RegisterFileResponse = FileObject;

export type GetFileResponse = FileObject;