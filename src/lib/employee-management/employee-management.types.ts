// src/lib/employee-management/employee-management.types.ts

/**
 * Employee Management Types (All-in-One)
 * Frontend-safe (no @prisma/client import needed)
 * Mirrors your NestJS DTOs + Prisma enums as string unions
 */

/* =========================================
 * Shared / Utility Types
 * ======================================= */

export type IsoDateString = string;

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;

export type Id = string;

/* =========================================
 * API Envelope Types (common backend style)
 * ======================================= */

export type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export type ApiResult<T> = ApiResponse<T> | T;

export type ApiErrorResponse = {
  statusCode: number;
  message: string;
  data?: unknown;
};

export type PaginatedMeta = {
  page: number; // 1-based
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PaginatedData<T> = {
  items: T[];
  meta: PaginatedMeta;
};

export type PaginatedApiResponse<T> = ApiResponse<PaginatedData<T>>;

/* =========================================
 * Enum Values (Prisma-compatible string unions)
 * ======================================= */

export const EMPLOYEE_STATUS_VALUES = [
  "ONBOARDING",
  "ACTIVE",
  "ON_LEAVE",
  "SUSPENDED",
  "TERMINATED",
  "INACTIVE",
] as const;
export type EmployeeStatus = (typeof EMPLOYEE_STATUS_VALUES)[number];

export const EMPLOYEE_ACCESS_STATUS_VALUES = [
  "NONE",
  "INVITED",
  "ACTIVE",
  "DISABLED",
] as const;
export type EmployeeAccessStatus = (typeof EMPLOYEE_ACCESS_STATUS_VALUES)[number];

export const EMPLOYMENT_TYPE_VALUES = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACTOR",
  "INTERN",
  "TEMPORARY",
] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPE_VALUES)[number];

export const GENDER_VALUES = ["MALE", "FEMALE", "OTHER", "UNSPECIFIED"] as const;
export type Gender = (typeof GENDER_VALUES)[number];

export const MARITAL_STATUS_VALUES = [
  "SINGLE",
  "MARRIED",
  "DIVORCED",
  "SEPARATED",
  "WIDOWED",
  "UNSPECIFIED",
] as const;
export type MaritalStatus = (typeof MARITAL_STATUS_VALUES)[number];

export const ADDRESS_TYPE_VALUES = ["HOME", "MAILING", "WORK", "OTHER"] as const;
export type AddressType = (typeof ADDRESS_TYPE_VALUES)[number];

export const EMPLOYEE_DOCUMENT_KIND_VALUES = [
  "ID_CARD",
  "PASSPORT",
  "CONTRACT",
  "OFFER_LETTER",
  "CV_RESUME",
  "CERTIFICATION",
  "OTHER",
] as const;
export type EmployeeDocumentKind = (typeof EMPLOYEE_DOCUMENT_KIND_VALUES)[number];

export const EMPLOYEE_DOCUMENT_REQUEST_STATUS_VALUES = [
  "PENDING",
  "SUBMITTED",
  "CANCELED",
  "EXPIRED",
] as const;
export type EmployeeDocumentRequestStatus =
  (typeof EMPLOYEE_DOCUMENT_REQUEST_STATUS_VALUES)[number];

export const EMPLOYEE_DOCUMENT_EXPIRY_STATUS_VALUES = [
  "current",
  "expiring",
  "expired",
] as const;
export type EmployeeDocumentExpiryStatus =
  (typeof EMPLOYEE_DOCUMENT_EXPIRY_STATUS_VALUES)[number];

export const FILE_PROVIDER_VALUES = ["CLOUDINARY", "S3", "LOCAL"] as const;
export type FileProvider = (typeof FILE_PROVIDER_VALUES)[number];

/* =========================================
 * Query / Pagination DTOs (matches backend DTOs)
 * ======================================= */

export type PaginationDto = {
  page?: number; // 1-based
  pageSize?: number; // default 20
};

export type EmployeeListFilterDto = {
  q?: string; // name/email/employeeNumber search
  status?: EmployeeStatus;
  employmentType?: EmploymentType;

  orgUnitId?: string;
  locationId?: string;
  positionId?: string;
  costCenterId?: string;

  includeDeleted?: boolean;
};

export type EmployeeListQuery = EmployeeListFilterDto & PaginationDto;

/* =========================================
 * Reference / Lookup Types (for joined records)
 * ======================================= */

export type BasicUserRef = {
  id: string;
  email?: string | null;
};

export type BasicEmployeeRef = {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber?: string | null;
  status?: EmployeeStatus;
};

export type BasicOrgUnitRef = {
  id: string;
  name: string;
  code?: string | null;
};

export type BasicLocationRef = {
  id: string;
  name: string;
  code?: string | null;
};

export type BasicPositionRef = {
  id: string;
  title: string;
  code?: string | null;
};

export type BasicCostCenterRef = {
  id: string;
  name: string;
  code?: string | null;
};

export type BasicTenantRef = {
  id: string;
  name?: string | null;
  slug?: string | null;
};

export type BasicFileObjectRef = {
  id: string;
  provider?: FileProvider;
  bucket?: string | null;
  key?: string | null;
  url?: string | null;
  cloudinaryPublicId?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  format?: string | null;
  width?: number | null;
  height?: number | null;
};

/* =========================================
 * Core Employee Entity Types
 * ======================================= */

export type Employee = {
  id: string;
  tenantId: string;

  userId?: string | null;
  user?: BasicUserRef | null;

  employeeNumber?: string | null;
  status: EmployeeStatus;
  employmentType: EmploymentType;

  accessStatus?: EmployeeAccessStatus;
  accessInvitedAt?: string | null;
  accessActivatedAt?: string | null;
  accessDisabledAt?: string | null;

  firstName: string;
  lastName: string;
  middleName?: string | null;
  preferredName?: string | null;

  workEmail?: string | null;
  personalEmail?: string | null;
  workPhone?: string | null;
  personalPhone?: string | null;

  dob?: string | null;
  gender: Gender;
  maritalStatus: MaritalStatus;

  nationality?: string | null;
  countryOfResidence?: string | null;
  language?: string | null;

  hireDate?: string | null;
  startDate?: string | null;
  probationEndDate?: string | null;
  terminationDate?: string | null;
  terminationReason?: string | null;

  managerId?: string | null;
  manager?: BasicEmployeeRef | null;

  profilePhotoFileId?: string | null;
  profilePhotoFile?: BasicFileObjectRef | null;

  metadata?: JsonValue | null;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type EmployeeAssignment = {
  id: string;
  tenantId: string;

  employeeId: string;
  employee?: BasicEmployeeRef;

  orgUnitId?: string | null;
  orgUnit?: BasicOrgUnitRef | null;

  locationId?: string | null;
  location?: BasicLocationRef | null;

  positionId?: string | null;
  position?: BasicPositionRef | null;

  costCenterId?: string | null;
  costCenter?: BasicCostCenterRef | null;

  managerId?: string | null;
  manager?: BasicEmployeeRef | null;

  isPrimary: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
  notes?: string | null;

  createdAt: string;
};

export type EmployeeAddress = {
  id: string;
  tenantId: string;
  employeeId: string;

  type: AddressType;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null; // ISO2
  isPrimary: boolean;

  createdAt: string;
  updatedAt: string;
};

export type EmergencyContact = {
  id: string;
  tenantId: string;
  employeeId: string;

  name: string;
  relationship?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  isPrimary: boolean;

  createdAt: string;
  updatedAt: string;
};

export type Dependent = {
  id: string;
  tenantId: string;
  employeeId: string;

  name: string;
  relationship?: string | null;
  dob?: string | null; // ISO
  metadata?: JsonValue | null;

  createdAt: string;
  updatedAt: string;
};

export type EmployeeDocument = {
  id: string;
  tenantId: string;
  employeeId: string;

  kind: EmployeeDocumentKind;
  title?: string | null;

  fileId: string;
  file?: BasicFileObjectRef;

  issuedAt?: string | null;
  expiresAt?: string | null;
  sourceRequestId?: string | null;

  verifiedAt?: string | null;
  verifiedByUserId?: string | null;
  verifiedByUser?: BasicUserRef | null;

  documentLabel?: string;
  expiryStatus?: EmployeeDocumentExpiryStatus;
  lastExpiryReminderAt?: string | null;
  expiryReminderCount?: number | null;

  metadata?: JsonValue | null;

  createdAt: string;
  updatedAt?: string;
};

export type EmployeeDocumentRequest = {
  id: string;
  tenantId: string;
  employeeId: string;

  kind: EmployeeDocumentKind;
  title?: string | null;
  notes?: string | null;
  recipientEmail: string;

  requestedByUserId?: string | null;
  requestedByUser?: BasicUserRef | null;

  dueAt?: string | null;
  expiresAt: string;
  status: EmployeeDocumentRequestStatus;

  submittedAt?: string | null;
  submittedDocumentId?: string | null;
  submittedDocument?: EmployeeDocument | null;

  metadata?: JsonValue | null;

  documentLabel?: string;
  isExpired?: boolean;
  publicLink?: string;

  createdAt: string;
  updatedAt?: string;
};

export type PublicEmployeeDocumentRequest = {
  id: string;
  kind: EmployeeDocumentKind;
  title?: string | null;
  notes?: string | null;
  dueAt?: string | null;
  expiresAt: string;
  status: EmployeeDocumentRequestStatus;
  submittedAt?: string | null;

  canSubmit: boolean;
  documentLabel: string;

  employee: {
    id: string;
    employeeNumber?: string | null;
    firstName: string;
    lastName: string;
    preferredName?: string | null;
  };

  tenant: BasicTenantRef;
};

export type EmployeeDocumentFolderSummary = {
  documentCount: number;
  pendingRequestCount: number;
  expiredCount: number;
  expiringCount: number;
  lastActivityAt?: string | null;
};

export type EmployeeDocumentFolderListItem = {
  employeeId: string;
  folderName: string;
  folderPath: string;
  summary: EmployeeDocumentFolderSummary;
};

export type EmployeeDocumentFolder = {
  employee: {
    id: string;
    employeeNumber?: string | null;
    firstName: string;
    lastName: string;
    preferredName?: string | null;
    workEmail?: string | null;
    personalEmail?: string | null;
  };
  folder: {
    name: string;
    path: string;
  };
  summary: EmployeeDocumentFolderSummary;
  documents: EmployeeDocument[];
  documentsByKind: Record<string, EmployeeDocument[]>;
  requests: EmployeeDocumentRequest[];
};

export type EmployeeNote = {
  id: string;
  tenantId: string;
  employeeId: string;

  authorUserId?: string | null;
  authorUser?: BasicUserRef | null;

  body: string;
  metadata?: JsonValue | null;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

/* =========================================
 * Aggregate / Detail View Types
 * ======================================= */

export type EmployeeDetail = Employee & {
  assignments?: EmployeeAssignment[];
  addresses?: EmployeeAddress[];
  emergencyContacts?: EmergencyContact[];
  dependents?: Dependent[];
  documents?: EmployeeDocument[];
  notes?: EmployeeNote[];
};

export type EmployeeListItem = Employee & {
  primaryAssignment?: EmployeeAssignment | null;
};

export type EmployeeListData = PaginatedData<EmployeeListItem>;

/* =========================================
 * Request DTO Types (Create / Update)
 * Mirrors backend DTOs
 * ======================================= */

export type CreateEmployeeAssignmentDto = {
  orgUnitId?: string | null;
  locationId?: string | null;
  positionId?: string | null;
  costCenterId?: string | null;

  managerId?: string | null;

  isPrimary?: boolean;

  effectiveFrom?: string; // ISO
  effectiveTo?: string | null;

  notes?: string | null;
};

export type UpdateEmployeeAssignmentDto = CreateEmployeeAssignmentDto;

export type CreateEmployeeDto = {
  userId?: string;

  employeeNumber?: string;
  employmentType?: EmploymentType;

  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;

  workEmail?: string;
  personalEmail?: string;
  workPhone?: string;
  personalPhone?: string;

  dob?: string; // ISO
  gender?: Gender;
  maritalStatus?: MaritalStatus;

  nationality?: string;
  countryOfResidence?: string; // ISO2
  language?: string;

  hireDate?: string; // ISO
  startDate?: string; // ISO
  probationEndDate?: string; // ISO

  metadata?: JsonValue;

  // optional primary assignment creation
  primaryAssignment?: CreateEmployeeAssignmentDto;

  // optional future extension:
  // onboardingTemplateId?: string;
};

export type UpdateEmployeeDto = {
  userId?: string | null;

  employeeNumber?: string | null;
  employmentType?: EmploymentType;

  firstName?: string;
  lastName?: string;
  middleName?: string | null;
  preferredName?: string | null;

  workEmail?: string | null;
  personalEmail?: string | null;
  workPhone?: string | null;
  personalPhone?: string | null;

  dob?: string | null; // ISO
  gender?: Gender;
  maritalStatus?: MaritalStatus;

  nationality?: string | null;
  countryOfResidence?: string | null;
  language?: string | null;

  hireDate?: string | null;
  startDate?: string | null;
  probationEndDate?: string | null;

  metadata?: JsonValue;
};

export type ChangeEmployeeStatusDto = {
  status: EmployeeStatus;
  terminationDate?: string; // required if TERMINATED
  terminationReason?: string;
};

export type CreateEmployeeAddressDto = {
  type: AddressType;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string; // ISO2
  isPrimary?: boolean;
};

export type UpdateEmployeeAddressDto = {
  type?: AddressType;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  isPrimary?: boolean;
};

export type CreateEmergencyContactDto = {
  name: string;
  relationship?: string;
  phone?: string;
  email?: string;
  address?: string;
  isPrimary?: boolean;
};

export type UpdateEmergencyContactDto = {
  name?: string;
  relationship?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  isPrimary?: boolean;
};

export type CreateDependentDto = {
  name: string;
  relationship?: string;
  dob?: string; // ISO
  metadata?: JsonValue;
};

export type UpdateDependentDto = {
  name?: string;
  relationship?: string | null;
  dob?: string | null; // ISO
  metadata?: JsonValue;
};

export type CreateEmployeeNoteDto = {
  body: string;
  metadata?: JsonValue;
};

export type UpdateEmployeeNoteDto = {
  body?: string;
  metadata?: JsonValue;
};

export type CreateEmployeeDocumentDto = {
  kind: EmployeeDocumentKind;
  title?: string;
  fileId: string; // For simplicity, we accept a file URL. In a real app, you might handle file uploads differently.

  issuedAt?: string; // ISO
  expiresAt?: string; // ISO

  metadata?: JsonValue;
};

export type VerifyEmployeeDocumentDto = {
  verified: boolean;
};

export type EmployeeDocumentFolderQueryDto = {
  daysAhead?: number;
};

export type CreateEmployeeDocumentRequestDto = {
  kind: EmployeeDocumentKind;
  title?: string;
  notes?: string;
  recipientEmail?: string;
  dueAt?: string;
  requestExpiresAt?: string;
  metadata?: JsonValue;
};

export type SubmitEmployeeDocumentRequestFileDto = {
  provider: FileProvider;
  bucket?: string | null;
  key?: string | null;
  url?: string | null;
  cloudinaryPublicId?: string | null;
  cloudinaryAssetId?: string | null;
  cloudinaryResource?: string | null;
  cloudinaryVersion?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  format?: string | null;
  width?: number | null;
  height?: number | null;
  metadata?: JsonValue;
};

export type SubmitEmployeeDocumentRequestDto = {
  fileId?: string;
  file?: SubmitEmployeeDocumentRequestFileDto;
  title?: string;
  issuedAt?: string;
  expiresAt?: string;
  metadata?: JsonValue;
};

export type SendEmployeeDocumentExpiryRemindersDto = {
  daysAhead?: number;
};

/* =========================================
 * Route Param Types (handy for hooks/pages)
 * ======================================= */

export type EmployeeIdParam = {
  employeeId: string;
};

export type EmployeeRecordIdParam = {
  id: string;
};

export type EmployeeAddressIdParam = {
  addressId: string;
};

export type EmployeeDocumentIdParam = {
  documentId: string;
};

export type EmployeeAssignmentIdParam = {
  assignmentId: string;
};

export type EmergencyContactIdParam = {
  contactId: string;
};

export type DependentIdParam = {
  dependentId: string;
};

/* =========================================
 * Endpoint Response Types (typed wrappers)
 * ======================================= */

// Employees
export type ListEmployeesResponse = ApiResponse<EmployeeListData>;
export type GetEmployeeResponse = ApiResponse<EmployeeDetail>;
export type CreateEmployeeResponse = ApiResponse<EmployeeDetail | Employee>;
export type UpdateEmployeeResponse = ApiResponse<EmployeeDetail | Employee>;
export type ChangeEmployeeStatusResponse = ApiResponse<Employee>;
export type SoftDeleteEmployeeResponse = ApiResponse<{ id: string; deletedAt?: string | null } | Employee>;
export type RestoreEmployeeResponse = ApiResponse<Employee>;

// Assignments
export type ListEmployeeAssignmentsResponse = ApiResponse<EmployeeAssignment[]>;
export type CreateEmployeeAssignmentResponse = ApiResponse<EmployeeAssignment>;
export type UpdateEmployeeAssignmentResponse = ApiResponse<EmployeeAssignment>;
export type SetPrimaryEmployeeAssignmentResponse = ApiResponse<EmployeeAssignment>;
export type EndEmployeeAssignmentResponse = ApiResponse<EmployeeAssignment>;
export type RemoveEmployeeAssignmentResponse = ApiResponse<{ id: string } | EmployeeAssignment>;

// Addresses
export type ListEmployeeAddressesResponse = ApiResponse<EmployeeAddress[]>;
export type CreateEmployeeAddressResponse = ApiResponse<EmployeeAddress>;
export type UpdateEmployeeAddressResponse = ApiResponse<EmployeeAddress>;
export type SetPrimaryEmployeeAddressResponse = ApiResponse<EmployeeAddress>;
export type RemoveEmployeeAddressResponse = ApiResponse<{ id: string } | EmployeeAddress>;

// Emergency Contacts
export type ListEmergencyContactsResponse = ApiResponse<EmergencyContact[]>;
export type CreateEmergencyContactResponse = ApiResponse<EmergencyContact>;
export type UpdateEmergencyContactResponse = ApiResponse<EmergencyContact>;
export type SetPrimaryEmergencyContactResponse = ApiResponse<EmergencyContact>;
export type RemoveEmergencyContactResponse = ApiResponse<{ id: string } | EmergencyContact>;

// Dependents
export type ListDependentsResponse = ApiResponse<Dependent[]>;
export type CreateDependentResponse = ApiResponse<Dependent>;
export type UpdateDependentResponse = ApiResponse<Dependent>;
export type RemoveDependentResponse = ApiResponse<{ id: string } | Dependent>;

// Documents
export type ListEmployeeDocumentsResponse = ApiResponse<EmployeeDocument[]>;
export type CreateEmployeeDocumentResponse = ApiResponse<EmployeeDocument>;
export type VerifyEmployeeDocumentResponse = ApiResponse<EmployeeDocument>;
export type RemoveEmployeeDocumentResponse = ApiResponse<{ id: string } | EmployeeDocument>;
export type ListEmployeeDocumentFoldersResponse = ApiResult<EmployeeDocumentFolderListItem[]>;
export type ListExpiringEmployeeDocumentsResponse = ApiResult<EmployeeDocument[]>;
export type SendEmployeeDocumentExpiryRemindersResponse = ApiResult<{
  ok: boolean;
  totalCandidates: number;
  queued: number;
  skipped: number;
}>;
export type GetEmployeeDocumentFolderResponse = ApiResult<EmployeeDocumentFolder>;
export type ListEmployeeDocumentRequestsResponse = ApiResult<EmployeeDocumentRequest[]>;
export type CreateEmployeeDocumentRequestResponse = ApiResult<EmployeeDocumentRequest>;
export type GetPublicEmployeeDocumentRequestResponse = ApiResult<PublicEmployeeDocumentRequest>;
export type SubmitPublicEmployeeDocumentRequestResponse = ApiResult<{
  ok: boolean;
  documentId: string;
  requestId: string;
}>;

// Notes (for future endpoint)
export type ListEmployeeNotesResponse = ApiResponse<EmployeeNote[]>;
export type CreateEmployeeNoteResponse = ApiResponse<EmployeeNote>;
export type UpdateEmployeeNoteResponse = ApiResponse<EmployeeNote>;
export type RemoveEmployeeNoteResponse = ApiResponse<{ id: string } | EmployeeNote>;

/* =========================================
 * Frontend Form Models (optional, convenient)
 * ======================================= */

export type EmployeeFormValues = {
  userId?: string | null;

  employeeNumber?: string | null;
  employmentType?: EmploymentType;

  firstName: string;
  lastName: string;
  middleName?: string | null;
  preferredName?: string | null;

  workEmail?: string | null;
  personalEmail?: string | null;
  workPhone?: string | null;
  personalPhone?: string | null;

  dob?: string | null;
  gender?: Gender;
  maritalStatus?: MaritalStatus;

  nationality?: string | null;
  countryOfResidence?: string | null;
  language?: string | null;

  hireDate?: string | null;
  startDate?: string | null;
  probationEndDate?: string | null;

  metadata?: JsonValue;

  primaryAssignment?: CreateEmployeeAssignmentDto;
};

export type EmployeeAddressFormValues = CreateEmployeeAddressDto;
export type EmergencyContactFormValues = CreateEmergencyContactDto;
export type DependentFormValues = CreateDependentDto;
export type EmployeeDocumentFormValues = CreateEmployeeDocumentDto;
export type EmployeeAssignmentFormValues = CreateEmployeeAssignmentDto;

/* =========================================
 * Guards / Helpers (type-level)
 * ======================================= */

export type EmployeeStatusChangeToTerminated = {
  status: "TERMINATED";
  terminationDate: string;
  terminationReason?: string;
};

export type EmployeeStatusChangeNonTerminated = {
  status: Exclude<EmployeeStatus, "TERMINATED">;
  terminationDate?: string;
  terminationReason?: string;
};

export type SafeChangeEmployeeStatusInput =
  | EmployeeStatusChangeToTerminated
  | EmployeeStatusChangeNonTerminated;
