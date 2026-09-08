"use client";

import React from "react";
import { Input } from "@/logaxp/components/ui/input";
import { SelectField } from "@/logaxp/components/orgStructure/shared/SelectField";
import { EmployeeSelect } from "@/logaxp/components/lookups/EmployeeSelect";
import { useReferenceData } from "@/logaxp/hooks/useReferenceData";
import type {
  CreateLocationDto,
  LocationType,
  UpdateLocationDto,
} from "@/logaxp/lib/orgStructure/orgStructure.types";

const TYPES: Array<{ value: LocationType; label: string }> = [
  { value: "HQ", label: "HQ" },
  { value: "BRANCH", label: "Branch" },
  { value: "REMOTE", label: "Remote" },
  { value: "OTHER", label: "Other" },
];

export function LocationForm({
  mode,
  initial,
  loading,
  onSubmit,
}: {
  mode: "create" | "edit";
  initial?: Partial<CreateLocationDto> & { id?: string };
  loading?: boolean;
  onSubmit: (dto: CreateLocationDto | UpdateLocationDto) => void;
}) {
  const {
    countries,
    timezones,
    getStates,
    getCachedStates,
    statesLoading,
    statesError,
  } = useReferenceData();

  const [name, setName] = React.useState(initial?.name ?? "");
  const [type, setType] = React.useState<LocationType>(
    (initial?.type as LocationType) ?? "HQ"
  );

  const [code, setCode] = React.useState(initial?.code ?? "");
  const [description, setDescription] = React.useState(
    (initial as any)?.description ?? ""
  );

  const [timezone, setTimezone] = React.useState(initial?.timezone ?? "");
  const [phone, setPhone] = React.useState(initial?.phone ?? "");
  const [email, setEmail] = React.useState(initial?.email ?? "");

  const [addressLine1, setAddressLine1] = React.useState(initial?.addressLine1 ?? "");
  const [addressLine2, setAddressLine2] = React.useState(initial?.addressLine2 ?? "");
  const [city, setCity] = React.useState(initial?.city ?? "");
  const [state, setState] = React.useState(initial?.state ?? "");
  const [postalCode, setPostalCode] = React.useState(initial?.postalCode ?? "");
  const [country, setCountry] = React.useState((initial as any)?.country ?? "");

  const [managerEmployeeId, setManagerEmployeeId] = React.useState(
    (initial as any)?.managerEmployeeId ?? ""
  );

  React.useEffect(() => {
    setName(initial?.name ?? "");
    setType((initial?.type as LocationType) ?? "HQ");
    setCode(initial?.code ?? "");
    setDescription((initial as any)?.description ?? "");
    setTimezone(initial?.timezone ?? "");
    setPhone(initial?.phone ?? "");
    setEmail(initial?.email ?? "");
    setAddressLine1(initial?.addressLine1 ?? "");
    setAddressLine2(initial?.addressLine2 ?? "");
    setCity(initial?.city ?? "");
    setState(initial?.state ?? "");
    setPostalCode(initial?.postalCode ?? "");
    setCountry((initial as any)?.country ?? "");
    setManagerEmployeeId((initial as any)?.managerEmployeeId ?? "");
  }, [initial?.id, initial]);

  React.useEffect(() => {
    if (!country) return;
    void getStates(country);
  }, [country, getStates]);

  const countryOptions = React.useMemo(
    () =>
      (countries.data ?? []).map((c) => ({
        value: c.code,
        label: `${c.name} (${c.code})`,
      })),
    [countries.data]
  );

  const cachedStates = getCachedStates(country) ?? [];

  const stateOptions = cachedStates.map((s) => ({
    value: s.code,
    label: s.name,
  }));

  const timezoneOptions = React.useMemo(
    () =>
      (timezones.data ?? [])
        .map((tz: any) => ({
          value:
            tz?.name ??
            tz?.value ??
            tz?.timezone ??
            tz?.code ??
            tz?.label ??
            "",
          label:
            tz?.label ??
            tz?.name ??
            tz?.value ??
            tz?.timezone ??
            tz?.code ??
            "",
        }))
        .filter((x) => x.value && x.label),
    [timezones.data]
  );

  const errors = React.useMemo(() => {
    const e: Record<string, string> = {};

    if (!name.trim()) e.name = "Name is required";
    if (!type) e.type = "Type is required";

    if (email && !String(email).includes("@")) {
      e.email = "Enter a valid email";
    }

    return e;
  }, [name, type, email]);

  const canSubmit = Object.keys(errors).length === 0 && !loading;

  const submit = () => {
    if (!canSubmit) return;

    const dto: CreateLocationDto | UpdateLocationDto = {
      name: name.trim(),
      type,
      code: code.trim() ? code.trim() : null,
      description: description.trim() ? description.trim() : null,
      timezone: timezone.trim() ? timezone.trim() : null,
      phone: phone.trim() ? phone.trim() : null,
      email: email.trim() ? email.trim() : null,
      addressLine1: addressLine1.trim() ? addressLine1.trim() : null,
      addressLine2: addressLine2.trim() ? addressLine2.trim() : null,
      city: city.trim() ? city.trim() : null,
      state: state.trim() ? state.trim() : null,
      postalCode: postalCode.trim() ? postalCode.trim() : null,
      country: country.trim() ? country.trim() : null,
      managerEmployeeId: managerEmployeeId.trim()
        ? managerEmployeeId.trim()
        : null,
    };

    onSubmit(dto);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />

        <SelectField
          label="Type"
          value={type}
          onChange={(v) => setType(v as LocationType)}
          options={TYPES}
          placeholder="Select type"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Code (optional)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Input
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <EmployeeSelect
          label="Manager (optional)"
          value={managerEmployeeId}
          onChange={setManagerEmployeeId}
          placeholder="Search employee..."
        />

        <SelectField
          label="Country (optional)"
          value={country}
          onChange={(value) => {
            setCountry(value);
            setState("");
          }}
          options={countryOptions}
          placeholder={
            countries.loading ? "Loading countries..." : "Select country"
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          label="State / Province (optional)"
          value={state}
          onChange={setState}
          options={stateOptions}
          placeholder={
            !country
              ? "Select country first"
              : statesLoading(country)
              ? "Loading states..."
              : stateOptions.length === 0
              ? "No states found"
              : "Select state"
          }
          disabled={!country || statesLoading(country)}
        />

        <SelectField
          label="Timezone (optional)"
          value={timezone}
          onChange={setTimezone}
          options={timezoneOptions}
          placeholder={
            timezones.loading ? "Loading timezones..." : "Select timezone"
          }
        />
      </div>

      {country && statesError(country) ? (
        <p className="text-sm text-red-600">{statesError(country)}</p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Input
          label="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Input
          label="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <Input
          label="Postal code (optional)"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Address line 1 (optional)"
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
        />
        <Input
          label="Address line 2 (optional)"
          value={addressLine2}
          onChange={(e) => setAddressLine2(e.target.value)}
        />
      </div>

      <Input
        label="City (optional)"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      <button
        type="button"
        data-form-submit="location"
        onClick={submit}
        disabled={!canSubmit}
        className="hidden"
      />
    </div>
  );
}