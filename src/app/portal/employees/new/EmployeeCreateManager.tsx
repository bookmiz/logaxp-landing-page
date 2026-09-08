"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  RefreshCcw,
  UserPlus,
  Mail,
  Users,
  Calendar,
  Briefcase,
  Building2,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

import { useEmployeeManagement } from "@/logaxp/hooks/useEmployeeManagement";
import { useOrgStructure } from "@/logaxp/hooks/useOrgStructure";

import type {
  CreateEmployeeDto,
  EmploymentType,
  Gender,
  MaritalStatus,
  CreateEmployeeAssignmentDto,
} from "@/logaxp/lib/employee-management/employee-management.types";
import {
  EMPLOYMENT_TYPE_VALUES,
  GENDER_VALUES,
  MARITAL_STATUS_VALUES,
} from "@/logaxp/lib/employee-management/employee-management.types";

import type {
  ApiResponse,
  ListData,
  OrgUnit,
  Location,
  Position,
  CostCenter,
} from "@/logaxp/lib/orgStructure/orgStructure.types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Input } from "@/logaxp/components/ui/input";
import { Textarea } from "@/logaxp/components/ui/textarea";
import { toast } from "@/logaxp/components/ui/toast";
import { EmployeeSelect } from "@/logaxp/components/lookups/EmployeeSelect";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function unwrapApi<T>(res: ApiResponse<T> | T): T {
  if (
    res &&
    typeof res === "object" &&
    "data" in (res as any) &&
    "statusCode" in (res as any)
  ) {
    return (res as ApiResponse<T>).data;
  }
  return res as T;
}

function unwrapList<T>(data: ListData<T> | any): { items: T[] } {
  if (!data) return { items: [] };
  if (Array.isArray(data)) return { items: data as T[] };
  if (typeof data === "object" && Array.isArray((data as any).items))
    return { items: (data as any).items as T[] };
  return { items: [] };
}

function human(s?: string | null) {
  if (!s) return "—";
  return String(s).replaceAll("_", " ");
}

function isEmail(v: string) {
  const t = v.trim();
  if (!t) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

function isPhone(v: string) {
  const t = v.trim();
  if (!t) return true;
  // permissive: digits + spaces + () +-.
  return /^[0-9()+\-.\s]{7,20}$/.test(t);
}

function SelectField({
  label,
  value,
  onChange,
  children,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx(
          "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none",
          "focus:ring-2 focus:ring-slate-200",
          "dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
        )}
      >
        {children}
      </select>
      {hint ? <div className="text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx(
          "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none",
          "focus:ring-2 focus:ring-slate-200",
          "dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
        )}
      />
      {hint ? <div className="text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

function Section({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            {title}
          </div>
          {subtitle ? (
            <div className="text-xs text-slate-500">{subtitle}</div>
          ) : null}
        </div>
        {right ? <div>{right}</div> : null}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

type StepKey =
  | "basic"
  | "contact"
  | "demographics"
  | "dates"
  | "assignment"
  | "metadata"
  | "review";

type StepDef = {
  key: StepKey;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
};

const STEPS: StepDef[] = [
  {
    key: "basic",
    title: "Basic",
    subtitle: "Identity + employment type",
    icon: UserPlus,
  },
  {
    key: "contact",
    title: "Contact",
    subtitle: "Emails + phone numbers",
    icon: Mail,
  },
  {
    key: "demographics",
    title: "Demographics",
    subtitle: "DOB, gender, marital status",
    icon: Users,
  },
  {
    key: "dates",
    title: "Employment dates",
    subtitle: "Hire/start/probation",
    icon: Calendar,
  },
  {
    key: "assignment",
    title: "Assignment",
    subtitle: "Org unit, position, manager",
    icon: Building2,
  },
  {
    key: "metadata",
    title: "Metadata",
    subtitle: "Custom JSON attributes",
    icon: ClipboardList,
  },
  {
    key: "review",
    title: "Review",
    subtitle: "Confirm and create",
    icon: CheckCircle2,
  },
];

function Stepper({
  active,
  setActive,
  status,
}: {
  active: StepKey;
  setActive: (k: StepKey) => void;
  status: Record<StepKey, "todo" | "error" | "ok">;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const st = status[s.key];
          const isActive = active === s.key;

          const dot =
            st === "ok"
              ? "bg-emerald-500"
              : st === "error"
              ? "bg-rose-500"
              : "bg-slate-300 dark:bg-slate-700";

          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setActive(s.key)}
              className={cx(
                "group w-full text-left rounded-xl border px-3 py-3 transition",
                isActive
                  ? "border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40"
                  : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900/30"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cx(
                    "mt-0.5 grid h-9 w-9 place-items-center rounded-xl border",
                    isActive
                      ? "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                  )}
                >
                  <Icon className="h-4 w-4 text-slate-700 dark:text-slate-200" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {idx + 1}. {s.title}
                    </div>
                    <span className={cx("h-2 w-2 rounded-full", dot)} />
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {s.subtitle}
                  </div>
                </div>

                <ChevronRight className="mt-1 h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2 last:border-b-0 dark:border-slate-900">
      <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
        {label}
      </div>
      <div className="text-sm text-slate-900 dark:text-slate-50">{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: "todo" | "error" | "ok" }) {
  const cls =
    status === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200"
      : status === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200"
      : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-200";

  const label = status === "ok" ? "OK" : status === "error" ? "Fix" : "—";

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        cls
      )}
    >
      {label}
    </span>
  );
}

function InlineErrors({ errors }: { errors: string[] }) {
  return (
    <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
      <div className="font-semibold">Please fix the following:</div>
      <ul className="mt-1 list-disc pl-5">
        {errors.map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ul>
    </div>
  );
}

function resolveName<T extends { id: string; name?: string | null }>(
  items: T[],
  id: string
) {
  if (!id) return "—";
  const found = items.find((x) => x.id === id);
  return found?.name ?? "—";
}

function resolvePosition(items: Position[], id: string) {
  if (!id) return "—";
  const found = items.find((x) => x.id === id) as any;
  return String(found?.title ?? found?.name ?? "—");
}

export default function EmployeeCreateManager() {
  const router = useRouter();
  const api = useEmployeeManagement();
  const { orgUnits: orgUnitsApi, locations: locationsApi, positions: positionsApi, costCenters: costCentersApi } =
  useOrgStructure();

  const [activeStep, setActiveStep] = React.useState<StepKey>("basic");
  const [saving, setSaving] = React.useState(false);

  // lookups for assignment
  const [orgUnits, setOrgUnits] = React.useState<OrgUnit[]>([]);
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [positions, setPositions] = React.useState<Position[]>([]);
  const [costCenters, setCostCenters] = React.useState<CostCenter[]>([]);
  const [lookupLoaded, setLookupLoaded] = React.useState(false);

  // Core fields
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [middleName, setMiddleName] = React.useState("");
  const [preferredName, setPreferredName] = React.useState("");

  const [employeeNumber, setEmployeeNumber] = React.useState("");
  const [employmentType, setEmploymentType] = React.useState<EmploymentType>(
    "FULL_TIME" as EmploymentType
  );

  const [workEmail, setWorkEmail] = React.useState("");
  const [personalEmail, setPersonalEmail] = React.useState("");
  const [workPhone, setWorkPhone] = React.useState("");
  const [personalPhone, setPersonalPhone] = React.useState("");

  const [dob, setDob] = React.useState("");
  const [gender, setGender] = React.useState<Gender>("UNSPECIFIED" as Gender);
  const [maritalStatus, setMaritalStatus] = React.useState<MaritalStatus>(
    "UNSPECIFIED" as MaritalStatus
  );

  const [hireDate, setHireDate] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [probationEndDate, setProbationEndDate] = React.useState("");

  // Optional primary assignment
  const [withPrimaryAssignment, setWithPrimaryAssignment] =
    React.useState(true);
  const [orgUnitId, setOrgUnitId] = React.useState("");
  const [locationId, setLocationId] = React.useState("");
  const [positionId, setPositionId] = React.useState("");
  const [costCenterId, setCostCenterId] = React.useState("");
  const [managerId, setManagerId] = React.useState("");
  const [assignmentNotes, setAssignmentNotes] = React.useState("");

  // metadata (optional)
  const [metadataText, setMetadataText] = React.useState("");

  const parseMetadata = (): any | undefined => {
    const t = metadataText.trim();
    if (!t) return undefined;
    try {
      return JSON.parse(t);
    } catch {
      throw new Error("Metadata must be valid JSON");
    }
  };

 React.useEffect(() => {
  let mounted = true;

  (async () => {
    try {
      setLookupLoaded(false);

      const [ou, lo, po, cc] = await Promise.all([
        orgUnitsApi.list({ includeDeleted: false }),
        locationsApi.list({ includeDeleted: false }),
        positionsApi.list({ includeDeleted: false }),
        costCentersApi.list({ includeDeleted: false }),
      ]);

      const ouItems = unwrapList<OrgUnit>(unwrapApi(ou)).items;
      const loItems = unwrapList<Location>(unwrapApi(lo)).items;
      const poItems = unwrapList<Position>(unwrapApi(po)).items;
      const ccItems = unwrapList<CostCenter>(unwrapApi(cc)).items;

      if (!mounted) return;

      setOrgUnits(ouItems);
      setLocations(loItems);
      setPositions(poItems);
      setCostCenters(ccItems);
      setLookupLoaded(true);
    } catch (e) {
      console.warn("Org structure lookups failed", e);
      if (!mounted) return;
      setLookupLoaded(true); // allow UI to render even if lists fail
    }
  })();

  return () => {
    mounted = false;
  };
}, [orgUnitsApi, locationsApi, positionsApi, costCentersApi]);
  // -----------------------------
  // Validation per step
  // -----------------------------
  const basicErrors = React.useMemo(() => {
    const errs: string[] = [];
    if (firstName.trim().length < 2) errs.push("First name is required.");
    if (lastName.trim().length < 2) errs.push("Last name is required.");
    return errs;
  }, [firstName, lastName]);

  const contactErrors = React.useMemo(() => {
    const errs: string[] = [];
    if (!isEmail(workEmail)) errs.push("Work email is invalid.");
    if (!isEmail(personalEmail)) errs.push("Personal email is invalid.");
    if (!isPhone(workPhone)) errs.push("Work phone is invalid.");
    if (!isPhone(personalPhone)) errs.push("Personal phone is invalid.");
    return errs;
  }, [workEmail, personalEmail, workPhone, personalPhone]);

  const metadataErrors = React.useMemo(() => {
    if (!metadataText.trim()) return [];
    try {
      JSON.parse(metadataText.trim());
      return [];
    } catch {
      return ["Metadata JSON is invalid."];
    }
  }, [metadataText]);

  const assignmentErrors = React.useMemo(() => {
    // Assignment is optional; when enabled we only validate lookups loaded.
    if (!withPrimaryAssignment) return [];
    if (!lookupLoaded) return [];
    return [];
  }, [withPrimaryAssignment, lookupLoaded]);

  const stepStatus: Record<StepKey, "todo" | "error" | "ok"> = React.useMemo(
    () => ({
      basic: basicErrors.length ? "error" : "ok",
      contact: contactErrors.length ? "error" : "ok",
      demographics: "ok",
      dates: "ok",
      assignment: assignmentErrors.length ? "error" : "ok",
      metadata: metadataErrors.length
        ? "error"
        : metadataText.trim()
        ? "ok"
        : "todo",
      review: "todo",
    }),
    [
      basicErrors.length,
      contactErrors.length,
      assignmentErrors.length,
      metadataErrors.length,
      metadataText,
    ]
  );

  const canSave =
    basicErrors.length === 0 &&
    contactErrors.length === 0 &&
    metadataErrors.length === 0 &&
    !saving;

  const activeIndex = STEPS.findIndex((s) => s.key === activeStep);
  const prevStep = STEPS[Math.max(0, activeIndex - 1)]?.key ?? "basic";
  const nextStep =
    STEPS[Math.min(STEPS.length - 1, activeIndex + 1)]?.key ?? "review";

  const goNext = () => {
    if (activeStep === "basic" && basicErrors.length) {
      toast.error("Fix required fields in Basic Information.");
      return;
    }
    if (activeStep === "contact" && contactErrors.length) {
      toast.error("Fix invalid contact fields.");
      return;
    }
    if (activeStep === "metadata" && metadataErrors.length) {
      toast.error("Fix metadata JSON before continuing.");
      return;
    }
    setActiveStep(nextStep);
  };

  const goPrev = () => setActiveStep(prevStep);

  const buildDto = (): CreateEmployeeDto => {
    const metadata = parseMetadata();

    const primaryAssignment: CreateEmployeeAssignmentDto | undefined =
      withPrimaryAssignment
        ? {
            orgUnitId: orgUnitId || null,
            locationId: locationId || null,
            positionId: positionId || null,
            costCenterId: costCenterId || null,
            managerId: managerId || null,
            isPrimary: true,
            notes: assignmentNotes || null,
            effectiveFrom: startDate || hireDate || undefined,
          }
        : undefined;

    return {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      middleName: middleName.trim() || undefined,
      preferredName: preferredName.trim() || undefined,

      employeeNumber: employeeNumber.trim() || undefined,
      employmentType,

      workEmail: workEmail.trim() || undefined,
      personalEmail: personalEmail.trim() || undefined,
      workPhone: workPhone.trim() || undefined,
      personalPhone: personalPhone.trim() || undefined,

      dob: dob || undefined,
      gender,
      maritalStatus,

      hireDate: hireDate || undefined,
      startDate: startDate || undefined,
      probationEndDate: probationEndDate || undefined,

      metadata,

      ...(withPrimaryAssignment ? { primaryAssignment } : {}),
    };
  };

  const submit = async () => {
    if (!canSave) return;

    let dto: CreateEmployeeDto;
    try {
      dto = buildDto();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid inputs");
      return;
    }

    try {
      setSaving(true);
      const res = await api.employees.create(dto);
      const created = unwrapApi(res) as any;
      const id = created?.id;

      toast.success("Employee created");
      if (id) router.push(`/portal/employees/${id}`);
      else router.push("/portal/employees");
    } catch (e) {
      console.error(e);
      toast.error("Failed to create employee");
    } finally {
      setSaving(false);
    }
  };

  const stepTitle = STEPS.find((s) => s.key === activeStep)?.title ?? "Create";
  const stepSubtitle =
    STEPS.find((s) => s.key === activeStep)?.subtitle ??
    "Register a new employee record.";

  const totalSteps = STEPS.length;
  const stepNumber = activeIndex + 1;

  const topBadges = React.useMemo(() => {
    const badges: Array<React.ReactNode> = [];
    badges.push(
      <Badge key="step" variant="secondary" className="rounded-full">
        Step {stepNumber}/{totalSteps}
      </Badge>
    );
    if (basicErrors.length)
      badges.push(
        <Badge key="b" variant="outline" className="rounded-full">
          Basic issues: {basicErrors.length}
        </Badge>
      );
    if (contactErrors.length)
      badges.push(
        <Badge key="c" variant="outline" className="rounded-full">
          Contact issues: {contactErrors.length}
        </Badge>
      );
    if (metadataErrors.length)
      badges.push(
        <Badge key="m" variant="outline" className="rounded-full">
          Metadata issue
        </Badge>
      );
    if (withPrimaryAssignment)
      badges.push(
        <Badge key="a" variant="outline" className="rounded-full">
          Assignment: enabled
        </Badge>
      );
    return badges;
  }, [
    stepNumber,
    totalSteps,
    basicErrors.length,
    contactErrors.length,
    metadataErrors.length,
    withPrimaryAssignment,
  ]);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl border bg-white dark:bg-slate-950 dark:border-slate-800">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Create Employee
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Multi-step onboarding: identity, contact, HR info, and optional
                primary assignment.
              </p>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {topBadges}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={saving}
            type="button"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            variant="outline"
            onClick={() => router.refresh()}
            disabled={saving}
            type="button"
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Reload
          </Button>

          <Button
            onClick={() => void submit()}
            disabled={!canSave}
            loading={saving}
            className="gap-2"
            type="button"
          >
            <Save className="h-4 w-4" />
            Create
          </Button>
        </div>
      </div>

      {/* Left stepper + right form */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
        <div className="space-y-3">
          <Stepper
            active={activeStep}
            setActive={setActiveStep}
            status={stepStatus}
          />

          <Card className="overflow-hidden rounded-2xl">
            <CardHeader className="border-b bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-950">
              <CardTitle className="text-base">Creation rules</CardTitle>
              <CardDescription>
                You can save once required steps are valid.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 p-4 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-start justify-between gap-3">
                <span>Basic Information</span>
                <StatusPill status={basicErrors.length ? "error" : "ok"} />
              </div>
              <div className="flex items-start justify-between gap-3">
                <span>Contact Validation</span>
                <StatusPill status={contactErrors.length ? "error" : "ok"} />
              </div>
              <div className="flex items-start justify-between gap-3">
                <span>Metadata JSON (if provided)</span>
                <StatusPill
                  status={
                    metadataErrors.length
                      ? "error"
                      : metadataText.trim()
                      ? "ok"
                      : "todo"
                  }
                />
              </div>
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300">
                Tip: You can navigate steps freely. “Next” blocks only when the
                current step has critical errors.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="overflow-hidden rounded-2xl">
            <CardHeader className="border-b bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-950">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{stepTitle}</CardTitle>
                  <CardDescription>{stepSubtitle}</CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  {activeStep !== "basic" ? (
                    <Button
                      variant="outline"
                      type="button"
                      onClick={goPrev}
                      className="gap-2"
                      disabled={saving}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                  ) : null}

                  {activeStep !== "review" ? (
                    <Button
                      type="button"
                      onClick={goNext}
                      className="gap-2"
                      disabled={saving}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => void submit()}
                      disabled={!canSave}
                      loading={saving}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Create employee
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 p-4 md:p-6">
              {activeStep === "basic" ? (
                <Section
                  title="Basic Information"
                  subtitle="Core identity and employment settings."
                >
                  {basicErrors.length ? <InlineErrors errors={basicErrors} /> : null}

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Input
                      label="First name *"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <Input
                      label="Last name *"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                    <Input
                      label="Middle name"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                    />
                    <Input
                      label="Preferred name"
                      value={preferredName}
                      onChange={(e) => setPreferredName(e.target.value)}
                    />

                    <Input
                      label="Employee #"
                      value={employeeNumber}
                      onChange={(e) => setEmployeeNumber(e.target.value)}
                    />

                    <SelectField
                      label="Employment type"
                      value={employmentType}
                      onChange={(v) => setEmploymentType(v as any)}
                    >
                      {EMPLOYMENT_TYPE_VALUES.map((t) => (
                        <option key={t} value={t}>
                          {human(t)}
                        </option>
                      ))}
                    </SelectField>
                  </div>
                </Section>
              ) : null}

              {activeStep === "contact" ? (
                <Section title="Contact" subtitle="Work and personal contact channels.">
                  {contactErrors.length ? (
                    <InlineErrors errors={contactErrors} />
                  ) : null}

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Input
                      label="Work email"
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                      error={!isEmail(workEmail) ? "Invalid email format" : undefined}
                    />

                    <Input
                      label="Personal email"
                      value={personalEmail}
                      onChange={(e) => setPersonalEmail(e.target.value)}
                      error={!isEmail(personalEmail) ? "Invalid email format" : undefined}
                    />

                    <Input
                      label="Work phone"
                      value={workPhone}
                      onChange={(e) => setWorkPhone(e.target.value)}
                      error={!isPhone(workPhone) ? "Invalid phone format" : undefined}
                    />

                    <Input
                      label="Personal phone"
                      value={personalPhone}
                      onChange={(e) => setPersonalPhone(e.target.value)}
                      error={!isPhone(personalPhone) ? "Invalid phone format" : undefined}
                    />
                  </div>
                </Section>
              ) : null}

              {activeStep === "demographics" ? (
                <Section
                  title="Demographics"
                  subtitle="Optional HR demographic attributes."
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <DateField label="DOB" value={dob} onChange={setDob} hint="Optional" />

                    <SelectField
                      label="Gender"
                      value={gender}
                      onChange={(v) => setGender(v as any)}
                    >
                      {GENDER_VALUES.map((g) => (
                        <option key={g} value={g}>
                          {human(g)}
                        </option>
                      ))}
                    </SelectField>

                    <SelectField
                      label="Marital status"
                      value={maritalStatus}
                      onChange={(v) => setMaritalStatus(v as any)}
                    >
                      {MARITAL_STATUS_VALUES.map((m) => (
                        <option key={m} value={m}>
                          {human(m)}
                        </option>
                      ))}
                    </SelectField>
                  </div>
                </Section>
              ) : null}

              {activeStep === "dates" ? (
                <Section
                  title="Employment Dates"
                  subtitle="Hire/start dates and probation end date."
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <DateField label="Hire date" value={hireDate} onChange={setHireDate} />
                    <DateField label="Start date" value={startDate} onChange={setStartDate} />
                    <DateField
                      label="Probation end"
                      value={probationEndDate}
                      onChange={setProbationEndDate}
                    />
                  </div>

                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300">
                    If “Start date” is provided, it will be used as assignment effective date.
                    Otherwise, “Hire date” is used (when assignment is enabled).
                  </div>
                </Section>
              ) : null}

              {activeStep === "assignment" ? (
                <Section
                  title="Primary Assignment"
                  subtitle="Optional — attach org unit, position, location, and cost center."
                  right={
                    <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950">
                      <input
                        type="checkbox"
                        checked={withPrimaryAssignment}
                        onChange={(e) => setWithPrimaryAssignment(e.target.checked)}
                        className="h-4 w-4 rounded"
                        disabled={!lookupLoaded}
                      />
                      Enable
                    </label>
                  }
                >
                  {!lookupLoaded ? (
                    <div className="text-sm text-slate-500">
                      Loading org structure lookups...
                    </div>
                  ) : !withPrimaryAssignment ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300">
                      Primary assignment disabled. You can add assignments later from the employee detail page.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <SelectField label="Org Unit" value={orgUnitId} onChange={setOrgUnitId}>
                        <option value="">—</option>
                        {orgUnits.map((x) => (
                          <option key={x.id} value={x.id}>
                            {String(x.name ?? "—")}
                          </option>
                        ))}
                      </SelectField>

                      <SelectField label="Location" value={locationId} onChange={setLocationId}>
                        <option value="">—</option>
                        {locations.map((x) => (
                          <option key={x.id} value={x.id}>
                            {String(x.name ?? "—")}
                          </option>
                        ))}
                      </SelectField>

                      <SelectField label="Position" value={positionId} onChange={setPositionId}>
                        <option value="">—</option>
                        {positions.map((x) => (
                          <option key={x.id} value={x.id}>
                            {String((x as any).title ?? (x as any).name ?? "—")}
                          </option>
                        ))}
                      </SelectField>

                      <SelectField label="Cost Center" value={costCenterId} onChange={setCostCenterId}>
                        <option value="">—</option>
                        {costCenters.map((x) => (
                          <option key={x.id} value={x.id}>
                            {String(x.name ?? "—")}
                          </option>
                        ))}
                      </SelectField>

                      <EmployeeSelect
                        label="Manager (optional)"
                        value={managerId}
                        onChange={setManagerId}
                        placeholder="Search manager…"
                      />

                      <div className="md:col-span-2">
                        <Textarea
                          label="Notes (optional)"
                          value={assignmentNotes}
                          onChange={(e) => setAssignmentNotes(e.target.value)}
                          resize="y"
                          size="sm"
                          className="min-h-[90px]"
                          placeholder="Assignment notes..."
                        />
                      </div>
                    </div>
                  )}
                </Section>
              ) : null}

              {activeStep === "metadata" ? (
                <Section
                  title="Metadata (optional)"
                  subtitle="JSON object for custom attributes (department codes, tags, etc.)."
                >
                  {metadataErrors.length ? (
                    <InlineErrors errors={metadataErrors} />
                  ) : null}

                  <Textarea
                    label="Metadata JSON"
                    value={metadataText}
                    onChange={(e) => setMetadataText(e.target.value)}
                    className="min-h-[140px] font-mono text-xs"
                    resize="y"
                    hint='Example: { "tags": ["contractor"], "source": "import" }'
                  />
                </Section>
              ) : null}

              {activeStep === "review" ? (
                <div className="space-y-4">
                  <Section
                    title="Review"
                    subtitle="Confirm the information below before creating the employee."
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                          Identity
                        </div>
                        <ReviewRow label="First name" value={firstName || "—"} />
                        <ReviewRow label="Last name" value={lastName || "—"} />
                        <ReviewRow label="Middle name" value={middleName || "—"} />
                        <ReviewRow label="Preferred name" value={preferredName || "—"} />
                        <ReviewRow label="Employee #" value={employeeNumber || "—"} />
                        <ReviewRow label="Employment type" value={human(employmentType)} />
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                          Contact
                        </div>
                        <ReviewRow label="Work email" value={workEmail || "—"} />
                        <ReviewRow label="Personal email" value={personalEmail || "—"} />
                        <ReviewRow label="Work phone" value={workPhone || "—"} />
                        <ReviewRow label="Personal phone" value={personalPhone || "—"} />
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                          HR
                        </div>
                        <ReviewRow label="DOB" value={dob || "—"} />
                        <ReviewRow label="Gender" value={human(gender)} />
                        <ReviewRow label="Marital status" value={human(maritalStatus)} />
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                          Dates
                        </div>
                        <ReviewRow label="Hire date" value={hireDate || "—"} />
                        <ReviewRow label="Start date" value={startDate || "—"} />
                        <ReviewRow label="Probation end" value={probationEndDate || "—"} />
                      </div>

                      <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                          Assignment
                        </div>
                        <ReviewRow label="Enabled" value={withPrimaryAssignment ? "Yes" : "No"} />
                        {withPrimaryAssignment ? (
                          <>
                            <ReviewRow label="Org Unit" value={resolveName(orgUnits, orgUnitId)} />
                            <ReviewRow label="Location" value={resolveName(locations, locationId)} />
                            <ReviewRow label="Position" value={resolvePosition(positions, positionId)} />
                            <ReviewRow label="Cost Center" value={resolveName(costCenters, costCenterId)} />
                            <ReviewRow label="Manager" value={managerId || "—"} />
                            <ReviewRow label="Notes" value={assignmentNotes || "—"} />
                          </>
                        ) : null}
                      </div>

                      <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                          Metadata
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-200">
                          {metadataText.trim() ? metadataText.trim() : "— (none)"}
                        </div>
                      </div>
                    </div>
                  </Section>

                  {!canSave ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
                      Cannot create yet. Fix the issues shown in the left panel (Basic/Contact/Metadata).
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
                      Everything looks good. Click <b>Create employee</b> to finish.
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Footer actions */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Step {stepNumber} of {totalSteps}:{" "}
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {stepTitle}
              </span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {activeStep !== "basic" ? (
                <Button
                  variant="outline"
                  type="button"
                  onClick={goPrev}
                  disabled={saving}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
              ) : null}

              {activeStep !== "review" ? (
                <Button type="button" onClick={goNext} disabled={saving} className="gap-2">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => void submit()}
                  disabled={!canSave}
                  loading={saving}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Create employee
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}