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
    <>
      <section
        id="services"
        className="md:pt-48 md:items-center pb-6 pt-32 flex flex-col"
      >
        <h2
          ref={containerRef}
          className="lg:px-24 md:text-center leading-normal px-4 md:max-w-5xl tracking-wide text-3xl md:text-6xl mango font-black"
        >
          <span>We collaborate with industry-leading </span>
          <span className="inline-block opacity-100 align-middle px-1">
            {" "}
            <Image
              className="align-middle rounded-2xl services-stickers w-10 h-10 md:w-12 md:h-12"
              width={100}
              height={100}
              ref={firstStickerRef}
              alt="mini"
              src="/images/8.png"
            />
          </span>
          <span> brands to provide exceptional </span>
          <span className="inline-block opacity-100 align-middle px-1">
            {" "}
            <Image
              className="align-middle rounded-2xl services-stickers w-10 h-10 md:w-12 md:h-12"
              width={100}
              height={100}
              ref={secondStickerRef}
              alt="mini"
              src="/images/9.png"
            />
          </span>
          <span> solutions that drive success. </span>
        </h2>
        <section className="md:pt-24 pt-10 pb-24 px-4 md:px-12 lg:px-24 gap-32 w-full flex-col">
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
    </>
  );
}
