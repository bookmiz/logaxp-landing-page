"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "../sections"; // adjust path to your marketing Navbar

export default function PublicNavbarGate() {
  const pathname = usePathname();

  // Hide marketing navbar on portal/admin routes
  const isPortal =
    pathname?.startsWith("/portal") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard");

  if (isPortal) return null;

  return <Navbar />;
}
