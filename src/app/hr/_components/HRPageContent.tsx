"use client";

import { MotionConfig } from "framer-motion";
import ControlLayerSection from "./ControlLayerSection";
import CoverageSection from "./CoverageSection";
import CtaSection from "./CtaSection";
import HRProductHeader from "./HRProductHeader";
import HeroSection from "./HeroSection";
import PricingSection from "./PricingSection";
import WorkstreamsSection from "./WorkstreamsSection";

export default function HRPageContent() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="geist flex min-h-screen flex-col bg-white text-black">
        <HRProductHeader />
        <HeroSection />
        <WorkstreamsSection />
        <ControlLayerSection />
        <CoverageSection />
        <PricingSection />
        <CtaSection />
      </main>
    </MotionConfig>
  );
}
