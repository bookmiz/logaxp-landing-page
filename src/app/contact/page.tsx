"use client";

import React, { useState } from "react";
import Link from "next/link";
import { OFFICES } from "@/logaxp/config/offices";
import { ArrowRight, Check, CheckCircle2, Loader2, Mail, ShieldCheck } from "lucide-react";

type FormState = {
  name: string;
  email: string;
  company: string;
  teamSize: string;
  interest: string;
  message: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  company: "",
  teamSize: "51-200",
  interest: "HR Suite",
  message: "",
};

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5";

const outcomes = [
  "A walkthrough mapped to your HR, approvals, and employee workflows.",
  "Implementation guidance for roles, locations, permissions, and rollout.",
  "Pricing aligned to your team size and operating model.",
];

const routeOptions = [
  { label: "HR Suite", href: "/hr", text: "Hiring, records, training, leave, attendance, and approvals." },
  { label: "Workspace access", href: "/admin/signup", text: "Create a tenant workspace and invite your admin team." },
];

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");

  const canSubmit =
    form.name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
    form.company.trim().length >= 2 &&
    form.message.trim().length >= 10;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit || status === "submitting") return;

    setStatus("submitting");
    await new Promise((resolve) => setTimeout(resolve, 650));
    setStatus("sent");
    setForm(initialForm);
  }

  return (
    <main className="bg-white text-slate-950">
      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-10 md:px-8 md:pb-20 md:pt-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div className="lg:pt-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#5f8700]">Contact sales</p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.05em] text-slate-950 md:text-6xl">
            Plan the right LogaXP rollout.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 md:text-lg">
            Share your team size, current HR workflow, and implementation goals. We will help you map the right modules, access model, and next steps.
          </p>

          <div className="mt-8 space-y-4 border-y border-slate-200 py-6">
            {outcomes.map((item) => (
              <div key={item} className="flex gap-3">
                <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#a3d900]/20 text-[#5f8700]">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>

          <section aria-label="Our offices" className="mt-7 grid gap-4 sm:grid-cols-2">
            {OFFICES.map((office) => (
              <div key={office.name} className="rounded-2xl border border-slate-200 p-4">
                <h2 className="text-sm font-bold text-slate-950">{office.name}</h2>
                <address className="mt-2 text-sm not-italic leading-6 text-slate-600">
                  {office.lines.map((line) => <span key={line} className="block">{line}</span>)}
                </address>
              </div>
            ))}
          </section>

          <div className="mt-7 grid gap-3">
            {routeOptions.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-4 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <span>
                  <span className="block text-sm font-bold text-slate-950">{item.label}</span>
                  <span className="mt-1 block text-sm leading-5 text-slate-500">{item.text}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#5f8700] transition group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center">
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#5f8700]" />
              sales@logaxp.com
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#5f8700]" />
              Response within one business day
            </span>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 md:p-7">
          {status === "sent" ? (
            <div className="flex min-h-[520px] flex-col justify-center text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#a3d900]/20 text-[#5f8700]">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">Message received.</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">
                Thanks for reaching out. Our team will review your request and follow up with the right next step.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mx-auto mt-7 inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.035em]">Tell us what you need.</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  A few details help us prepare a useful conversation instead of a generic demo.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Full name" required>
                  <input
                    value={form.name}
                    onChange={(event) => setField("name", event.target.value)}
                    placeholder="Your name"
                    className={inputClassName}
                    required
                  />
                </Field>

                <Field label="Work email" required>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setField("email", event.target.value)}
                    placeholder="you@company.com"
                    className={inputClassName}
                    required
                  />
                </Field>
              </div>

              <Field label="Company" required>
                <input
                  value={form.company}
                  onChange={(event) => setField("company", event.target.value)}
                  placeholder="Company name"
                  className={inputClassName}
                  required
                />
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Team size">
                  <select
                    value={form.teamSize}
                    onChange={(event) => setField("teamSize", event.target.value)}
                    className={inputClassName}
                  >
                    <option>1-10</option>
                    <option>11-50</option>
                    <option>51-200</option>
                    <option>201-1000</option>
                    <option>1000+</option>
                  </select>
                </Field>

                <Field label="Interest">
                  <select
                    value={form.interest}
                    onChange={(event) => setField("interest", event.target.value)}
                    className={inputClassName}
                  >
                    <option>HR Suite</option>
                    <option>Employee records</option>
                    <option>Approvals and workflows</option>
                    <option>Leave and attendance</option>
                    <option>Training and onboarding</option>
                    <option>Multi-location rollout</option>
                  </select>
                </Field>
              </div>

              <Field label="Message" required>
                <textarea
                  value={form.message}
                  onChange={(event) => setField("message", event.target.value)}
                  placeholder="Tell us about your HR process, locations, approvals, timeline, or reporting needs."
                  className={`${inputClassName} min-h-[150px] resize-none`}
                  required
                />
              </Field>

              <button
                type="submit"
                disabled={!canSubmit || status === "submitting"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#a3d900] px-6 py-3.5 text-sm font-bold text-black transition hover:brightness-95 disabled:pointer-events-none disabled:opacity-50"
              >
                {status === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {status === "submitting" ? "Sending" : "Send message"}
                {status !== "submitting" ? <ArrowRight className="h-4 w-4" /> : null}
              </button>

              <p className="text-center text-xs leading-5 text-slate-500">
                By submitting, you agree to be contacted about LogaXP. No spam.
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">
        {label} {required ? <span className="text-[#5f8700]">*</span> : null}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}
