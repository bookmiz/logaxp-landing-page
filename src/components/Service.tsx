import { useRef } from "react";
import { useMoveOnScroll, useRotateOnScroll } from "../hooks";

type ServiceProps = {
  index: number;
  title: string;
  length: number;
};

export default function Service({ index, title, length }: ServiceProps) {
  const serviceMaskRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<HTMLDivElement | null>(null);
  useMoveOnScroll(serviceMaskRef, containerRef, "x", undefined, "+=100%");
  useRotateOnScroll(
    svgRef,
    containerRef,
    index % 2 === 0 ? "+=360deg" : "-=360deg"
  );
  return (
    <div
      ref={containerRef}
      className="shrink-0 overflow-hidden cursor-pointer my-12 md:my-16 flex-1"
    >
      <div className="flex overflow-x-hidden justify-start md:justify-between items-center mb-4">
        <div className="relative w-full">
          <p className="font-bold min-w-[60%] truncate text-ellipsis w-full opacity-90 hover:opacity-100 whitespace-nowrap mango text-5xl md:text-8xl">
            <span className="text-xl align-top mr-2">[0{index + 1}] </span>{" "}
            {title}
          </p>
          <div
            ref={serviceMaskRef}
            className="w-full bg-[var(--background)] opacity-60 h-full absolute top-0 left-0"
          ></div>
        </div>
        <div
          className="overflow-hidden shrink-0 w-8 h-8 md:w-12 md:h-12"
          ref={svgRef}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 207 207"
            className="fill-black"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="69" y="138" width="69" height="69" fill="#89E101" />
            <rect x="69" width="69" height="69" fill="#89E101" />
            <rect y="69" width="69" height="69" fill="#89E101" />
            <rect
              x="138"
              y="138"
              width="69"
              height="69"
              transform="rotate(-90 138 138)"
              fill="#89E101"
            />
          </svg>
        </div>
      </div>
      {index < length - 1 ? (
        <div className="bg-[var(--foreground)] h-0.5 opacity-50 w-full mt-4"></div>
      ) : null}
    </div>
  );
}
