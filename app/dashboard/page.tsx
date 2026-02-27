'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { MetricCard } from '@/components/common/MetricCard';
import { ChartContainer } from '@/components/common/ChartContainer';
import { TradeTable } from '@/components/common/TradeTable';
import { AnimatedButton } from '@/components/common/AnimatedButton';
import { TrendingUp, BarChart3, Target, Zap, AlertCircle, Plus } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mockDashboardMetrics, mockAnalyticsData } from '@/lib/mock-data';

export default function DashboardPage() {
  const [showNewTrade, setShowNewTrade] = useState(false);
  const metrics = mockDashboardMetrics;
  const analytics = mockAnalyticsData;

  const equityData = analytics.equityCurve;
  const strategyData = Object.entries(analytics.strategyPerformance).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <DashboardLayout title="Dashboard" subtitle="Monitor your trading performance at a glance">
      {/* Key Metrics */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Key Metrics</h2>
          <AnimatedButton variant="primary" size="sm" onClick={() => setShowNewTrade(true)} icon={<Plus size={18} />}>
            New Trade
          </AnimatedButton>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Account Balance"
            value={`$${metrics.accountBalance.toLocaleString()}`}
            change={4.9}
            color="primary"
            icon={<TrendingUp size={20} />}
          />
          <MetricCard
            label="Total Equity"
            value={`$${metrics.equity.toLocaleString()}`}
            change={4.9}
            color="success"
            icon={<BarChart3 size={20} />}
          />
          <MetricCard
            label="Total P&L"
            value={`$${metrics.totalPnL.toLocaleString()}`}
            change={Math.round((metrics.totalPnL / metrics.accountBalance) * 100 * 100) / 100}
            color="info"
            icon={<Zap size={20} />}
          />
          <MetricCard
            label="Win Rate"
            value={`${metrics.winRate.toFixed(1)}%`}
            change={2.3}
            color="success"
            icon={<Target size={20} />}
          />
        </div>
      </section>

      {/* Charts Row 1 */}
      <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Equity Curve */}
        <ChartContainer title="Equity Curve" description="Your account equity over time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={equityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 209, 255, 0.1)" />
              <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" />
              <YAxis stroke="rgba(255, 255, 255, 0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F1729',
                  border: '1px solid rgba(0, 209, 255, 0.3)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#00D1FF"
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Drawdown */}
        <ChartContainer title="Drawdown Analysis" description="Maximum loss from peak to trough">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={equityData}>
              <defs>
                <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 209, 255, 0.1)" />
              <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" />
              <YAxis stroke="rgba(255, 255, 255, 0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F1729',
                  border: '1px solid rgba(0, 209, 255, 0.3)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="value" stroke="#10B981" fillOpacity={1} fill="url(#colorDrawdown)" isAnimationActive={true} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </section>

      {/* Charts Row 2 */}
      <section className="mb-8">
        <ChartContainer title="Strategy Performance" description="P&L by trading strategy">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={strategyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 209, 255, 0.1)" />
              <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="rgba(255, 255, 255, 0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F1729',
                  border: '1px solid rgba(0, 209, 255, 0.3)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" fill="#00D1FF" isAnimationActive={true} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </section>

      {/* Additional Metrics */}
      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard label="Risk/Reward Avg" value={`${metrics.riskRewardAverage.toFixed(2)}`} color="info" />
        <MetricCard label="Max Drawdown" value={`${metrics.drawdown.toFixed(1)}%`} color="warning" />
        <MetricCard label="Active Trades" value={metrics.trades.length} color="primary" />
      </section>

      {/* Recent Trades */}
      <section className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-foreground">Recent Trades</h2>
        </div>
        <TradeTable trades={metrics.trades.slice(0, 5)} />
      </section>

      {/* AI Insights Card */}
      <section className="mb-8">
        <div className="rounded-lg border border-primary/30 bg-gradient-to-r from-primary/10 to-transparent p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="mt-1 flex-shrink-0 text-primary" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-foreground">AI Coach Insight</h3>
              <p className="mt-2 text-muted-foreground">
                Your win rate has improved by 3.2% this week. Consider scaling up your position size by 10-15% to take advantage of your improved trading consistency.
              </p>
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
