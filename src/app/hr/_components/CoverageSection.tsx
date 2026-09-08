import { Check } from "lucide-react";
import { coverage } from "../_content";
import SectionHeader from "./SectionHeader";

export default function CoverageSection() {
  return (
    <section id="coverage" className="scroll-mt-28 border-t border-zinc-100 bg-white px-5 py-16 md:px-12 md:py-20 lg:px-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <SectionHeader
          eyebrow="Coverage"
          title="Core HR workflows in one suite."
          text="Start with the modules your team needs, then expand as operations grow."
        />

        <div className="grid gap-3 sm:grid-cols-2">
          {coverage.map((item) => (
            <div key={item} className="group flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white px-4 py-4 shadow-sm transition hover:border-[#a3d900]/25 hover:bg-[#a3d900]/5 hover:shadow-md hover:shadow-zinc-950/5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#a3d900]/10 text-[#5f8700] transition group-hover:bg-[#5f8700] group-hover:text-white">
                <Check className="h-4 w-4" />
              </span>
              <span className="text-sm font-bold text-zinc-700">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
