"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "../sections"; // adjust path to your marketing Navbar

export default function PublicNavbarGate() {
  const pathname = usePathname();

  // Hide marketing navbar on app routes and product pages with their own header.
  const isPortal =
    pathname?.startsWith("/portal") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/site-admin") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/hr");

  if (isPortal) return null;

  return <Navbar />;
}
