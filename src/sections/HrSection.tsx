"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef } from "react";
import useTextReveal from "../hooks";
import { motion, MotionConfig, Variants } from "framer-motion";

/* -----------------------------
  Animations
----------------------------- */

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.95 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 18,
      delay: i * 0.08,
    },
  }),
};

const glowPulse: Variants = {
  rest: { opacity: 0.35 },
  hover: {
    opacity: 0.9,
    transition: { duration: 0.8, repeat: Infinity, repeatType: "reverse" },
  },
};

const sheen: Variants = {
  rest: { x: "-120%", opacity: 0 },
  hover: {
    x: "120%",
    opacity: 1,
    transition: { duration: 0.9, ease: "easeInOut" },
  },
};

const particleVariants: Variants = {
  animate: (i: number) => ({
    y: [0, -42, 0],
    x: [0, i % 2 === 0 ? 10 : -10, 0],
    opacity: [0, 1, 0],
    transition: {
      duration: 3.2 + i * 0.35,
      repeat: Infinity,
      delay: i * 0.35,
      ease: "easeInOut",
    },
  }),
};

type Feature = {
  title: string;
  description: string;
  image: string;
  icon: string;
  tag: string;
};

export default function HR() {
  const textRevealRef = useRef<HTMLHeadingElement | null>(null);
  useTextReveal(textRevealRef);

  const features: Feature[] = useMemo(
    () => [
      {
        title: "Talent Acquisition",
        tag: "Hire smarter",
        description:
          "AI-driven sourcing, smart screening, automated scheduling, and bias-reduced matching — all in one modern pipeline.",
        image: "/images/hr-talent.png",
        icon: "/gifs/sparkle.gif",
      },
      {
        title: "Employee Engagement",
        tag: "Keep teams thriving",
        description:
          "Pulse surveys, recognition walls, wellbeing check-ins, and personalized growth paths that actually get used.",
        image: "/images/hr-engagement.png",
        icon: "/gifs/management.gif",
      },
      {
        title: "Performance & Growth",
        tag: "Ship excellence",
        description:
          "OKR alignment, 360° feedback, continuous coaching, career lattices — designed for today’s dynamic teams.",
        image: "/images/hr-performance.png",
        icon: "/gifs/chart-growth.gif",
      },
    ],
    []
  );
  return (
    <MotionConfig reducedMotion="user">
      <section
        id="hr"
        className="
          relative overflow-hidden
          py-16 md:py-24
          px-5 md:px-12 lg:px-24
          min-h-screen
          bg-gradient-to-br from-neutral-50 via-white to-[#ffffff]
          dark:from-neutral-950 dark:via-neutral-900 dark:to-[#ffffff]">
        <motion.div
          className="relative z-10 max-w-7xl mx-auto"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* HERO */}
          <div className="flex flex-col lg:flex-row gap-10 lg:items-end justify-between mb-14 md:mb-16">
            <div className="max-w-3xl">
              {/* badge */}
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur px-3 py-1.5"
              >
                <span className="h-2 w-2 rounded-full bg-[#a3d900] shadow-[0_0_18px_rgba(163,217,0,0.6)]" />
                <span className="geist text-[12px] font-semibold tracking-wide text-black/70 dark:text-white/70">
                  HR Suite • Hiring • Engagement • Performance
                </span>
              </motion.div>

              <motion.h2
                ref={textRevealRef}
                variants={fadeUp}
                className="
                  mt-5 mango tracking-tight font-black
                  text-5xl md:text-7xl
                  leading-[1.02]
                "
              >
                Modern HR,
                <span className="block text-neutral-900 dark:text-white bg-none text-transparent">
                  built for high-velocity teams.
                </span>
              </motion.h2>

              <motion.p
                variants={fadeUp}
                className="mt-5 geist text-lg md:text-xl leading-relaxed text-black/70 dark:text-white/70"
              >
                Replace spreadsheets and scattered tools with one intelligent system — hiring, engagement,
                performance, and growth, all aligned to outcomes.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeUp} className="mt-7 flex flex-col sm:flex-row gap-3">
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/hr"
                    className="
                      group relative inline-flex items-center justify-center gap-3
                      h-12 px-7 rounded-full
                      bg-[#a3d900] text-black
                      font-black mango
                      shadow-lg shadow-[#a3d900]/25 hover:shadow-[#a3d900]/45
                      transition
                      overflow-hidden
                    "
                  >
                    <span className="relative z-10">Explore HR Suite</span>
                    <span className="relative z-10 h-2 w-2 rounded-full bg-black/80" />
                    <motion.span
                      className="absolute inset-0  opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={false}
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.9 }}
                    />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/contact"
                    className="
                      inline-flex items-center justify-center gap-2
                      h-12 px-7 rounded-full
                      border border-black/10 dark:border-white/10
                      bg-white/70 dark:bg-white/5 backdrop-blur
                      geist font-semibold text-black/80 dark:text-white/80
                      hover:bg-white/90 dark:hover:bg-white/10
                      transition
                    "
                  >
                    Book a demo
                    <span className="text-black/40 dark:text-white/40">→</span>
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            {/* right mini stats */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-2 gap-3 w-full max-w-md"
            >
              {[
                { k: "↓ 38%", v: "time-to-hire" },
                { k: "↑ 22%", v: "retention uplift" },
                { k: "360°", v: "feedback loops" },
                { k: "OKRs", v: "aligned execution" },
              ].map((s) => (
                <div
                  key={s.v}
                  className="
                    rounded-3xl border border-black/10 dark:border-white/10
                    bg-white/70 dark:bg-white/5 backdrop-blur
                    px-4 py-4
                  "
                >
                  <div className="mango text-2xl font-black text-neutral-900 dark:text-white">
                    {s.k}
                  </div>
                  <div className="geist text-[12px] font-semibold tracking-wide text-black/55 dark:text-white/55">
                    {s.v}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 lg:gap-9">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                variants={cardVariants}
                whileHover="hover"
                animate="rest"
                className="
                  group relative rounded-[28px] overflow-hidden
                  bg-white/75 dark:bg-neutral-900/50
                  backdrop-blur-xl
                  border border-black/10 dark:border-white/10
                  shadow-[0_18px_50px_rgba(0,0,0,0.08)]
                "
              >
                {/* border glow */}
                <motion.div
                  variants={glowPulse}
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100"
                 
                />

                {/* sheen */}
                <motion.div
                  variants={sheen}
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/30 to-transparent blur-md"
                />

                {/* Media */}
                <div className="relative h-56">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                    priority={i === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

                  {/* tag */}
                  <div className="absolute top-4 left-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-black/55 text-white px-3 py-1.5 backdrop-blur">
                      <span className="h-2 w-2 rounded-full bg-[#a3d900]" />
                      <span className="geist text-[12px] font-semibold tracking-wide">
                        {feature.tag}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="relative p-7 pb-10">
                  <div className="flex items-center gap-4 mb-4">
                    <motion.div
                      className="
                        w-14 h-14 rounded-2xl
                        bg-black/5 dark:bg-white/10
                        border border-black/10 dark:border-white/10
                        flex items-center justify-center
                      "
                      whileHover={{ rotate: 360, scale: 1.12 }}
                      transition={{ duration: 0.8 }}
                    >
                      <Image
                        src={feature.icon}
                        alt=""
                        width={32}
                        height={32}
                        className="w-8 h-8"
                        unoptimized
                      />
                    </motion.div>

                    <div className="min-w-0">
                      <h3 className="mango text-3xl font-black text-neutral-900 dark:text-white leading-tight">
                        {feature.title}
                      </h3>
                      <div className="mt-1 geist text-[12px] font-semibold text-black/55 dark:text-white/55">
                        Built for modern ops • Automations • Insights
                      </div>
                    </div>
                  </div>

                  <p className="geist text-lg opacity-80 leading-relaxed text-black/70 dark:text-white/70">
                    {feature.description}
                  </p>

                  {/* footer link */}
                  <div className="mt-6">
                    <Link
                      href="/hr"
                      className="
                        inline-flex items-center gap-2
                        geist text-sm font-semibold
                        text-neutral-900 dark:text-white
                        hover:text-[#89E101]
                        transition
                      "
                    >
                      Learn more
                      <span className="text-black/40 dark:text-white/40">→</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer line */}
          <motion.p
            variants={fadeUp}
            className="mt-14 md:mt-16 text-center md:text-xl geist max-w-3xl mx-auto text-black/70 dark:text-white/70"
          >
            Loga<span className="text-[#a3d900] font-bold">XP</span> HR — where people science meets
            cutting-edge technology.
          </motion.p>
        </motion.div>
      </section>
    </MotionConfig>
  );
}