"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { EmployeeEditManager } from "./EmployeeEditManager";

export default function EmployeeEditPage() {
  const params = useParams<{ id: string }>();
  const id = String(params?.id ?? "");
  return <EmployeeEditManager employeeId={id} />;
}