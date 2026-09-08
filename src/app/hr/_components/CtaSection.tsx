import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";

export default function CtaSection() {
  return (
    <section id="demo" className="scroll-mt-28 border-t border-zinc-100 bg-white px-5 py-12 md:px-12 md:py-16 lg:px-24">
      <div className="relative mx-auto grid max-w-6xl overflow-hidden rounded-[1.5rem] border border-zinc-100 bg-white p-6 shadow-xl shadow-zinc-950/5 md:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="absolute inset-x-0 top-0 h-1 bg-[#a3d900]" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#5f8700]">See it live</p>
          <h2 className="mt-3 max-w-3xl text-2xl font-extrabold tracking-[-0.03em] md:text-4xl">Run HR operations end to end in LogaXP.</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">Book a walkthrough and map the platform to your recruiting, records, training, leave, performance, and compliance workflows.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <Link href="/contact" className="inline-flex items-center justify-center gap-3 rounded-xl bg-zinc-950 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-zinc-950/10 transition hover:-translate-y-0.5 hover:shadow-xl">
            Request demo <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/admin/login" className="inline-flex items-center justify-center gap-3 rounded-xl border border-zinc-100 bg-white px-7 py-4 text-sm font-bold text-zinc-950 shadow-sm transition hover:shadow-md">
            Open platform <LockKeyhole className="h-4 w-4 text-[#5f8700]" />
          </Link>
        </div>
      </div>
      <footer className="mt-10 text-center text-sm font-medium text-zinc-400">© {new Date().getFullYear()} LogaXP HR Suite</footer>
    </section>
  );
}
