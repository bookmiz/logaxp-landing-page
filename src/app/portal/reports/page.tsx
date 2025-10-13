 "use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../store/useAuthStore";
import Layout from "../Layout";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ReportData {
  period: string;
  transactions: number;
  users: number;
  revenue: number;
}

interface TopServiceData {
  name: string;
  bookings: number;
  revenue: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}

// Reports Content Component
const ReportsContent = () => {
  const monthlyReports: ReportData[] = [
    { period: "Jan", transactions: 2400, users: 1800, revenue: 145000 },
    { period: "Feb", transactions: 2850, users: 2100, revenue: 162000 },
    { period: "Mar", transactions: 3100, users: 2450, revenue: 178000 },
    { period: "Apr", transactions: 3450, users: 2800, revenue: 191000 },
    { period: "May", transactions: 3800, users: 3200, revenue: 205000 },
    { period: "Jun", transactions: 4200, users: 3600, revenue: 228000 },
  ];

  const topServices: TopServiceData[] = [
    { name: "Event Planning", bookings: 1250, revenue: 45600 },
    { name: "Home Cleaning", bookings: 980, revenue: 32400 },
    { name: "Catering", bookings: 850, revenue: 38900 },
    { name: "Photography", bookings: 720, revenue: 28500 },
    { name: "Venue Booking", bookings: 650, revenue: 52300 },
  ];

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const StatCard = ({ title, value, subtitle, icon }: { title: string; value: string; subtitle: string; icon: string }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400">{subtitle}</p>
    </div>
  );

  return (
    <main className="flex-1 p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reports Overview</h1>
        <p className="text-gray-600 dark:text-gray-400">Comprehensive insights and performance metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Reports" value="156" subtitle="Generated this month" icon="📊" />
        <StatCard title="Active Platforms" value="5" subtitle="All systems operational" icon="🚀" />
        <StatCard title="Data Points" value="24.8K" subtitle="Collected this period" icon="📈" />
        <StatCard title="Export Rate" value="92%" subtitle="Successful exports" icon="💾" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Performance */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">Monthly Performance</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Transaction and user growth trends</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyReports}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="period" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="transactions" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} name="Transactions" />
              <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} name="New Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Services */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">Top Services</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Revenue by service category</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topServices}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '11px' }} angle={-15} textAnchor="end" height={80} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report Actions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
            <span>📄</span>
            <span>Generate Report</span>
          </button>
          <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
            <span>📊</span>
            <span>Export Data</span>
          </button>
          <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
            <span>📧</span>
            <span>Email Report</span>
          </button>
          <button className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
            <span>⚙️</span>
            <span>Schedule</span>
          </button>
        </div>
      </div>
    </main>
  );
};

// Main Reports Page Component
export default function ReportsPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeLink, setActiveLink] = useState<string>("Reports");

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const { accessToken } = useAuthStore();
  const router = useRouter();

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
        <ReportsContent />
      </Layout>
    </div>
  );
}