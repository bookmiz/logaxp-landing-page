// app/contact/page.tsx (or src/app/contact/page.tsx)
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Mail,
  Phone,
  Building2,
  Check,
  Clock,
  ChevronRight,
} from "lucide-react";

type FormState = {
  name: string;
  email: string;
  company: string;
  role: string;
  teamSize: string;
  interest: string;
  message: string;
};

const DEFAULT: FormState = {
  name: "",
  email: "",
  company: "",
  role: "",
  teamSize: "1-10",
  interest: "HR Suite",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(DEFAULT);
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");

  const stats = useMemo(
    () => [
      { label: "Response time", value: "< 24 hours", icon: Clock },
      { label: "Enterprise-ready", value: "RBAC + Audit", icon: ShieldCheck },
      { label: "Adoption-first UX", value: "4.9/5 rating", icon: Sparkles },
    ],
    []
  );

  const bullets = useMemo(
    () => [
      "A guided product walkthrough tailored to your org",
      "Workflow + approvals best practices",
      "Implementation plan and rollout strategy",
      "Pricing aligned to your team size",
    ],
    []
  );

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  const canSubmit =
    form.name.trim().length >= 2 &&
    validateEmail(form.email) &&
    form.company.trim().length >= 2 &&
    form.message.trim().length >= 10;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || status === "submitting") return;

    try {
      setStatus("submitting");

      // 🔧 Replace this with your real endpoint when ready.
      // Example:
      // await fetch("/api/contact", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(form),
      // });

      await new Promise((r) => setTimeout(r, 700));

      setStatus("sent");
      setForm(DEFAULT);
    } catch {
      setStatus("idle");
      alert("Something went wrong. Please try again.");
    }
  }

  return (
    <main className="relative overflow-hidden bg-gradient-to-br from-neutral-50 via-white to-[#f8fdea] dark:from-neutral-950 dark:via-neutral-900 dark:to-[#1a2400]">
      {/* background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_55%_45%_at_50%_20%,black,transparent)]" />
        <div className="absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-[#a3d900]/18 blur-3xl" />
        <div className="absolute -bottom-48 -left-48 h-[560px] w-[560px] rounded-full bg-[#a3d900]/12 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-7xl px-5 md:px-12 lg:px-24 pt-28 md:pt-32 pb-20">
        {/* header row */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl px-4 py-2 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#a3d900]" />
              <span className="geist text-xs font-bold tracking-wider uppercase opacity-80">
                Contact Sales
              </span>
              <span className="h-4 w-px bg-black/10 dark:bg-white/10" />
              <span className="geist text-xs opacity-70">
                Demo • Pricing • Implementation
              </span>
            </div>

            <h1 className="mango mt-6 text-4xl md:text-6xl font-black tracking-tight text-neutral-900 dark:text-white">
              Let’s map Loga<span className="text-[#a3d900]">XP</span> to your org
            </h1>

            <p className="geist mt-4 text-base md:text-lg opacity-80 max-w-2xl">
              Tell us what you’re building. We’ll recommend the right modules, approval
              structure, and rollout plan — with pricing that matches your team size.
            </p>
          </div>

          {/* RIGHT ACTIONS (matches your header pattern) */}
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="hidden md:inline-flex items-center gap-2 rounded-full text-sm bg-[#a3d900] px-3 py-2 font-bold text-black shadow-lg shadow-[#a3d900]/25 hover:shadow-[#a3d900]/40 hover:brightness-95 transition"
            >
              Contact Sales
              <span className="h-2 w-2 rounded-full bg-white" />
            </Link>

            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl px-4 py-2 font-bold text-sm hover:bg-white/90 dark:hover:bg-white/10 transition"
            >
              Book a Demo <ChevronRight className="h-4 w-4 text-[#a3d900]" />
            </Link>
          </div>
        </div>

        {/* layout */}
        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          {/* left: form */}
          <div className="lg:col-span-7">
            <div className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur-xl shadow-[0_18px_55px_-30px_rgba(0,0,0,0.28)] overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="geist text-sm opacity-70">Sales inquiry</p>
                    <h2 className="mango mt-1 text-2xl md:text-3xl font-black">
                      Get a tailored walkthrough
                    </h2>
                  </div>

                  {status === "sent" ? (
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#a3d900]/15 px-4 py-2">
                      <CheckCircle2 className="h-4 w-4 text-[#a3d900]" />
                      <span className="geist text-sm font-semibold">Sent</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-2">
                      <ShieldCheck className="h-4 w-4 text-[#a3d900]" />
                      <span className="geist text-xs opacity-75">
                        Secure • No spam
                      </span>
                    </div>
                  )}
                </div>

                <form onSubmit={onSubmit} className="mt-7 grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Full name" required>
                      <input
                        value={form.name}
                        onChange={(e) => setField("name", e.target.value)}
                        className={inputCls}
                        placeholder="Your name"
                      />
                    </Field>

                    <Field label="Work email" required>
                      <input
                        value={form.email}
                        onChange={(e) => setField("email", e.target.value)}
                        className={inputCls}
                        placeholder="you@company.com"
                        inputMode="email"
                      />
                    </Field>

                    <Field label="Company" required>
                      <input
                        value={form.company}
                        onChange={(e) => setField("company", e.target.value)}
                        className={inputCls}
                        placeholder="Company name"
                      />
                    </Field>

                    <Field label="Role">
                      <input
                        value={form.role}
                        onChange={(e) => setField("role", e.target.value)}
                        className={inputCls}
                        placeholder="HR Lead, COO, Founder…"
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Team size">
                      <select
                        value={form.teamSize}
                        onChange={(e) => setField("teamSize", e.target.value)}
                        className={inputCls}
                      >
                        <option>1-10</option>
                        <option>11-50</option>
                        <option>51-200</option>
                        <option>201-1000</option>
                        <option>1000+</option>
                      </select>
                    </Field>

                    <Field label="Interested in">
                      <select
                        value={form.interest}
                        onChange={(e) => setField("interest", e.target.value)}
                        className={inputCls}
                      >
                        <option>HR Suite</option>
                        <option>Approvals & Workflows</option>
                        <option>Performance & Appraisals</option>
                        <option>Employee Records</option>
                        <option>People Analytics</option>
                        <option>Multi-tenant / Multi-branch</option>
                      </select>
                    </Field>
                  </div>

                  <Field label="What are you trying to achieve?" required>
                    <textarea
                      value={form.message}
                      onChange={(e) => setField("message", e.target.value)}
                      className={`${inputCls} min-h-[140px] resize-none`}
                      placeholder="Tell us what you need (modules, approvals, locations, timelines)…"
                    />
                    <p className="geist text-xs opacity-60 mt-2">
                      Tip: include number of branches, employee count, and key workflows.
                    </p>
                  </Field>

                  <div className="mt-2 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="geist text-xs opacity-70 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#a3d900]" />
                      sales@logaxp.com
                      <span className="mx-2 h-1 w-1 rounded-full bg-black/20 dark:bg-white/20" />
                      <Phone className="h-4 w-4 text-[#a3d900]" />
                      +1 (000) 000-0000
                    </div>

                    <button
                      type="submit"
                      disabled={!canSubmit || status === "submitting"}
                      className={`group inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-black transition
                        ${
                          !canSubmit || status === "submitting"
                            ? "bg-black/10 dark:bg-white/10 text-black/40 dark:text-white/40 cursor-not-allowed"
                            : "bg-[#a3d900] text-black hover:brightness-95 shadow-lg shadow-[#a3d900]/25"
                        }`}
                    >
                      {status === "submitting" ? "Sending..." : "Send message"}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </form>
              </div>

              {/* bottom strip */}
              <div className="border-t border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 px-6 md:px-8 py-5">
                <div className="grid gap-3 md:grid-cols-3">
                  {stats.map((s) => (
                    <div key={s.label} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-[#a3d900]/15 grid place-items-center">
                        <s.icon className="h-5 w-5 text-[#a3d900]" />
                      </div>
                      <div>
                        <div className="geist text-xs opacity-70">{s.label}</div>
                        <div className="mango text-lg font-black">{s.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* right: value + proof */}
          <div className="lg:col-span-5">
            <div className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur-xl shadow-[0_18px_55px_-30px_rgba(0,0,0,0.28)] overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-xs font-black">
                  <Sparkles className="h-4 w-4 text-[#a3d900]" />
                  What you’ll get
                </div>

                <h3 className="mango mt-4 text-2xl md:text-3xl font-black">
                  A modern rollout plan, not just a demo
                </h3>

                <p className="geist mt-3 opacity-80 leading-relaxed">
                  We’ll walk through your org structure, approvals, and modules — then
                  recommend a clean implementation path.
                </p>

                <div className="mt-6 grid gap-3">
                  {bullets.map((b) => (
                    <div
                      key={b}
                      className="flex items-start gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4"
                    >
                      <span className="mt-0.5 h-6 w-6 rounded-full bg-[#a3d900]/20 grid place-items-center">
                        <Check className="h-4 w-4 text-[#a3d900]" />
                      </span>
                      <span className="geist opacity-85">{b}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-3xl bg-black text-white dark:bg-white dark:text-black p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 dark:bg-black/10 grid place-items-center">
                      <Building2 className="h-6 w-6 text-[#a3d900]" />
                    </div>
                    <div>
                      <div className="geist text-xs opacity-75">Best for</div>
                      <div className="mango text-xl font-black">Multi-branch teams</div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2">
                    <ProofRow text="Role-based approvals by unit/department/branch" />
                    <ProofRow text="Audit trails and enterprise controls" />
                    <ProofRow text="Fast adoption — clean UI + self-service" />
                  </div>

                  <Link
                    href="/demo"
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#a3d900] px-5 py-3 font-black text-black hover:brightness-95 transition w-full justify-center"
                  >
                    Book a demo <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* subtle footer */}
            <div className="mt-6 geist text-xs opacity-60">
              By submitting, you agree to be contacted about LogaXP. No spam.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const inputCls =
  "w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl px-4 py-3.5 geist text-sm outline-none transition focus:border-[#a3d900]/60 focus:ring-4 focus:ring-[#a3d900]/15";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="geist text-xs font-semibold opacity-75">
        {label} {required ? <span className="text-[#a3d900]">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function ProofRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 geist text-sm">
      <CheckCircle2 className="h-4 w-4 text-[#a3d900]" />
      <span className="opacity-90">{text}</span>
    </div>
  );
}
