"use client";

import React from "react";
import { usePathname } from "next/navigation";
import CustomLenis from "../components/CustomLenis"; // adjust path
import Cursor from "../components/Cursor"; // adjust path

export default function RouteFXGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isPortal =
    pathname.startsWith("/portal") ||
    pathname.startsWith("/admin"); // include admin routes too if you want

  // ✅ Portal/Admin: NO Lenis, NO Cursor
  if (isPortal) return <>{children}</>;

  // ✅ Public site: Lenis + Cursor
  return (
    <CustomLenis>
      {children}
      <Cursor />
    </CustomLenis>
  );
}