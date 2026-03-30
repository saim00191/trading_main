'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { MetricCard } from '@/components/common/MetricCard';
import { ChartContainer } from '@/components/common/ChartContainer';
import { TradeTable } from '@/components/common/TradeTable';
import { TrendingUp, Target, Zap, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { ProtectedRoute } from './ProtectedRoute';
import { getTradesByUser } from '@/lib/trade_services';
import { useSelector } from 'react-redux';
import { selectUserEmail } from '@/store/UserLoggedInSlice';
import { Trade } from '@/lib/types';
import { toast } from 'sonner';
import { generateAICoachInsight } from '@/lib/aiCoach';

type TradeUI = {
  id?: string;
  date: string | Date;
  pair: string;
  type: 'BUY' | 'SELL';
  entry: number;
  exit: number | null;
  riskRewardRatio: number;
  pnl: number;
  status: 'OPEN' | 'CLOSED';
};

export default function DashboardPage() {


  const userEmail = useSelector(selectUserEmail);

  const [trades, setTrades] = useState<TradeUI[]>([]);
  const [loading, setLoading] = useState(true);

  const [totalTrades, setTotalTrades] = useState(0);
  const [winningTrades, setWinningTrades] = useState(0);
  const [losingTrades, setLosingTrades] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [lossRate, setLossRate] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalLoss, setTotalLoss] = useState(0);

  const [marketPerformance, setMarketPerformance] = useState<Record<string, number>>({});
  const [strategyPerformance, setStrategyPerformance] = useState<Record<string, number>>({});
  const [equityCurve, setEquityCurve] = useState<{ name: string; value: number }[]>([]);
      const [aiInsight, setAIInsight] = useState<string>('');

useEffect(() => {
  if (trades.length) {
    // Map TradeUI -> Trade (with defaults for missing fields)
    const tradesForAI: Trade[] = trades.map(t => ({
      id: t.id,
      opened_at: t.date,
      closed_at: t.date,      // if you don't track closed date separately
      pair: t.pair,
      side: t.type,           // 'BUY' | 'SELL'
      status: t.status,
      trade_type: 'DAY',      // default value
      market: 'FOREX',        // default or derived value
      exchange: 'Unknown',
      entry: t.entry,
      stop_loss: 0,
      take_profit: 0,
      exit_price: t.exit ?? 0,
      position_size: 0,
      risk_percent: 0,
      risk_reward: t.riskRewardRatio,
      pnl: t.pnl,
      pnl_percent: 0,
      strategy: 'Default',
      session: 'ASIA',
      tags: [],
      emotion_before: 5,
      emotion_after: 5,
      notes: '',
    }));

    const insight = generateAICoachInsight(tradesForAI);
    setAIInsight(insight);
  }
}, [trades]);


  useEffect(() => {

    const loadTrades = async () => {

      if (!userEmail) {
        setLoading(false);
        return;
      }

      try {

        const data: Trade[] = await getTradesByUser(userEmail);

        const mappedTrades: TradeUI[] = data.map((t) => ({
          id: t.id,
          date: t.opened_at,
          pair: t.pair,
          type: t.side,
          entry: t.entry,
          exit: t.exit_price ?? null,
          riskRewardRatio: t.risk_reward,
          pnl: t.pnl,
          status: t.status
        }));

        setTrades(mappedTrades);

        const total = data.length;

        const wins = data.filter(t => t.pnl > 0).length;
        const losses = data.filter(t => t.pnl < 0).length;

        const winRateCalc = total ? (wins / total) * 100 : 0;
        const lossRateCalc = total ? (losses / total) * 100 : 0;

        const profit = data
          .filter(t => t.pnl > 0)
          .reduce((sum, t) => sum + t.pnl, 0);

        const loss = data
          .filter(t => t.pnl < 0)
          .reduce((sum, t) => sum + t.pnl, 0);

        const marketPerf: Record<string, number> = {};
        const strategyPerf: Record<string, number> = {};
        const equity: { name: string; value: number }[] = [];

        let equityRunning = 0;

        data.forEach((t, idx) => {

          equityRunning += t.pnl;

          equity.push({
            name: `T${idx + 1}`,
            value: equityRunning
          });

          marketPerf[t.market] = (marketPerf[t.market] || 0) + t.pnl;
          strategyPerf[t.strategy] = (strategyPerf[t.strategy] || 0) + t.pnl;

        });

        setTotalTrades(total);
        setWinningTrades(wins);
        setLosingTrades(losses);
        setWinRate(winRateCalc);
        setLossRate(lossRateCalc);
        setTotalProfit(profit);
        setTotalLoss(loss);
        setMarketPerformance(marketPerf);
        setStrategyPerformance(strategyPerf);
        setEquityCurve(equity);

      } catch (err) {

        toast.error('Failed to load trades');

      } finally {

        setLoading(false);

      }

    };

    loadTrades();

  }, [userEmail]);

  if (loading) {

    return (
      <DashboardLayout title="Dashboard" subtitle="Loading...">
        <p>Loading trades...</p>
      </DashboardLayout>
    );

  }

  return (

    <ProtectedRoute>

      <DashboardLayout
        title="Dashboard"
        subtitle="Monitor your trading performance at a glance"
      >

        <section className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">

          <MetricCard
            label="Total Trades"
            value={totalTrades}
            color="primary"
            icon={<TrendingUp size={20} />}
          />

          <MetricCard
            label="Winning / Losing Trades"
            value={`${winningTrades} / ${losingTrades}`}
            change={winRate}
            color="success"
            icon={<Target size={20} />}
          />

          <MetricCard
            label="Win / Loss Rate"
            value={`${winRate.toFixed(1)}% / ${lossRate.toFixed(1)}%`}
            color="info"
            icon={<Zap size={20} />}
          />

        </section>

        <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">

          <MetricCard
            label="Total Profit"
            value={`$${totalProfit.toFixed(2)}`}
            color="success"
            icon={<ArrowUp size={20} />}
          />

          <MetricCard
            label="Total Loss"
            value={`$${Math.abs(totalLoss).toFixed(2)}`}
            color="danger"
            icon={<ArrowDown size={20} />}
          />

        </section>

        <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">

          <ChartContainer
            title="Market Performance"
            description="Profit by market"
          >

            <ResponsiveContainer width="100%" height={250}>

              <BarChart
                data={Object.entries(marketPerformance).map(([k, v]) => ({
                  name: k,
                  value: v
                }))}
              >

                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,209,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F1729',
                    border: '1px solid rgba(0,209,255,0.3)',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" fill="#00D1FF" />

              </BarChart>

            </ResponsiveContainer>

          </ChartContainer>

          <ChartContainer
            title="Strategy Performance"
            description="Profit by strategy"
          >

            <ResponsiveContainer width="100%" height={250}>

              <BarChart
                data={Object.entries(strategyPerformance).map(([k, v]) => ({
                  name: k,
                  value: v
                }))}
              >

                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,209,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F1729',
                    border: '1px solid rgba(0,209,255,0.3)',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" fill="#10B981" />

              </BarChart>

            </ResponsiveContainer>

          </ChartContainer>

        </section>

        <section className="mb-8">

          <div className="mb-4">
            <h2 className="text-xl font-bold text-foreground">
              Recent Trades
            </h2>
          </div>

          <TradeTable trades={trades.slice(0, 5)} />

        </section>

      <section className="mb-8">
  <div className="rounded-lg border border-primary/30 bg-gradient-to-r from-primary/10 to-transparent p-6">
    <div className="flex items-start gap-4">
      <AlertCircle className="mt-1 flex-shrink-0 text-primary" size={24} />
      <div>
        <h3 className="text-lg font-semibold text-foreground">AI Coach Insight</h3>
        <p className="mt-2 text-muted-foreground">
          {aiInsight || 'Analyzing your trades...'}
        </p>
      </div>
    </div>
  </div>
</section>

      </DashboardLayout>

    </ProtectedRoute>

  );

}
