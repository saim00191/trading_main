'use client';

import React from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { ChartContainer } from '@/components/common/ChartContainer';
import { AlertCircle, Lightbulb, TrendingUp, Zap, BarChart3 } from 'lucide-react';
import { mockTrades, mockAnalyticsData } from '@/lib/mock-data';

export default function AiCoachPage() {
  const recentTrades = mockTrades.slice(0, 5);
  const analytics = mockAnalyticsData;

  // Calculate some metrics for insights
  const losingStreak = mockTrades.filter((t) => t.pnl < 0).length > 3 ? 4 : 0;
  const avgRiskPercent = mockTrades.reduce((sum, t) => sum + t.riskPercent, 0) / mockTrades.length;
  const overtradingThreshold = 5;
  const tradesThisWeek = mockTrades.length;

  const insights = [
    {
      type: 'positive',
      title: 'Strong Win Rate',
      description: 'Your win rate has improved by 3.2% this week. Keep maintaining your current strategy and risk management.',
      icon: TrendingUp,
    },
    {
      type: 'warning',
      title: 'Overtrading Alert',
      description: `You've taken ${tradesThisWeek} trades this week. Consider scaling back to maintain quality over quantity.`,
      icon: AlertCircle,
      show: tradesThisWeek > overtradingThreshold,
    },
    {
      type: 'positive',
      title: 'Risk Management',
      description: `Your average risk per trade is ${avgRiskPercent.toFixed(2)}%. This is within optimal parameters.`,
      icon: Zap,
    },
    {
      type: 'recommendation',
      title: 'Strategy Optimization',
      description: 'The MA Crossover strategy has shown the best performance. Consider allocating more capital to this approach.',
      icon: Lightbulb,
    },
  ].filter((i) => i.show !== false);

  const colorMap = {
    positive: 'border-success/30 bg-success/5',
    warning: 'border-warning/30 bg-warning/5',
    recommendation: 'border-primary/30 bg-primary/5',
  };

  const iconColorMap = {
    positive: 'text-success',
    warning: 'text-warning',
    recommendation: 'text-primary',
  };

  return (
    <DashboardLayout title="AI Coach" subtitle="Personalized trading insights and recommendations">
      {/* Key Insights */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-foreground">AI Insights</h2>

        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div
                key={index}
                className={`
                  animate-fade-in rounded-lg border p-4 transition-all duration-300
                  ${colorMap[insight.type]}
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-4">
                  <Icon className={`mt-1 flex-shrink-0 ${iconColorMap[insight.type]}`} size={24} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{insight.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pattern Analysis */}
      <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartContainer title="Behavior Pattern Detection" description="Your trading patterns and tendencies">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/10 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Best Trading Session</p>
                <p className="text-xs text-muted-foreground">When you perform best</p>
              </div>
              <span className="font-semibold text-primary">Europe Session</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/10 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Preferred Trade Type</p>
                <p className="text-xs text-muted-foreground">Most frequent setup</p>
              </div>
              <span className="font-semibold text-primary">Day Trading</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/10 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Emotional Control</p>
                <p className="text-xs text-muted-foreground">Emotional stability index</p>
              </div>
              <span className="font-semibold text-success">7.2/10</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/10 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Consistency Score</p>
                <p className="text-xs text-muted-foreground">Trade adherence to plan</p>
              </div>
              <span className="font-semibold text-success">8.5/10</span>
            </div>
          </div>
        </ChartContainer>

        <ChartContainer title="Risk Violation Detection" description="Compliance with your trading rules">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-success/20 bg-success/5 p-4">
              <span className="font-medium text-foreground">Daily Loss Limit Rule</span>
              <span className="rounded-full bg-success/20 px-3 py-1 text-xs font-semibold text-success">PASSED</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-success/20 bg-success/5 p-4">
              <span className="font-medium text-foreground">Max 2% Risk Per Trade</span>
              <span className="rounded-full bg-success/20 px-3 py-1 text-xs font-semibold text-success">PASSED</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-warning/20 bg-warning/5 p-4">
              <span className="font-medium text-foreground">No Revenge Trading</span>
              <span className="rounded-full bg-warning/20 px-3 py-1 text-xs font-semibold text-warning">CAUTION</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-success/20 bg-success/5 p-4">
              <span className="font-medium text-foreground">Position Sizing</span>
              <span className="rounded-full bg-success/20 px-3 py-1 text-xs font-semibold text-success">PASSED</span>
            </div>
          </div>
        </ChartContainer>
      </section>

      {/* Personalized Recommendations */}
      <section className="mb-8">
        <ChartContainer title="Personalized Recommendations" description="AI-generated suggestions for improvement">
          <div className="space-y-3">
            <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <Lightbulb className="mt-0.5 flex-shrink-0 text-primary" size={20} />
              <div>
                <p className="font-medium text-foreground">Increase Position Size by 10-15%</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your recent trading consistency has improved. Consider scaling up your position size to capitalize on your improved performance.
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <Lightbulb className="mt-0.5 flex-shrink-0 text-primary" size={20} />
              <div>
                <p className="font-medium text-foreground">Focus on EUR/USD Pair</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  EUR/USD has shown the best risk-reward ratio for your trading style. Consider allocating more capital to this pair.
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <Lightbulb className="mt-0.5 flex-shrink-0 text-primary" size={20} />
              <div>
                <p className="font-medium text-foreground">Trade Only During Europe Session</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your statistics show 65% higher profitability during the Europe session. Limit trading to this window for better results.
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-lg border border-warning/20 bg-warning/5 p-4">
              <AlertCircle className="mt-0.5 flex-shrink-0 text-warning" size={20} />
              <div>
                <p className="font-medium text-foreground">Reduce Revenge Trading</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  3 revenge trades detected this month. Implement a 30-minute cooling period after losses to prevent emotional decisions.
                </p>
              </div>
            </div>
          </div>
        </ChartContainer>
      </section>

      {/* Trading Psychology */}
      <section>
        <ChartContainer title="Trading Psychology Analysis" description="Emotional patterns and psychological insights">
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Emotional Stability</span>
                <span className="text-sm font-semibold text-primary">72%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[72%] bg-gradient-to-r from-primary to-success" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Discipline Score</span>
                <span className="text-sm font-semibold text-primary">85%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[85%] bg-gradient-to-r from-primary to-success" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Confidence Level</span>
                <span className="text-sm font-semibold text-primary">78%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[78%] bg-gradient-to-r from-primary to-success" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Risk Awareness</span>
                <span className="text-sm font-semibold text-primary">92%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[92%] bg-gradient-to-r from-primary to-success" />
              </div>
            </div>
          </div>
        </ChartContainer>
      </section>
    </DashboardLayout>
  );
}
