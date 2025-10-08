"use client";
import { useRef } from "react";
import { useMoveOnScroll } from "../hooks";
import "@/logaxp/utils/gsap";

type Props = {
  src: string;
};

export default function ProjectImage({ src }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLVideoElement | null>(null);
  useMoveOnScroll(mediaRef, containerRef, "yPercent", 0, -20, false, {
    start: "top center",
  });
  return (
    <div
      ref={containerRef}
      data-cursor-video={src}
      className="overflow-hidden w-full aspect-11/6 rounded-2xl"
    >
      <video
        playsInline={false}
        controls={false}
        autoPlay
        muted
        loop
        ref={mediaRef}
        src={src}
        className="h-full scale-200 object-cover relative w-full"
      ></video>
    </div>
  );
}
