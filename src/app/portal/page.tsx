 "use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/useAuthStore";
import Layout from "./Layout";
import MainContent from "./DashboardContent";
export default function Page() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeLink, setActiveLink] = useState<string>("Dashboard");

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const { accessToken } = useAuthStore();
  const router = useRouter();

  // redirect if not logged in
  useEffect(() => {
    if (!accessToken) {
      router.push("/admin/login");
    }
  }, [accessToken, router]);

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <Layout
        theme={theme}
        toggleTheme={toggleTheme}
        activeLink={activeLink}
        setActiveLink={setActiveLink}
      >
        <MainContent />
      </Layout>
    </div>
  );
}