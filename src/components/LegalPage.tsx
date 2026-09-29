import Link from "next/link";
import { OFFICES } from "@/logaxp/config/offices";

export default function LegalPage({ title, intro, sections }: {
  title: string;
  intro: string;
  sections: { title: string; text: string }[];
}) {
  return <main className="geist mx-auto max-w-4xl px-5 py-12 md:px-8 md:py-20">
    <nav aria-label="Legal pages" className="mb-8 flex flex-wrap gap-5 text-sm">
      <Link href="/">Home</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link>
    </nav>
    <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
    <p className="mt-4 text-sm opacity-70">Last updated: September 28, 2026</p>
    <p className="mt-6 leading-8 opacity-80">{intro}</p>
    <div className="mt-10 space-y-9">
      {sections.map(section => <section key={section.title}>
        <h2 className="text-xl font-semibold">{section.title}</h2>
        <p className="mt-3 leading-8 opacity-80">{section.text}</p>
      </section>)}
      <section>
        <h2 className="text-xl font-semibold">Contact LogaXP</h2>
        <p className="mt-3 leading-8">For questions or privacy requests, email <a className="underline underline-offset-4" href="mailto:support@logaxp.com">support@logaxp.com</a>.</p>
        <div className="mt-6 grid gap-6">{OFFICES.map(office => <div key={office.name}>
          <h3 className="text-sm font-semibold">{office.name}</h3>
          <address className="mt-2 text-sm not-italic leading-6 opacity-80">{office.lines.map(line => <span className="block" key={line}>{line}</span>)}</address>
        </div>)}</div>
      </section>
    </div>
    <footer className="mt-12 border-t border-current/15 pt-6 text-sm opacity-70">© {new Date().getFullYear()} LogaXP. All rights reserved.</footer>
  </main>;
}
