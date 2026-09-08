import {
  BriefcaseBusiness,
  CalendarCheck,
  FileText,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";

export type LifecycleItem = {
  title: string;
  text: string;
  icon: LucideIcon;
};

export type ImagePanel = {
  eyebrow: string;
  title: string;
  text: string;
  src: string;
  alt: string;
};

export type Workstream = ImagePanel & {
  points: string[];
};

export const lifecycle: LifecycleItem[] = [
  {
    title: "Onboarding",
    text: "Task checklists",
    icon: BriefcaseBusiness,
  },
  {
    title: "Records",
    text: "Employee files",
    icon: FileText,
  },
  {
    title: "Time and leave",
    text: "Requests and approvals",
    icon: CalendarCheck,
  },
  {
    title: "Team operations",
    text: "Manager reporting",
    icon: GraduationCap,
  },
];

export const heroPanels: ImagePanel[] = [
  {
    eyebrow: "People operations",
    title: "Employee records",
    text: "Profiles, documents, roles.",
    src: "/images/hr_rep.png",
    alt: "HR representative helping an employee",
  },
  {
    eyebrow: "Onboarding",
    title: "Onboarding tasks",
    text: "Owners, tasks, completion.",
    src: "/images/hr_interview.png",
    alt: "Structured HR interview session",
  },
  {
    eyebrow: "Attendance review",
    title: "Team operations programs",
    text: "Assignments and evidence.",
    src: "/images/hr_training.png",
    alt: "HR training session",
  },
];

export const workstreams: Workstream[] = [
  {
    eyebrow: "Employee operations",
    title: "A complete employee record.",
    text: "Maintain profiles, documents, roles, and manager history in one controlled workspace.",
    src: "/images/hr_rep.png",
    alt: "HR representative speaking with an employee",
    points: ["Employee file", "Document history"],
  },
  {
    eyebrow: "Onboarding",
    title: "Onboarding with clear ownership.",
    text: "Assign onboarding tasks, link employee accounts and track required steps.",
    src: "/images/hr_interview.png",
    alt: "HR interview session",
    points: ["Required tasks", "Completion status"],
  },
  {
    eyebrow: "Team operations and development",
    title: "Team operations records you can verify.",
    text: "Review attendance, breaks and timesheets before exporting approved hours.",
    src: "/images/hr_training.png",
    alt: "HR training session",
    points: ["Assignments", "Completion evidence"],
  },
];

export const coverage = [
  "Employee records",
  "Onboarding",
  "Team operations",
  "Leave",
  "Attendance",
  "Approvals",
  "Documents",
  "Reporting",
  "Access control",
];

export const workflow = [
  "Request created",
  "Policy route selected",
  "Manager or HR approval",
  "Audit trail stored",
];
