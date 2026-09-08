import type { Metadata } from "next";
export const metadata:Metadata={title:"HR Suite — People operations",description:"Employee records, onboarding, attendance, leave approvals and project work in one workspace.",alternates:{canonical:"/hr"}};
import HRPageContent from "./_components/HRPageContent";

export default function HRPage() {
  return <HRPageContent />;
}
