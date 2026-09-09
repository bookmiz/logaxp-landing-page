"use client";

import Image from "next/image";

export type ProjectMotionStyle = "beauty" | "craft" | "delivery" | "events" | "scripture" | "finance" | "collaboration" | "workspace";

const rhythms = {
  collaboration: { duration: 8.4, offset: 2.8 },
  workspace: { duration: 12, offset: 0 },
  scripture: { duration: 9, offset: 0 },
  finance: { duration: 7.2, offset: 1.6 },
  events: { duration: 5.4, offset: 1.3 },
  beauty: { duration: 7.8, offset: 0.9 },
  craft: { duration: 6.3, offset: 2.1 },
  delivery: { duration: 4.5, offset: 0 },
};

export default function ProjectMotion({ scenes, motionStyle }: {
  scenes: { src: string; alt: string }[];
  motionStyle: ProjectMotionStyle;
}) {
  const rhythm = rhythms[motionStyle];
  return (
    <div className="relative w-full aspect-11/6 overflow-hidden rounded-2xl">
      <div className={`motion-track ${motionStyle} absolute inset-0`}>
        {scenes.map((scene, index) => (
          <div key={scene.src} className={`motion-scene scene-${index} absolute inset-0`}
            style={{
              animationDuration: `${rhythm.duration}s`,
              animationDelay: `${-(rhythm.duration - index * rhythm.duration / scenes.length + rhythm.offset)}s`,
            }}>
            <Image
              src={scene.src}
              alt={scene.alt}
              fill
              loading="eager"
              sizes="(min-width: 1280px) 55vw, 100vw"
              className={motionStyle === "scripture" ? "object-contain bg-[#071018]" : motionStyle === "finance" ? "object-contain bg-[#f2f5ef]" : "object-cover"}
            />
          </div>
        ))}
      </div>
      <style jsx>{`
        .motion-scene {
          opacity: 0;
          animation-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1);
          animation-iteration-count: infinite;
          will-change: transform, opacity;
        }
        .delivery .scene-0 { animation-name: dash-slide; }
        .delivery .scene-1 { animation-name: dash-rise; }
        .delivery .scene-2 { animation-name: dash-zoom; }
        .beauty .motion-scene { animation-name: beauty-dissolve; animation-timing-function: linear; }
        .craft .scene-0 { animation-name: craft-right; }
        .craft .scene-1 { animation-name: craft-up; }
        .craft .scene-2 { animation-name: craft-left; }
        .events .motion-scene { animation-name: event-aperture; }
        .scripture .motion-scene { animation-name: scripture-fade; }
        .finance .motion-scene { animation-name: finance-panel; }
        .collaboration .motion-scene { animation-name: collaboration-reveal; }
        .workspace .motion-scene { animation-name: workspace-drift; animation-direction: alternate; }
        @keyframes collaboration-reveal {
          0% { opacity: 0; clip-path: inset(0 15% 0 15%); }
          9%, 33.33% { opacity: 1; clip-path: inset(0); }
          43%, 100% { opacity: 0; clip-path: inset(0); }
        }
        @keyframes workspace-drift {
          from { opacity: 1; transform: scale(1.02) translateX(-0.5%); }
          to { opacity: 1; transform: scale(1.06) translateX(0.5%); }
        }
        @keyframes scripture-fade {
          0% { opacity: 0; }
          9%, 33.33% { opacity: 1; }
          43%, 100% { opacity: 0; }
        }
        @keyframes finance-panel {
          0% { opacity: 0; transform: translateY(9%); }
          8%, 33.33% { opacity: 1; transform: translateY(0); }
          43%, 100% { opacity: 0; transform: translateY(-6%); }
        }
        @keyframes event-aperture {
          0% { opacity: 0; clip-path: inset(42% 0 round 24px); transform: scale(1.18); }
          8% { opacity: 1; clip-path: inset(0 round 0); transform: scale(1.04); }
          33.33% { opacity: 1; clip-path: inset(0 round 0); transform: scale(1.09); }
          43%, 100% { opacity: 0; clip-path: inset(0 round 0); transform: scale(1.12); }
        }
        @keyframes beauty-dissolve {
          0% { opacity: 0; transform: scale(1.025); }
          11% { opacity: 1; }
          33.33% { opacity: 1; }
          45%, 100% { opacity: 0; transform: scale(1.13); }
        }
        @keyframes craft-right {
          0% { opacity: 1; clip-path: inset(0 100% 0 0); transform: translateX(-3%) scale(1.06); }
          9%, 33.33% { opacity: 1; clip-path: inset(0); transform: translateX(0) scale(1.06); }
          43%, 100% { opacity: 0; clip-path: inset(0); transform: translateX(0) scale(1.06); }
        }
        @keyframes craft-up {
          0% { opacity: 1; clip-path: inset(100% 0 0 0); transform: translateY(3%) scale(1.06); }
          9%, 33.33% { opacity: 1; clip-path: inset(0); transform: translateY(0) scale(1.06); }
          43%, 100% { opacity: 0; clip-path: inset(0); transform: translateY(0) scale(1.06); }
        }
        @keyframes craft-left {
          0% { opacity: 1; clip-path: inset(0 0 0 100%); transform: translateX(3%) scale(1.06); }
          9%, 33.33% { opacity: 1; clip-path: inset(0); transform: translateX(0) scale(1.06); }
          43%, 100% { opacity: 0; clip-path: inset(0); transform: translateX(0) scale(1.06); }
        }
        @keyframes dash-slide {
          0% { opacity: 0; transform: translateX(18%) scale(1.15); }
          6% { opacity: 1; transform: translateX(0) scale(1.08); }
          29% { opacity: 1; transform: translateX(-2%) scale(1.14); }
          39%, 100% { opacity: 0; transform: translateX(-14%) scale(1.2); }
        }
        @keyframes dash-rise {
          0% { opacity: 0; transform: translateY(14%) scale(1.22); }
          6% { opacity: 1; transform: translateY(0) scale(1.12); }
          29% { opacity: 1; transform: translateY(-2%) scale(1.06); }
          39%, 100% { opacity: 0; transform: translateY(-12%) scale(1.16); }
        }
        @keyframes dash-zoom {
          0% { opacity: 0; transform: scale(1.38); }
          6% { opacity: 1; transform: scale(1.12); }
          29% { opacity: 1; transform: scale(1.03); }
          39%, 100% { opacity: 0; transform: translateX(10%) scale(1.18); }
        }
        @media (prefers-reduced-motion: reduce) {
          .motion-track .motion-scene { animation-name: none; will-change: auto; opacity: 0; clip-path: none; }
          .motion-track .scene-0 { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}

