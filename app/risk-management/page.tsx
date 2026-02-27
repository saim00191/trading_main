'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { ChartContainer } from '@/components/common/ChartContainer';
import { MetricCard } from '@/components/common/MetricCard';
import { AnimatedButton } from '@/components/common/AnimatedButton';
import { Modal } from '@/components/common/Modal';
import { AlertCircle, Calculator, Target, TrendingDown } from 'lucide-react';

export default function RiskManagementPage() {
  const [showRiskCalc, setShowRiskCalc] = useState(false);
  const [showPosCalc, setShowPosCalc] = useState(false);
  const [riskCalcResult, setRiskCalcResult] = useState<any>(null);
  const [posCalcResult, setPosCalcResult] = useState<any>(null);

  const handleRiskCalc = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const account = parseFloat(formData.get('account') as string);
    const riskPercent = parseFloat(formData.get('riskPercent') as string);

    setRiskCalcResult({
      riskAmount: (account * (riskPercent / 100)).toFixed(2),
      account,
      riskPercent,
    });
  };

  const handlePosCalc = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const entry = parseFloat(formData.get('entry') as string);
    const stop = parseFloat(formData.get('stop') as string);
    const riskAmount = parseFloat(formData.get('riskAmount') as string);

    const pipDifference = Math.abs(entry - stop);
    const posSize = (riskAmount / pipDifference).toFixed(2);

    setPosCalcResult({
      entry,
      stop,
      riskAmount,
      pipDifference: pipDifference.toFixed(4),
      posSize,
    });
  };

  return (
    <DashboardLayout title="Risk Management" subtitle="Manage and monitor your trading risk">
      {/* Key Metrics */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-foreground">Risk Summary</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Daily Loss Limit"
            value="$500"
            color="info"
            icon={<Target size={20} />}
          />
          <MetricCard
            label="Current Daily Loss"
            value="$120"
            change={-10}
            color="success"
            icon={<TrendingDown size={20} />}
          />
          <MetricCard
            label="Max Drawdown Limit"
            value="10%"
            color="warning"
            icon={<AlertCircle size={20} />}
          />
          <MetricCard
            label="Current Drawdown"
            value="3.2%"
            color="success"
            icon={<TrendingDown size={20} />}
          />
        </div>
      </section>

      {/* Calculators */}
      <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Risk Calculator */}
        <ChartContainer title="Risk Size Calculator" description="Calculate position size based on risk percentage">
          <div className="space-y-4">
            <form onSubmit={handleRiskCalc} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Account Balance ($)</label>
                <input
                  type="number"
                  name="account"
                  placeholder="50000"
                  step="100"
                  required
                  className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Risk Percentage (%)</label>
                <input
                  type="number"
                  name="riskPercent"
                  placeholder="2.00"
                  step="0.1"
                  required
                  className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <AnimatedButton type="submit" variant="primary" className="w-full">
                Calculate Risk Amount
              </AnimatedButton>
            </form>

            {riskCalcResult && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <h4 className="mb-3 font-semibold text-foreground">Risk Calculation Result</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Balance:</span>
                    <span className="font-semibold text-foreground">${riskCalcResult.account.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Percentage:</span>
                    <span className="font-semibold text-foreground">{riskCalcResult.riskPercent}%</span>
                  </div>
                  <div className="border-t border-primary/20 pt-2 flex justify-between">
                    <span className="text-foreground font-medium">Risk Amount per Trade:</span>
                    <span className="font-bold text-primary text-lg">${riskCalcResult.riskAmount}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ChartContainer>

        {/* Position Size Calculator */}
        <ChartContainer title="Position Size Calculator" description="Calculate lot size based on risk amount">
          <div className="space-y-4">
            <form onSubmit={handlePosCalc} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Entry Price</label>
                <input
                  type="number"
                  name="entry"
                  placeholder="1.0500"
                  step="0.0001"
                  required
                  className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Stop Loss Price</label>
                <input
                  type="number"
                  name="stop"
                  placeholder="1.0480"
                  step="0.0001"
                  required
                  className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Risk Amount ($)</label>
                <input
                  type="number"
                  name="riskAmount"
                  placeholder="100"
                  step="10"
                  required
                  className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <AnimatedButton type="submit" variant="primary" className="w-full">
                Calculate Position Size
              </AnimatedButton>
            </form>

            {posCalcResult && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <h4 className="mb-3 font-semibold text-foreground">Position Size Result</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Entry Price:</span>
                    <span className="font-semibold text-foreground">{posCalcResult.entry}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Stop Loss:</span>
                    <span className="font-semibold text-foreground">{posCalcResult.stop}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pip Difference:</span>
                    <span className="font-semibold text-foreground">{posCalcResult.pipDifference}</span>
                  </div>
                  <div className="border-t border-primary/20 pt-2 flex justify-between">
                    <span className="text-foreground font-medium">Position Size (Lots):</span>
                    <span className="font-bold text-primary text-lg">{posCalcResult.posSize}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ChartContainer>
      </section>

      {/* Risk Limits */}
      <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartContainer title="Daily Loss Limit Tracker" description="Monitor your daily loss against your limit">
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Daily Loss Limit</span>
                <span className="text-sm font-semibold text-foreground">$500.00</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[24%] bg-success" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Current: $120.00 (24%)</p>
            </div>

            <div className="rounded-lg border border-success/20 bg-success/5 p-4">
              <p className="text-sm text-foreground">You have $380.00 remaining before hitting your daily loss limit.</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trades Today:</span>
                <span className="font-semibold text-foreground">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wins:</span>
                <span className="font-semibold text-success">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Losses:</span>
                <span className="font-semibold text-danger">1</span>
              </div>
            </div>
          </div>
        </ChartContainer>

        <ChartContainer title="Maximum Drawdown Monitor" description="Track maximum loss from peak equity">
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Max Drawdown Limit</span>
                <span className="text-sm font-semibold text-foreground">10%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[32%] bg-warning" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Current: 3.2% (32% of limit)</p>
            </div>

            <div className="rounded-lg border border-success/20 bg-success/5 p-4">
              <p className="text-sm text-foreground">You are safe. Your current drawdown is well within acceptable limits.</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Peak Equity:</span>
                <span className="font-semibold text-foreground">$52,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Equity:</span>
                <span className="font-semibold text-foreground">$50,820</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loss from Peak:</span>
                <span className="font-semibold text-warning">$1,680 (3.2%)</span>
              </div>
            </div>
          </div>
        </ChartContainer>
      </section>

      {/* Rule Violations */}
      <section>
        <ChartContainer title="Rule Violation Tracker" description="Monitor compliance with your trading rules">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-success/20 bg-success/5 p-4">
              <div>
                <p className="font-medium text-foreground">Max 2% Risk Per Trade</p>
                <p className="text-sm text-muted-foreground">Violations: 0 this month</p>
              </div>
              <span className="rounded-full bg-success/20 px-3 py-1 text-xs font-semibold text-success">COMPLIANT</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-success/20 bg-success/5 p-4">
              <div>
                <p className="font-medium text-foreground">No Revenge Trading</p>
                <p className="text-sm text-muted-foreground">Violations: 3 this month</p>
              </div>
              <span className="rounded-full bg-warning/20 px-3 py-1 text-xs font-semibold text-warning">CAUTION</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-success/20 bg-success/5 p-4">
              <div>
                <p className="font-medium text-foreground">Daily Loss Limit</p>
                <p className="text-sm text-muted-foreground">Violations: 1 this month</p>
              </div>
              <span className="rounded-full bg-warning/20 px-3 py-1 text-xs font-semibold text-warning">CAUTION</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-success/20 bg-success/5 p-4">
              <div>
                <p className="font-medium text-foreground">Position Sizing</p>
                <p className="text-sm text-muted-foreground">Violations: 0 this month</p>
              </div>
              <span className="rounded-full bg-success/20 px-3 py-1 text-xs font-semibold text-success">COMPLIANT</span>
            </div>
          </div>
        </ChartContainer>
      </section>
    </DashboardLayout>
  );
}
