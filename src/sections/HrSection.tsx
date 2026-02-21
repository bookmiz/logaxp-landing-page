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
  rest: { opacity: 0.15 },
  hover: {
    opacity: 0.9,
    transition: { duration: 0.9, repeat: Infinity, repeatType: "reverse" },
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

type Feature = {
  title: string;
  description: string;
  image: string;
  icon: string;
  tag: string;
};

function ArrowIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 12h12" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

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
        className={[
          "relative overflow-hidden",
          "py-16 md:py-24",
          "px-5 md:px-12 lg:px-24",
          "min-h-screen",
          "bg-gradient-to-br from-neutral-50 via-white to-white",
          "dark:from-neutral-950 dark:via-neutral-900 dark:to-black",
        ].join(" ")}
      >
        <motion.div
          className="relative z-10 max-w-7xl mx-auto"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* HERO */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-14 md:mb-16">
            {/* Left */}
            <div className="lg:col-span-7">
             

              <motion.h2
                ref={textRevealRef}
                variants={fadeUp}
                className="mt-5 mango tracking-tight font-black text-5xl md:text-8xl leading-[1.02] text-neutral-900 dark:text-white pb-8 md:pb-12"
              >
                Modern HR,
                <span className="block text-[#a3d900] mask-b-to-indigo-500 ">
                  built for high-velocity teams.
                </span>
              </motion.h2>

            

              {/* CTAs */}
              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-col sm:flex-row items-center gap-3"
              >
                {/* Primary CTA */}
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                  <Link
                    href="/hr"
                    aria-label="Open the full HR Suite landing page"
                    className={[
                      "group relative inline-flex w-full sm:w-auto items-center justify-center gap-3",
                      "h-16 px-7 rounded-full",
                      "bg-[#142503] text-white",
                      "font-black mango",
                      
                      "hover:shadow-[0_22px_55px_rgba(163,217,0,0.42)]",
                      "transition overflow-hidden",
                      "ring-1 ring-black/10",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a3d900]/45",
                    ].join(" ")}
                  >
                    {/* animated glow backdrop */}
                    <span className="pointer-events-none absolute -inset-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.65),transparent_55%)]" />
                    </span>

                    {/* shine sweep */}
                    <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="absolute inset-y-0 -left-1/2 w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/60 to-transparent blur-md animate-[shine_1.1s_ease-in-out]" />
                    </span>

                    {/* left icon */}
                    <span className="relative z-10 grid place-items-center h-9 w-9 rounded-2xl bg-black/10 justify-start">
                      <ArrowIcon className="h-5 w-5" />
                    </span>

                    <span className="relative z-10 flex flex-col leading-tight">
                      <span className="text-[22px] font-black mango ">Open HR Suite</span>
                      <span className="text-[13px] geist font-semibold ">
                        Open HR Suite features
                      </span>
                    </span>

                  </Link>
                </motion.div>

                <div className="mt-1 sm:mt-0 sm:ml-2 text-[11px] geist font-semibold text-black/50 dark:text-white/45">
                  You’re viewing a preview section — the full HR landing page includes modules, pricing & onboarding.
                </div>

                <style jsx>{`
                  @keyframes shine {
                    from {
                      transform: translateX(0) rotate(12deg);
                      opacity: 0;
                    }
                    30% {
                      opacity: 1;
                    }
                    to {
                      transform: translateX(260%) rotate(12deg);
                      opacity: 0;
                    }
                  }
                `}</style>
              </motion.div>
            </div>

            {/* Right mini stats */}
            <div className="lg:col-span-5">
              <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 w-full">
                {[
                  { k: "↓ 38%", v: "time-to-hire" },
                  { k: "↑ 22%", v: "retention uplift" },
                  { k: "360°", v: "feedback loops" },
                  { k: "OKRs", v: "aligned execution" },
                ].map((s) => (
                  <div
                    key={s.v}
                    className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur px-4 py-4"
                  >
                    <div className="mango text-2xl md:text-3xl font-black text-neutral-900 dark:text-white">
                      {s.k}
                    </div>
                    <div className="geist text-[12px] font-semibold tracking-wide text-black/55 dark:text-white/55">
                      {s.v}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
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
                className={[
                  "group relative rounded-[28px] overflow-hidden",
                  "bg-white/75 dark:bg-neutral-900/50",
                  "backdrop-blur-xl",
                  "border border-black/10 dark:border-white/10",
                  "shadow-[0_18px_50px_rgba(0,0,0,0.08)]",
                ].join(" ")}
              >
                {/* border glow */}
                <motion.div
                  variants={glowPulse}
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(900px 260px at 20% 10%, rgba(163,217,0,0.35), transparent 55%), radial-gradient(900px 260px at 80% 90%, rgba(137,225,1,0.22), transparent 55%)",
                  }}
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
                      className={[
                        "w-14 h-14 rounded-2xl",
                        "bg-black/5 dark:bg-white/10",
                        "border border-black/10 dark:border-white/10",
                        "flex items-center justify-center",
                      ].join(" ")}
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

                  <p className="geist text-lg leading-relaxed text-black/70 dark:text-white/70">
                    {feature.description}
                  </p>

                  {/* footer link */}
                  <div className="mt-6">
                    <Link
                      href="/hr"
                      className="inline-flex items-center gap-2 geist text-sm font-semibold text-neutral-900 dark:text-white hover:text-[#89E101] transition"
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
            Loga<span className="text-[#a3d900] font-bold">XP</span> HR — where people science meets cutting-edge
            technology.
          </motion.p>
        </motion.div>
      </section>
    </MotionConfig>
  );
}
