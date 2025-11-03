"use client";
import Link from "next/link";
import { TextAlignJustifyIcon, XIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { NavLink } from "../components";
import gsap from "gsap";
import Image from "next/image";


const links = [
  {
    name: "Home",
    href: "#home",
  },
  { name: "Services", href: "#services" },
  { name: "Projects", href: "#projects" },
  { name: "Blog", href: "#blogs" },
];

export default function Navbar() {
  const menuRef = useRef<HTMLUListElement | null>(null);

  const showNavbar = () => {
    document.body.style.overflowY = "hidden";
    gsap.to(menuRef.current, {
      x: "0",
    });
  };

  const hideNavbar = () => {
    document.body.style.overflowY = "auto";
    gsap.to(menuRef.current, {
      x: "100%",
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) hideNavbar();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full flex justify-between items-center px-8 md:px-24 py-4">
         <Link href="/">
  <Image
    src="/logo-light.png"
    alt="LogaXp logo"
    width={140}
    height={40}
    priority
    className="block dark:hidden" // shows only in light mode
  />
  <Image
    src="/logo-dark.png"
    alt="LogaXp logo"
    width={140}
    height={40}
    priority
    className="hidden dark:block" // shows only in dark mode
  />
</Link>


      <div className="flex">
        <TextAlignJustifyIcon className="cursor-pointer" onClick={showNavbar} />
      </div>

      <ul
        ref={menuRef}
        className="z-120  flex-col overflow-hidden gap-8 translate-x-full md:w-2xl w-full px-8 pt-18 fixed h-full right-0 top-0 bg-[var(--background)]"
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
