"use client";

import React from "react";

// -----------------------------
// Small UI helpers
// -----------------------------
function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function Card(props: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cx(
        "rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/60 shadow-sm",
        "backdrop-blur supports-[backdrop-filter]:bg-white/85 dark:supports-[backdrop-filter]:bg-slate-900/70",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}

function CardHeader(props: {
  title: string;
  right?: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-900 dark:text-white">
          {props.title}
        </div>
        {props.subtitle ? (
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {props.subtitle}
          </div>
        ) : null}
      </div>
      {props.right ? <div className="shrink-0">{props.right}</div> : null}
    </div>
  );
}

function Pill(props: { tone: "green" | "amber" | "red" | "blue"; label: string }) {
  const tone = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
    amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
    red: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20",
    blue: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20",
  }[props.tone];

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold border",
        tone
      )}
    >
      {props.label}
    </span>
  );
}

function IconWrap(props: { tone: "green" | "orange" | "blue" | "red"; children: React.ReactNode }) {
  const tone = {
    green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300",
    blue: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300",
    red: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
  }[props.tone];

  return (
    <div className={cx("h-10 w-10 rounded-xl grid place-items-center", tone)}>
      {props.children}
    </div>
  );
}

// -----------------------------
// Icons (simple inline SVGs)
// -----------------------------
const UserGroupIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 11a4 4 0 10-8 0 4 4 0 008 0z" />
    <path d="M4 20a8 8 0 0116 0" />
  </svg>
);

const BriefcaseIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 6V5a2 2 0 012-2h0a2 2 0 012 2v1" />
    <path d="M4 7h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" />
    <path d="M4 12h16" />
  </svg>
);

const SparkIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l1.2 4.2L17 7.5l-3.8 1.3L12 13l-1.2-4.2L7 7.5l3.8-1.3L12 2z" />
    <path d="M19 12l.7 2.4L22 15l-2.3.6L19 18l-.7-2.4L16 15l2.3-.6L19 12z" />
  </svg>
);

const CalendarIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 3v2m10-2v2M4 7h16" />
    <path d="M5 7h14v14a2 2 0 01-2 2H7a2 2 0 01-2-2V7z" />
  </svg>
);

const ChevronDown = ({ className = "h-4 w-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

// -----------------------------
// KPI Card (matches screenshot style)
// -----------------------------
function KpiCard(props: {
  title: string;
  value: string;
  sub: string;
  tone: "green" | "orange" | "blue" | "red";
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {props.title}
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            {props.value}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {props.sub}
          </div>
        </div>
        <IconWrap tone={props.tone}>{props.icon}</IconWrap>
      </div>
    </Card>
  );
}

// -----------------------------
// MainContent (HR Dashboard layout)
// -----------------------------
export default function MainContent() {
  // mock data (replace with API later)
  const kpis = [
    { title: "Total Employees", value: "256", sub: "+12 this month", tone: "green" as const, icon: <UserGroupIcon /> },
    { title: "Open Positions", value: "18", sub: "• 5 urgent", tone: "orange" as const, icon: <BriefcaseIcon /> },
    { title: "New Hires", value: "32", sub: "• this month", tone: "blue" as const, icon: <SparkIcon /> },
    { title: "Pending Leave", value: "7", sub: "Awaiting approval", tone: "red" as const, icon: <CalendarIcon /> },
  ];

  const pipeline = [
    { label: "Applied", value: 124, tone: "bg-sky-500" },
    { label: "Interview", value: 48, tone: "bg-cyan-500" },
    { label: "Offered", value: 26, tone: "bg-emerald-500" },
    { label: "Hired", value: 12, tone: "bg-amber-500" },
  ];

  const distribution = [
    { label: "Engineering", value: 96, color: "bg-sky-500" },
    { label: "HR & Admin", value: 48, color: "bg-emerald-500" },
    { label: "Sales", value: 36, color: "bg-amber-500" },
    { label: "Finance", value: 28, color: "bg-indigo-500" },
    { label: "Others", value: 48, color: "bg-slate-400" },
  ];

  const timeOff = [
    { name: "Emma Davis", range: "Apr 20 - 25", status: "Approved" as const },
    { name: "Michael Brown", range: "Apr 22 - 24", status: "Pending" as const },
    { name: "Sophia Lee", range: "Apr 30 - May 2", status: "Rejected" as const },
  ];

  const events = [
    { title: "Team Meeting", meta: "Today, 10:00 AM" },
    { title: "Payroll Run", meta: "Apr 25, 2025" },
    { title: "Training Workshop", meta: "Apr 28, 2025" },
  ];

  return (
    <main className="flex-1 bg-slate-50 dark:bg-slate-950 p-6 lg:p-8">
      {/* Top KPI row (4 cards like screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpis.map((k) => (
          <KpiCard key={k.title} {...k} />
        ))}
      </div>

      {/* Middle row: Pipeline (left), Distribution (center), Events (right) */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Recruitment Pipeline */}
        <Card className="xl:col-span-4">
          <CardHeader
            title="Recruitment Pipeline"
            right={
              <button className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white inline-flex items-center gap-1">
                This Month <ChevronDown />
              </button>
            }
          />
          <div className="px-5 pb-5">
            <div className="space-y-3">
              {pipeline.map((p) => (
                <div key={p.label} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={cx("h-2.5 w-2.5 rounded-full", p.tone)} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                      {p.label}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                    {p.value}
                  </span>
                </div>
              ))}
            </div>

            <button className="mt-4 w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition">
              View All →
            </button>
          </div>
        </Card>

        {/* Employee Distribution */}
        <Card className="xl:col-span-5">
          <CardHeader title="Employee Distribution" />
          <div className="px-5 pb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* Donut */}
              <div className="flex items-center justify-center">
                <div className="relative h-44 w-44">
                  {/* Simple donut using conic-gradient */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "conic-gradient(#0EA5E9 0 37.5%, #10B981 37.5% 56.25%, #F59E0B 56.25% 70.31%, #6366F1 70.31% 81.25%, #94A3B8 81.25% 100%)",
                    }}
                  />
                  <div className="absolute inset-[14px] rounded-full bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/60 grid place-items-center">
                    <div className="text-center">
                      <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                        256
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Employees
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2.5">
                {distribution.map((d) => (
                  <div key={d.label} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cx("h-2.5 w-2.5 rounded-full", d.color)} />
                      <span className="text-sm text-slate-700 dark:text-slate-200 truncate">
                        {d.label}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card className="xl:col-span-3">
          <CardHeader title="Upcoming Events" />
          <div className="px-5 pb-5 space-y-3">
            {events.map((e) => (
              <div
                key={e.title}
                className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
              >
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {e.title}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {e.meta}
                </div>
              </div>
            ))}

            <button className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition">
              Calendar →
            </button>
          </div>
        </Card>
      </div>

      {/* Bottom row: Performance overview (left), Time off (center), Payroll summary (right) */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Performance Overview */}
        <Card className="xl:col-span-6">
          <CardHeader
            title="Performance Overview"
            right={<Pill tone="green" label="+18%" />}
            subtitle="Jan - Jun"
          />
          <div className="px-5 pb-5">
            <div className="h-52">
              {/* lightweight SVG line chart */}
              <svg viewBox="0 0 600 220" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(59,130,246,0.22)" />
                    <stop offset="100%" stopColor="rgba(59,130,246,0)" />
                  </linearGradient>
                </defs>

                {/* grid */}
                {[40, 80, 120, 160, 200].map((y) => (
                  <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="rgba(148,163,184,0.25)" strokeWidth="1" />
                ))}

                {/* area + line */}
                <path
                  d="M0,170 C60,150 90,120 140,130 C190,140 230,110 280,95 C330,80 380,120 430,105 C480,90 520,70 600,95 L600,220 L0,220 Z"
                  fill="url(#areaFill)"
                />
                <path
                  d="M0,170 C60,150 90,120 140,130 C190,140 230,110 280,95 C330,80 380,120 430,105 C480,90 520,70 600,95"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>

            {/* mini KPI strip like screenshot */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  On Track
                </div>
                <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-300 mt-1">
                  82%
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  At Risk
                </div>
                <div className="text-lg font-extrabold text-amber-600 dark:text-amber-300 mt-1">
                  10%
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Needs Support
                </div>
                <div className="text-lg font-extrabold text-rose-600 dark:text-rose-300 mt-1">
                  8%
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Time Off Requests */}
        <Card className="xl:col-span-3">
          <CardHeader title="Time Off Requests" right={<button className="text-slate-400 hover:text-slate-700 dark:hover:text-white">•••</button>} />
          <div className="px-5 pb-5 space-y-3">
            {timeOff.map((t) => (
              <div
                key={t.name}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 grid place-items-center text-slate-700 dark:text-slate-200 font-bold text-xs">
                    {t.name
                      .split(" ")
                      .slice(0, 2)
                      .map((x) => x[0])
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {t.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {t.range}
                    </div>
                  </div>
                </div>
                {t.status === "Approved" ? (
                  <Pill tone="green" label="Approved" />
                ) : t.status === "Pending" ? (
                  <Pill tone="amber" label="Pending" />
                ) : (
                  <Pill tone="red" label="Rejected" />
                )}
              </div>
            ))}

            <button className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition">
              View All →
            </button>
          </div>
        </Card>

        {/* Payroll Summary */}
        <Card className="xl:col-span-3">
          <CardHeader title="Payroll Summary" subtitle="Jan - Apr" />
          <div className="px-5 pb-5">
            {/* bar chart */}
            <div className="h-40 flex items-end gap-3">
              {[
                { m: "Jan", h: 38 },
                { m: "Feb", h: 58 },
                { m: "Mar", h: 46 },
                { m: "Apr", h: 74 },
              ].map((b) => (
                <div key={b.m} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="w-full rounded-xl bg-gradient-to-b from-sky-500 to-indigo-500"
                      style={{ height: `${b.h}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{b.m}</div>
                </div>
              ))}
            </div>

            {/* total row */}
            <div className="mt-4 flex items-end justify-between">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Total
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  $5,280
                </div>
              </div>
              <Pill tone="green" label="+12%" />
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
