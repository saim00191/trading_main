'use client';

import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AdminLayout } from '@/components/admin/AdminLayout';

const userGrowthData = [
  { month: 'Jan', users: 400, premium: 240 },
  { month: 'Feb', users: 600, premium: 380 },
  { month: 'Mar', users: 850, premium: 520 },
  { month: 'Apr', users: 1200, premium: 750 },
  { month: 'May', users: 1500, premium: 920 },
  { month: 'Jun', users: 1850, premium: 1100 },
];

const tradesData = [
  { date: 'Mon', trades: 145 },
  { date: 'Tue', trades: 189 },
  { date: 'Wed', trades: 234 },
  { date: 'Thu', trades: 178 },
  { date: 'Fri', trades: 289 },
  { date: 'Sat', trades: 123 },
  { date: 'Sun', trades: 89 },
];

const profitLossData = [
  { name: 'Profitable', value: 65, color: '#10B981' },
  { name: 'Losing', value: 35, color: '#EF4444' },
];

const revenueData = [
  { month: 'Jan', revenue: 12000 },
  { month: 'Feb', revenue: 19000 },
  { month: 'Mar', revenue: 25000 },
  { month: 'Apr', revenue: 32000 },
  { month: 'May', revenue: 41000 },
  { month: 'Jun', revenue: 52000 },
];

export default function AdminAnalyticsPage() {
  return (
    <AdminLayout>
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-foreground mb-2">Platform Analytics</h1>
        <p className="text-muted-foreground">Monitor platform metrics and performance</p>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <motion.div
          className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-6">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(0,209,255,0.3)' }} />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#00D1FF" strokeWidth={2} dot={{ fill: '#00D1FF' }} name="Total Users" />
              <Line type="monotone" dataKey="premium" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} name="Premium Users" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Daily Trades Activity */}
        <motion.div
          className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-6">Daily Trades Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tradesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(0,209,255,0.3)' }} />
              <Bar dataKey="trades" fill="#00D1FF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Profit vs Loss Distribution */}
        <motion.div
          className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-6">Profit vs Loss Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={profitLossData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {profitLossData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(0,209,255,0.3)' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue Analytics */}
        <motion.div
          className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-6">Revenue Analytics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(0,209,255,0.3)' }} />
              <Bar dataKey="revenue" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
