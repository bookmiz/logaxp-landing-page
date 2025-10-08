"use client";
import { useRef } from "react";
import useTextReveal from "../hooks";
import Link from "next/link";
import gsap from "gsap";
import { useLenis } from "lenis/react";

type Props = {
  title: string;
  link: string;
  onClick: () => void;
};

export default function NavLink({ title, link, onClick }: Props) {
  const linkRef = useRef<HTMLLIElement | null>(null);
  const iconRef = useRef<HTMLDivElement | null>(null);
  const lenis = useLenis();

  useTextReveal(linkRef);

  return (
    <li
      onClick={onClick}
      onMouseEnter={() => {
        if (!iconRef) return;
        gsap.to(iconRef.current, {
          rotate: "360deg",
        });
      }}
      ref={linkRef}
      onMouseLeave={() => {
        gsap.set(iconRef.current, {
          rotate: 0,
        });
      }}
      className="md:text-9xl hover:text-[#89E101] text-8xl cursor-pointer mango font-black"
    >
      <Link
        className="flex items-center justify-between "
        href={""}
        onClick={() => lenis?.scrollTo(`#${title.toLowerCase()}`)}
      >
        {title}
        <div ref={iconRef} className="md:w-20 w-10 h-10 md:h-20">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 207 207"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="69" y="138" width="69" height="69" fill="#D9D9D9" />
            <rect x="69" width="69" height="69" fill="#D9D9D9" />
            <rect y="69" width="69" height="69" fill="#D9D9D9" />
            <rect
              x="138"
              y="138"
              width="69"
              height="69"
              transform="rotate(-90 138 138)"
              fill="#D9D9D9"
            />
          </svg>
        </div>
      </Link>
    </li>
  );
}
