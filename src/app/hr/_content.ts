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
    title: "Recruiting",
    text: "Hiring flow",
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
    title: "Training",
    text: "Learning records",
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
    eyebrow: "Talent acquisition",
    title: "Interview workflow",
    text: "Stages, feedback, decisions.",
    src: "/images/hr_interview.png",
    alt: "Structured HR interview session",
  },
  {
    eyebrow: "Workforce development",
    title: "Training programs",
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
    eyebrow: "Recruitment",
    title: "Structured hiring workflows.",
    text: "Track candidates, interview feedback, decisions, and onboarding handoff.",
    src: "/images/hr_interview.png",
    alt: "HR interview session",
    points: ["Interview stages", "Decision trail"],
  },
  {
    eyebrow: "Training and development",
    title: "Training records you can verify.",
    text: "Assign training, capture attendance, and retain completion evidence.",
    src: "/images/hr_training.png",
    alt: "HR training session",
    points: ["Assignments", "Completion evidence"],
  },
];

export const coverage = [
  "Employee records",
  "Recruiting",
  "Onboarding",
  "Training",
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
