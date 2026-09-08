import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import "@/logaxp/utils/gsap";
import CustomLenis, { BackToTop } from "../components";
import RouteFXGate from "../components/RouteFXGate";
import Cursor from "../components/Cursor";
import ReactQueryProvider from "../providers/ReactQueryProvider"; 
import PublicNavbarGate from "../components/PublicNavbarGate";
import { Suspense } from "react";

const mangoGrotesque = localFont({
  src: [
    { path: "../../public/fonts/mango/extrabold.woff2", weight: "900" },
    { path: "../../public/fonts/mango/regular.woff2", weight: "400" },
    { path: "../../public/fonts/mango/medium.woff2", weight: "500" },
    { path: "../../public/fonts/mango/semibold.woff2", weight: "600" },
    { path: "../../public/fonts/mango/light.woff2", weight: "300" },
  ],
  variable: "--font-mango",
});

const geist = localFont({
  src: "../../public/fonts/geist/Geist-Variable.woff2",
  variable: "--font-geist",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.logaxp.com"),
  title: { default: "LogaXP — Software Agency & Products", template: "%s | LogaXP" },
  description: "Custom software design and development, with products for HR, bookings, events and delivery.",
  openGraph: { type: "website", siteName: "LogaXP", title: "LogaXP — Software Agency & Products", description: "Custom software and products for people and business.", images: [{url: "/images/4.png", alt: "LogaXP software and products"}] },
  twitter: {card: "summary_large_image"},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${mangoGrotesque.variable} ${geist.variable} antialiased`}
      >
        <ReactQueryProvider>
          <RouteFXGate>
            <PublicNavbarGate />
            <Suspense fallback={null}>{children}</Suspense>
            <BackToTop />
          </RouteFXGate>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
