"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  TrendingUp,
  DollarSign,
  Clock,
  AlertCircle,
  LineChart,
} from "lucide-react";
import {
  LineChart as LineChartComponent,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminStatsCard } from "@/components/admin/AdminStatsCards";
import { AdminTable } from "@/components/admin/AdminTable";
import {
  getAdminDashboardStats,
  getRevenueChartData,
  getTradesChartData,
  type AdminDashboardStats,
  type RevenueChartData,
} from "@/lib/admin/adminDashboardService";

interface CardConfig {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: number;
  color: "primary" | "success" | "info" | "warning" | "danger";
}

export interface TradesChartData {
  date: string;
  trades: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [revenueChartData, setRevenueChartData] = useState<RevenueChartData[]>(
    [],
  );
  const [tradesChartData, setTradesChartData] = useState<TradesChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [dashboardStats, tradesData, revenueData] = await Promise.all([
          getAdminDashboardStats(),
          getTradesChartData(30), // last 30 days
          getRevenueChartData(30),
        ]);

        setStats(dashboardStats);
        setTradesChartData(tradesData);
        setRevenueChartData(revenueData);
      } catch (err) {
        console.error("[Dashboard] Error loading data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const statsCards: CardConfig[] = [
    {
      icon: <Users size={24} />,
      title: "Total Users",
      value: stats?.totalUsers.toLocaleString() || "0",
      trend: 12,
      color: "primary",
    },
    {
      icon: <UserCheck size={24} />,
      title: "Pro Users",
      value: stats?.totalProUsers.toLocaleString() || "0",
      trend: 8,
      color: "success",
    },
    {
      icon: <TrendingUp size={24} />,
      title: "Total Trades",
      value: stats?.totalTrades.toLocaleString() || "0",
      trend: 23,
      color: "info",
    },
    {
      icon: <Users size={24} />,
      title: "Total Support Requests",
      value: stats?.totalSupportRequests.toLocaleString() || "0",
      trend: 5,
      color: "info",
    },
    {
      icon: <Clock size={24} />,
      title: "Total Earnings",
      value: `Rs ${stats?.totalEarnings.toLocaleString() || "0"}`,
      trend: (stats?.totalEarnings ?? 0) > 0 ? 10 : -5,
      color: "warning",
    },
    {
      icon: <AlertCircle size={24} />,
      title: "Total Notifications",
      value: stats?.totalNotifications.toLocaleString() || "0",
      trend: 10,
      color: "info",
    },
  ];

  const recentActivityData = [
    {
      id: 1,
      user: "Recent activity",
      activity: "Loading...",
      date: new Date().toLocaleString(),
    },
  ];

  return (
    <AdminLayout>
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time platform analytics and metrics
        </p>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          className="p-4 bg-danger/10 border border-danger/50 rounded-lg text-danger mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.div>
      )}

      {/* Stats Cards Grid */}
      {!isLoading && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statsCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <AdminStatsCard {...card} />
              </motion.div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <motion.div
              className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <LineChart size={20} className="text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Platform Revenue
                </h3>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <LineChartComponent
                  data={
                    revenueChartData.length
                      ? revenueChartData
                      : [{ date: "N/A", revenue: 0 }]
                  }
                >
                  {/* Hide grid if you want minimal design */}
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  {/* X-axis can be minimal */}
                  <XAxis dataKey="date" hide />
                  {/* Y-axis shows revenue numbers */}
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  {/* Tooltip shows date and revenue */}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111118",
                      border: "1px solid rgba(0,209,255,0.3)",
                    }}
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  {/* Zig-zag line with dots */}
                  <Line
                    type="monotone" // makes line smooth, can use "linear" for sharp zig-zag
                    dataKey="revenue"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: "#10B981", r: 4 }}
                    activeDot={{ r: 6 }} // bigger dot on hover
                  />
                </LineChartComponent>
              </ResponsiveContainer>
            </motion.div>

            {/* Trades Chart */}
            <motion.div
              className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={20} className="text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Trades Over Time
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={
                    tradesChartData.length > 0
                      ? tradesChartData
                      : [{ date: "N/A", trades: 0 }]
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis stroke="rgba(255,255,255,0.5)" dataKey="date" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111118",
                      border: "1px solid rgba(0,209,255,0.3)",
                    }}
                  />
                  <Bar dataKey="trades" fill="#00D1FF" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Summary Stats */}
          <motion.div
            className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Platform Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Free Users</p>
                <p className="text-2xl font-bold text-primary">
                  {stats?.totalFreeUsers.toLocaleString() || "0"}
                </p>
              </div>
              {/* <div className="p-4 bg-success/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Pro Users</p>
                <p className="text-2xl font-bold text-success">{stats.activeProUsers}</p>
              </div> */}
              <div className="p-4 bg-info/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Pending Support Request
                </p>
                <p className="text-2xl font-bold text-info">
                  {stats?.pendingSupportRequests.toLocaleString() || "0"}
                </p>
              </div>
              <div className="p-4 bg-warning/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Pending Payment Approvals
                </p>
                <p className="text-2xl font-bold text-warning">
                  {stats?.pendingPayments.toLocaleString() || "0"}
                </p>
              </div>
              {/* <div className="p-4 bg-warning/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Gave Suggestion
                </p>
                <p className="text-2xl font-bold text-warning">
                  {stats.pendingPayments}
                </p>
              </div> */}
            </div>
          </motion.div>
        </>
      )}
    </AdminLayout>
  );
}
