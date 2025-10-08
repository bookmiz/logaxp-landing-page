import { useGSAP } from "@gsap/react";
import { RefObject } from "react";
import gsap from "gsap";
import "@/logaxp/utils/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);
export default function useMoveOnScroll(
  elementRef: RefObject<HTMLElement | HTMLElement[] | null>,
  containerRef: RefObject<HTMLElement | null>,
  direction: "x" | "y" | "yPercent" | "xPercent" = "x",
  from: gsap.TweenValue | undefined,
  to: gsap.TweenValue = "+=100%",
  fade?: boolean,
  options?: ScrollTrigger.Vars
) {
  useGSAP(() => {
    if (!elementRef.current || !containerRef.current) return;
    if (from) gsap.set(elementRef.current, { [direction]: from });
    gsap.to(elementRef.current, {
      [direction]: to,
      opacity: fade ? 0 : 1,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top-=100 center",
        end: "bottom top+=100",
        scrub: true,
        ...options,
      },

      overwrite: "auto",
    });
  }, [elementRef, containerRef]);
}
