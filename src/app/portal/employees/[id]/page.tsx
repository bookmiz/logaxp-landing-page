"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { EmployeeDetailManager } from "@/logaxp/components/employees/detail/EmployeeDetailManager";

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = String(params?.id ?? "");
  return <EmployeeDetailManager employeeId={id} />;
}