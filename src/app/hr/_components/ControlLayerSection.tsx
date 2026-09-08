"use client";

import { motion } from "framer-motion";
import { ClipboardCheck } from "lucide-react";
import { workflow } from "../_content";
import { fadeUp, stagger } from "../_motion";
import SectionHeader from "./SectionHeader";

export default function ControlLayerSection() {
  return (
    <section id="governance" className="scroll-mt-28 border-t border-zinc-100 bg-white px-5 py-16 md:px-12 md:py-20 lg:px-24">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
          <SectionHeader
            eyebrow="Control layer"
            title="Approvals and HR actions stay accountable."
            text="Policy routing, ownership, evidence, and decision history stay attached."
          />
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.28 }} variants={stagger} className="rounded-[1.25rem] border border-zinc-100 bg-white p-5 shadow-lg shadow-zinc-950/5 md:p-6">
          <div className="flex items-center justify-between gap-5 border-b border-zinc-100 pb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-400">Workflow example</p>
              <h3 className="mt-2 text-2xl font-extrabold tracking-tight">Request to approval</h3>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#a3d900]/25 bg-[#a3d900]/10 text-[#5f8700]">
              <ClipboardCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {workflow.map((item, index) => (
              <motion.div key={item} variants={fadeUp} className="relative border-l border-zinc-100 pl-4 md:border-l-0 md:border-t md:pl-0 md:pt-5">
                <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-[#a3d900] md:-top-1.5 md:left-0" />
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">Step {index + 1}</p>
                <p className="mt-2 text-base font-extrabold tracking-tight text-zinc-950">{item}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
