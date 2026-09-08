"use client";
import Link from "next/link";
import { TextAlignJustifyIcon, XIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { NavLink } from "../components";
import gsap from "gsap";
import Image from "next/image";
import { useLenis } from "lenis/react";

const links = [
  {
    name: "Home",
    href: "#home",
  },
  { name: "Services", href: "#services" },
  { name: "Projects", href: "#projects" },
  { name: "Blog", href: "#blog" },
];

export default function Drawer() {
  const menuRef = useRef<HTMLUListElement | null>(null);
  const previousBodyOverflow = useRef("");
  const previousHtmlOverflow = useRef("");
  const lenis = useLenis();

  const showNavbar = () => {
    previousBodyOverflow.current = document.body.style.overflow;
    previousHtmlOverflow.current = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    lenis?.stop();
    gsap.to(menuRef.current, {
      x: "0",
    });
  };

  const hideNavbar = () => {
    document.body.style.overflow = previousBodyOverflow.current;
    document.documentElement.style.overflow = previousHtmlOverflow.current;
    lenis?.start();
    gsap.to(menuRef.current, {
      x: "100%",
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) hideNavbar();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = previousBodyOverflow.current;
      document.documentElement.style.overflow = previousHtmlOverflow.current;
      lenis?.start();
    };
  }, [lenis]);

  return (
    <nav className="w-full flex justify-between items-center px-8 md:px-24 py-4">
    

      <div className="flex">
        <TextAlignJustifyIcon className="cursor-pointer" onClick={showNavbar} />
      </div>

      <ul
        ref={menuRef}
        data-lenis-prevent
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
        className="z-120 flex h-dvh flex-col gap-8 overflow-y-auto overscroll-contain translate-x-full md:w-2xl w-full px-8 pt-18 pb-10 fixed right-0 top-0 bg-[var(--background)]"
      >
        <XIcon
          onClick={hideNavbar}
          className="top-8 right-8 cursor-pointer absolute"
        />
        {links.map((link, index) => (
          <NavLink
            onClick={hideNavbar}
            key={index}
            title={link.name}
            link={link.href}
          />
        ))}
      </ul>
    </nav>
  );
}
