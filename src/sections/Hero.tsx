"use client";
import Image from "next/image";
import { Users } from "lucide-react";
import { useRef } from "react";
import useTextReveal, { useRotateOnScroll } from "../hooks";
import Link from "next/link";

export default function Hero() {
  const textRevealRef = useRef<HTMLHeadingElement | null>(null);
  const smileyStickerRef = useRef<HTMLImageElement | null>(null);
  const heroMediaRef = useRef<HTMLDivElement | null>(null);

  useTextReveal(textRevealRef);
  useRotateOnScroll(smileyStickerRef, heroMediaRef, "-=45deg");

  return (
    <header
      id="home"
      className="px-4 md:px-12 lg:px-24 pt-12 md:pt-20 gap-12 flex flex-col items-center pb-10 md:pb-20"
    >
      <section className="lg:max-w-4xl">
        <div className="flex md:items-center lg:px-18 flex-col gap-2">
            <h1
              data-cursor="-inverse"
              ref={textRevealRef}
              className="text-5xl mb-4 md:text-7xl xl:text-8xl overflow-hidden tracking-wide mango font-bold md:text-center"
            >
              Enterprise Software{" "}
              <span>
                <Users aria-hidden="true" className="inline h-10 w-10 md:h-14 md:w-14 align-middle text-[#86BF00]" strokeWidth={1.75} />
              </span>{" "}
              Built to Power{" "}
              <span className="block text-[#86BF00] opacity-100">People & Performance</span>
            </h1>

            <p className="md:text-lg opacity-80 geist font-normal md:text-center max-w-2xl">
              Hiring, cybersecurity to operations tools, we ship SaaS products teams depend on every day.
            </p>

          </div>
      </section>
      <div ref={heroMediaRef} className="relative">
        <video
          className="rounded-3xl w-full aspect-video object-cover"
          src="/videos/2.mp4"
          loop
          muted
          autoPlay
          controlsList="nofullscreen nodownload" 
          disablePictureInPicture
          disableRemotePlayback
          playsInline
          poster="" 
          preload="metadata" 
          tabIndex={-1}
        ></video>
        <Link
          href=""
          className="absolute md:-top-[7%] md:-left-[8%] -top-[10%] left-0 w-20 md:w-42 h-auto"
        >
          <Image
            ref={smileyStickerRef}
            src="/images/10.png"
            alt="smiley face"
            width={200}
            height={200}
          />
        </Link>
      </div>
    </header>
  );
}
