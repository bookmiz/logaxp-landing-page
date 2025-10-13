 "use client";

import React from "react";

// KPI Card Component
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

// Main Content Component
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

export default MainContent;