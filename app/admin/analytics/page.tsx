
'use client';

import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getAllTrades, getTradeStats } from '@/lib/admin/adminTradesService';
import { getAllPayments, getPaymentStats } from '@/lib/admin/adminPaymentsService';
import { getAllUsers } from '@/lib/admin/adminUsersService';
import { supabase } from '@/lib/supabaseClient';


interface UserGrowthData {
  date: string;
  users: number;
  premium: number;
}

interface TradeActivityData {
  date: string;
  trades: number;
}

interface ProfitLossData {
  name: string;
  value: number;
  color: string;
}

interface RevenueData {
  month: string;
  revenue: number;
}

export default function AdminAnalyticsPage() {
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([]);
  const [tradesData, setTradesData] = useState<TradeActivityData[]>([]);
  const [profitLossData, setProfitLossData] = useState<ProfitLossData[]>([
    { name: 'Profitable', value: 0, color: '#10B981' },
    { name: 'Losing', value: 0, color: '#EF4444' },
  ]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      // ========================
      // 1. USERS DATA
      // ========================
      const usersRes = await getAllUsers();
      const users = usersRes.users;

      const usersMap = new Map<string, number>();

      users.forEach((user) => {
        const date = new Date(user.created_at)
          .toISOString()
          .split('T')[0];

        usersMap.set(date, (usersMap.get(date) || 0) + 1);
      });

      const userGrowth = Array.from(usersMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({
          date,
          users: count,
          premium: Math.round(count * 0.5),
        }));

      setUserGrowthData(userGrowth);

      // ========================
      // 2. TRADES DATA
      // ========================
      const tradesRes = await getAllTrades();
      const trades = tradesRes.trades;

      const tradesMap = new Map<string, number>();

      trades.forEach((trade) => {
        const date = new Date(trade.opened_at)
          .toISOString()
          .split('T')[0];

        tradesMap.set(date, (tradesMap.get(date) || 0) + 1);
      });

      const tradesActivity = Array.from(tradesMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({
          date,
          trades: count,
        }));

      setTradesData(tradesActivity);

      // ========================
      // 3. PROFIT / LOSS
      // ========================
      const winners = trades.filter((t) => t.pnl > 0).length;
      const losers = trades.filter((t) => t.pnl <= 0).length;
      const total = trades.length || 1;

      setProfitLossData([
        {
          name: 'Profitable',
          value: Math.round((winners / total) * 100),
          color: '#10B981',
        },
        {
          name: 'Losing',
          value: Math.round((losers / total) * 100),
          color: '#EF4444',
        },
      ]);

      // ========================
      // 4. PAYMENTS / REVENUE
      // ========================
      const paymentsRes = await getAllPayments();
      const payments = paymentsRes.payments;

      const revenueMap = new Map<string, number>();

      payments
        .filter((p) => p.status === 'Approved')
        .forEach((payment) => {
          const month = new Date(payment.created_at).toLocaleDateString(
            'en-US',
            { month: 'short' }
          );

          revenueMap.set(
            month,
            (revenueMap.get(month) || 0) + payment.amount
          );
        });

      const revenue = Array.from(revenueMap.entries()).map(
        ([month, amount]) => ({
          month,
          revenue: amount,
        })
      );

      setRevenueData(revenue);
    } catch (error) {
      console.error('[analytics] fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();

  // ========================
  // REALTIME SUBSCRIPTIONS
  // ========================
  const channel = supabase.channel('analytics-realtime');

  channel
    .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchData)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'trades' }, fetchData)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'records_of_payment' }, fetchData)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

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
            <LineChart data={userGrowthData.length > 0 ? userGrowthData : [{ date: 'No data', users: 0, premium: 0 }]}>
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
            <BarChart data={tradesData.length > 0 ? tradesData : [{ date: 'No data', trades: 0 }]}>
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
            <BarChart data={revenueData.length > 0 ? revenueData : [{ month: 'No data', revenue: 0 }]}>
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



// 'use client';

// import { motion } from 'framer-motion';
// import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { AdminLayout } from '@/components/admin/AdminLayout';

// const userGrowthData = [
//   { month: 'Jan', users: 400, premium: 240 },
//   { month: 'Feb', users: 600, premium: 380 },
//   { month: 'Mar', users: 850, premium: 520 },
//   { month: 'Apr', users: 1200, premium: 750 },
//   { month: 'May', users: 1500, premium: 920 },
//   { month: 'Jun', users: 1850, premium: 1100 },
// ];

// const tradesData = [
//   { date: 'Mon', trades: 145 },
//   { date: 'Tue', trades: 189 },
//   { date: 'Wed', trades: 234 },
//   { date: 'Thu', trades: 178 },
//   { date: 'Fri', trades: 289 },
//   { date: 'Sat', trades: 123 },
//   { date: 'Sun', trades: 89 },
//   { date: 'Thu', trades: 178 },
//   { date: 'Fri', trades: 289 },
//   { date: 'Sat', trades: 123 },
//   { date: 'Sun', trades: 89 },
//   { date: 'Mon', trades: 145 },
//   { date: 'Tue', trades: 189 },
//   { date: 'Wed', trades: 234 },
//   { date: 'Thu', trades: 178 },
//   { date: 'Fri', trades: 289 },
//   { date: 'Sat', trades: 123 },
//   { date: 'Sun', trades: 89 },
//   { date: 'Thu', trades: 178 },
//   { date: 'Fri', trades: 289 },
//   { date: 'Sat', trades: 123 },
//   { date: 'Sun', trades: 89 },
// ];

// const profitLossData = [
//   { name: 'Profitable', value: 65, color: '#10B981' },
//   { name: 'Losing', value: 35, color: '#EF4444' },
// ];

// const revenueData = [
//   { month: 'Jan', revenue: 12000 },
//   { month: 'Feb', revenue: 19000 },
//   { month: 'Mar', revenue: 25000 },
//   { month: 'Apr', revenue: 32000 },
//   { month: 'May', revenue: 41000 },
//   { month: 'Jun', revenue: 52000 },
// ];

// export default function AdminAnalyticsPage() {
//   return (
//     <AdminLayout>
//       {/* Header */}
//       <motion.div
//         className="mb-8"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//       >
//         <h1 className="text-4xl font-bold text-foreground mb-2">Platform Analytics</h1>
//         <p className="text-muted-foreground">Monitor platform metrics and performance</p>
//       </motion.div>

//       {/* Charts Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* User Growth */}
//         <motion.div
//           className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//         >
//           <h3 className="text-lg font-semibold text-foreground mb-6">User Growth</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={userGrowthData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
//               <XAxis stroke="rgba(255,255,255,0.5)" />
//               <YAxis stroke="rgba(255,255,255,0.5)" />
//               <Tooltip contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(0,209,255,0.3)' }} />
//               <Legend />
//               <Line type="monotone" dataKey="users" stroke="#00D1FF" strokeWidth={2} dot={{ fill: '#00D1FF' }} name="Total Users" />
//               <Line type="monotone" dataKey="premium" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} name="Premium Users" />
//             </LineChart>
//           </ResponsiveContainer>
//         </motion.div>

//         {/* Daily Trades Activity */}
//         <motion.div
//           className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//         >
//           <h3 className="text-lg font-semibold text-foreground mb-6">Daily Trades Activity</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={tradesData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
//               <XAxis stroke="rgba(255,255,255,0.5)" />
//               <YAxis stroke="rgba(255,255,255,0.5)" />
//               <Tooltip contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(0,209,255,0.3)' }} />
//               <Bar dataKey="trades" fill="#00D1FF" radius={[8, 8, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </motion.div>

//         {/* Profit vs Loss Distribution */}
//         <motion.div
//           className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3 }}
//         >
//           <h3 className="text-lg font-semibold text-foreground mb-6">Profit vs Loss Distribution</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie
//                 data={profitLossData}
//                 cx="50%"
//                 cy="50%"
//                 labelLine={false}
//                 label={({ name, value }) => `${name}: ${value}%`}
//                 outerRadius={80}
//                 fill="#8884d8"
//                 dataKey="value"
//               >
//                 {profitLossData.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={entry.color} />
//                 ))}
//               </Pie>
//               <Tooltip contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(0,209,255,0.3)' }} />
//             </PieChart>
//           </ResponsiveContainer>
//         </motion.div>

//         {/* Revenue Analytics */}
//         <motion.div
//           className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.4 }}
//         >
//           <h3 className="text-lg font-semibold text-foreground mb-6">Revenue Analytics</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={revenueData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
//               <XAxis stroke="rgba(255,255,255,0.5)" />
//               <YAxis stroke="rgba(255,255,255,0.5)" />
//               <Tooltip contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(0,209,255,0.3)' }} />
//               <Bar dataKey="revenue" fill="#10B981" radius={[8, 8, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </motion.div>
//       </div>
//     </AdminLayout>
//   );
// }
