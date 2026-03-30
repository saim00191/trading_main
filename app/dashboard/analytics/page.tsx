'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUserEmail } from '@/store/UserLoggedInSlice';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { MetricCard } from '@/components/common/MetricCard';
import { ChartContainer } from '@/components/common/ChartContainer';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Target, Zap, BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

type Trade = {
  id: string;
  email: string;
  opened_at: string;
  closed_at: string;
  pnl: number;
  strategy: string;
  pair: string;
  session: string;
  trade_type: 'SCALP' | 'DAY' | 'SWING';
};

export default function AnalyticsPage() {
  const userEmail = useSelector(selectUserEmail);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrades = async () => {
      if (!userEmail) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('useremail', userEmail)
        .order('closed_at', { ascending: true });

      if (error) {
        console.error('Failed to fetch trades:', error);
      } else {
        setTrades(data || []);
      }

      setLoading(false);
    };

    fetchTrades();
  }, [userEmail]);

  if (loading) {
    return (
      <DashboardLayout title="Performance Analytics" subtitle="Loading...">
        <p>Loading analytics...</p>
      </DashboardLayout>
    );
  }

  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => t.pnl > 0).length;
  const losingTrades = trades.filter((t) => t.pnl < 0).length;

  const winLossData = [
    { name: 'Wins', value: winningTrades, fill: '#10B981' },
    { name: 'Losses', value: losingTrades, fill: '#EF4444' },
  ];

  const strategyPerf = trades.reduce((acc: Record<string, number>, t) => {
    acc[t.strategy] = (acc[t.strategy] || 0) + t.pnl;
    return acc;
  }, {});
  const strategyData = Object.entries(strategyPerf).map(([name, value]) => ({ name, value }));

  const pairPerf = trades.reduce((acc: Record<string, number>, t) => {
    acc[t.pair] = (acc[t.pair] || 0) + t.pnl;
    return acc;
  }, {});
  const pairData = Object.entries(pairPerf).map(([name, value]) => ({ name, value }));

  const sessionPerf = trades.reduce((acc: Record<string, number>, t) => {
    acc[t.session] = (acc[t.session] || 0) + t.pnl;
    return acc;
  }, {});
  const sessionData = Object.entries(sessionPerf).map(([name, value]) => ({ name, value }));

  let equity = 0;
  const equityData = trades.map((t, i) => {
    equity += t.pnl;
    return { name: `T${i + 1}`, value: equity };
  });

  const totalProfit = trades.filter((t) => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
  const totalLoss = Math.abs(trades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));
  const profitFactor = totalProfit / (totalLoss || 1);
  const avgWin = winningTrades ? totalProfit / winningTrades : 0;
  const avgLoss = losingTrades ? totalLoss / losingTrades : 0;
  const expectancy = totalTrades ? (totalProfit - totalLoss) / totalTrades : 0;

  const scalpCount = trades.filter((t) => t.trade_type === 'SCALP').length;
  const dayCount = trades.filter((t) => t.trade_type === 'DAY').length;
  const swingCount = trades.filter((t) => t.trade_type === 'SWING').length;

  return (
    <DashboardLayout title="Performance Analytics" subtitle="Deep dive into your trading statistics">
      {/* Key Metrics */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-foreground">Key Statistics</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Trades" value={totalTrades} color="primary" icon={<BarChart3 size={20} />} />
          <MetricCard
            label="Win Rate"
            value={`${((winningTrades / totalTrades) * 100).toFixed(1)}%`}
            color="success"
            icon={<Target size={20} />}
          />
          <MetricCard label="Profit Factor" value={profitFactor.toFixed(2)} color="info" icon={<Zap size={20} />} />
          <MetricCard label="Expectancy" value={`$${expectancy.toFixed(2)}`} color="primary" icon={<TrendingUp size={20} />} />
        </div>
      </section>

      {/* Charts Row 1: Equity Curve + Win/Loss */}
      <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartContainer title="Equity Curve" description="Account growth over time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={equityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 209, 255, 0.1)" />
              <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" />
              <YAxis stroke="rgba(255, 255, 255, 0.5)" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F1729', border: '1px solid rgba(0, 209, 255, 0.3)', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="value" stroke="#00D1FF" strokeWidth={2} dot={false} isAnimationActive />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

<ChartContainer title="Win/Loss Distribution" description="Total winning vs losing trades">
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={winLossData}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, value }) => (
          <text fill="#ffffff">{`${name}: ${value}`}</text>
        )}
        outerRadius={80}
        dataKey="value"
      >
        {winLossData.map((entry, index) => (
          <Cell key={index} fill={entry.fill} />
        ))}
      </Pie>

      <Tooltip
        contentStyle={{
          backgroundColor: '#0F1729',
          border: '1px solid rgba(0, 209, 255, 0.3)',
          borderRadius: '8px',
          color: '#ffffff'
        }}
        itemStyle={{ color: '#ffffff' }}
        labelStyle={{ color: '#ffffff' }}
      />
    </PieChart>
  </ResponsiveContainer>
</ChartContainer>
      </section>

      {/* Charts Row 2: Strategy & Pair Performance */}
      <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartContainer title="Strategy Performance" description="Profits by trading strategy">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={strategyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 209, 255, 0.1)" />
              <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="rgba(255, 255, 255, 0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#0F1729', border: '1px solid rgba(0, 209, 255, 0.3)', borderRadius: '8px' }} labelStyle={{ color: '#fff' }} />
              <Bar dataKey="value" fill="#00D1FF" isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Pair Performance" description="Profits by currency pair">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pairData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 209, 255, 0.1)" />
              <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" />
              <YAxis stroke="rgba(255, 255, 255, 0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#0F1729', border: '1px solid rgba(0, 209, 255, 0.3)', borderRadius: '8px' }} labelStyle={{ color: '#fff' }} />
              <Bar dataKey="value" fill="#10B981" isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </section>

      {/* Charts Row 3: Session Performance */}
   <section className="mb-8">
  <ChartContainer title="Session Performance" description="Profits by trading session">
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={sessionData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 209, 255, 0.1)" />

        <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" />
        <YAxis stroke="rgba(255, 255, 255, 0.5)" />

        <Tooltip
          contentStyle={{
            backgroundColor: "#0F1729",
            border: "1px solid rgba(0, 209, 255, 0.3)",
            borderRadius: "8px",
            color: "#fff",
          }}
          itemStyle={{ color: "#fff" }}
          labelStyle={{ color: "#fff" }}
        />

        <Bar
          dataKey="value"
          isAnimationActive={true}
          animationDuration={500}   // ✅ smaller hover feel
        >
          {sessionData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.value >= 0 ? "#22C55E" : "#EF4444"} // green / red
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </ChartContainer>
</section>

      {/* Summary Statistics */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-foreground">Trade Statistics</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Profit Summary */}
          <div className="rounded-lg border border-border/50 bg-card p-6">
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">Profit Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Profit:</span>
                <span className="font-semibold text-success">${totalProfit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Loss:</span>
                <span className="font-semibold text-danger">${totalLoss.toFixed(2)}</span>
              </div>
              <div className="border-t border-border/50 pt-3 flex justify-between">
                <span className="text-foreground font-medium">Net P&L:</span>
                <span className="font-semibold text-primary">${(totalProfit - totalLoss).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Average Metrics */}
          <div className="rounded-lg border border-border/50 bg-card p-6">
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">Average Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Win:</span>
                <span className="font-semibold text-success">${avgWin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Loss:</span>
                <span className="font-semibold text-danger">${avgLoss.toFixed(2)}</span>
              </div>
              <div className="border-t border-border/50 pt-3 flex justify-between">
                <span className="text-foreground font-medium">Ratio:</span>
                <span className="font-semibold text-primary">{(avgWin / avgLoss).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Trade Types */}
          <div className="rounded-lg border border-border/50 bg-card p-6">
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">Trade Types</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scalps:</span>
                <span className="font-semibold text-foreground">{scalpCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Day Trades:</span>
                <span className="font-semibold text-foreground">{dayCount}</span>
              </div>
              <div className="border-t border-border/50 pt-3 flex justify-between">
                <span className="text-foreground font-medium">Swings:</span>
                <span className="font-semibold">{swingCount}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}


// 'use client';

// import React from 'react';
// import { DashboardLayout } from '@/components/common/DashboardLayout';
// import { MetricCard } from '@/components/common/MetricCard';
// import { ChartContainer } from '@/components/common/ChartContainer';
// import { LineChart, Line, PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { mockAnalyticsData, mockTrades } from '@/lib/mock-data';
// import { TrendingUp, Target, Zap, BarChart3 } from 'lucide-react';

// export default function AnalyticsPage() {
//   const analytics = mockAnalyticsData;

//   const winLossData = [
//     { name: 'Wins', value: analytics.winningTrades, fill: '#10B981' },
//     { name: 'Losses', value: analytics.losingTrades, fill: '#EF4444' },
//   ];

//   const strategyData = Object.entries(analytics.strategyPerformance).map(([name, value]) => ({
//     name,
//     value,
//   }));

//   const pairData = Object.entries(analytics.pairPerformance).map(([name, value]) => ({
//     name,
//     value,
//   }));

//   const sessionData = Object.entries(analytics.sessionPerformance).map(([name, value]) => ({
//     name,
//     value,
//   }));

//   const equityData = analytics.equityCurve;

//   // Calculate statistics
//   const totalProfit = mockTrades.filter((t) => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
//   const totalLoss = Math.abs(mockTrades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));
//   const profitFactor = totalProfit / (totalLoss || 1);

//   return (
//     <DashboardLayout title="Performance Analytics" subtitle="Deep dive into your trading statistics">
//       {/* Key Metrics */}
//       <section className="mb-8">
//         <h2 className="mb-4 text-xl font-bold text-foreground">Key Statistics</h2>

//         <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
//           <MetricCard
//             label="Total Trades"
//             value={analytics.totalTrades}
//             color="primary"
//             icon={<BarChart3 size={20} />}
//           />
//           <MetricCard
//             label="Win Rate"
//             value={`${((analytics.winningTrades / analytics.totalTrades) * 100).toFixed(1)}%`}
//             color="success"
//             icon={<Target size={20} />}
//           />
//           <MetricCard
//             label="Profit Factor"
//             value={profitFactor.toFixed(2)}
//             color="info"
//             icon={<Zap size={20} />}
//           />
//           <MetricCard
//             label="Expectancy"
//             value={`$${analytics.expectancy.toFixed(2)}`}
//             color="primary"
//             icon={<TrendingUp size={20} />}
//           />
//         </div>
//       </section>

//       {/* Charts Row 1: Equity Curve + Win/Loss */}
//       <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
//         <ChartContainer title="Equity Curve" description="Account growth over time">
//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={equityData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 209, 255, 0.1)" />
//               <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" />
//               <YAxis stroke="rgba(255, 255, 255, 0.5)" />
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: '#0F1729',
//                   border: '1px solid rgba(0, 209, 255, 0.3)',
//                   borderRadius: '8px',
//                 }}
//                 labelStyle={{ color: '#fff' }}
//               />
//               <Line
//                 type="monotone"
//                 dataKey="value"
//                 stroke="#00D1FF"
//                 strokeWidth={2}
//                 dot={false}
//                 isAnimationActive={true}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </ChartContainer>

//         <ChartContainer title="Win/Loss Distribution" description="Total winning vs losing trades">
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie
//                 data={winLossData}
//                 cx="50%"
//                 cy="50%"
//                 labelLine={false}
//                 label={({ name, value }) => `${name}: ${value}`}
//                 outerRadius={80}
//                 fill="#00D1FF"
//                 dataKey="value"
//                 isAnimationActive={true}
//               >
//                 {winLossData.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={entry.fill} />
//                 ))}
//               </Pie>
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: '#0F1729',
//                   border: '1px solid rgba(0, 209, 255, 0.3)',
//                   borderRadius: '8px',
//                 }}
//                 labelStyle={{ color: '#fff' }}
//               />
//             </PieChart>
//           </ResponsiveContainer>
//         </ChartContainer>
//       </section>

//       {/* Charts Row 2: Strategy & Pair Performance */}
//       <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
//         <ChartContainer title="Strategy Performance" description="Profits by trading strategy">
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={strategyData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 209, 255, 0.1)" />
//               <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" angle={-45} textAnchor="end" height={80} />
//               <YAxis stroke="rgba(255, 255, 255, 0.5)" />
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: '#0F1729',
//                   border: '1px solid rgba(0, 209, 255, 0.3)',
//                   borderRadius: '8px',
//                 }}
//                 labelStyle={{ color: '#fff' }}
//               />
//               <Bar dataKey="value" fill="#00D1FF" isAnimationActive={true} />
//             </BarChart>
//           </ResponsiveContainer>
//         </ChartContainer>

//         <ChartContainer title="Pair Performance" description="Profits by currency pair">
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={pairData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 209, 255, 0.1)" />
//               <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" />
//               <YAxis stroke="rgba(255, 255, 255, 0.5)" />
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: '#0F1729',
//                   border: '1px solid rgba(0, 209, 255, 0.3)',
//                   borderRadius: '8px',
//                 }}
//                 labelStyle={{ color: '#fff' }}
//               />
//               <Bar dataKey="value" fill="#10B981" isAnimationActive={true} />
//             </BarChart>
//           </ResponsiveContainer>
//         </ChartContainer>
//       </section>

//       {/* Charts Row 3: Session Performance */}
//       <section className="mb-8">
//         <ChartContainer title="Session Performance" description="Profits by trading session">
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={sessionData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 209, 255, 0.1)" />
//               <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" />
//               <YAxis stroke="rgba(255, 255, 255, 0.5)" />
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: '#0F1729',
//                   border: '1px solid rgba(0, 209, 255, 0.3)',
//                   borderRadius: '8px',
//                 }}
//                 labelStyle={{ color: '#fff' }}
//               />
//               <Bar dataKey="value" fill="#F59E0B" isAnimationActive={true} />
//             </BarChart>
//           </ResponsiveContainer>
//         </ChartContainer>
//       </section>

//       {/* Summary Statistics */}
//       <section className="mb-8">
//         <h2 className="mb-4 text-xl font-bold text-foreground">Trade Statistics</h2>

//         <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
//           <div className="rounded-lg border border-border/50 bg-card p-6">
//             <h3 className="mb-4 text-sm font-medium text-muted-foreground">Profit Summary</h3>
//             <div className="space-y-3">
//               <div className="flex justify-between">
//                 <span className="text-muted-foreground">Total Profit:</span>
//                 <span className="font-semibold text-success">${totalProfit.toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-muted-foreground">Total Loss:</span>
//                 <span className="font-semibold text-danger">${totalLoss.toFixed(2)}</span>
//               </div>
//               <div className="border-t border-border/50 pt-3 flex justify-between">
//                 <span className="text-foreground font-medium">Net P&L:</span>
//                 <span className="font-semibold text-primary">${(totalProfit - totalLoss).toFixed(2)}</span>
//               </div>
//             </div>
//           </div>

//           <div className="rounded-lg border border-border/50 bg-card p-6">
//             <h3 className="mb-4 text-sm font-medium text-muted-foreground">Average Metrics</h3>
//             <div className="space-y-3">
//               <div className="flex justify-between">
//                 <span className="text-muted-foreground">Avg Win:</span>
//                 <span className="font-semibold text-success">${analytics.avgWin.toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-muted-foreground">Avg Loss:</span>
//                 <span className="font-semibold text-danger">${analytics.avgLoss.toFixed(2)}</span>
//               </div>
//               <div className="border-t border-border/50 pt-3 flex justify-between">
//                 <span className="text-foreground font-medium">Ratio:</span>
//                 <span className="font-semibold text-primary">{(analytics.avgWin / analytics.avgLoss).toFixed(2)}</span>
//               </div>
//             </div>
//           </div>

//           <div className="rounded-lg border border-border/50 bg-card p-6">
//             <h3 className="mb-4 text-sm font-medium text-muted-foreground">Trade Types</h3>
//             <div className="space-y-3">
//               <div className="flex justify-between">
//                 <span className="text-muted-foreground">Scalps:</span>
//                 <span className="font-semibold text-foreground">{mockTrades.filter((t) => t.tradeType === 'SCALP').length}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-muted-foreground">Day Trades:</span>
//                 <span className="font-semibold text-foreground">{mockTrades.filter((t) => t.tradeType === 'DAY').length}</span>
//               </div>
//               <div className="border-t border-border/50 pt-3 flex justify-between">
//                 <span className="text-foreground font-medium">Swings:</span>
//                 <span className="font-semibold">{mockTrades.filter((t) => t.tradeType === 'SWING').length}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </DashboardLayout>
//   );
// }
