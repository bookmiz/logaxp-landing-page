"use client";
import Image from "next/image";
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
      className="px-4 md:px-12 lg:px-24 pt-24 gap-18 flex flex-col items-center"
    >
      <section className="lg:max-w-4xl">
        <div className="flex md:items-center lg:px-18 flex-col gap-2">
          <h1
            data-cursor="-inverse"
            ref={textRevealRef}
            className="text-6xl mb-4 md:text-8xl overflow-hidden tracking-wide mango font-bold md:text-center"
          >
            Empowering You for Success{" "}
            <span>
              <Image
                className="inline hero-gifs rounded-2xl md:rounded-3xl w-12 h-12 md:w-18 md:h-18"
                width={100}
                height={100}
                alt="mini"
                unoptimized
                src={"/gifs/1.gif"}
              />
            </span>{" "}
            <span>Through</span>{" "}
            <span className="text-[#a3d900] opacity-100">Innovation</span>
          </h1>
          <p className="md:text-lg opacity-80 geist font-normal md:text-center max-w-2xl">
            Discover cutting-edge solutions designed to streamline operations,
            boost productivity, and drive your business forward. With Loga
            <span className="text-[#a3d900] opacity-100 font-bold">XP</span>,
            experience technology that works as hard as you do.
          </p>
        </div>
      </section>
      <div ref={heroMediaRef} className="relative">
        <video
          className="rounded-3xl w-full md:aspect-video"
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
          href="/portal"
          className="absolute md:-top-[7%] md:-left-[8%] -top-[15%] -left-[15%] w-32 md:w-42 h-auto"
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
