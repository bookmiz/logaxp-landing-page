"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion, MotionConfig, Variants, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ClipboardCheck,
  FileText,
  HelpCircle,
  LineChart,
  Lock,
  Sparkles,
  Users,
  Workflow,
  ChevronRight, 
  Play,
  Star,
  Zap,
  Shield,
  TrendingUp,
  Globe,
  Clock
} from "lucide-react";
import useTextReveal from "../../hooks"; 

/* -----------------------------
   Motion Variants
-----------------------------*/
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardIn: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: "easeOut", delay: i * 0.06 },
  }),
};

const floaty: Variants = {
  animate: (i: number) => ({
    y: [0, -10 - i * 1.2, 0],
    opacity: [0.35, 0.75, 0.35],
    transition: {
      duration: 4 + i * 0.3,
      repeat: Infinity,
      ease: "easeInOut",
      delay: i * 0.4,
    },
  }),
};

const glowingPulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

/* -----------------------------
   Page
-----------------------------*/
export default function HRPage() {
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  
  useTextReveal(headlineRef);

  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Parallax effect
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Mouse move effect for floating elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = useMemo(
    () => [
      {
        title: "Talent Acquisition",
        description:
          "AI-driven sourcing, smart screening, automated scheduling, and bias-reduced matching — all in one modern pipeline.",
        image: "/images/hr-talent.png",
        icon: "/gifs/sparkle.gif",
        bullets: ["Sourcing + ATS pipeline", "Smart screening", "Auto scheduling", "Fair matching"],
      },
      {
        title: "Employee Engagement",
        description:
          "Pulse surveys, recognition walls, wellbeing check-ins, and personalized growth paths that actually get used.",
        image: "/images/hr-engagement.png",
        icon: "/gifs/heart-pulse.gif",
        bullets: ["Pulse surveys", "Recognition wall", "Wellbeing check-ins", "Growth paths"],
      },
      {
        title: "Performance & Growth",
        description:
          "OKR alignment, 360° feedback, continuous coaching, career lattices — designed for today’s dynamic teams.",
        image: "/images/hr-performance.png",
        icon: "/gifs/chart-growth.gif",
        bullets: ["OKRs & alignment", "360° feedback", "Coaching notes", "Career lattice"],
      },
    ],
    []
  );

  const modules = useMemo(
    () => [
      {
        title: "Employee Records",
        desc: "Profiles, documents, policy acknowledgements, and history — searchable and structured.",
        icon: <FileText className="h-5 w-5" />,
      },
      {
        title: "Workflows & Approvals",
        desc: "Leave, expenses, assets, changes — approvals routed by role, unit, and policy.",
        icon: <Workflow className="h-5 w-5" />,
      },
      {
        title: "Performance Reviews",
        desc: "Templates, cycles, coaching, calibration-ready reporting, and 360° feedback.",
        icon: <ClipboardCheck className="h-5 w-5" />,
      },
      {
        title: "Engagement Layer",
        desc: "Pulse surveys, recognition wall, and wellbeing — adoption-focused by design.",
        icon: <Sparkles className="h-5 w-5" />,
      },
      {
        title: "People Analytics",
        desc: "Headcount, trends, signals — dashboards that tell the truth without digging.",
        icon: <LineChart className="h-5 w-5" />,
      },
      {
        title: "Enterprise Controls",
        desc: "Role-based access, audit trails, and multi-branch support out of the box.",
        icon: <Lock className="h-5 w-5" />,
      },
    ],
    []
  );

  const testimonials = useMemo(
    () => [
      {
        name: "Head of People Ops",
        meta: "High-growth company",
        quote:
          "We standardized approvals and reduced back-and-forth dramatically. The interface is clean — teams actually use it.",
      },
      {
        name: "Operations Manager",
        meta: "Multi-branch business",
        quote:
          "Managers now follow one workflow. The dashboards highlight issues instantly without extra meetings.",
      },
      {
        name: "HR Generalist",
        meta: "Mid-size org",
        quote:
          "Employee records, leave, and reviews in one place. The structure keeps everything consistent and audit-ready.",
      },
    ],
    []
  );

  const stats = [
    { label: "Active Users", value: "50K+", icon: Users },
    { label: "Companies", value: "500+", icon: Building2 },
    { label: "Avg. Time Saved", value: "12h/week", icon: Clock },
    { label: "Satisfaction", value: "4.9/5", icon: Star },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative overflow-hidden bg-gradient-to-br from-neutral-50 via-white to-[#f8fdea] dark:from-neutral-950 dark:via-neutral-900 dark:to-[#1a2400]">
        {/* HERO SECTION */}
            <section
            ref={heroRef}
            className="relative pt-10 md:pt-14 pb-16 md:pb-24 px-5 md:px-12 lg:px-24 overflow-hidden"
            >
            <div className="absolute inset-0 pointer-events-none">
                {useMemo(
                () =>
                    Array.from({ length: 14 }).map((_, i) => {
                    const left = (i * 7.1 + 11) % 100;
                    const top = (i * 13.7 + 18) % 100;
                    const size = 3 + ((i * 11) % 5);
                    const d = 4.8 + (i % 5) * 0.6;
                    const delay = (i % 6) * 0.35;
                    return { left: `${left}%`, top: `${top}%`, size, d, delay };
                    }),
                []
                ).map((p, i) => (
                <motion.span
                    key={i}
                    className="absolute rounded-full bg-[#a3d900]/35"
                    style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
                    animate={{ y: [0, -18, 0], opacity: [0.2, 0.7, 0.2] }}
                    transition={{ duration: p.d, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
                />
                ))}
            </div>

            <div className="relative max-w-7xl mx-auto">
                {/* badge row */}
                <div className="flex justify-center md:justify-start">
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="inline-flex items-center gap-3 rounded-full border border-black/10 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur-xl px-5 py-2.5 shadow-sm"
                >
                    <span className="inline-flex items-center gap-2 geist text-xs font-black tracking-wider uppercase">
                    <span className="h-2 w-2 rounded-full bg-[#a3d900]" />
                    LogaXP HR Suite
                    </span>
                    <span className="h-4 w-px bg-black/10 dark:bg-white/10" />
                    <span className="geist text-xs opacity-70 flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-[#a3d900]" />
                    SOC-ready workflows • RBAC • Audit trails
                    </span>
                </motion.div>
                </div>

                {/* layout: content + preview */}
                <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:items-center">
                {/* LEFT: messaging */}
                <motion.div style={{ y, opacity }} className="text-center lg:text-left">
                    <h1
                    ref={headlineRef}
                    className="mango text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.02] text-neutral-900 dark:text-white"
                    >
                    HR that teams
                    <br />
                    <span className="relative inline-block text-[#a3d900]">
                        actually adopt
                        <span className="absolute -inset-x-3 bottom-1.5 h-4 rounded-full bg-[#a3d900]/15 -z-10" />
                    </span>
                    </h1>

                    <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18, duration: 0.7, ease: "easeOut" }}
                    className="mt-6 geist text-lg md:text-2xl opacity-85 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                    >
                    Standardize employee records, approvals, performance and engagement — with clean workflows,
                    real dashboards, and enterprise controls built-in.
                    </motion.p>

                    {/* chips */}
                    <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.24, duration: 0.65, ease: "easeOut" }}
                    className="mt-7 flex flex-wrap gap-3 justify-center lg:justify-start"
                    >
                    {[
                        { icon: <Workflow className="h-4 w-4" />, text: "Approvals by policy" },
                        { icon: <Users className="h-4 w-4" />, text: "Employee self-service" },
                        { icon: <LineChart className="h-4 w-4" />, text: "People analytics" },
                        { icon: <Lock className="h-4 w-4" />, text: "RBAC + audit trails" },
                    ].map((c) => (
                        <div
                        key={c.text}
                        className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl px-4 py-2 geist text-sm font-medium"
                        >
                        <span className="text-[#a3d900]">{c.icon}</span>
                        <span className="opacity-90">{c.text}</span>
                        </div>
                    ))}
                    </motion.div>

                    {/* CTAs */}
                    <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.32, duration: 0.7, ease: "easeOut" }}
                    className="mt-9 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center"
                    >
                    <Link
                        href="/demo"
                        className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-[#a3d900] px-9 py-4 text-black font-black text-lg shadow-xl shadow-[#a3d900]/25 hover:shadow-[#a3d900]/45 transition-all overflow-hidden"
                    >
                        <span className="relative z-10">Book a Demo</span>
                        <ChevronRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
                        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="absolute -left-[35%] top-0 h-full w-[35%] bg-white/30 rotate-12 blur-md animate-[shine_1.2s_ease-in-out_infinite]" />
                        </span>
                    </Link>

                    <button
                        onClick={() => setIsVideoPlaying(true)}
                        className="group inline-flex items-center gap-4 rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl px-7 py-4 hover:bg-white/80 dark:hover:bg-white/10 transition-all"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#a3d900] flex items-center justify-center shadow-md shadow-[#a3d900]/30">
                        <Play className="text-black ml-0.5" fill="black" size={22} />
                        </div>
                        <div className="text-left">
                        <div className="geist font-bold">Watch Overview</div>
                        <div className="geist text-sm opacity-70">1:45 product tour</div>
                        </div>
                    </button>
                    </motion.div>

                    {/* stats (reuse your stats array) */}
                    <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55, duration: 0.6 }}
                    className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto lg:mx-0"
                    >
                    {stats.map((stat) => (
                        <div
                        key={stat.label}
                        className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/65 dark:bg-white/5 backdrop-blur-xl p-4"
                        >
                        <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-xl bg-[#a3d900]/12 grid place-items-center">
                            <stat.icon className="h-5 w-5 text-[#a3d900]" />
                            </div>
                            <div>
                            <div className="mango text-xl font-black leading-none">{stat.value}</div>
                            <div className="geist text-xs opacity-70">{stat.label}</div>
                            </div>
                        </div>
                        </div>
                    ))}
                    </motion.div>

                    {/* compliance row */}
                    <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 justify-center lg:justify-start geist text-sm font-medium opacity-80">
                    {[
                        { icon: <Shield className="h-4 w-4 text-[#a3d900]" />, text: "SOC 2 practices" },
                        { icon: <Globe className="h-4 w-4 text-[#a3d900]" />, text: "GDPR-aligned" },
                        { icon: <TrendingUp className="h-4 w-4 text-[#a3d900]" />, text: "99.9% uptime" },
                        { icon: <Clock className="h-4 w-4 text-[#a3d900]" />, text: "Fast onboarding" },
                    ].map((b) => (
                        <div key={b.text} className="inline-flex items-center gap-2">
                        {b.icon}
                        {b.text}
                        </div>
                    ))}
                    </div>
                </motion.div>

                {/* RIGHT: preview (cleaner, less noisy) */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.45, duration: 0.9, ease: "easeOut" }}
                    className="relative"
                    style={{
                    rotateX: mousePosition.y * 4,
                    rotateY: mousePosition.x * 4,
                    }}
                >
                    {/* glow */}
                    <motion.div
                    className="absolute -inset-8 -z-10 rounded-[2.8rem] bg-[#a3d900]/14 blur-3xl"
                    variants={glowingPulse}
                    animate="animate"
                    />

                    <div className="relative rounded-[2.2rem] border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
                    {/* top bar */}
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-black/10 dark:border-white/10">
                        <div className="flex gap-2">
                        <span className="h-3 w-3 rounded-full bg-red-400/80" />
                        <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                        <span className="h-3 w-3 rounded-full bg-green-400/80" />
                        </div>
                        <div className="ml-4 h-8 flex-1 rounded-xl bg-black/5 dark:bg-white/10" />
                        <div className="h-8 w-12 rounded-xl bg-black/5 dark:bg-white/10" />
                    </div>

                    {/* preview */}
                    <div className="relative aspect-[16/10]">
                        <Image
                        src="/gifs/hr_premium_dashboard_real.gif"
                        alt="LogaXP HR Dashboard"
                        fill
                        className="object-cover object-top"
                        priority
                        />
                        {/* deliberate overlay */}
                        <div className="absolute inset-0 bg-[radial-gradient(900px_320px_at_45%_10%,rgba(163,217,0,0.18),transparent_62%)]" />
                        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/25 to-transparent" />
                    </div>
                    </div>

                    {/* small callouts (minimal, premium) */}
                    <div className="absolute top-5 left-5 rounded-2xl bg-black/75 text-white backdrop-blur-xl border border-white/10 px-4 py-3">
                    <div className="geist text-xs opacity-80">Live dashboards</div>
                    <div className="mango text-lg font-black text-[#a3d900]">Headcount • Trends</div>
                    </div>

                    <div className="absolute bottom-5 right-5 rounded-2xl bg-black/75 text-white backdrop-blur-xl border border-white/10 px-4 py-3">
                    <div className="flex items-center gap-2 geist text-xs opacity-85">
                        <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                        Real-time updates
                    </div>
                    </div>
                </motion.div>
                </div>
            </div>

            {/* Keyframes */}
            <style jsx global>{`
                @keyframes shine {
                0% { transform: translateX(0) rotate(12deg); }
                100% { transform: translateX(260%) rotate(12deg); }
                }
            `}</style>
            </section>


        {/* Floating Access Button — top-right sticky */}
            <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
            className="fixed top-2 right-6 md:top-6 md:right-16 z-[200] flex items-center gap-3"
            >

            <Link
                href="/login"           // ← change to your actual login route
                className="group relative inline-flex items-center gap-2.5 px-3 py-2 rounded-full bg-white/90 dark:bg-neutral-900/80 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
            >
                <div className="relative">
                <div className="h-9 w-9 rounded-full bg-[#a3d900]/20 flex items-center justify-center">
                    <Users className="h-4 w-4 text-[#a3d900]" />
                </div>
                {/* Tiny pulse ring */}
                <motion.span
                    className="absolute inset-0 rounded-full border border-[#a3d900]/40"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                />
                </div>

                <span className="font-semibold geist text-base md:text-lg">
                Sign In
                </span>

                {/* Hover shine effect */}
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
            </Link>
            </motion.div>

        {/* MODULE CARDS (Premium) */}
        <section id="modules" className="relative z-10 mx-auto max-w-7xl px-5 md:px-12 lg:px-24 py-14 md:py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="geist text-sm opacity-70">Core pillars</p>
              <h2 className="mango mt-2 text-4xl md:text-6xl font-black tracking-tight">
                The full HR lifecycle
              </h2>
              <p className="geist mt-4 opacity-80 md:text-lg max-w-2xl">
                Not just features — a cohesive system that standardizes people ops across teams and locations.
              </p>
            </div>

            <a
              href="#demo"
              className="inline-flex items-center gap-2 rounded-full bg-black text-white dark:bg-white dark:text-black px-6 py-3 font-bold hover:opacity-90 w-fit"
            >
              See it in action <ArrowRight className="h-4 w-4 text-[#a3d900]" />
            </a>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-7 lg:gap-9">
            {features.map((f, i) => (
              <motion.article
                key={f.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-90px" }}
                variants={cardIn}
                className="group rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur-xl shadow-xl"
              >
                <div className="relative h-56">
                  <Image
                    src={f.image}
                    alt={f.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                </div>

                <div className="p-7">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-black/5 dark:bg-white/10 grid place-items-center">
                      <Image src={f.icon} alt="" width={32} height={32} className="h-8 w-8" unoptimized />
                    </div>
                    <h3 className="mango text-3xl font-black">{f.title}</h3>
                  </div>

                  <p className="geist mt-4 opacity-80 leading-relaxed">{f.description}</p>

                  <div className="mt-5 grid gap-2">
                    {f.bullets.map((b) => (
                      <div key={b} className="flex items-center gap-2 geist text-sm opacity-85">
                        <span className="h-5 w-5 rounded-full bg-[#a3d900]/20 grid place-items-center">
                          <Check className="h-3.5 w-3.5 text-[#a3d900]" />
                        </span>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <a
                      href="#demo"
                      className="inline-flex items-center gap-2 font-bold text-black dark:text-white hover:opacity-90"
                    >
                      Get a walkthrough <ArrowRight className="h-4 w-4 text-[#a3d900]" />
                    </a>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* CAPABILITIES GRID */}
        <section id="capabilities" className="relative z-10 mx-auto max-w-7xl px-5 md:px-12 lg:px-24 py-14 md:py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="geist text-sm opacity-70">Capabilities</p>
              <h2 className="mango mt-2 text-4xl md:text-6xl font-black tracking-tight">
                Built like enterprise software — without the mess
              </h2>
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((m, i) => (
              <motion.div
                key={m.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-70px" }}
                variants={cardIn}
                className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/75 dark:bg-white/5 p-7"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#a3d900]/15 grid place-items-center text-[#a3d900]">
                    {m.icon}
                  </div>
                  <div>
                    <p className="mango text-2xl font-black">{m.title}</p>
                    <p className="geist mt-1 text-sm opacity-80">{m.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* PROOF */}
        <section id="proof" className="relative z-10 mx-auto max-w-7xl px-5 md:px-12 lg:px-24 py-14 md:py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="geist text-sm opacity-70">Proof</p>
              <h2 className="mango mt-2 text-4xl md:text-6xl font-black tracking-tight">
                Teams adopt it because it’s clear
              </h2>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/75 dark:bg-white/5 p-7"
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-[#a3d900]">★</span>
                  ))}
                </div>
                <p className="geist mt-4 opacity-85 leading-relaxed">“{t.quote}”</p>
                <div className="mt-6">
                  <p className="mango text-xl font-black">{t.name}</p>
                  <p className="geist text-sm opacity-70">{t.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="relative z-10 mx-auto max-w-7xl px-5 md:px-12 lg:px-24 py-14 md:py-20">
          <div>
            <p className="geist text-sm opacity-70">FAQ</p>
            <h2 className="mango mt-2 text-4xl md:text-6xl font-black tracking-tight">Answers, fast</h2>
          </div>

          <div className="mt-10 grid gap-4">
            <FaqItem
              q="Is this suitable for small teams and enterprises?"
              a="Yes. It scales from single-company teams to multi-branch orgs with role-based controls, approvals, and audit trails."
            />
            <FaqItem
              q="Can we customize approvals and policies?"
              a="Yes. Approvals can route by role, unit, department, location, and policy rules you define."
            />
            <FaqItem
              q="Does it support employee self-service?"
              a="Yes. Employees can manage profile, requests, documents, acknowledgements, and feedback workflows based on permission."
            />
            <FaqItem
              q="How do we get a demo?"
              a="Use the demo section below. You can link to /contact (or embed a form later)."
            />
          </div>
        </section>

        {/* FINAL CTA */}
        <section id="demo" className="relative z-10 mx-auto max-w-7xl px-5 md:px-12 lg:px-24 pb-24">
          <div className="rounded-[2.5rem] border border-black/10 dark:border-white/10 bg-black text-white dark:bg-white dark:text-black overflow-hidden">
            <div className="relative p-10 md:p-14">
              <div className="absolute inset-0 opacity-30 [background:radial-gradient(900px_400px_at_20%_20%,rgba(163,217,0,0.45),transparent_55%),radial-gradient(900px_400px_at_80%_60%,rgba(137,225,1,0.30),transparent_55%)]" />

              <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 dark:bg-black/10 px-4 py-2 text-sm">
                    <HelpCircle className="h-4 w-4 text-[#a3d900]" />
                    <span className="geist opacity-85">Ready to see it live?</span>
                  </div>

                  <h3 className="mango mt-4 text-4xl md:text-5xl font-black">
                    Get a guided demo of Loga<span className="text-[#a3d900]">XP</span> HR
                  </h3>

                  <p className="geist mt-4 opacity-85 md:text-lg max-w-xl">
                    We’ll walk through workflows, records, engagement and performance — and map it to your org structure.
                  </p>

                  <div className="mt-7 flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#a3d900] px-7 py-3 font-black text-black hover:brightness-95"
                    >
                      Request Demo <ArrowRight className="h-4 w-4" />
                    </Link>

                    <Link
                      href="/"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 dark:border-black/15 bg-white/5 px-7 py-3 font-black hover:bg-white/10"
                    >
                      Back to Home <ArrowRight className="h-4 w-4 text-[#a3d900]" />
                    </Link>
                  </div>
                </div>

                <div className="rounded-3xl bg-white/10 dark:bg-black/10 border border-white/10 dark:border-black/10 p-6">
                  <p className="geist text-sm opacity-85">What you’ll get</p>
                  <div className="mt-4 grid gap-3">
                    <CtaBullet text="A focused product walkthrough" />
                    <CtaBullet text="Workflow + org structure recommendations" />
                    <CtaBullet text="Implementation plan & best practices" />
                    <CtaBullet text="Pricing tailored to your needs" />
                  </div>

                  <div className="mt-6 rounded-2xl bg-black/20 dark:bg-white/10 p-4">
                    <p className="geist text-xs opacity-80">
                      Replace /contact with your form page when ready.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-10 text-center geist text-sm opacity-65">
            © {new Date().getFullYear()} LogaXP — HR Suite
          </footer>
        </section>
        
      </main>
    </MotionConfig>
  );
}

/* -----------------------------
   Small components (unchanged)
-----------------------------*/
function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4">
      <p className="geist text-xs opacity-70">{label}</p>
      <p className="mango mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 p-3 text-sm">
      <div className="text-[#a3d900]">{icon}</div>
      <div className="geist opacity-80">{text}</div>
    </div>
  );
}

function CtaBullet({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/5 dark:bg-black/5 border border-white/10 dark:border-black/10 p-4">
      <span className="h-6 w-6 rounded-full bg-[#a3d900]/25 grid place-items-center">
        <Check className="h-4 w-4 text-[#a3d900]" />
      </span>
      <span className="geist opacity-85">{text}</span>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/75 dark:bg-white/5 p-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 text-left"
      >
        <div className="flex items-start gap-3">
          <span className="mt-1 h-8 w-8 rounded-2xl bg-[#a3d900]/15 grid place-items-center">
            <HelpCircle className="h-4 w-4 text-[#a3d900]" />
          </span>
          <div>
            <p className="mango text-2xl font-black">{q}</p>
            {!open && <p className="geist mt-1 text-sm opacity-70">Tap to expand</p>}
          </div>
        </div>
        <span className="mango text-2xl font-black text-[#a3d900]">{open ? "–" : "+"}</span>
      </button>

      {open && <p className="geist mt-4 opacity-80 leading-relaxed">{a}</p>}
    </div>
  );
}