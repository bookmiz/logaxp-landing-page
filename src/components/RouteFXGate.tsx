"use client";

import React, {useEffect,useState} from "react";
import { usePathname } from "next/navigation";
import CustomLenis from "../components/CustomLenis"; // adjust path
import Cursor from "../components/Cursor"; // adjust path

export default function RouteFXGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [reduced,setReduced]=useState(false);
  useEffect(()=>{const media=window.matchMedia("(prefers-reduced-motion: reduce)");const update=()=>{setReduced(media.matches);if(media.matches)document.querySelectorAll("video").forEach(v=>v.pause());};update();media.addEventListener("change",update);return()=>media.removeEventListener("change",update);},[pathname]);

  const isPortal =
    pathname.startsWith("/portal") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/site-admin"); // include protected app routes too

  // ✅ Portal/Admin: NO Lenis, NO Cursor
  if (isPortal || reduced) return <>{children}</>;

  // ✅ Public site: Lenis + Cursor
  return (
    <CustomLenis>
      {children}
      <Cursor />
    </CustomLenis>
  );
}
