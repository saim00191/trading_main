'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { ChartContainer } from '@/components/common/ChartContainer';
import { AlertCircle, Lightbulb, TrendingUp, Zap, BarChart3 } from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";
import { generateAiCoachAnalytics, AnalyticsData, mapTradesToTradeData } from './AI_Coach_Engine';
import { selectUserEmail } from '@/store/UserLoggedInSlice';
import { useSelector } from 'react-redux';
import { getTradesByUser } from '@/lib/trade_services';


export default function AiCoachPage() {
  const userEmail = useSelector(selectUserEmail);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  const fetchAnalytics = async () => {
    try {
      if (!userEmail) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      // 1. Fetch raw trades (Trade[])
      const rawTrades = await getTradesByUser(userEmail);

      // 2. Convert to TradeData[]
      const trades = mapTradesToTradeData(rawTrades);

      // 3. Generate analytics
      const analyticsData = await generateAiCoachAnalytics(trades);

      setAnalytics(analyticsData);
    } catch (err) {
      console.error('[v0] Error in fetchAnalytics:', err);
      setError('An error occurred while loading AI analytics');
    } finally {
      setLoading(false);
    }
  };

  fetchAnalytics();
}, [userEmail]); // ✅ important


  if (loading) {
    return (
      <DashboardLayout title="AI Coach" subtitle="Personalized trading insights and recommendations">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading AI analysis...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="AI Coach" subtitle="Personalized trading insights and recommendations">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-400 mb-2">{error}</p>
            <p className="text-muted-foreground text-sm">Please check your Supabase connection</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout title="AI Coach" subtitle="Personalized trading insights and recommendations">
        <p className="text-muted-foreground">No analytics data available</p>
      </DashboardLayout>
    );
  }

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
      <section className="mb-2">
        
        <div className="space-y-4">
          {analytics.insights.map((insight, index) => {
            const Icon = insight.type === 'positive' ? TrendingUp : insight.type === 'warning' ? AlertCircle : Lightbulb;
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
              <span className="font-semibold text-primary">{analytics.behaviorPatterns.bestSession}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/10 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Preferred Trade Type</p>
                <p className="text-xs text-muted-foreground">Most frequent setup</p>
              </div>
              <span className="font-semibold text-primary">{analytics.behaviorPatterns.preferredTradeType}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/10 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Emotional Control</p>
                <p className="text-xs text-muted-foreground">Emotional stability index</p>
              </div>
              <span className="font-semibold text-success">{analytics.behaviorPatterns.emotionalControl}/100</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/10 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Consistency Score</p>
                <p className="text-xs text-muted-foreground">Trade adherence to plan</p>
              </div>
              <span className="font-semibold text-success">{analytics.behaviorPatterns.consistencyScore}/100</span>
            </div>
          </div>
        </ChartContainer>

        <ChartContainer title="Risk Violation Detection" description="Compliance with your trading rules">
          <div className="space-y-3">
            {analytics.riskViolations.map((violation, index) => (
              <div
                key={index}
                className={`flex items-center justify-between rounded-lg border p-4 ${
                  violation.status === 'PASSED'
                    ? 'border-success/20 bg-success/5'
                    : violation.status === 'CAUTION'
                    ? 'border-warning/20 bg-warning/5'
                    : 'border-destructive/20 bg-destructive/5'
                }`}
              >
                <span className="font-medium text-foreground">{violation.rule}</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    violation.status === 'PASSED'
                      ? 'bg-success/20 text-success'
                      : violation.status === 'CAUTION'
                      ? 'bg-warning/20 text-warning'
                      : 'bg-destructive/20 text-destructive'
                  }`}
                >
                  {violation.status}
                </span>
              </div>
            ))}
          </div>
        </ChartContainer>
      </section>

      {/* Personalized Recommendations */}
      <section className="mb-8">
        <ChartContainer title="Personalized Recommendations" description="AI-generated suggestions for improvement">
          <div className="space-y-3">
            {analytics.recommendations.map((rec, index) => (
              <div key={index} className={`flex gap-3 rounded-lg border p-4 ${colorMap[rec.type]}`}>
                <Lightbulb className="mt-0.5 flex-shrink-0 text-primary" size={20} />
                <div>
                  <p className="font-medium text-foreground">{rec.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartContainer>
      </section>

      {/* Trading Psychology */}
      <section>
        <ChartContainer title="Trading Psychology Analysis" description="Emotional patterns and psychological insights">
          <div className="space-y-4">
            {analytics.psychologyAnalysis.map((metric, index) => (
              <div key={index}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{metric.label}</span>
                  <span className="text-sm font-semibold text-primary">{metric.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-success"
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartContainer>
      </section>
    </DashboardLayout>
  );
}
