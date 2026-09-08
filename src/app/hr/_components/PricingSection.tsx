import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const plans = [
  {
    name: "Core HR",
    label: "Start",
    description: "For teams standardizing employee records, approvals, and basic HR requests.",
    points: ["Employee records", "Documents and notes", "Approval routing"],
  },
  {
    name: "HR Operations",
    label: "Most teams",
    description: "For growing teams connecting hiring, onboarding, training, leave, and attendance.",
    points: ["Recruiting workflow", "Training evidence", "Leave and attendance", "Role-based access"],
    featured: true,
  },
  {
    name: "Enterprise",
    label: "Custom",
    description: "For multi-location teams that need governance, implementation support, and controls.",
    points: ["Advanced permissions", "Audit-ready workflows", "Multi-branch rollout", "Implementation planning"],
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-28 border-t border-zinc-100 bg-white px-5 py-16 md:px-12 md:py-20 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#5f8700]">Pricing</p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.045em] text-zinc-950 md:text-5xl">
              Build the HR suite around your rollout.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-zinc-600 lg:justify-self-end">
            Start with the modules your team needs now, then expand as your HR operation grows across departments, locations, and approval policies.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={[
                "rounded-[1.5rem] border p-5 md:p-6",
                plan.featured ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-100 bg-white text-zinc-950",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold tracking-[-0.035em]">{plan.name}</h3>
                  <p className={plan.featured ? "mt-2 text-sm leading-6 text-white/65" : "mt-2 text-sm leading-6 text-zinc-500"}>
                    {plan.description}
                  </p>
                </div>
                <span className={plan.featured ? "rounded-full bg-[#a3d900] px-3 py-1 text-xs font-bold text-black" : "rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-700"}>
                  {plan.label}
                </span>
              </div>

              <div className="mt-7 space-y-3">
                {plan.points.map((point) => (
                  <div key={point} className="flex items-center gap-3 text-sm font-medium">
                    <span className={plan.featured ? "grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/10 text-[#a3d900]" : "grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#a3d900]/15 text-[#5f8700]"}>
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className={plan.featured ? "text-white/85" : "text-zinc-700"}>{point}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/contact"
                className={plan.featured ? "mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#a3d900] px-5 py-3 text-sm font-bold text-black transition hover:-translate-y-0.5" : "mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-200 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:-translate-y-0.5 hover:bg-zinc-50"}
              >
                Talk to sales
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
