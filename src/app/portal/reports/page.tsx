"use client";
import Link from "next/link";
import { ArrowUpRight, Clock3, CalendarDays, ClipboardList, Users, ChartNoAxesCombined, FileText } from "lucide-react";
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
  const icons: Record<string, typeof FileText> = { "Time entries": Clock3, "Attendance": CalendarDays, "Timesheets": ClipboardList, "Employee directory": Users, "Manager reports": ChartNoAxesCombined };
  return <div><div className="portal-page-heading"><div><div className="portal-kicker">Workspace insights</div><h1>Reports</h1><p className="mt-2 text-sm text-slate-500">Find the records you need. Choose a report to review, filter and export.</p></div><span className="text-xs text-slate-500">{reports.length} available reports</span></div><div className="portal-report-list">{reports.map((report)=>{const Icon=icons[report.title] || FileText;return <Link key={report.href} href={report.href} className="portal-report-row"><span className="portal-report-icon"><Icon size={18}/></span><div><h2>{report.title}</h2><p>{report.description}</p></div><ArrowUpRight size={17} className="portal-report-arrow"/></Link>;})}</div>{!reports.length&&<p className="mt-5 text-sm text-slate-500">No reports are available for your current role.</p>}</div>;
}
