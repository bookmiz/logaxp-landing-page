 "use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/useAuthStore";

 
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

// Sidebar Link Component
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

// Navbar Props
type NavbarProps = {
  activeLink: string;
  setActiveLink: (link: string) => void;
};

const Navbar = ({ activeLink, setActiveLink }: NavbarProps) => {
  const router = useRouter();
  const { clearAuth } = useAuthStore();

  const handleNavigation = (path: string, linkName: string) => {
    setActiveLink(linkName);
    router.push(path);
  };

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/admin/login";
  };

  return (
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
            onClick={() => handleNavigation("/portal", "Dashboard")}
          />
          <SidebarLink
            text="Analytics"
            icon={<ChartBarIcon className="w-5 h-5" />}
            active={activeLink === "Analytics"}
            onClick={() => handleNavigation("/portal/analytics", "Analytics")}
          />
          <SidebarLink
            text="Reports"
            icon={<DocumentReportIcon className="w-5 h-5" />}
            active={activeLink === "Reports"}
            onClick={() => handleNavigation("/portal/reports", "Reports")}
          />
          <SidebarLink
            text="Settings"
            icon={<CogIcon className="w-5 h-5" />}
            active={activeLink === "Settings"}
            onClick={() => handleNavigation("/portal/settings", "Settings")}
          />
          <SidebarLink
            text="Help"
            icon={<QuestionMarkCircleIcon className="w-5 h-5" />}
            active={activeLink === "Help"}
            onClick={() => handleNavigation("/portal/help", "Help")}
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
            <button
              onClick={handleLogout}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
              title="Logout"
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
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Navbar;