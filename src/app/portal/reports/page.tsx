"use client";
import Link from "next/link";
import { useAuthStore } from "@/logaxp/stores/useAuthStore";
export default function ReportsPage() {
  const membership = useAuthStore((s) => s.membership);
  const reports = [
    {
      title: "Time entries",
      description: "Filter recorded work and export the results.",
      href: "/portal/time-attendance/entries",
      permission: "time.read",
    },
    {
      title: "Attendance",
      description: "Review attendance and breaks for the selected dates.",
      href: "/portal/time-attendance/clocks",
      permission: "time.clock.read",
    },
    {
      title: "Timesheets",
      description: "Review submitted and approved hours by pay period.",
      href: "/portal/time/payroll/timesheets",
      permission: "time.read",
    },
    {
      title: "Employee directory",
      description: "Review employee records, status and assignments.",
      href: "/portal/employees",
      permission: "employee.read",
    },
    {
      title: "Manager reports",
      description: "Review your team’s attendance, leave and timesheets.",
      href: "/portal/manager",
      permission: "manager.summary.read",
    },
  ].filter((report) => membership?.permissions.includes(report.permission));
  return (
    <div className="space-y-5 p-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <p className="text-sm text-slate-500">
        Open a report to choose a date range and review your workspace records.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => (
          <Link
            key={report.href}
            href={report.href}
            className="rounded-2xl border bg-white p-5 transition hover:border-lime-500"
          >
            <h2 className="font-semibold">{report.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{report.description}</p>
          </Link>
        ))}
      </div>
      {!reports.length && (
        <p>No reports are available for your current role.</p>
      )}
    </div>
  );
}
