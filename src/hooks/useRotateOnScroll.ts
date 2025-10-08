import { useGSAP } from "@gsap/react";
import { RefObject } from "react";
import gsap from "gsap";
import "@/logaxp/utils/gsap";

export default function useRotateOnScroll(
  elementRef: RefObject<HTMLElement | null>,
  containerRef: RefObject<HTMLElement | null>,
  rotation: gsap.TweenValue = "+=360deg",
  scrollTriggerOptions?: ScrollTrigger.Vars | undefined
) {
  useGSAP(() => {
    if (!elementRef.current || !containerRef.current) return;

    gsap.from(elementRef.current, {
      rotation,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top center",
        end: "bottom+=200 top",
        scrub: true,
        ...scrollTriggerOptions,
      },
      overwrite: "auto",
    });
  }, [elementRef, containerRef]);
}
