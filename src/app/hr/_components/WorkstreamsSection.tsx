"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { workstreams } from "../_content";
import { fadeUp, photoReveal, stagger } from "../_motion";
import SectionHeader from "./SectionHeader";

const iconVariants = ["records", "hiring", "training"] as const;

export default function WorkstreamsSection() {
  return (
    <section id="workflows" className="scroll-mt-28 border-t border-zinc-100 bg-white px-5 py-16 md:px-12 md:py-24 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1fr] lg:items-end">
          <SectionHeader
            eyebrow="Lifecycle management"
            title="Connect every stage of the employee journey."
            text="Records, onboarding, leave, attendance, and approvals stay connected."
          />
          <div className="hidden h-px bg-zinc-100 lg:block" />
        </div>

        <div className="mt-14 space-y-14 md:space-y-20">
          {workstreams.map((section, index) => (
            <motion.article
              key={section.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={stagger}
              className="grid gap-6 rounded-[2rem] border border-zinc-100 bg-white p-3 shadow-xl shadow-zinc-950/5 md:p-4 lg:grid-cols-[0.95fr_1fr] lg:items-stretch"
            >
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <motion.div
                  variants={photoReveal}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                  className="group relative h-full min-h-[260px] overflow-hidden rounded-[1.5rem] bg-zinc-100 md:min-h-[360px]"
                >
                  <Image
                    src={section.src}
                    alt={section.alt}
                    fill
                    className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-950/35 to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full border border-white/45 bg-white/85 px-3 py-1.5 text-xs font-bold text-zinc-800 shadow-sm backdrop-blur">
                    0{index + 1}
                  </div>
                </motion.div>
              </div>

              <motion.div variants={fadeUp} className="flex flex-col justify-center px-2 py-5 md:px-6 lg:px-8">
                <div className="mb-6 flex items-center gap-4">
                  <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-[#a3d900]/25 bg-[#a3d900]/10 text-[#5f8700] shadow-sm">
                    <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#a3d900]" />
                    <WorkstreamIcon variant={iconVariants[index]} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5f8700]">{section.eyebrow}</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-500">LogaXP workflow</p>
                  </div>
                </div>

                <h2 className="max-w-xl text-2xl font-extrabold leading-tight tracking-[-0.03em] text-zinc-950 md:text-4xl">
                  {section.title}
                </h2>
                <p className="mt-4 max-w-lg text-base leading-7 text-zinc-600">{section.text}</p>

                <div className="mt-7 flex flex-wrap gap-3">
                  {section.points.map((point) => (
                    <motion.div
                      key={point}
                      variants={fadeUp}
                      className="inline-flex items-center gap-2.5 rounded-2xl border border-zinc-100 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 shadow-sm transition hover:border-[#a3d900]/25 hover:bg-[#a3d900]/10 hover:text-[#5f8700]"
                    >
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-[#a3d900]/25 text-[#5f8700]">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {point}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkstreamIcon({ variant }: { variant: (typeof iconVariants)[number] }) {
  if (variant === "hiring") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true" className="h-10 w-10" fill="none">
        <circle cx="16" cy="17" r="5" stroke="currentColor" strokeWidth="2.4" />
        <circle cx="32" cy="17" r="5" stroke="currentColor" strokeWidth="2.4" />
        <path d="M8 37c1.4-6.2 5-9.3 10.8-9.3 2.1 0 3.8.4 5.2 1.2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M24 29c1.5-.9 3.2-1.3 5.2-1.3 5.8 0 9.4 3.1 10.8 9.3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M22 11.5h4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M19 35h10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M33.5 29.5l4.5-4.5h-4.5v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
      </svg>
    );
  }

  if (variant === "training") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true" className="h-10 w-10" fill="none">
        <path d="M10 12.5A4.5 4.5 0 0 1 14.5 8H38v28H14.5A4.5 4.5 0 0 0 10 40.5v-28Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M14.5 36H38" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M18 16h13" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M18 22h9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
        <path d="M18 29l4 3 7-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="35" cy="14" r="3" fill="currentColor" opacity="0.25" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-10 w-10" fill="none">
      <path d="M14 7h15l7 7v27H14V7Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M29 7v8h7" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M19 21h12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M19 27h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
      <path d="M19 33h8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
      <path d="M9 13v28h19" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
    </svg>
  );
}
