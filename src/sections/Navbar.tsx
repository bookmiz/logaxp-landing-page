"use client";

import Link from "next/link";
import { TextAlignJustifyIcon, XIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { NavLink } from "../components";
import gsap from "gsap";
import Image from "next/image";

const links = [
  { name: "Home", href: "#home" },
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
      duration: 0.45,
      ease: "power3.out",
    });
  };

  const hideNavbar = () => {
    document.body.style.overflowY = "auto";
    gsap.to(menuRef.current, {
      x: "100%",
      duration: 0.35,
      ease: "power3.inOut",
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
    <>
      {/* PREMIUM HEADER SHELL (doesn't affect drawer logic) */}
      <header className="fixed top-0 left-0 right-0 z-[120]">
        {/* soft top fade */}
       

        <nav className="mx-auto max-w-7xl px-5 md:px-12 lg:px-24 pt-4">
          <div className="relative rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-[0_10px_35px_-20px_rgba(0,0,0,0.01)]">
            <div className="relative flex items-center justify-between px-5 md:px-6 py-3.5">
              {/* Logo (unchanged) */}
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo-light.png"
                  alt="LogaXp logo"
                  width={140}
                  height={40}
                  priority
                  className="block dark:hidden"
                />
                <Image
                  src="/logo-dark.png"
                  alt="LogaXp logo"
                  width={140}
                  height={40}
                  priority
                  className="hidden dark:block"
                />
              </Link>

              {/* Right actions */}
              <div className="flex items-center gap-3">
                <Link
                  href="/contact"
                  className="hidden md:inline-flex items-center gap-2 rounded-full text-sm bg-[#a3d900] px-3 py-2 font-bold text-blue-950 shadow-lg shadow-[#a3d900]/25 hover:shadow-[#a3d900]/40 hover:brightness-95 transition"
                >
                  Contact Sales
                  <span className="h-2 w-2 rounded-full bg-white" />
                </Link>

                {/* SAME icon, SAME open handler */}
                <button
                  type="button"
                  aria-label="Open menu"
                  onClick={showNavbar}
                  className="inline-flex items-center justify-center h-11 w-11 rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition"
                >
                  <TextAlignJustifyIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Drawer MUST be outside header container (so it behaves like your original) */}
      <ul
        ref={menuRef}
        className="z-[999] flex flex-col overflow-hidden gap-8 translate-x-full md:w-2xl w-full px-8 pt-18 fixed h-full right-0 top-0 bg-[var(--background)]"
      >
        <XIcon
          onClick={hideNavbar}
          className="top-8 right-8 cursor-pointer absolute"
        />
        {/* Featured product */}
        <li className="mt-2">
          <Link
            href="/hr"
            onClick={hideNavbar}
            className="
              group relative block overflow-hidden
              rounded-3xl border border-black/10 dark:border-white/10
              bg-white/70 dark:bg-white/5 backdrop-blur-xl
              p-2
              hover:bg-white/85 dark:hover:bg-white/10
              transition
            "
          >
            {/* soft glow */}
            <div className="pointer-events-none absolute -inset-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(163,217,0,0.35),transparent_60%)]" />
            </div>

            <div className="relative flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#a3d900]/20 grid place-items-center border border-black/10 dark:border-white/10">
                <Image
                  src="/gifs/sparkle.gif"
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7"
                  unoptimized
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="mango text-2xl font-black leading-none">HR Suite</p>
                  <span className="rounded-full bg-black/5 dark:bg-white/10 px-2.5 py-1 text-[11px] geist font-bold opacity-80">
                    NEW
                  </span>
                </div>
                <p className="geist text-sm opacity-75 mt-1">
                  Hiring • Engagement • Performance — in one system
                </p>
              </div>

              <span className="ml-auto geist text-sm font-bold opacity-60 group-hover:opacity-100 transition">
                →
              </span>
            </div>
          </Link>
        </li>

        {/* divider */}
        <li className="h-px bg-black/10 dark:bg-white/10 my-2" />


        {links.map((link, index) => (
          <NavLink
            onClick={hideNavbar}
            key={index}
            title={link.name}
            link={link.href}
          />
        ))}

        {/* optional bottom CTA (visual only) */}
        <div className="mt-auto pt-10">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-6">
            <div className="geist text-sm opacity-70">Want a walkthrough?</div>
            <div className="mango text-2xl font-black mt-1">Talk to Sales</div>
            <div className="geist mt-2 opacity-80">
              Let’s map your workflows and show how LogaXP fits your org.
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                onClick={hideNavbar}
                className="inline-flex items-center justify-center rounded-2xl bg-[#a3d900] px-6 py-3 font-black text-black hover:brightness-95 transition"
              >
                Contact Sales
              </Link>

              <Link
                href="/demo"
                onClick={hideNavbar}
                className="inline-flex items-center justify-center rounded-2xl border border-black/10 dark:border-white/10 bg-black text-white dark:bg-white dark:text-black px-6 py-3 font-black hover:opacity-90 transition"
              >
                Book a Demo
              </Link>
            </div>

            <div className="mt-4 geist text-xs opacity-60">
              Enterprise-ready • Multi-tenant • Secure
            </div>
          </div>
        </div>
      </ul>

      {/* Spacer so content doesn't sit under fixed header */}
      <div className="h-[92px] md:h-[104px]" />
    </>
  );
}
