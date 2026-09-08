
// src/logaxp/lib/auth/portalAuthz.ts
import type { AuthMembership } from "@/logaxp/lib/auth/auth.types";

export function getRoleKeys(m: AuthMembership | null | undefined): string[] {
  return Array.isArray(m?.roleKeys) ? m.roleKeys : [];
}

export function hasRole(m: AuthMembership | null | undefined, roleKey: string): boolean {
  return getRoleKeys(m).includes(roleKey);
}

export function hasAnyRole(
  m: AuthMembership | null | undefined,
  roleKeys?: string[]
): boolean {
  if (!roleKeys?.length) return true;
  const current = new Set(getRoleKeys(m));
  return roleKeys.some((r) => current.has(r));
}

export function getPermissions(m: AuthMembership | null | undefined): string[] {
  return Array.isArray(m?.permissions) ? m.permissions : [];
}

/**
 * ✅ Enterprise-style capability normalization:
 * - Keep backend capabilities if present
 * - Add missing capabilities derived from permissions
 * - Add aliases so old nav keys still work (portal.admin.*)
 */
export function getCapabilities(m: AuthMembership | null | undefined): string[] {
  const baseCaps = Array.isArray(m?.capabilities)
    ? m.capabilities
    : [];
  const perms = getPermissions(m);

  const set = new Set<string>(baseCaps);

  // -----------------------------
  // Derive missing capabilities from permissions
  // -----------------------------
  if (perms.some((p) => p.startsWith("onboarding."))) {
    set.add("portal.onboarding");
  }

  if (
    perms.some((p) =>
      p.startsWith("employee.") ||
      p.startsWith("employee.assignments.") ||
      p.startsWith("employee.documents.") ||
      p.startsWith("employee.notes.")
    )
  ) {
    set.add("portal.people");
    set.add("portal.members");
  }

  if (
    perms.some((p) =>
      p.startsWith("orgunits.") ||
      p.startsWith("positions.") ||
      p.startsWith("locations.") ||
      p.startsWith("costcenters.")
    )
  ) {
    set.add("portal.org_structure");
    set.add("portal.org_admin");
    set.add("portal.org"); // legacy
  }

  // -----------------------------
  // TIME (core)
  // -----------------------------
  if (perms.some((p) => p.startsWith("time."))) {
    set.add("portal.time");
  }

  if (perms.some((p) => p.startsWith("leave."))) {
    set.add("portal.leave");
  }

  // -----------------------------
  // WORK
  // -----------------------------
  if (
    perms.some((p) =>
      p.startsWith("project.") ||
      p.startsWith("projects.") ||
      p.startsWith("boards.") ||
      p.startsWith("board.") ||
      p.startsWith("work-items.") ||
      p.startsWith("workitem.") ||
      p.startsWith("workflows.") ||
      p.startsWith("testing.")
    )
  ) {
    set.add("portal.work");
    set.add("portal.projects");
    set.add("portal.boards");
    set.add("portal.testing");
  }

  // -----------------------------
  // Collaboration
  // -----------------------------
  if (perms.some((p) => p.startsWith("chat."))) {
    set.add("portal.chat");
  }

  if (perms.some((p) => p.startsWith("notifications."))) {
    set.add("portal.notifications");
  }

  // -----------------------------
  // Manager
  // -----------------------------
  const hasManager =
    perms.some((p) => p.startsWith("manager.read")) ||
    perms.some((p) => p.startsWith("manager.summary.read")) ||
    perms.some((p) => p.startsWith("manager.team.read")) ||
    perms.some((p) => p.startsWith("manager.orgscope.read")) ||
    perms.some((p) => p.startsWith("manager.leave.read")) ||
    perms.some((p) => p.startsWith("manager.timesheet.read")) ||
    perms.some((p) => p.startsWith("manager.attendance.read"));

  if (hasManager) {
    set.add("portal.manager");
  }

  if (perms.includes("manager.summary.read")) {
    set.add("portal.manager.summary");
  }

  if (perms.includes("manager.team.read") || perms.includes("manager.team.read.all")) {
    set.add("portal.manager.team");
  }

  if (perms.includes("manager.orgscope.read")) {
    set.add("portal.manager.scope");
  }

  if (perms.includes("manager.leave.read")) {
    set.add("portal.manager.leave");
  }

  if (perms.includes("manager.timesheet.read")) {
    set.add("portal.manager.timesheets");
  }

  if (perms.includes("manager.attendance.read")) {
    set.add("portal.manager.attendance");
  }

  // -----------------------------
  // Admin / Tenant surface
  // -----------------------------
  if (perms.some((p) => p.startsWith("tenant.settings."))) {
    set.add("portal.settings");
  }

  if (perms.some((p) => p.startsWith("tenant.domain."))) {
    set.add("portal.domains");
  }

  if (perms.some((p) => p.startsWith("tenant.roles."))) {
    set.add("portal.rbac");
  }

  if (perms.some((p) => p.startsWith("api_keys."))) {
    set.add("portal.api_keys");
  }

  if (perms.some((p) => p.startsWith("billing."))) {
    set.add("portal.billing");
  }

  if (
    perms.some(
      (p) => p.startsWith("tenant.members.") || p.startsWith("tenant.invitations.")
    )
  ) {
    set.add("portal.security");
  }

  // -----------------------------
  // Scheduling
  // -----------------------------
  if (perms.some((p) => p.startsWith("schedule."))) {
    set.add("portal.schedule");
  }

  if (perms.some((p) => p.startsWith("schedule.shifts."))) {
    set.add("portal.schedule.shifts");
  }

  if (perms.some((p) => p.startsWith("schedule.templates."))) {
    set.add("portal.schedule.templates");
  }

  if (perms.some((p) => p.startsWith("schedule.assignments."))) {
    set.add("portal.schedule.assignments");
  }

  if (perms.some((p) => p.startsWith("schedule.availability."))) {
    set.add("portal.schedule.availability");
  }

  // schedule “settings/admin surface”
  if (perms.includes("schedule.admin") || perms.includes("schedule.write")) {
    set.add("portal.schedule.settings");
  }

  // -----------------------------
  // Payroll
  // -----------------------------
  const hasPayroll =
    perms.some((p) => p.startsWith("time.payroll.")) ||
    perms.some((p) => p.startsWith("time.payperiods.")) ||
    perms.some((p) => p.startsWith("time.timesheets.")) ||
    perms.some((p) => p.startsWith("time.overtime.")) ||
    perms.some((p) => p.startsWith("time.settings."));

  if (hasPayroll) {
    set.add("portal.payroll");
  }

  if (perms.some((p) => p.startsWith("time.payperiods."))) {
    set.add("portal.payroll.pay_periods");
  }

  if (perms.some((p) => p.startsWith("time.timesheets."))) {
    set.add("portal.payroll.timesheets");
  }

  if (perms.some((p) => p.startsWith("time.overtime."))) {
    set.add("portal.payroll.overtime");
  }

  if (perms.some((p) => p.startsWith("time.payroll."))) {
    set.add("portal.payroll.runs");
  }

  if (perms.some((p) => p.startsWith("time.settings."))) {
    set.add("portal.payroll.settings");
  }

  // approvals queue is special (approve/admin)
  if (
    perms.includes("time.timesheets.approve") ||
    perms.includes("time.admin") ||
    perms.includes("time.clock.admin") ||
    perms.includes("time.payroll.write")
  ) {
    set.add("portal.payroll.approvals");
  }

  // -----------------------------
  // Aliases (your nav config uses portal.admin.* keys)
  // -----------------------------
  if (set.has("portal.settings")) set.add("portal.admin.settings");
  if (set.has("portal.domains")) set.add("portal.admin.domains");
  if (set.has("portal.security")) set.add("portal.admin.members");
  if (set.has("portal.rbac")) set.add("portal.admin.rbac");
  if (set.has("portal.api_keys")) set.add("portal.admin.api_keys");
  if (set.has("portal.billing")) set.add("portal.admin.billing");

  if (set.has("portal.org_structure") || set.has("portal.org_admin")) {
    set.add("portal.org");
  }

  return Array.from(set);
}

export function hasCapability(m: AuthMembership | null | undefined, capability: string): boolean {
  return getCapabilities(m).includes(capability);
}

export function hasAnyCapability(
  m: AuthMembership | null | undefined,
  capabilities?: readonly string[]
): boolean {
  if (!capabilities?.length) return true;
  const current = new Set(getCapabilities(m));
  return capabilities.some((c) => current.has(c));
}

export function isActiveMembership(m: AuthMembership | null | undefined) {
  return m?.status === "ACTIVE";
}

export function getMembershipLabel(m: AuthMembership | null | undefined): string {
  if (!m) return "No workspace";
  if (m.isOwner) return "Owner";

  const roles = getRoleKeys(m);
  if (roles.includes("tenant.admin")) return "Tenant Admin";
  if (roles.includes("hr.manager")) return "HR Manager";
  if (roles.includes("hr.viewer")) return "HR Viewer";
  if (roles.includes("project.manager")) return "Project Manager";
  if (roles.includes("project.member")) return "Project Member";
  if (roles.includes("tenant.viewer")) return "Viewer";

  return m.title || "Member";
}

export type NavGate = {
  requiredAnyCapabilities?: string[]; // ✅ backend-computed
  requiredAnyRoles?: string[];        // ✅ backend-computed (optional)
  ownerOnly?: boolean;
};

export type PortalNavIconKey =
  | "Dashboard"
  | "Employees"
  | "Recruitment"
  | "Time"
  | "Payroll"
  | "Leave"
  | "Performance"
  | "Reports"
  | "Settings"
  | "UserPlus"
  | "UserCog"
  | "Users"
  | "Calendar"
  | "Clock"
  | "Dollar"
  | "FileText"
  | "TrendingUp"
  | "Shield"
  | "Globe"
  | "Leave";

export type PortalChildNavConfig = NavGate & {
  name: string;
  path: string;
  iconKey?: PortalNavIconKey;
  description?: string;
};

export type PortalNavConfig = NavGate & {
  name: string;
  path: string;
  iconKey: PortalNavIconKey;
  children?: PortalChildNavConfig[];
};

/**
 * ✅ Capability contract (from backend MembershipAccessService.deriveCapabilities)
 *
 * portal.dashboard
 * portal.people
 * portal.org
 * portal.onboarding
 * portal.time
 * portal.leave
 * portal.work
 * portal.testing
 * portal.chat
 * portal.notifications
 * portal.admin.settings
 * portal.admin.domains
 * portal.admin.members
 * portal.admin.rbac
 * portal.admin.api_keys
 * portal.admin.billing
 * portal.manager
 */
export const PORTAL_NAV_CONFIG: PortalNavConfig[] = [
  {
    name: "Dashboard",
    path: "/portal",
    iconKey: "Dashboard",
    requiredAnyCapabilities: ["portal.dashboard"],
    children: [
      {
        name: "Overview",
        path: "/portal",
        iconKey: "TrendingUp",
        description: "Key metrics and insights",
        requiredAnyCapabilities: ["portal.dashboard"],
      },
    ],
  },

  // -----------------------------
  // People & HR (real keys exist: employee.*, orgunits.*, positions.*, locations.*, costcenters.*)
  // -----------------------------
  {
    name: "People",
    path: "/portal/members",
    iconKey: "Employees",
    requiredAnyCapabilities: ["portal.people"],
    children: [
      {
        name: "Employees",
        path: "/portal/members",
        iconKey: "Users",
        description: "Employee records and profiles",
        requiredAnyCapabilities: ["portal.people"],
      },
      {
        name: "Org Structure",
        path: "/portal/org",
        iconKey: "UserCog",
        description: "Org units, positions, locations, cost centers",
        requiredAnyCapabilities: ["portal.org"],
      },
      {
        name: "Onboarding",
        path: "/portal/onboarding",
        iconKey: "FileText",
        description: "Templates and onboarding workflows",
        requiredAnyCapabilities: ["portal.onboarding"],
      },
    ],
  },

    {
    name: "Scheduling",
    path: "/portal/schedule",
    iconKey: "Calendar",
    requiredAnyCapabilities: ["portal.schedule"],
    children: [
      {
        name: "Overview",
        path: "/portal/schedule",
        iconKey: "TrendingUp",
        description: "Schedule dashboard",
        requiredAnyCapabilities: ["portal.schedule"],
      },
      {
        name: "Shifts",
        path: "/portal/schedule/shifts",
        iconKey: "Calendar",
        description: "Create, generate, publish shifts",
        requiredAnyCapabilities: ["portal.schedule.shifts", "portal.schedule"],
      },
      {
        name: "Templates",
        path: "/portal/schedule/templates",
        iconKey: "FileText",
        description: "Schedule templates",
        requiredAnyCapabilities: ["portal.schedule.templates", "portal.schedule"],
      },
      {
        name: "Assignments",
        path: "/portal/schedule/assignments",
        iconKey: "Users",
        description: "Template assignments to employees/org units",
        requiredAnyCapabilities: ["portal.schedule.assignments", "portal.schedule"],
      },
      {
        name: "Availability",
        path: "/portal/schedule/availability",
        iconKey: "Clock",
        description: "Availability rules & preferences",
        requiredAnyCapabilities: ["portal.schedule.availability", "portal.schedule"],
      },
      {
        name: "My Schedule",
        path: "/portal/schedule/me",
        iconKey: "UserCog",
        description: "Personal schedule view",
        requiredAnyCapabilities: ["portal.schedule"],
      },
      {
        name: "Settings",
        path: "/portal/schedule/settings",
        iconKey: "Settings",
        description: "Min rest, max shift, policy",
        requiredAnyCapabilities: ["portal.schedule.settings"],
      },
    ],
  },

  {
  name: "Payroll",
  path: "/portal/time/payroll",
  iconKey: "Dollar",
  requiredAnyCapabilities: ["portal.payroll"],
  children: [
    {
      name: "Overview",
      path: "/portal/time/payroll",
      iconKey: "TrendingUp",
      description: "Payroll operations",
      requiredAnyCapabilities: ["portal.payroll"],
    },
    {
      name: "Pay Periods",
      path: "/portal/time/payroll/pay-periods",
      iconKey: "Calendar",
      description: "Generate, lock, manage pay periods",
      requiredAnyCapabilities: ["portal.payroll.pay_periods", "portal.payroll"],
    },
    {
      name: "Timesheets",
      path: "/portal/time/payroll/timesheets",
      iconKey: "FileText",
      description: "Submit and review timesheets",
      requiredAnyCapabilities: ["portal.payroll.timesheets", "portal.payroll"],
    },
    {
      name: "Approvals",
      path: "/portal/time/payroll/approvals",
      iconKey: "Shield",
      description: "Approval queue (submitted timesheets)",
      requiredAnyCapabilities: ["portal.payroll.approvals"],
    },
    {
      name: "Overtime",
      path: "/portal/time/payroll/overtime",
      iconKey: "Clock",
      description: "Overtime policy & calculations",
      requiredAnyCapabilities: ["portal.payroll.overtime", "portal.payroll"],
    },
    {
      name: "Runs",
      path: "/portal/time/payroll/run",
      iconKey: "Dollar",
      description: "Payroll exports & run history",
      requiredAnyCapabilities: ["portal.payroll.runs", "portal.payroll"],
    },
    {
      name: "Settings",
      path: "/portal/time/payroll/settings",
      iconKey: "Settings",
      description: "Time/payroll settings",
      requiredAnyCapabilities: ["portal.payroll.settings", "portal.payroll"],
    },
  ],
},

  // -----------------------------
  // Time & Leave (real keys exist: time.*, time.clock.*, time.timers.*, leave.*)
  // -----------------------------
  {
    name: "Time & Leave",
    path: "/portal/time",
    iconKey: "Time",
    requiredAnyCapabilities: ["portal.time", "portal.leave"],
    children: [
      {
        name: "Time Clocks",
        path: "/portal/time/clocks",
        iconKey: "Clock",
        description: "Clock in/out & attendance records",
        requiredAnyCapabilities: ["portal.time"],
      },
      {
        name: "Time Entries",
        path: "/portal/time/entries",
        iconKey: "FileText",
        description: "Time entries & approvals",
        requiredAnyCapabilities: ["portal.time"],
      },
      {
        name: "Timers",
        path: "/portal/time/timers",
        iconKey: "Clock",
        description: "Work session timers",
        requiredAnyCapabilities: ["portal.time"],
      },
      {
        name: "Leave Requests",
        path: "/portal/leave-requests",
        iconKey: "Leave",
        description: "Leave requests & approvals",
        requiredAnyCapabilities: ["portal.leave"],
      },
    ],
  },

  // -----------------------------
  // Work Management (real keys exist: project.read/write alias, boards.*, workitem.*, workflows alias, testing.*)
  // -----------------------------
  {
    name: "Work",
    path: "/portal/work",
    iconKey: "TrendingUp",
    requiredAnyCapabilities: ["portal.work"],
    children: [
      {
        name: "Projects",
        path: "/portal/projects",
        iconKey: "FileText",
        description: "Projects & members",
        requiredAnyCapabilities: ["portal.work"],
      },
      {
        name: "Boards",
        path: "/portal/boards",
        iconKey: "Dashboard",
        description: "Boards and columns",
        requiredAnyCapabilities: ["portal.work"],
      },
      {
        name: "Work Items",
        path: "/portal/work-items",
        iconKey: "FileText",
        description: "Tasks, issues and tracking",
        requiredAnyCapabilities: ["portal.work"],
      },
      {
        name: "Workflows",
        path: "/portal/workflows",
        iconKey: "UserCog",
        description: "Workflow configuration",
        requiredAnyCapabilities: ["portal.work"],
      },
      {
        name: "Testing",
        path: "/portal/testing",
        iconKey: "Shield",
        description: "Suites, cases, plans and runs",
        requiredAnyCapabilities: ["portal.testing"],
      },
    ],
  },

  // -----------------------------
  // Collaboration (real keys exist: chat.*, notifications.*)
  // -----------------------------
  {
    name: "Collaboration",
    path: "/portal/collaboration",
    iconKey: "Users",
    requiredAnyCapabilities: ["portal.chat", "portal.notifications"],
    children: [
      {
        name: "Chat",
        path: "/portal/chat",
        iconKey: "Users",
        description: "Threads and messages",
        requiredAnyCapabilities: ["portal.chat"],
      },
      {
        name: "Notifications",
        path: "/portal/notifications",
        iconKey: "Shield",
        description: "Notification feed and preferences",
        requiredAnyCapabilities: ["portal.notifications"],
      },
    ],
  },

  // Manager (subset of collaboration with elevated permissions)
    {
    name: "Manager",
    path: "/portal/manager",
    iconKey: "Users",
    requiredAnyCapabilities: ["portal.manager"],
    children: [
      {
        name: "Overview",
        path: "/portal/manager",
        iconKey: "TrendingUp",
        description: "Manager dashboard and summary",
        requiredAnyCapabilities: ["portal.manager", "portal.manager.summary"],
      },
      {
        name: "Team",
        path: "/portal/manager/my-team",
        iconKey: "Users",
        description: "My team and reporting structure",
        requiredAnyCapabilities: ["portal.manager.team", "portal.manager"],
      },
      {
        name: "Org Scope",
        path: "/portal/manager/org-scope",
        iconKey: "UserCog",
        description: "Managed org units, locations, and cost centers",
        requiredAnyCapabilities: ["portal.manager.scope", "portal.manager"],
      },
      {
        name: "Leave Requests",
        path: "/portal/manager/leave-requests",
        iconKey: "Leave",
        description: "Team leave visibility",
        requiredAnyCapabilities: ["portal.manager.leave", "portal.manager"],
      },
      {
        name: "Timesheets",
        path: "/portal/manager/timesheets",
        iconKey: "FileText",
        description: "Team timesheets and approvals",
        requiredAnyCapabilities: ["portal.manager.timesheets", "portal.manager"],
      },
      {
        name: "Attendance",
        path: "/portal/manager/time-clocks",
        iconKey: "Clock",
        description: "Team attendance and time clocks",
        requiredAnyCapabilities: ["portal.manager.attendance", "portal.manager"],
      },
    ],
  },

  // -----------------------------
  // Admin & Security (real keys exist: tenant.settings.*, tenant.domain.*, tenant.invitations.*, roles.*, permissions.*, api_keys.*, billing.subscription.*)
  // -----------------------------
  {
    name: "Admin",
    path: "/portal/settings",
    iconKey: "Settings",
    requiredAnyCapabilities: [
      "portal.admin.settings",
      "portal.admin.domains",
      "portal.admin.members",
      "portal.admin.rbac",
      "portal.admin.api_keys",
      "portal.admin.billing",
    ],
    children: [
      {
        name: "Settings",
        path: "/portal/settings",
        iconKey: "Settings",
        description: "Workspace settings and policies",
        requiredAnyCapabilities: ["portal.admin.settings"],
      },
      {
        name: "Domains",
        path: "/portal/domains",
        iconKey: "Globe",
        description: "Domain management",
        requiredAnyCapabilities: ["portal.admin.domains"],
      },
      {
        name: "Members & Invites",
        path: "/portal/settings/team",
        iconKey: "Users",
        description: "Memberships and invitations",
        requiredAnyCapabilities: ["portal.admin.members"],
      },
      {
        name: "Roles & Permissions",
        path: "/portal/rbac",
        iconKey: "Shield",
        description: "RBAC management",
        requiredAnyCapabilities: ["portal.admin.rbac"],
      },
      {
        name: "API Keys",
        path: "/portal/api-keys",
        iconKey: "Shield",
        description: "Tenant API keys",
        requiredAnyCapabilities: ["portal.admin.api_keys"],
      },
      {
        name: "Billing",
        path: "/portal/billing",
        iconKey: "Dollar",
        description: "Subscription & billing",
        requiredAnyCapabilities: ["portal.admin.billing"],
      },
    ],
  },
];

