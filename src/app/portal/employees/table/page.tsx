"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/logaxp/components/ui/button";
import { EmployeesFullTableManager } from "@/logaxp/components/employees/EmployeesFullTableManager";

export default function EmployeesFullTablePage() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <EmployeesFullTableManager />
    </div>
  );
}