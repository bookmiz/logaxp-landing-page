import { useGSAP } from "@gsap/react";
import { RefObject } from "react";
import { SplitText } from "gsap/SplitText";
import gsap from "gsap";
import { debounce } from "lodash";
import "@/logaxp/utils/gsap";

export default function useTextReveal(
  textRevealRef: RefObject<HTMLElement | null>,
  type?: string,
  scrollTriggerOptions?: ScrollTrigger.Vars
) {
  useGSAP(() => {
    if (!textRevealRef.current) return;
    const splitType = type ?? "chars";
    const splitText = SplitText.create(textRevealRef.current, {
      type: splitType,
      mask: splitType as "lines" | "words" | "chars",
      autoSplit: true,
      smartWrap: true,
    });
    const elements: Record<string, Element[]> = {
      chars: splitText.chars,
      lines: splitText.lines,
      words: splitText.words,
    };

    gsap.from(elements[splitType], {
      y: 400,
      opacity: 0,
      stagger: 0.01,
      autoAlpha: 0,
      duration: 0.5,
      scrollTrigger: {
        trigger: textRevealRef.current,
        ...scrollTriggerOptions,
      },
      ease: "power2.out",
      overwrite: "auto",
    });

    window.addEventListener(
      "resize",
      debounce(() => {
        splitText.revert();
      })
    );
  }, [type]);
}
