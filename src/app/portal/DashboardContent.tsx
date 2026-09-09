"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { api } from "@/logaxp/lib/api/apiClient";
import { unwrapApi } from "@/logaxp/lib/api/unwrap";
import { useAuthStore } from "@/logaxp/stores/useAuthStore";
type Overview = {
  scope: "workspace" | "personal";
  asOf: string;
  employees: number;
  activeEmployees: number;
  clockedIn: number;
  pendingLeave: number;
  distribution: { status: string; count: number }[];
  recentLeave: {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    employee: { firstName: string; lastName: string };
  }[];
};
const label = (value: string) => value.toLowerCase().replaceAll("_", " ");
const day = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
export default function MainContent() {
  const tenant = useAuthStore((s) => s.tenant);
  const membership = useAuthStore((s) => s.membership);
  const query = useQuery({
    queryKey: ["dashboard", tenant?.id, membership?.id],
    enabled: Boolean(tenant && membership),
    queryFn: async () => {
      const result = unwrapApi<Overview>(
        (await api.get("/dashboard/overview")).data,
      );
      if (!result) throw new Error("No dashboard response");
      return result;
    },
    refetchInterval: 60000,
  });
  const data = query.data;
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 text-slate-900 dark:text-white">
      <div className="portal-page-heading">
        <div>
          <div className="portal-kicker">Workspace overview</div><h1 className="text-2xl font-bold">
            {tenant?.name ?? "Workspace"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {data?.scope === "personal"
              ? "Your employee record and time off."
              : "Current employee and attendance records."}
          </p>
          {data && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Updated {new Date(data.asOf).toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={() => void query.refetch()}
          disabled={query.isFetching}
          className="rounded-xl border p-2 disabled:opacity-50"
          aria-label="Refresh dashboard"
        >
          <RefreshCw
            className={`h-5 w-5 ${query.isFetching ? "animate-spin" : ""}`}
          />
        </button>
      </div>
      {query.isError && (
        <div
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800"
        >
          Unable to refresh the dashboard.{" "}
          {data
            ? "Previously loaded figures are shown."
            : "Try again using Refresh dashboard."}
        </div>
      )}
      {query.isPending && <p role="status">Loading workspace metrics…</p>}
      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              {
                title:
                  data.scope === "personal"
                    ? "Linked employee records"
                    : "Employees",
                value: data.employees,
              },
              { title: "Active employees", value: data.activeEmployees },
              { title: "Currently clocked in", value: data.clockedIn },
              { title: "Pending leave", value: data.pendingLeave },
            ].map(({ title, value }) => (
              <section
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
              >
                <h2 className="text-sm text-slate-500 dark:text-slate-400">
                  {title}
                </h2>
                <p className="mt-3 text-[28px] font-semibold tabular-nums">
                  {value.toLocaleString()}
                </p>
              </section>
            ))}
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white p-4 dark:bg-slate-900">
              <h2 className="font-semibold">Employee status</h2>
              {!data.distribution.length && (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  No employee records to show.
                </p>
              )}
              {data.distribution.map((row) => (
                <div key={row.status} className="mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{label(row.status)}</span>
                    <span>{row.count}</span>
                  </div>
                  <div className="mt-2 h-2 rounded bg-slate-100">
                    <div
                      className="h-2 rounded bg-lime-500"
                      style={{
                        width: `${data.employees ? (row.count / data.employees) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </section>
            <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white p-4 dark:bg-slate-900 lg:col-span-2">
              <h2 className="font-semibold">Recent leave requests</h2>
              {!data.recentLeave.length && (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  No leave requests yet.
                </p>
              )}
              <ul className="divide-y">
                {data.recentLeave.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap justify-between gap-2 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {row.employee.firstName} {row.employee.lastName}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        {day(row.startDate)} – {day(row.endDate)}
                      </p>
                    </div>
                    <span className="capitalize">{label(row.status)}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={
                  data.scope === "personal"
                    ? "/portal/leave/me"
                    : "/portal/leave"
                }
                className="mt-4 inline-block text-sm font-semibold underline"
              >
                View leave requests
              </Link>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
