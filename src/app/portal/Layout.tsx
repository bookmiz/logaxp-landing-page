"use client";

import React from "react";
import Navbar from "./Navbar";
import Header from "./Header";

type LayoutProps = {
  children?: React.ReactNode;
  theme: "light" | "dark";
  toggleTheme: () => void;
  activeLink: string;
  setActiveLink: (link: string) => void;
};

const Layout = ({
  children,
  theme,
  toggleTheme,
  activeLink,
  setActiveLink,
}: LayoutProps) => (
  <div className="flex bg-gray-100 dark:bg-gray-900 min-h-screen font-sans">
    <Navbar activeLink={activeLink} setActiveLink={setActiveLink} />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header theme={theme} toggleTheme={toggleTheme} />
      {children}
    </div>
  </div>
);

export default Layout;