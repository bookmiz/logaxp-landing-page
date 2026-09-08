const companies = [
  { name: "Northline", mark: "wave" },
  { name: "ApexWorks", mark: "spark" },
  { name: "Clearpath", mark: "route" },
  { name: "SummitCo", mark: "peak" },
  { name: "BluePeak", mark: "orbit" },
  { name: "Fieldstone", mark: "grid" },
  { name: "Veridian", mark: "leaf" },
  { name: "Oakbridge", mark: "bridge" },
];

const marqueeCompanies = [...companies, ...companies];

export default function CompanyLogoMarquee() {
  return (
    <section id="customers" className="mx-auto mt-8 scroll-mt-28 max-w-7xl bg-white py-16 px-5 md:px-12 lg:px-20">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-600">Growing teams run HR with LogaXP</p>
      </div>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white to-transparent" />

        <div className="logo-track flex w-max items-center gap-16">
          {marqueeCompanies.map((company, index) => (
            <div key={`${company.name}-${index}`} className="flex min-w-max items-center gap-3 text-zinc-400 grayscale transition duration-300 hover:text-zinc-600">
              <LogoMark type={company.mark} />
              <p className="text-2xl font-extrabold tracking-[-0.055em]">{company.name}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .logo-track {
          animation: logo-marquee 28s linear infinite;
        }

        .logo-track:hover {
          animation-play-state: paused;
        }

        @keyframes logo-marquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .logo-track {
            animation: none;
            flex-wrap: wrap;
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}

function LogoMark({ type }: { type: string }) {
  return (
    <svg viewBox="0 0 36 36" className="h-7 w-7 shrink-0 fill-current" aria-hidden="true">
      {type === "wave" ? <path d="M3 21c3.8-8.4 9.8-10.1 15.2-5.2 4.5 4 8.5 4.1 14.8-1.9-3.5 9.4-10.6 12.1-16.6 6.3C11.8 15.9 7.4 16.3 3 21Z" /> : null}
      {type === "spark" ? <path d="M18 2 22.6 13.4 34 18l-11.4 4.6L18 34l-4.6-11.4L2 18l11.4-4.6L18 2Z" /> : null}
      {type === "route" ? <path d="M7 8h14a8 8 0 0 1 0 16H8v-5h13a3 3 0 0 0 0-6H7V8Z" /> : null}
      {type === "peak" ? <path d="m2 29 12.2-22 7 11.5L25 13l9 16H2Z" /> : null}
      {type === "orbit" ? <path d="M18 6a12 12 0 1 1-8.5 20.5A12 12 0 0 1 18 6Zm0 4.8a7.2 7.2 0 1 0 0 14.4 7.2 7.2 0 0 0 0-14.4Zm12.8-8.2 2.6 2.6-7 7-2.6-2.6 7-7Z" /> : null}
      {type === "grid" ? <path d="M5 5h10v10H5V5Zm16 0h10v10H21V5ZM5 21h10v10H5V21Zm16 0h10v10H21V21Z" /> : null}
      {type === "leaf" ? <path d="M31 5c-13.7.7-22 7.1-22 16.3 0 4.8 3.4 8.7 8.2 8.7 9.1 0 13.1-10.9 13.8-25ZM6 31c4.8-7.5 10-12.3 18-16.2" /> : null}
      {type === "bridge" ? <path d="M4 27h28v4H4v-4Zm2-4c1.8-9.7 6-16 12-16s10.2 6.3 12 16h-5c-1.4-6.6-3.9-11-7-11s-5.6 4.4-7 11H6Z" /> : null}
    </svg>
  );
}
