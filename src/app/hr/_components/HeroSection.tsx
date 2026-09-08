"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { fadeUp, stagger } from "../_motion";
import CompanyLogoMarquee from "./CompanyLogoMarquee";

export default function HeroSection() {
  return (
    <section id="overview" className="relative scroll-mt-28 overflow-hidden bg-white px-5 pb-12 pt-3 md:px-12 md:pb-20 md:pt-4 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative overflow-hidden rounded-[2rem] border border-zinc-100 bg-white shadow-2xl shadow-zinc-950/5"
        >
          <div className="grid min-h-[560px] gap-8 px-5 py-10 md:px-10 md:py-14 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:px-14">
            <motion.div variants={stagger} className="relative z-10 max-w-xl">
              <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-[0.22em] text-[#5f8700]">
                LogaXP HR Suite
              </motion.p>

              <motion.h1 variants={fadeUp} className="mt-7 max-w-2xl text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.055em] text-zinc-950 md:text-6xl lg:text-[72px]">
                HR + Payroll.
                <br />
                Everywhere.
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">
                Hire, manage, train, approve, and pay teams from one secure HR platform built for growing operations.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="group inline-flex items-center justify-center gap-3 rounded-full bg-zinc-950 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-zinc-950/15 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-zinc-950/10"
                >
                  Book demo
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>

                <Link
                  href="/admin/signup"
                  className="inline-flex items-center justify-center rounded-full border border-[#5f8700]/35 bg-white px-7 py-3.5 text-base font-semibold text-[#5f8700] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#5f8700] hover:shadow-md"
                >
                  Sign up
                </Link>
              </motion.div>
            </motion.div>

            <motion.div variants={fadeUp} className="relative min-h-[360px] overflow-hidden rounded-[1.5rem] bg-white lg:-mr-12 lg:min-h-[520px]">
              <Image
                src="/images/hr-dashboard-1.png"
                alt="LogaXP HR dashboard with employee analytics, leave tracking, approvals, and payroll workflow cards"
                fill
                priority
                sizes="(min-width: 1024px) 760px, 100vw"
                className="object-contain object-center lg:object-right"
              />
            </motion.div>
          </div>
        </motion.div>

        <CompanyLogoMarquee />
      </div>
    </section>
  );
}
