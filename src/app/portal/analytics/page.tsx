"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../store/useAuthStore";
import Layout from "../Layout";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
  activeUsers: number;
}

interface PlatformData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface ServiceData {
  service: string;
  bookings: number;
  revenue: number;
}

interface TrendData {
  value: number;
}

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease";
  trend: TrendData[];
}

// Analytics Content Component 
const AnalyticsContent = () => {
  const revenueData: RevenueData[] = [
    { month: "Jan", revenue: 145000, bookings: 2400, activeUsers: 8200 },
    { month: "Feb", revenue: 162000, bookings: 2850, activeUsers: 9100 },
    { month: "Mar", revenue: 178000, bookings: 3100, activeUsers: 10500 },
    { month: "Apr", revenue: 191000, bookings: 3450, activeUsers: 11800 },
    { month: "May", revenue: 205000, bookings: 3800, activeUsers: 13200 },
    { month: "Jun", revenue: 228000, bookings: 4200, activeUsers: 15600 },
    { month: "Jul", revenue: 242000, bookings: 4600, activeUsers: 17100 },
    { month: "Aug", revenue: 268000, bookings: 5100, activeUsers: 19500 },
  ];

  const platformData: PlatformData[] = [
    { name: "GatherPlux", value: 32, color: "#6366f1" },
    { name: "Logaluxe", value: 28, color: "#8b5cf6" },
    { name: "DishUp", value: 22, color: "#ec4899" },
    { name: "Bookmiz", value: 12, color: "#14b8a6" },
    { name: "Profixer", value: 6, color: "#f59e0b" },
  ];

  const serviceData: ServiceData[] = [
    { service: "Event Bookings", bookings: 4523, revenue: 85600 },
    { service: "Home Services", bookings: 3891, revenue: 62400 },
    { service: "Food Delivery", bookings: 3214, revenue: 48200 },
    { service: "Tickets Sales", bookings: 2847, revenue: 71800 },
    { service: "Package Delivery", bookings: 1956, revenue: 32100 },
  ];

  const trendData: TrendData[] = [
    { value: 30 }, { value: 45 }, { value: 35 }, { value: 55 }, { value: 50 }, { value: 65 }
  ];

  const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, changeType, trend }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`flex items-center text-sm font-medium ${changeType === "increase" ? "text-green-500" : "text-red-500"}`}>
          {changeType === "increase" ? "↑" : "↓"} {change}
        </div>
      </div>
      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend}>
            <defs>
              <linearGradient id={`color${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={changeType === "increase" ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={changeType === "increase" ? "#10b981" : "#ef4444"} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke={changeType === "increase" ? "#10b981" : "#ef4444"} fillOpacity={1} fill={`url(#color${title})`} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <main className="flex-1 p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Total Bookings" value="28.4K" change="18.5%" changeType="increase" trend={trendData} />
        <MetricCard title="Active Users" value="19.5K" change="23.7%" changeType="increase" trend={trendData} />
        <MetricCard title="Platform Revenue" value="$268K" change="10.7%" changeType="increase" trend={trendData} />
        <MetricCard title="Completion Rate" value="94.8%" change="2.3%" changeType="increase" trend={trendData} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Revenue & User Growth</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg">Month</button>
              <button className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Year</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} name="Revenue ($)" />
              <Area type="monotone" dataKey="activeUsers" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} name="Active Users" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Revenue by Platform</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={platformData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {platformData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-600 dark:text-gray-300">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Service Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={serviceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis dataKey="service" type="category" stroke="#9ca3af" style={{ fontSize: '12px' }} width={120} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="bookings" fill="#6366f1" radius={[0, 8, 8, 0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Monthly Bookings Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Legend />
              <Line type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} name="Total Bookings" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  );
};

// Main Analytics Page Component
export default function AnalyticsPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeLink, setActiveLink] = useState<string>("Analytics");

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
        <AnalyticsContent />
      </Layout>
    </div>
  );
}