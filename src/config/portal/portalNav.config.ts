// src/logaxp/config/portal/portalNav.config.ts

export type NavGate = {
  requiredAnyCapabilities?: string[]; // ✅ from backend (membership.capabilities)
  requiredAnyRoles?: string[];        // ✅ from backend (membership.roleKeys) optional
  ownerOnly?: boolean;
};

export type PortalNavIconKey =
  | "Dashboard"
  | "Employees"
  | "Time"
  | "Leave"
  | "Settings"
  | "Users"
  | "UserCog"
  | "UserPlus"
  | "Calendar"
  | "Clock"
  | "Dollar"
  | "FileText"
  | "TrendingUp"
  | "Shield"
  | "Globe"
  | "Flask"
  | "DollarSign";

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
 * ✅ These MUST match backend membership.capabilities (or derived via getCapabilities()).
 */
export const PORTAL_NAV_CONFIG: PortalNavConfig[] = [
  // -----------------------------
  // Dashboard
  // -----------------------------
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
      {
        name: "Analytics",
        path: "/portal/analytics",
        iconKey: "TrendingUp",
        description: "Key metrics and insights",
        requiredAnyCapabilities: ["portal.dashboard"],
      },
      {
        name: "Reports",
        path: "/portal/reports",
        iconKey: "TrendingUp",
        description: "Key metrics and insights",
        requiredAnyCapabilities: ["portal.dashboard"],
      },
    ],
  },

  // -----------------------------
  // People (Employees + Org Structure)
  // -----------------------------
  {
    name: "People",
    path: "/portal/members",
    iconKey: "Employees",
    requiredAnyCapabilities: ["portal.people", "portal.members", "portal.org_structure", "portal.org_admin"],
    children: [
      {
        name: "Members",
        path: "/portal/members",
        iconKey: "Users",
        description: "Employee records and profiles",
        requiredAnyCapabilities: ["portal.people", "portal.members"],
      },
      {
        name: "Employees",
        path: "/portal/employees",
        iconKey: "Users",
        description: "Employee records and profiles",
        requiredAnyCapabilities: ["portal.people", "portal.members"],
      },
      {
        name: "Org Structure",
        path: "/portal/org-structure",
        iconKey: "UserCog",
        description: "Org units, positions, locations, cost centers",
        requiredAnyCapabilities: ["portal.org_structure", "portal.org_admin"],
      },
      {
        name: "Onboarding",
        path: "/portal/onboarding",
        iconKey: "FileText",
        description: "Build onboarding templates",
        requiredAnyCapabilities: ["portal.onboarding"],
      },
      {
        name: "Add Employee",
        path: "/portal/employees/new",
        iconKey: "UserPlus",
        description: "Onboard a new employee",
        requiredAnyCapabilities: ["portal.people", "portal.members"],
      },
    ],
  },

  // -----------------------------
  // Time & Leave
  // (Your real time folder is /portal/time-attendance)
  // -----------------------------
  {
    name: "Time & Leave",
    path: "/portal/time-attendance",
    iconKey: "Time",
    requiredAnyCapabilities: ["portal.time", "portal.leave"],
    children: [
      {
        name: "Time",
        path: "/portal/time-attendance",
        iconKey: "Clock",
        description: "Time clocks, entries, timers",
        requiredAnyCapabilities: ["portal.time"],
      },
      {
        name: "Leave",
        path: "/portal/leave",
        iconKey: "Leave",
        description: "Leave requests & approvals",
        requiredAnyCapabilities: ["portal.leave"],
      },
      // ✅ Fix Payroll to match your folder:
      // C:\...\src\app\portal\time\payroll\*
      {
        name: "Payroll",
        path: "/portal/time/payroll",
        iconKey: "DollarSign",
        description: "Payroll processing and approvals",
        requiredAnyCapabilities: ["portal.payroll"],
      },
    ],
  },

  // -----------------------------
  // ✅ Scheduling (matches src/app/portal/schedule/*)
  // -----------------------------
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
        description: "Scheduling dashboard",
        requiredAnyCapabilities: ["portal.schedule"],
      },
      {
        name: "Shifts",
        path: "/portal/schedule/shifts",
        iconKey: "Calendar",
        description: "List, generate, publish shifts",
        requiredAnyCapabilities: ["portal.schedule"],
      },
      {
        name: "Templates",
        path: "/portal/schedule/templates",
        iconKey: "FileText",
        description: "Schedule templates",
        requiredAnyCapabilities: ["portal.schedule"],
      },
      {
        name: "Assignments",
        path: "/portal/schedule/assignments",
        iconKey: "Users",
        description: "Assign templates to employees/org units",
        requiredAnyCapabilities: ["portal.schedule"],
      },
      {
        name: "Availability",
        path: "/portal/schedule/availability",
        iconKey: "Clock",
        description: "Availability rules and preferences",
        requiredAnyCapabilities: ["portal.schedule"],
      },
      {
        name: "My Schedule",
        path: "/portal/schedule/me",
        iconKey: "Users",
        description: "My schedule view",
        requiredAnyCapabilities: ["portal.schedule"],
      },
      {
        name: "Settings",
        path: "/portal/schedule/settings",
        iconKey: "Settings",
        description: "Scheduling policies and constraints",
        requiredAnyCapabilities: ["portal.schedule"],
      },
    ],
  },

  // -----------------------------
  // ✅ Payroll submenu (matches src/app/portal/time/payroll/*)
  // Keep as its own top-level section if you want richer nav than the single link above.
  // If you prefer only the single link under Time & Leave, delete this entire block.
  // -----------------------------
  {
    name: "Payroll",
    path: "/portal/time/payroll",
    iconKey: "DollarSign",
    requiredAnyCapabilities: ["portal.payroll"],
    children: [
      {
        name: "Overview",
        path: "/portal/time/payroll",
        iconKey: "TrendingUp",
        description: "Payroll overview",
        requiredAnyCapabilities: ["portal.payroll"],
      },
      {
        name: "Approvals",
        path: "/portal/time/payroll/approvals",
        iconKey: "Shield",
        description: "Submitted timesheets awaiting decision",
        requiredAnyCapabilities: ["portal.payroll"],
      },
      {
        name: "Pay Periods",
        path: "/portal/time/payroll/pay-periods",
        iconKey: "Calendar",
        description: "Generate, lock, manage pay periods",
        requiredAnyCapabilities: ["portal.payroll"],
      },
      {
        name: "Timesheets",
        path: "/portal/time/payroll/timesheets",
        iconKey: "FileText",
        description: "Submit and audit timesheets",
        requiredAnyCapabilities: ["portal.payroll"],
      },
      {
        name: "Overtime",
        path: "/portal/time/payroll/overtime",
        iconKey: "Clock",
        description: "Overtime policy and calculations",
        requiredAnyCapabilities: ["portal.payroll"],
      },
      {
        name: "Runs",
        path: "/portal/time/payroll/run",
        iconKey: "Dollar",
        description: "Payroll exports and run history",
        requiredAnyCapabilities: ["portal.payroll"],
      },
      {
        name: "Settings",
        path: "/portal/time/payroll/settings",
        iconKey: "Settings",
        description: "Time/payroll settings",
        requiredAnyCapabilities: ["portal.payroll"],
      },
    ],
  },

  // -----------------------------
  // Work (Projects / Boards / Work Items / Workflows)
  // -----------------------------
  {
    name: "Work",
    path: "/portal/projects",
    iconKey: "FileText",
    requiredAnyCapabilities: ["portal.work", "portal.projects", "portal.boards"],
    children: [
      {
        name: "Projects",
        path: "/portal/projects",
        iconKey: "FileText",
        description: "Projects & members",
        requiredAnyCapabilities: ["portal.work", "portal.projects"],
      },
      {
        name: "Boards",
        path: "/portal/boards",
        iconKey: "Dashboard",
        description: "Boards and columns",
        requiredAnyCapabilities: ["portal.work", "portal.boards"],
      },
      {
        name: "Work Hub",
        path: "/portal/work",
        iconKey: "FileText",
        description: "Cross-functional work overview",
        requiredAnyCapabilities: ["portal.work"],
      },
      {
        name: "Work Items",
        path: "/portal/work-items",
        iconKey: "FileText",
        description: "Tasks, issues, and delivery tracking",
        requiredAnyCapabilities: ["portal.work"],
      },
      {
        name: "Backlog",
        path: "/portal/backlog",
        iconKey: "FileText",
        description: "Prioritized work queue",
        requiredAnyCapabilities: ["portal.work"],
      },
      {
        name: "Sprints",
        path: "/portal/sprints",
        iconKey: "Calendar",
        description: "Sprint planning and execution",
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
        iconKey: "Flask",
        description: "QA plans, suites, runs, and cases",
        requiredAnyCapabilities: ["portal.work", "portal.testing"],
      },
    ],
  },

  // -----------------------------
  // Collaboration (Chat / Notifications)
  // -----------------------------
  {
    name: "Collaboration",
    path: "/portal/chat",
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
        description: "Feed and preferences",
        requiredAnyCapabilities: ["portal.notifications"],
      },
    ],
  },

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
  // Admin
  // -----------------------------
  {
    name: "Admin",
    path: "/portal/settings",
    iconKey: "Settings",
    requiredAnyCapabilities: [
      "portal.settings",
      "portal.security",
      "portal.domains",
      "portal.members",
      "portal.rbac",
      "portal.api_keys",
      "portal.billing",
    ],
    children: [
      {
        name: "Settings",
        path: "/portal/settings",
        iconKey: "Settings",
        description: "Workspace settings and policies",
        requiredAnyCapabilities: ["portal.settings"],
      },
      {
        name: "Security",
        path: "/portal/settings/security/change-password",
        iconKey: "Shield",
        description: "Security preferences",
        requiredAnyCapabilities: ["portal.security"],
      },
      {
        name: "Domains",
        path: "/portal/domains",
        iconKey: "Globe",
        description: "Domain management",
        requiredAnyCapabilities: ["portal.domains"],
      },
      {
        name: "Members & Invites",
        path: "/portal/settings/team",
        iconKey: "Users",
        description: "Memberships and invitations",
        requiredAnyCapabilities: ["portal.members"],
      },
      {
        name: "Roles & Permissions",
        path: "/portal/rbac",
        iconKey: "Shield",
        description: "RBAC management",
        requiredAnyCapabilities: ["portal.rbac"],
      },
      {
        name: "API Keys",
        path: "/portal/api-keys",
        iconKey: "Shield",
        description: "Tenant API keys",
        requiredAnyCapabilities: ["portal.api_keys"],
      },
      {
        name: "Billing",
        path: "/portal/billings",
        iconKey: "Dollar",
        description: "Subscription & billing",
        requiredAnyCapabilities: ["portal.billing"],
      },
    ],
  },
];
