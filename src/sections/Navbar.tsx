"use client";

import Link from "next/link";
import { TextAlignJustifyIcon, XIcon, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink } from "../components";
import gsap from "gsap";
import Image from "next/image";
import { useLenis } from "lenis/react";

const links = [
  { name: "Home", href: "/#home" },
  { name: "Services", href: "/#services" },
  { name: "Projects", href: "/#projects" },
  { name: "Blog", href: "/#blog" },
];

export default function Navbar() {
  const [open,setOpen]=useState(false);
  const triggerRef=useRef<HTMLButtonElement>(null);
  const closeRef=useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);
  const previousBodyOverflow = useRef("");
  const previousHtmlOverflow = useRef("");
  const lenis = useLenis();

  const showNavbar = () => {
    setOpen(true);
    setTimeout(()=>closeRef.current?.focus(),0);
    previousBodyOverflow.current = document.body.style.overflow;
    previousHtmlOverflow.current = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    lenis?.stop();
    gsap.to(menuRef.current, {
      x: "0",
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.45,
      ease: "power3.out",
    });
  };

  const hideNavbar = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
    document.body.style.overflow = previousBodyOverflow.current;
    document.documentElement.style.overflow = previousHtmlOverflow.current;
    lenis?.start();
    gsap.to(menuRef.current, {
      x: "100%",
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.35,
      ease: "power3.inOut",
    });
  }, [lenis]);

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
  }, [lenis, hideNavbar]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[120]">
        <nav className="mx-auto max-w-7xl px-5 pt-3 md:px-12 lg:px-24">
          <div className="rounded-[1.35rem] border border-black/10 bg-white shadow-sm">
            <div className="flex h-[64px] items-center justify-between gap-4 px-4 md:h-[68px] md:px-5">
              <div className="flex min-w-0 items-center gap-5">
                <Link href="/" className="flex shrink-0 items-center">
                  <Image
                    src="/logo-light.png"
                    alt="LogaXp logo"
                    width={132}
                    height={40}
                    priority
                    className="block"
                  />
                </Link>

                <Link
                  href="/hr"
                  className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-black/65 transition hover:bg-black/[0.04] hover:text-black sm:inline-flex"
                >
                  HR Suite
                  <span className="h-1.5 w-1.5 rounded-full bg-[#86BF00]" />
                </Link>
              </div>

              <div className="flex shrink-0 items-center justify-end gap-2.5">
                <Link
                  href="/admin/login"
                  className="hidden rounded-full px-3 py-2 text-sm font-bold text-black/60 transition hover:bg-black/[0.04] hover:text-black md:inline-flex"
                >
                  Login
                </Link>
                <Link
                  href="/contact"
                  className="hidden items-center gap-2 rounded-full bg-[#86BF00] text-slate-950 px-4 py-2 text-sm font-semibold transition hover:brightness-95 md:inline-flex"
                >
                  Contact Sales
                  <span className="h-2 w-2 rounded-full bg-white" />
                </Link>

                <button
                  type="button"
                  ref={triggerRef}
                  aria-label="Open menu" aria-expanded={open} aria-controls="public-menu"
                  onClick={showNavbar}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-white text-slate-900 transition hover:bg-black/[0.04] md:h-11 md:w-11"
                >
                  <TextAlignJustifyIcon className="h-5 w-5 md:h-6 md:w-6" />
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <ul
        id="public-menu" inert={!open} aria-hidden={!open}
        onKeyDown={event=>{if(event.key==="Escape")hideNavbar(); if(event.key==="Tab"){const items=menuRef.current?.querySelectorAll<HTMLElement>("a[href],button");if(!items?.length)return;const first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}}}
        ref={menuRef}
        data-lenis-prevent
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
        className="z-[999] flex h-dvh flex-col gap-8 overflow-y-auto overscroll-contain translate-x-full md:w-2xl w-full px-8 pt-18 pb-10 fixed right-0 top-0 bg-[var(--background)]"
      >
        <button ref={closeRef} aria-label="Close menu" onClick={hideNavbar} className="top-8 right-8 absolute rounded p-2"><XIcon/></button>
        <li className="mt-2">
          <Link
            href="/hr"
            onClick={hideNavbar}
            className="group relative block overflow-hidden rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-2 hover:bg-white/85 dark:hover:bg-white/10 transition"
          >
            <div className="pointer-events-none absolute -inset-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(163,217,0,0.35),transparent_60%)]" />
            </div>

            <div className="relative flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#86BF00]/20 grid place-items-center border border-black/10 dark:border-white/10">
                <Users aria-hidden="true" className="h-6 w-6 text-[#86BF00]" strokeWidth={1.75} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="mango text-2xl font-black leading-none">HR Suite</p>
                  <span className="rounded-full bg-black/5 dark:bg-white/10 px-2.5 py-1 text-[11px] geist font-bold opacity-80">
                    NEW
                  </span>
                </div>
                <p className="geist text-sm opacity-75 mt-1">
                  Records • Onboarding • Time and leave
                </p>
              </div>

              <span className="ml-auto geist text-sm font-bold opacity-60 group-hover:opacity-100 transition">
                →
              </span>
            </div>
          </Link>
        </li>

        <li><Link href="/admin/login" onClick={hideNavbar} className="text-xl font-bold">Login to your workspace</Link></li>
        <li className="h-px bg-black/10 dark:bg-white/10 my-2" />

        {links.map((link, index) => (
          <NavLink
            onClick={hideNavbar}
            key={index}
            title={link.name}
            link={link.href}
          />
        ))}

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
                className="inline-flex items-center justify-center rounded-2xl bg-[#86BF00] text-slate-950 px-6 py-3 font-black hover:brightness-95 transition"
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
              Software projects • Products • Team workflows
            </div>
          </div>
        </div>
      </ul>

      <div className="h-[78px] md:h-[84px]" />
    </>
  );
}
