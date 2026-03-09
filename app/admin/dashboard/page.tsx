'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, TrendingUp, DollarSign, Clock, AlertCircle, PieChart as PieChartIcon } from 'lucide-react';
import {  Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminStatsCard } from '@/components/admin/AdminStatsCards';
import { AdminTable } from '@/components/admin/AdminTable';

// Mock data
const chartData = [
  { name: 'Jan', users: 2400, revenue: 2400 },
  { name: 'Feb', users: 3210, revenue: 1398 },
  { name: 'Mar', users: 2290, revenue: 9800 },
  { name: 'Apr', users: 2390, revenue: 3908 },
  { name: 'May', users: 3490, revenue: 4800 },
  { name: 'Jun', users: 3490, revenue: 3800 },
];

const recentActivityData = [
  {
    id: 1,
    user: 'john@example.com',
    activity: 'New Signup',
    date: '2024-03-05 10:30 AM',
  },
  {
    id: 2,
    user: 'alice@example.com',
    activity: 'Payment Submitted',
    date: '2024-03-05 9:15 AM',
  },
  {
    id: 3,
    user: 'bob@example.com',
    activity: 'Support Ticket Created',
    date: '2024-03-04 4:45 PM',
  },
  {
    id: 4,
    user: 'carol@example.com',
    activity: 'Trade Logged',
    date: '2024-03-04 2:20 PM',
  },
  {
    id: 5,
    user: 'dave@example.com',
    activity: 'New Signup',
    date: '2024-03-03 11:00 AM',
  },
];

const statsCards = [
  {
    icon: <Users size={24} />,
    title: 'Total Users',
    value: '1,234',
    trend: 12,
    color: 'primary' as const,
  },
  {
    icon: <UserCheck size={24} />,
    title: 'Active Users',
    value: '856',
    trend: 8,
    color: 'success' as const,
  },
  {
    icon: <TrendingUp size={24} />,
    title: 'Total Trades',
    value: '12,456',
    trend: 23,
    color: 'info' as const,
  },
  {
    icon: <DollarSign size={24} />,
    title: 'Total Revenue',
    value: '₹234,560',
    trend: 15,
    color: 'success' as const,
  },
  {
    icon: <Clock size={24} />,
    title: 'Pending Payments',
    value: '42',
    trend: -5,
    color: 'warning' as const,
  },
  {
    icon: <AlertCircle size={24} />,
    title: 'Support Tickets',
    value: '18',
    trend: -10,
    color: 'danger' as const,
  },
];

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your admin control panel</p>
      </motion.div>

      {/* Stats Cards Grid */}
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
        {/* User Growth Chart */}
        <motion.div
          className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Line  className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">User Growth</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <Line data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(0,209,255,0.3)' }} />
              <Line type="monotone" dataKey="users" stroke="#00D1FF" strokeWidth={2} dot={{ fill: '#00D1FF' }} />
            </Line>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue Chart */}
        <motion.div
          className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <DollarSign size={20} className="text-success" />
            <h3 className="text-lg font-semibold text-foreground">Revenue Chart</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(0,209,255,0.3)' }} />
              <Bar dataKey="revenue" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activity Table */}
      <motion.div
        className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-6">Recent Activity</h3>
        <AdminTable<(typeof recentActivityData)[0]>
          columns={[
            { key: 'user', label: 'User Email' },
            { key: 'activity', label: 'Activity' },
            { key: 'date', label: 'Date' },
          ]}
          data={recentActivityData}
        />
      </motion.div>
    </AdminLayout>
  );
}
