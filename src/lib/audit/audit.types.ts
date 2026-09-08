export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "RESTORE"
  | "LOGIN"
  | "LOGOUT"
  | "PUBLISH"
  | "UNPUBLISH"
  | "ARCHIVE"
  | (string & {});

export interface AuditLog {
  id: string;
  tenantId?: string | null;
  actorUserId?: string | null;
  actorMembershipId?: string | null;
  requestId?: string | null;

  action: AuditAction;
  entityType: string;
  entityId?: string | null;

  route?: string | null;
  method?: string | null;
  ip?: string | null;
  userAgent?: string | null;

  before?: unknown;
  after?: unknown;
  diff?: unknown;
  metadata?: unknown;

  createdAt?: string;
  updatedAt?: string;
}

export interface AuditListDto {
  q?: string;
  action?: AuditAction;
  entityType?: string;
  entityId?: string;
  actorUserId?: string;
  actorMembershipId?: string;
  tenantId?: string;
  requestId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedAuditLogs {
  items: AuditLog[];
  page: number;
  pageSize: number;
  total: number;
}

export interface AuditSummaryBucket {
  action?: string;
  entityType?: string;
  _count: {
    _all: number;
  };
}

export interface AuditSummary {
  total: number;
  byAction: AuditSummaryBucket[];
  byEntityType: AuditSummaryBucket[];
}