"use client";

import React, { useState } from "react";

// icons
export const ChartBarIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

export const DocumentReportIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

export const ViewGridIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
);

export const CogIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

export const QuestionMarkCircleIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export const SunIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

export const MoonIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

// sidebar
type SidebarLinkProps = {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  onClick?: () => void;
};

const SidebarLink = ({ icon, text, active, onClick }: SidebarLinkProps) => (
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      onClick?.();
    }}
    className={`flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
      active
        ? "bg-indigo-600 text-white shadow-lg"
        : "text-gray-400 hover:bg-gray-700 hover:text-white"
    }`}
  >
    {icon}
    <span className="mx-4 text-sm font-normal">{text}</span>
  </a>
);

type SidebarProps = {
  activeLink: string;
  setActiveLink: (link: string) => void;
};

const Sidebar = ({ activeLink, setActiveLink }: SidebarProps) => (
  <aside className="flex flex-col w-64 h-screen px-5 py-8 overflow-y-auto bg-white dark:bg-gray-900 border-r rtl:border-r-0 rtl:border-l dark:border-gray-700">
    <div className="flex items-center space-x-2">
      <svg
        className="h-8 w-8 text-indigo-500"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4ZM12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6Z"
        />
      </svg>
      <span className="text-2xl font-bold text-gray-900 dark:text-white">
        LogaXP
      </span>
    </div>

    <div className="flex flex-col justify-between flex-1 mt-8">
      <nav className="-mx-3 space-y-1">
        <SidebarLink
          text="Dashboard"
          icon={<ViewGridIcon className="w-5 h-5" />}
          active={activeLink === "Dashboard"}
          onClick={() => setActiveLink("Dashboard")}
        />
        <SidebarLink
          text="Analytics"
          icon={<ChartBarIcon className="w-5 h-5" />}
          active={activeLink === "Analytics"}
          onClick={() => setActiveLink("Analytics")}
        />
        <SidebarLink
          text="Reports"
          icon={<DocumentReportIcon className="w-5 h-5" />}
          active={activeLink === "Reports"}
          onClick={() => setActiveLink("Reports")}
        />
        <SidebarLink
          text="Settings"
          icon={<CogIcon className="w-5 h-5" />}
          active={activeLink === "Settings"}
          onClick={() => setActiveLink("Settings")}
        />
        <SidebarLink
          text="Help"
          icon={<QuestionMarkCircleIcon className="w-5 h-5" />}
          active={activeLink === "Help"}
          onClick={() => setActiveLink("Help")}
        />
      </nav>
      <div className="mt-6">
        <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center">
            <img
              className="object-cover w-8 h-8 rounded-full"
              src="https://placehold.co/100x100/667eea/e0e7ff?text=OC"
              alt="Avatar"
            />
            <span className="mx-2 font-semibold text-gray-800 dark:text-gray-200 text-sm">
              Olivia Chen
            </span>
          </div>
          <a
            href="#"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </aside>
);

// header
type HeaderProps = {
  theme: "light" | "dark";
  toggleTheme: () => void;
};

const Header = ({ theme, toggleTheme }: HeaderProps) => (
  <header className="bg-white dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800">
    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
        Overview Dashboard
      </h1>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
        <button className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </div>
  </header>
);

// KPI Card
type KpiCardProps = {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease";
  icon: React.ReactNode;
};

const KpiCard = ({ title, value, change, changeType, icon }: KpiCardProps) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow duration-300">
    <div className="flex justify-between items-start">
      <div className="flex flex-col">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
          {value}
        </p>
      </div>
      <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">{icon}</div>
    </div>
    <div
      className={`mt-4 flex items-center text-sm ${
        changeType === "increase" ? "text-green-500" : "text-red-500"
      }`}
    >
      {changeType === "increase" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      )}
      <span className="ml-1">{change} vs last month</span>
    </div>
  </div>
);

// main content
const MainContent = () => (
  <main className="flex-1 p-6 lg:p-8 bg-gray-50 dark:bg-gray-900">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <KpiCard
        title="Total Revenue"
        value="$1.2M"
        change="5.2%"
        changeType="increase"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-indigo-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"
            />
          </svg>
        }
      />
      <KpiCard
        title="New Customers"
        value="15,800"
        change="12%"
        changeType="increase"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-indigo-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        }
      />
      <KpiCard
        title="Conversion Rate"
        value="4.1%"
        change="0.5%"
        changeType="decrease"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-indigo-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        }
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="font-semibold text-gray-800 dark:text-white">
          Quarterly Performance
        </h3>
        <div className="mt-4 h-64">
          <svg
            className="w-full h-full"
            viewBox="0 0 300 150"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop
                  offset="0%"
                  style={{ stopColor: "rgba(129, 140, 248, 0.2)" }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "rgba(129, 140, 248, 0)" }}
                />
              </linearGradient>
            </defs>
            <polyline
              fill="url(#gradient)"
              stroke="#6366F1"
              strokeWidth="2"
              points="0,120 50,90 100,100 150,60 200,80 250,50 300,70"
            />
          </svg>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="font-semibold text-gray-800 dark:text-white">
          Top Acquisition Channels
        </h3>
        <div className="mt-4 h-64 flex items-center justify-center">
          <svg
            className="transform -rotate-90"
            width="100%"
            height="100%"
            viewBox="0 0 42 42"
          >
            <circle
              cx="21"
              cy="21"
              r="15.9154943092"
              fill="transparent"
              stroke="#E5E7EB"
              strokeWidth="4"
            ></circle>
            <circle
              cx="21"
              cy="21"
              r="15.9154943092"
              fill="transparent"
              stroke="#4F46E5"
              strokeWidth="4"
              strokeDasharray="45 55"
              strokeDashoffset="0"
            ></circle>
            <circle
              cx="21"
              cy="21"
              r="15.9154943092"
              fill="transparent"
              stroke="#34D399"
              strokeWidth="4"
              strokeDasharray="30 70"
              strokeDashoffset="-45"
            ></circle>
            <circle
              cx="21"
              cy="21"
              r="15.9154943092"
              fill="transparent"
              stroke="#FBBF24"
              strokeWidth="4"
              strokeDasharray="15 85"
              strokeDashoffset="-75"
            ></circle>
            <g className="text-center">
              <text
                x="21"
                y="24"
                textAnchor="middle"
                className="text-xl font-bold fill-current text-gray-800 dark:text-white"
              >
                100%
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  </main>
);

// layout
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
    <Sidebar activeLink={activeLink} setActiveLink={setActiveLink} />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <MainContent />
      {children}
    </div>
  </div>
);

// page component
export default function Page() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeLink, setActiveLink] = useState<string>("Dashboard");

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <Layout
        theme={theme}
        toggleTheme={toggleTheme}
        activeLink={activeLink}
        setActiveLink={setActiveLink}
      />
    </div>
  );
}
