"use client";

import type {
  ApiResponse,
  Id,
  IsoDateString,
  JsonValue,
} from "@/logaxp/lib/employee-management/employee-management.types";

export type DecimalValue = string | number;

export const COMPENSATION_TYPE_VALUES = [
  "SALARIED",
  "HOURLY",
  "COMMISSION_ONLY",
  "SALARY_PLUS_COMMISSION",
  "CONTRACT_FIXED",
] as const;
export type CompensationType = (typeof COMPENSATION_TYPE_VALUES)[number];

export const PAYROLL_PROFILE_STATUS_VALUES = [
  "ACTIVE",
  "SUSPENDED",
  "ARCHIVED",
] as const;
export type PayrollProfileStatus = (typeof PAYROLL_PROFILE_STATUS_VALUES)[number];

export const PAYMENT_METHOD_TYPE_VALUES = [
  "BANK_ACCOUNT",
  "MOBILE_MONEY",
  "CHECK",
  "CASH",
  "PAYCARD",
] as const;
export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPE_VALUES)[number];

export const PAYMENT_SPLIT_TYPE_VALUES = [
  "FIXED_AMOUNT",
  "PERCENTAGE",
  "REMAINDER",
] as const;
export type PaymentSplitType = (typeof PAYMENT_SPLIT_TYPE_VALUES)[number];

export const BANK_ACCOUNT_TYPE_VALUES = [
  "CHECKING",
  "SAVINGS",
  "DOMICILIARY",
  "OTHER",
] as const;
export type BankAccountType = (typeof BANK_ACCOUNT_TYPE_VALUES)[number];

export const PAY_FREQUENCY_VALUES = [
  "WEEKLY",
  "BIWEEKLY",
  "SEMI_MONTHLY",
  "MONTHLY",
] as const;
export type PayFrequency = (typeof PAY_FREQUENCY_VALUES)[number];

export type EmployeePayrollProfile = {
  id: Id;
  tenantId: Id;
  employeeId: Id;

  status: PayrollProfileStatus;
  compensationType: CompensationType;
  payFrequency?: PayFrequency | null;
  currency: string;

  defaultHoursPerWeek?: number | null;
  overtimeEligible: boolean;

  payrollGroup?: string | null;
  workerCategory?: string | null;

  standardRateCents?: number | null;
  costRateCents?: number | null;

  notes?: string | null;
  metadata?: JsonValue | null;

  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};

export type EmployeeCompensation = {
  id: Id;
  tenantId: Id;
  employeeId: Id;

  compensationType: CompensationType;
  currency: string;

  baseSalaryCents?: number | null;
  hourlyRateCents?: number | null;
  dailyRateCents?: number | null;

  commissionPercent?: DecimalValue | null;
  bonusEligible: boolean;

  grade?: string | null;
  band?: string | null;
  step?: string | null;

  effectiveFrom: IsoDateString;
  effectiveTo?: IsoDateString | null;
  reason?: string | null;
  metadata?: JsonValue | null;

  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};

export type EmployeePaymentMethod = {
  id: Id;
  tenantId: Id;
  employeeId: Id;

  type: PaymentMethodType;
  label?: string | null;

  bankName?: string | null;
  bankCode?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  accountNumberLast4?: string | null;
  accountType?: BankAccountType | null;

  routingNumber?: string | null;
  swiftCode?: string | null;
  iban?: string | null;

  providerName?: string | null;
  walletNumber?: string | null;

  isPrimary: boolean;
  isActive: boolean;

  verificationStatus?: string | null;
  verifiedAt?: IsoDateString | null;

  notes?: string | null;
  metadata?: JsonValue | null;

  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};

export type EmployeePaymentMethodSummary = Pick<
  EmployeePaymentMethod,
  | "id"
  | "type"
  | "label"
  | "bankName"
  | "accountName"
  | "accountNumberLast4"
  | "providerName"
  | "walletNumber"
  | "isPrimary"
  | "isActive"
>;

export type EmployeePaymentSplit = {
  id: Id;
  tenantId: Id;
  employeeId: Id;
  paymentMethodId: Id;

  splitType: PaymentSplitType;
  fixedAmountCents?: number | null;
  percentage?: DecimalValue | null;

  priority: number;
  isActive: boolean;

  effectiveFrom: IsoDateString;
  effectiveTo?: IsoDateString | null;
  notes?: string | null;

  createdAt: IsoDateString;
  updatedAt: IsoDateString;

  paymentMethod?: EmployeePaymentMethodSummary;
};

export type UpsertEmployeePayrollProfileDto = {
  compensationType: CompensationType;
  status?: PayrollProfileStatus;
  payFrequency?: PayFrequency;
  currency?: string;
  defaultHoursPerWeek?: number;
  overtimeEligible?: boolean;
  payrollGroup?: string;
  workerCategory?: string;
  standardRateCents?: number;
  costRateCents?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
};

export type ListEmployeeCompensationsQueryDto = {
  currentOnly?: boolean;
  effectiveOn?: string;
};

export type CreateEmployeeCompensationDto = {
  compensationType: CompensationType;
  currency?: string;
  baseSalaryCents?: number;
  hourlyRateCents?: number;
  dailyRateCents?: number;
  commissionPercent?: number;
  bonusEligible?: boolean;
  grade?: string;
  band?: string;
  step?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
};

export type UpdateEmployeeCompensationDto = {
  compensationType?: CompensationType;
  currency?: string;
  baseSalaryCents?: number | null;
  hourlyRateCents?: number | null;
  dailyRateCents?: number | null;
  commissionPercent?: number | null;
  bonusEligible?: boolean;
  grade?: string | null;
  band?: string | null;
  step?: string | null;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  reason?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type ListEmployeePaymentMethodsQueryDto = {
  includeInactive?: boolean;
};

export type CreateEmployeePaymentMethodDto = {
  type: PaymentMethodType;
  label?: string;
  bankName?: string;
  bankCode?: string;
  accountName?: string;
  accountNumber?: string;
  accountType?: BankAccountType;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  providerName?: string;
  walletNumber?: string;
  isPrimary?: boolean;
  isActive?: boolean;
  verificationStatus?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
};

export type UpdateEmployeePaymentMethodDto = {
  type?: PaymentMethodType;
  label?: string | null;
  bankName?: string | null;
  bankCode?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  accountType?: BankAccountType | null;
  routingNumber?: string | null;
  swiftCode?: string | null;
  iban?: string | null;
  providerName?: string | null;
  walletNumber?: string | null;
  isPrimary?: boolean;
  isActive?: boolean;
  verificationStatus?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type ListEmployeePaymentSplitsQueryDto = {
  includeInactive?: boolean;
};

export type CreateEmployeePaymentSplitDto = {
  paymentMethodId: string;
  splitType: PaymentSplitType;
  fixedAmountCents?: number;
  percentage?: number;
  priority?: number;
  isActive?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
  notes?: string;
};

export type UpdateEmployeePaymentSplitDto = {
  paymentMethodId?: string;
  splitType?: PaymentSplitType;
  fixedAmountCents?: number | null;
  percentage?: number | null;
  priority?: number;
  isActive?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  notes?: string | null;
};

export type GetEmployeePayrollProfileResponse = ApiResponse<EmployeePayrollProfile | null>;
export type UpsertEmployeePayrollProfileResponse = ApiResponse<EmployeePayrollProfile>;

export type ListEmployeeCompensationsResponse = ApiResponse<EmployeeCompensation[]>;
export type GetEmployeeCompensationResponse = ApiResponse<EmployeeCompensation>;
export type CreateEmployeeCompensationResponse = ApiResponse<EmployeeCompensation>;
export type UpdateEmployeeCompensationResponse = ApiResponse<EmployeeCompensation>;
export type RemoveEmployeeCompensationResponse = ApiResponse<EmployeeCompensation | { id: string }>;

export type ListEmployeePaymentMethodsResponse = ApiResponse<EmployeePaymentMethod[]>;
export type GetEmployeePaymentMethodResponse = ApiResponse<EmployeePaymentMethod>;
export type CreateEmployeePaymentMethodResponse = ApiResponse<EmployeePaymentMethod>;
export type UpdateEmployeePaymentMethodResponse = ApiResponse<EmployeePaymentMethod>;
export type SetPrimaryEmployeePaymentMethodResponse = ApiResponse<{ ok: true }>;
export type RemoveEmployeePaymentMethodResponse = ApiResponse<EmployeePaymentMethod | { id: string }>;

export type ListEmployeePaymentSplitsResponse = ApiResponse<EmployeePaymentSplit[]>;
export type GetEmployeePaymentSplitResponse = ApiResponse<EmployeePaymentSplit>;
export type CreateEmployeePaymentSplitResponse = ApiResponse<EmployeePaymentSplit>;
export type UpdateEmployeePaymentSplitResponse = ApiResponse<EmployeePaymentSplit>;
export type RemoveEmployeePaymentSplitResponse = ApiResponse<EmployeePaymentSplit | { id: string }>;