"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  RefreshCcw,
  Briefcase,
  UserPlus,
  Mail,
  Users,
  Calendar,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

import { useEmployeeManagement } from "@/logaxp/hooks/useEmployeeManagement";

import type {
  EmployeeDetail,
  UpdateEmployeeDto,
  EmploymentType,
  Gender,
  MaritalStatus,
} from "@/logaxp/lib/employee-management/employee-management.types";
import {
  EMPLOYMENT_TYPE_VALUES,
  GENDER_VALUES,
  MARITAL_STATUS_VALUES,
} from "@/logaxp/lib/employee-management/employee-management.types";

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
import { EmptyState } from "@/logaxp/components/ui/empty-state";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
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

type StepKey = "basic" | "contact" | "demographics" | "dates" | "metadata" | "review";

type StepDef = {
  key: StepKey;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
};

const STEPS: StepDef[] = [
  { key: "basic", title: "Basic", subtitle: "Identity + employment type", icon: UserPlus },
  { key: "contact", title: "Contact", subtitle: "Emails + phone numbers", icon: Mail },
  { key: "demographics", title: "Demographics", subtitle: "DOB, gender, marital status", icon: Users },
  { key: "dates", title: "Employment dates", subtitle: "Hire/start/probation", icon: Calendar },
  { key: "metadata", title: "Metadata", subtitle: "Custom JSON attributes", icon: ClipboardList },
  { key: "review", title: "Review", subtitle: "Confirm and save", icon: CheckCircle2 },
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

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2 last:border-b-0 dark:border-slate-900">
      <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
        {label}
      </div>
      <div className="text-sm text-slate-900 dark:text-slate-50">{value}</div>
    </div>
  );
}

export function EmployeeEditManager({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const api = useEmployeeManagement();

  const [employee, setEmployee] = React.useState<EmployeeDetail | null>(null);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState<StepKey>("basic");

  // form state
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

  const [metadataText, setMetadataText] = React.useState("");

  const load = React.useCallback(
    async (opts?: { silent?: boolean }) => {
      try {
        const res = await api.employees.get(employeeId);
        const data = (res as any)?.data ?? res;
        setEmployee(data as EmployeeDetail);

        setFirstName(String((data as any)?.firstName ?? ""));
        setLastName(String((data as any)?.lastName ?? ""));
        setMiddleName(String((data as any)?.middleName ?? ""));
        setPreferredName(String((data as any)?.preferredName ?? ""));

        setEmployeeNumber(String((data as any)?.employeeNumber ?? ""));
        setEmploymentType(
          String((data as any)?.employmentType ?? "FULL_TIME") as any
        );

        setWorkEmail(String((data as any)?.workEmail ?? ""));
        setPersonalEmail(String((data as any)?.personalEmail ?? ""));
        setWorkPhone(String((data as any)?.workPhone ?? ""));
        setPersonalPhone(String((data as any)?.personalPhone ?? ""));

        setDob(String((data as any)?.dob ?? ""));
        setGender(String((data as any)?.gender ?? "UNSPECIFIED") as any);
        setMaritalStatus(
          String((data as any)?.maritalStatus ?? "UNSPECIFIED") as any
        );

        setHireDate(String((data as any)?.hireDate ?? ""));
        setStartDate(String((data as any)?.startDate ?? ""));
        setProbationEndDate(String((data as any)?.probationEndDate ?? ""));

        // keep empty if metadata is null/undefined
        const meta = (data as any)?.metadata;
        setMetadataText(
          meta && typeof meta === "object" ? JSON.stringify(meta, null, 2) : ""
        );
      } catch (e) {
        console.error(e);
        if (!opts?.silent) toast.error("Failed to load employee");
      } finally {
        setInitialLoading(false);
      }
    },
    [api.employees, employeeId]
  );

  React.useEffect(() => {
    void load({ silent: true });
  }, [load]);

  const parseMetadata = (): any | undefined => {
    const t = metadataText.trim();
    if (!t) return undefined;
    try {
      return JSON.parse(t);
    } catch {
      throw new Error("Metadata must be valid JSON");
    }
  };

  // -----------------------------
  // Step validation
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

  const stepStatus: Record<StepKey, "todo" | "error" | "ok"> = React.useMemo(
    () => ({
      basic: basicErrors.length ? "error" : "ok",
      contact: contactErrors.length ? "error" : "ok",
      demographics: "ok",
      dates: "ok",
      metadata: metadataErrors.length
        ? "error"
        : metadataText.trim()
        ? "ok"
        : "todo",
      review: "todo",
    }),
    [basicErrors.length, contactErrors.length, metadataErrors.length, metadataText]
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

  const submit = async () => {
    if (!canSave) return;

    let metadata: any | undefined;
    try {
      metadata = parseMetadata();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid metadata JSON");
      return;
    }

    const dto: UpdateEmployeeDto = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      middleName: middleName.trim() ? middleName.trim() : null,
      preferredName: preferredName.trim() ? preferredName.trim() : null,

      employeeNumber: employeeNumber.trim() ? employeeNumber.trim() : null,
      employmentType,

      workEmail: workEmail.trim() ? workEmail.trim() : null,
      personalEmail: personalEmail.trim() ? personalEmail.trim() : null,
      workPhone: workPhone.trim() ? workPhone.trim() : null,
      personalPhone: personalPhone.trim() ? personalPhone.trim() : null,

      dob: dob ? dob : null,
      gender,
      maritalStatus,

      hireDate: hireDate ? hireDate : null,
      startDate: startDate ? startDate : null,
      probationEndDate: probationEndDate ? probationEndDate : null,

      metadata,
    };

    try {
      setSaving(true);
      await api.employees.update(employeeId, dto);
      toast.success("Employee updated");
      router.push(`/portal/employees/${employeeId}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update employee");
    } finally {
      setSaving(false);
    }
  };

  const stepTitle = STEPS.find((s) => s.key === activeStep)?.title ?? "Edit";
  const stepSubtitle =
    STEPS.find((s) => s.key === activeStep)?.subtitle ??
    "Update employee details.";

  const totalSteps = STEPS.length;
  const stepNumber = activeIndex + 1;

  const topBadges = React.useMemo(() => {
    const badges: Array<React.ReactNode> = [];
    badges.push(
      <Badge key="step" variant="secondary" className="rounded-full">
        Step {stepNumber}/{totalSteps}
      </Badge>
    );
    if (saving)
      badges.push(
        <Badge key="saving" variant="outline" className="rounded-full">
          Saving…
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
    return badges;
  }, [stepNumber, totalSteps, saving, basicErrors.length, contactErrors.length, metadataErrors.length]);

  // -----------------------------
  // Render
  // -----------------------------
  if (initialLoading) {
    return (
      <Card className="rounded-2xl">
        <CardHeader className="border-b bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-950">
          <CardTitle className="text-base">Loading employee…</CardTitle>
          <CardDescription>Fetching record and preparing the editor.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 text-sm text-slate-600 dark:text-slate-300">
          Loading employee...
        </CardContent>
      </Card>
    );
  }

  if (!employee) {
    return (
      <Card className="rounded-2xl">
        <CardHeader className="border-b bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-950">
          <CardTitle className="text-base">Employee not found</CardTitle>
          <CardDescription>This record may have been removed or you lack access.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <EmptyState
            title="Employee not found"
            description="This record may have been removed or you lack access."
          />
        </CardContent>
      </Card>
    );
  }

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
              <h1 className="text-xl font-semibold tracking-tight">Edit Employee</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Multi-step editor for identity, contact, HR information, and metadata.
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
            onClick={() => void load()}
            disabled={saving}
            type="button"
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>

          <Button
            onClick={() => void submit()}
            disabled={!canSave}
            loading={saving}
            className="gap-2"
            type="button"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Left stepper + right form */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
        <div className="space-y-3">
          <Stepper active={activeStep} setActive={setActiveStep} status={stepStatus} />

          <Card className="overflow-hidden rounded-2xl">
            <CardHeader className="border-b bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-950">
              <CardTitle className="text-base">Save rules</CardTitle>
              <CardDescription>Saving is allowed when critical steps are valid.</CardDescription>
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
                    metadataErrors.length ? "error" : metadataText.trim() ? "ok" : "todo"
                  }
                />
              </div>
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300">
                Tip: Use “Next” to proceed. It blocks only when the current step has critical errors.
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
                    <Button type="button" onClick={goNext} className="gap-2" disabled={saving}>
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
                      Save changes
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 p-4 md:p-6">
              {activeStep === "basic" ? (
                <Section title="Basic Information" subtitle="Core identity and employment settings.">
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
                  {contactErrors.length ? <InlineErrors errors={contactErrors} /> : null}

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
                <Section title="Demographics" subtitle="Optional HR demographic attributes.">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <DateField label="DOB" value={dob} onChange={setDob} hint="Optional" />

                    <SelectField label="Gender" value={gender} onChange={(v) => setGender(v as any)}>
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
                <Section title="Employment Dates" subtitle="Hire/start dates and probation end date.">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <DateField label="Hire date" value={hireDate} onChange={setHireDate} />
                    <DateField label="Start date" value={startDate} onChange={setStartDate} />
                    <DateField
                      label="Probation end"
                      value={probationEndDate}
                      onChange={setProbationEndDate}
                    />
                  </div>
                </Section>
              ) : null}

              {activeStep === "metadata" ? (
                <Section
                  title="Metadata (optional)"
                  subtitle="JSON object for custom attributes (tags, source, etc.)."
                >
                  {metadataErrors.length ? <InlineErrors errors={metadataErrors} /> : null}

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
                  <Section title="Review" subtitle="Confirm the information below before saving.">
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
                      Cannot save yet. Fix the issues shown in the left panel (Basic/Contact/Metadata).
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
                      Everything looks good. Click <b>Save changes</b> to finish.
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Footer nav */}
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
                  Save changes
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}