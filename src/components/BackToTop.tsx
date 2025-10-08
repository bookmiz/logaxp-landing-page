"use client";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import Image from "next/image";

gsap.registerPlugin(ScrollToPlugin);
export default function BackToTop() {
  return (
    <div
      onClick={() => {
        gsap.to(window, {
          scrollTo: 0,
          ease: "power2.out",
          duration: 2,
        });
      }}
      className="fixed bottom-4 z-50 right-4 md:bottom-10 md:right-10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:scale-110 transition-transform"
    >
      <Image
        src="/svg/1.svg"
        className="-rotate-90"
        alt="arrow"
        width={40}
        height={40}
      />
      <p className="mango font-bold tracking-wide">Back to top</p>
    </div>
  );
}
