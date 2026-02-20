"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Service from "../components/Service";
import Image from "next/image";
import useTextReveal, { useRotateOnScroll } from "../hooks";
import { useRef } from "react";
import { services } from "../utils/content";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Services() {
  const firstStickerRef = useRef<HTMLImageElement | null>(null);
  const secondStickerRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLHeadingElement | null>(null);

  useRotateOnScroll(firstStickerRef, containerRef, "+=45deg");
  useRotateOnScroll(secondStickerRef, containerRef, "-=45deg");
  useTextReveal(containerRef, "words");

  return (
    <section id="services" className="pt-28 pb-16 md:pt-48 md:pb-20">
      {/* Heading block */}
      <div className="px-4 md:px-12 lg:px-24">
        <div className="mx-auto max-w-5xl">
          <h2
            ref={containerRef}
            className="md:text-center leading-[1.08] tracking-tight text-3xl md:text-7xl mango font-black "
          >
            <span>We build </span>
            <span className="text-[#a3d900] opacity-100">secure</span>
            <span> software for </span>

            <span className="inline-block align-middle px-1 opacity-100">
              <Image
                className="align-middle rounded-2xl services-stickers w-10 h-10 md:w-12 md:h-12"
                width={100}
                height={100}
                ref={firstStickerRef}
                alt="mini"
                src="/images/8.png"
              />
            </span>

            <span> modern teams — </span>
            <span className="text-[#a3d900] opacity-100">SaaS</span>
            <span>, </span>
            <span className="text-[#a3d900] opacity-100">cybersecurity</span>
            <span> & </span>
            <span className="text-[#a3d900] opacity-100">platform engineering</span>

            <span className="inline-block align-middle px-1 opacity-100">
              <Image
                className="align-middle rounded-2xl services-stickers w-10 h-10 md:w-12 md:h-12"
                width={100}
                height={100}
                ref={secondStickerRef}
                alt="mini"
                src="/images/9.png"
              />
            </span>
            <span>.</span>
          </h2>

          {/* Subtext (short, calmer) */}
          <p className="mt-5 md:mt-6 md:text-center geist text-base md:text-lg opacity-75 max-w-3xl mx-auto">
            From product design to deployment, we ship scalable systems with strong security, clean UX, and enterprise-grade reliability.
          </p>

          {/* Minimal structure line (quiet) */}
          <div className="mt-8 md:mt-10 mx-auto h-px w-24 bg-black/10 dark:bg-white/10" />

          {/* Optional: tiny 3-metric row (still quiet). Remove if you want ZERO extras. */}
          <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            {[
              { k: "Secure by design", v: "Cyber-first architecture" },
              { k: "Built to scale", v: "Multi-tenant ready" },
              { k: "Production ready", v: "Reliable delivery" },
            ].map((x) => (
              <div
                key={x.k}
                className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur px-5 py-4"
              >
                <div className="geist text-xs font-semibold opacity-70">{x.k}</div>
                <div className="mango text-lg font-black mt-1">{x.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services list */}
      <section className="md:pt-20 pt-10 pb-8 px-4 md:px-12 lg:px-24 w-full flex flex-col">
        {services.map((service, index) => (
          <Service
            key={index}
            index={index}
            title={service.title}
            length={services.length}
          />
        ))}
      </section>
    </section>
  );
}
