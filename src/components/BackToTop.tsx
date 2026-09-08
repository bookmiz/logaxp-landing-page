"use client";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ArrowUp } from "lucide-react";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollToPlugin);
export default function BackToTop() {
  const pathname = usePathname();
  if (pathname.startsWith("/site-admin")) return null;
  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => {
        gsap.to(window, {
          scrollTo: 0,
          ease: "power2.out",
          duration: 2,
        });
      }}
      className="fixed bottom-4 z-50 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-current/20 bg-[var(--background)] text-[var(--foreground)] shadow-sm cursor-pointer hover:scale-105 transition-transform"
    >
      <ArrowUp aria-hidden="true" className="h-5 w-5" />
    </button>
  );
}
