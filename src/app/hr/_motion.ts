import type { Variants } from "framer-motion";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};

export const photoReveal: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 18 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.58, ease: "easeOut" } },
};
