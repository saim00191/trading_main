import { supabase } from "@/lib/supabaseClient";
import { Trade } from "@/lib/types";


export interface TradeData {
  id: string;
  user_email: string;
  symbol: string;
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  pnl: number | null;
  risk_percent: number;
  emotion_before?: number;
  emotion_after?: number;
  strategy?: string;
  trade_type?: string;
  session?: string;
  duration?: number;
  status: 'open' | 'closed';
  opened_at: string;
  closed_at: string | null;
}

type SessionStats = {
  trades: number;
  winRate: number;
  avgPnL: number;
};

// type Recommendation = {
//   title: string;
//   description: string;
//   type: 'positive' | 'warning' | 'recommendation';
// };

// type Insight = {
//   type: 'positive' | 'warning' | 'recommendation';
//   title: string;
//   description: string;
// };

type EmotionalData = {
  stability: number;
  revengeTrades: number;
};

type RiskStatus = 'PASSED' | 'CAUTION' | 'FAILED';

type RiskViolation = {
  rule: string;
  status: RiskStatus;
};


export interface AnalyticsData {
  performanceScore: number;
  marketBehaviorSummary: string;
  disciplineAnalysis: string;
  riskExposureEvaluation: string;
  netPnL: number;
  bestMarket: string;
  worstStrategy: string;
  riskVsRewardAnalysis: string;
  emotionalStability: number;
  disciplineScore: number;
  confidentLevel: number;
  riskAwareness: number;
  sessionPerformance: Record<string, SessionStats>;
  tradePatterns: string;
  riskManagementScore: number;
  overRiskFrequency: number;
  stopLossDiscipline: string;
  userGrowthTrend: string;
  revenueTrend: string;
  platformPerformance: string;
  behaviorPatterns: {
    bestSession: string;
    preferredTradeType: string;
    emotionalControl: number;
    consistencyScore: number;
  };
  riskViolations: RiskViolation[];
  recommendations: Array<{
    title: string;
    description: string;
    type: 'positive' | 'warning' | 'recommendation';
  }>;
  psychologyAnalysis: {
    label: string;
    value: number;
  }[];
  insights: Array<{
    type: 'positive' | 'warning' | 'recommendation';
    title: string;
    description: string;
  }>;
}

// export interface Trade {
//   id: string;
//   useremail: string; // DB column name
//   symbol: string;
//   entry: number;
//   exit_price?: number | null;
//   position_size: number;
//   pnl?: number | null;
//   risk_percent?: number | null;
//   emotion_before?: number;
//   emotion_after?: number;
//   strategy?: string;
//   trade_type?: string;
//   session?: string;
//   duration?: number;
//   status: string; // raw DB string (we convert later)
//   opened_at: string;
//   closed_at?: string | null;
// }

export const mapTradesToTradeData = (trades: Trade[]): TradeData[] => {
  return trades.map((t) => ({
    id: t.id ?? '', // fallback to empty string if undefined
    user_email: t.useremail ?? '', // fallback
    symbol: t.symbol,
    entry_price: t.entry,
    exit_price: t.exit_price ?? null,
    quantity: t.position_size,
    pnl: t.pnl ?? null,
    risk_percent: t.risk_percent ?? 0,
    emotion_before: t.emotion_before,
    emotion_after: t.emotion_after,
    strategy: t.strategy,
    trade_type: t.trade_type,
    session: t.session,
    duration: t.duration ? Number(t.duration) : undefined,
    status: t.status.toLowerCase() === 'closed' ? 'closed' : 'open',
    opened_at: t.opened_at ? new Date(t.opened_at).toISOString() : '',
    closed_at: t.closed_at ? new Date(t.closed_at).toISOString() : null,
  }));
};

// Generate comprehensive AI analytics
export async function generateAiCoachAnalytics(
  trades: TradeData[]
): Promise<AnalyticsData> {
  try {
    if (trades.length === 0) {
      return generateEmptyAnalytics();
    }

    const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl !== null);
    const profitableTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
    const losingTrades = closedTrades.filter(t => (t.pnl || 0) <= 0);

    // Calculate core metrics
    const winRate = closedTrades.length > 0
      ? (profitableTrades.length / closedTrades.length) * 100
      : 0;

    const netPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

    const avgRisk = trades.length > 0
      ? trades.reduce((sum, t) => sum + (t.risk_percent || 0), 0) / trades.length
      : 0;

    const totalTrades = trades.length;

    // Performance Score
    const performanceScore = calculatePerformanceScore(
      winRate,
      netPnL,
      avgRisk,
      totalTrades
    );

    // Analysis
    const marketBehaviorSummary = analyzeMarketBehavior(trades, winRate, netPnL);
    const disciplineAnalysis = analyzeDiscipline(trades, avgRisk);
    const riskExposureEvaluation = evaluateRiskExposure(
      avgRisk,
      losingTrades.length,
      closedTrades.length
    );

    const bestMarket = findBestMarket(trades);
    const worstStrategy = findWorstStrategy(trades);
    const riskVsRewardAnalysis = analyzeRiskVsReward(netPnL, avgRisk, winRate);

    // Psychology
    const emotionalData = extractEmotionalData(trades);
    const emotionalStability = emotionalData.stability;
    const disciplineScore = calculateDisciplineScore(trades);
    const confidentLevel = calculateConfidenceLevel(winRate, netPnL);
    const riskAwareness = calculateRiskAwareness(avgRisk, losingTrades.length);

    // Sessions
    const sessionPerformance = analyzeSessionPerformance(trades);
    const bestSession = findBestSession(sessionPerformance);

    // Patterns
    const tradePatterns = analyzeTradePatterns(trades);
    const preferredTradeType = findPreferredTradeType(trades);

    // Risk
    const riskManagementScore = calculateRiskManagementScore(
      avgRisk,
      losingTrades.length,
      closedTrades.length
    );

    const overRiskFrequency =
      (trades.filter(t => (t.risk_percent || 0) > 2).length / trades.length) * 100;

    const stopLossDiscipline = evaluateStopLossDiscipline(
      losingTrades,
      closedTrades
    );

    const riskViolations = generateRiskViolations(
      avgRisk,
      overRiskFrequency,
      losingTrades,
      emotionalData
    );

    const recommendations = generateRecommendations(
      winRate,
      netPnL,
      avgRisk,
      trades
    );

    const psychologyAnalysis = [
      { label: 'Emotional Stability', value: Math.round(emotionalStability) },
      { label: 'Discipline Score', value: Math.round(disciplineScore) },
      { label: 'Confidence Level', value: Math.round(confidentLevel) },
      { label: 'Risk Awareness', value: Math.round(riskAwareness) },
    ];

    const insights = generateInsights(
      winRate,
      netPnL,
      avgRisk,
      totalTrades,
      trades
    );

    // Mock platform stats (unchanged)
    const userGrowthTrend =
      'Steady 12% monthly growth with strong user retention';
    const revenueTrend =
      'Premium subscriptions up 23% QoQ; recurring revenue stable';
    const platformPerformance =
      'System uptime 99.9%; API response time averaging 145ms';

    return {
      performanceScore: Math.round(performanceScore),
      marketBehaviorSummary,
      disciplineAnalysis,
      riskExposureEvaluation,
      netPnL,
      bestMarket,
      worstStrategy,
      riskVsRewardAnalysis,
      emotionalStability: Math.round(emotionalStability),
      disciplineScore: Math.round(disciplineScore),
      confidentLevel: Math.round(confidentLevel),
      riskAwareness: Math.round(riskAwareness),
      sessionPerformance,
      tradePatterns,
      riskManagementScore: Math.round(riskManagementScore),
      overRiskFrequency,
      stopLossDiscipline,
      userGrowthTrend,
      revenueTrend,
      platformPerformance,
      behaviorPatterns: {
        bestSession,
        preferredTradeType,
        emotionalControl: Math.round(emotionalStability),
        consistencyScore: Math.round(disciplineScore),
      },
      riskViolations,
      recommendations,
      psychologyAnalysis,
      insights,
    };
  } catch (err) {
    console.error('[AI Coach] Error:', err);
    return generateEmptyAnalytics();
  }
}

function calculatePerformanceScore(winRate: number, netPnL: number, avgRisk: number, totalTrades: number): number {
  let score = 50;

  // Win rate component (0-30 points)
  score += Math.min(30, (winRate / 100) * 30);

  // PnL component (0-20 points)
  if (netPnL > 0) {
    score += Math.min(20, (netPnL / 10000) * 20);
  } else if (netPnL < 0) {
    score -= Math.min(20, Math.abs(netPnL) / 10000) * 20;
  }

  // Risk management component (0-20 points)
  if (avgRisk <= 2) {
    score += 20;
  } else if (avgRisk <= 3) {
    score += 15;
  } else if (avgRisk <= 5) {
    score += 10;
  }

  // Trade frequency component (0-10 points)
  if (totalTrades >= 10 && totalTrades <= 30) {
    score += 10;
  } else if (totalTrades > 30) {
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

function analyzeMarketBehavior(trades: TradeData[], winRate: number, netPnL: number): string {
  if (trades.length < 5) {
    return 'Insufficient trade history for comprehensive analysis. Accumulate more trades for detailed insights.';
  }

  let analysis = '';

  if (winRate >= 55) {
    analysis += `Strong win rate of ${winRate.toFixed(1)}% indicates consistent profitable decision-making. `;
  } else if (winRate >= 45) {
    analysis += `Moderate win rate at ${winRate.toFixed(1)}% shows balanced trading with room for improvement. `;
  } else {
    analysis += `Below-average win rate of ${winRate.toFixed(1)}% suggests trading logic needs refinement. `;
  }

  if (netPnL > 0) {
    analysis += `Net profit of $${netPnL.toFixed(2)} demonstrates overall positive market exposure. `;
  } else {
    analysis += `Net loss of $${Math.abs(netPnL).toFixed(2)} indicates capital drawdown requiring strategy review. `;
  }

  analysis += 'Focus on high-probability setups and maintain strict position sizing discipline.';

  return analysis;
}

function analyzeDiscipline(trades: TradeData[], avgRisk: number): string {
  let analysis = '';

  if (avgRisk <= 2) {
    analysis = `Your average risk per trade is ${avgRisk.toFixed(2)}%, demonstrating exceptional risk discipline. This conservative approach preserves capital effectively across market conditions.`;
  } else if (avgRisk <= 3) {
    analysis = `Average risk of ${avgRisk.toFixed(2)}% per trade shows solid risk management. Consider tightening to 2% or lower for optimal capital preservation.`;
  } else {
    analysis = `Risk exposure at ${avgRisk.toFixed(2)}% per trade is elevated. Implement stricter position sizing rules to limit downside exposure and improve sustainability.`;
  }

  return analysis;
}

function evaluateRiskExposure(avgRisk: number, losingTrades: number, closedTrades: number): string {
  const lossRate = closedTrades > 0 ? (losingTrades / closedTrades) * 100 : 0;

  let evaluation = '';

  if (avgRisk <= 2 && lossRate <= 50) {
    evaluation = `Risk exposure is well-controlled. With ${avgRisk.toFixed(2)}% average risk and ${lossRate.toFixed(1)}% loss frequency, your portfolio maintains strong downside protection.`;
  } else if (avgRisk <= 3 && lossRate <= 55) {
    evaluation = `Moderate risk exposure detected. Current parameters show acceptable risk tolerance, but monitor for correlation with losing streaks.`;
  } else {
    evaluation = `Elevated risk exposure warning. At ${avgRisk.toFixed(2)}% average risk with ${lossRate.toFixed(1)}% losing trades, implement immediate risk reduction strategy.`;
  }

  return evaluation;
}

function findBestMarket(trades: TradeData[]): string {
  const marketPerformance: Record<string, { wins: number; total: number; pnl: number }> = {};

  trades.forEach(trade => {
    const market = trade.symbol?.split('/')[1] || 'Unknown';
    if (!marketPerformance[market]) {
      marketPerformance[market] = { wins: 0, total: 0, pnl: 0 };
    }
    marketPerformance[market].total++;
    marketPerformance[market].pnl += trade.pnl || 0;
    if ((trade.pnl || 0) > 0) {
      marketPerformance[market].wins++;
    }
  });

  let bestMarket = 'Diverse';
  let bestScore = 0;

  Object.entries(marketPerformance).forEach(([market, data]) => {
    const score = (data.wins / data.total) * 100 + (data.pnl > 0 ? 10 : -10);
    if (score > bestScore) {
      bestScore = score;
      bestMarket = market;
    }
  });

  return bestMarket;
}

function findWorstStrategy(trades: TradeData[]): string {
  const strategyPerformance: Record<string, { wins: number; total: number; pnl: number }> = {};

  trades.forEach(trade => {
    const strategy = trade.strategy || 'Unspecified';
    if (!strategyPerformance[strategy]) {
      strategyPerformance[strategy] = { wins: 0, total: 0, pnl: 0 };
    }
    strategyPerformance[strategy].total++;
    strategyPerformance[strategy].pnl += trade.pnl || 0;
    if ((trade.pnl || 0) > 0) {
      strategyPerformance[strategy].wins++;
    }
  });

  let worstStrategy = 'None';
  let worstScore = 100;

  Object.entries(strategyPerformance).forEach(([strategy, data]) => {
    if (data.total < 3) return;
    const score = (data.wins / data.total) * 100;
    if (score < worstScore) {
      worstScore = score;
      worstStrategy = strategy;
    }
  });

  return worstStrategy;
}

function analyzeRiskVsReward(netPnL: number, avgRisk: number, winRate: number): string {
  const riskRewardRatio = avgRisk > 0 ? Math.abs(netPnL) / avgRisk : 0;

  let analysis = '';

  if (riskRewardRatio > 3 && winRate > 50) {
    analysis = `Excellent risk-reward profile with ratio of ${riskRewardRatio.toFixed(2)}:1. Your trading captures ${winRate.toFixed(1)}% win rate with favorable payoff structure.`;
  } else if (riskRewardRatio > 2) {
    analysis = `Solid risk-reward ratio of ${riskRewardRatio.toFixed(2)}:1. Consider optimizing entry/exit logic to further improve payoff asymmetry.`;
  } else {
    analysis = `Risk-reward ratio of ${riskRewardRatio.toFixed(2)}:1 needs improvement. Focus on trades with 3:1 or better reward-to-risk ratios.`;
  }

  return analysis;
}

function extractEmotionalData(trades: TradeData[]): { stability: number; revengeTrades: number } {
  let emotionalDiff = 0;
  let validTrades = 0;
  let revengeTrades = 0;

  trades.forEach(trade => {
    if (trade.emotion_before !== undefined && trade.emotion_after !== undefined) {
      emotionalDiff += trade.emotion_before - trade.emotion_after;
      validTrades++;

      if (trade.emotion_after < trade.emotion_before - 20) {
        revengeTrades++;
      }
    }
  });

  const stability = validTrades > 0 ? 85 - (emotionalDiff / validTrades) * 0.5 : 75;

  return { stability: Math.min(100, Math.max(0, stability)), revengeTrades };
}

function calculateDisciplineScore(trades: TradeData[]): number {
  let score = 80;

  const riskViolations = trades.filter(t => (t.risk_percent || 0) > 2.5).length;
  score -= (riskViolations / trades.length) * 30;

  const inconsistentSizing = trades.filter((t, i) => {
    if (i === 0) return false;
    const prevRisk = trades[i - 1].risk_percent || 0;
    return Math.abs((t.risk_percent || 0) - prevRisk) > 1.5;
  }).length;
  score -= (inconsistentSizing / trades.length) * 15;

  return Math.min(100, Math.max(0, score));
}

function calculateConfidenceLevel(winRate: number, netPnL: number): number {
  let confidence = 50;
  confidence += Math.min(30, (winRate / 100) * 30);
  if (netPnL > 0) {
    confidence += Math.min(20, (netPnL / 5000) * 20);
  }
  return Math.min(100, confidence);
}

function calculateRiskAwareness(avgRisk: number, losingTrades: number): number {
  let awareness = 90;
  if (avgRisk > 3) awareness -= (avgRisk - 3) * 10;
  awareness -= Math.min(20, (losingTrades / 10) * 20);
  return Math.min(100, Math.max(0, awareness));
}

function analyzeSessionPerformance(trades: TradeData[]): Record<string, SessionStats> {
  const sessions = ['Asia', 'Europe', 'NY'];
  const performance: Record<string, SessionStats> = {};

  sessions.forEach(session => {
    const sessionTrades = trades.filter(t => t.session === session || false);
    if (sessionTrades.length === 0) {
      performance[session] = { trades: 0, winRate: 0, avgPnL: 0 };
      return;
    }

    const closedTrades = sessionTrades.filter(t => t.status === 'closed' && t.pnl !== null);
    const wins = closedTrades.filter(t => (t.pnl || 0) > 0).length;
    const avgPnL = closedTrades.length > 0 ? closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / closedTrades.length : 0;

    performance[session] = {
      trades: sessionTrades.length,
      winRate: closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0,
      avgPnL,
    };
  });

  return performance;
}

function findBestSession(performance: Record<string, SessionStats>): string {
  let bestSession = 'Europe Session';
  let bestScore = 0;

  Object.entries(performance).forEach(([session, data]) => {
    const score = (data.winRate || 0) + (data.avgPnL > 0 ? 20 : -20);
    if (score > bestScore) {
      bestScore = score;
      bestSession = session + ' Session';
    }
  });

  return bestSession;
}

function analyzeTradePatterns(trades: TradeData[]): string {
  if (trades.length < 5) {
    return 'Accumulate more trading data for comprehensive pattern analysis.';
  }

  let patterns = '';

  const avgDuration = trades.reduce((sum, t) => sum + (t.duration || 0), 0) / trades.length;
  if (avgDuration < 60) {
    patterns += 'Scalp-focused trading detected with short hold times. ';
  } else if (avgDuration < 1440) {
    patterns += 'Day trading patterns dominate your approach. ';
  } else {
    patterns += 'Swing trading characteristics observed across your trades. ';
  }

  const strategyDiversity = new Set(trades.map(t => t.strategy)).size;
  if (strategyDiversity === 1) {
    patterns += 'Single-strategy focus shows specialization but limits diversification. Consider developing complementary approaches.';
  } else {
    patterns += `Multi-strategy approach with ${strategyDiversity} distinct methodologies. Ensure each strategy has sufficient sample size for statistical validity.`;
  }

  return patterns;
}

function findPreferredTradeType(trades: TradeData[]): string {
  const typeMap: Record<string, number> = {};
  trades.forEach(t => {
    const type = t.trade_type || 'Unspecified';
    typeMap[type] = (typeMap[type] || 0) + 1;
  });

  let preferred = 'Mixed';
  let maxCount = 0;
  Object.entries(typeMap).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count;
      preferred = type;
    }
  });

  return preferred;
}

function calculateRiskManagementScore(avgRisk: number, losingTrades: number, closedTrades: number): number {
  let score = 100;

  if (avgRisk > 2) score -= (avgRisk - 2) * 10;
  if (avgRisk > 3) score -= (avgRisk - 3) * 15;

  const lossFrequency = closedTrades > 0 ? (losingTrades / closedTrades) * 100 : 0;
  if (lossFrequency > 55) score -= (lossFrequency - 55) * 0.5;

  return Math.min(100, Math.max(0, score));
}

function evaluateStopLossDiscipline(losingTrades: TradeData[], closedTrades: TradeData[]): string {
  const hitStopLoss = losingTrades.filter(t => t.exit_price && t.entry_price && Math.abs(t.exit_price - t.entry_price) < 0.05).length;
  const hitStopPercent = closedTrades.length > 0 ? (hitStopLoss / closedTrades.length) * 100 : 0;

  if (hitStopPercent > 80) {
    return 'Excellent stop-loss discipline with systematic exit execution';
  } else if (hitStopPercent > 60) {
    return 'Good stop-loss adherence; most losses are within planned exit zones';
  } else {
    return 'Stop-loss discipline needs improvement; implement automated exits';
  }
}

function generateRiskViolations(
  avgRisk: number,
  overRiskFrequency: number,
  losingTrades: TradeData[],
  emotionalData: EmotionalData
): RiskViolation[] {

  const violations: RiskViolation[] = [
    {
      rule: 'Daily Loss Limit Rule',
      status: overRiskFrequency < 20 ? 'PASSED' : 'CAUTION',
    },
    {
      rule: 'Max 2% Risk Per Trade',
      status: avgRisk <= 2.5 ? 'PASSED' : 'CAUTION',
    },
    {
      rule: 'No Revenge Trading',
      status: emotionalData.revengeTrades < 3 ? 'PASSED' : 'CAUTION',
    },
    {
      rule: 'Position Sizing',
      status: 'PASSED',
    },
  ];

  return violations;
}

function generateRecommendations(winRate: number, netPnL: number, avgRisk: number, trades: TradeData[]) {
  const recommendations = [];

  if (winRate < 45) {
    recommendations.push({
      title: 'Refine Trading Strategy',
      description: 'Your current win rate of ' + winRate.toFixed(1) + '% indicates the need for strategy optimization. Review recent losing trades for common patterns and adjust entry criteria.',
      type: 'warning' as const,
    });
  }

  if (netPnL > 5000) {
    recommendations.push({
      title: 'Increase Position Size by 10-15%',
      description: 'Your recent trading consistency has improved. Consider scaling up your position size to capitalize on improved performance.',
      type: 'recommendation' as const,
    });
  }

  if (avgRisk > 2.5) {
    recommendations.push({
      title: 'Reduce Risk Per Trade',
      description: 'Average risk of ' + avgRisk.toFixed(2) + '% exceeds optimal levels. Implement stricter position sizing to limit drawdown exposure.',
      type: 'warning' as const,
    });
  }

  if (!recommendations.some(r => r.title.includes('Psychology'))) {
    recommendations.push({
      title: 'Focus on Process Discipline',
      description: 'Your trading discipline score shows room for improvement. Focus on consistent rule adherence and emotional control.',
      type: 'recommendation' as const,
    });
  }

  return recommendations;
}

function generateInsights(winRate: number, netPnL: number, avgRisk: number, totalTrades: number, trades: TradeData[]) {
  const insights = [];

  if (winRate >= 55) {
    insights.push({
      type: 'positive' as const,
      title: 'Strong Win Rate',
      description: 'Your win rate has improved to ' + winRate.toFixed(1) + '%. Keep maintaining your current strategy and risk management.',
    });
  }

  if (totalTrades > 30) {
    insights.push({
      type: 'warning' as const,
      title: 'Overtrading Alert',
      description: 'You\'ve taken ' + totalTrades + ' trades this period. Consider scaling back to maintain quality over quantity.',
    });
  }

  if (avgRisk <= 2) {
    insights.push({
      type: 'positive' as const,
      title: 'Risk Management',
      description: 'Your average risk per trade is ' + avgRisk.toFixed(2) + '%. This is within optimal parameters.',
    });
  }

  if (netPnL > 0) {
    insights.push({
      type: 'positive' as const,
      title: 'Profitability',
      description: 'Your trading has generated ' + netPnL.toFixed(2) + ' in net profit. Maintain this momentum with disciplined execution.',
    });
  }

  return insights.slice(0, 4);
}

function generateEmptyAnalytics(): AnalyticsData {
  return {
    performanceScore: 0,
    marketBehaviorSummary: 'No trading data available. Start trading to generate analytics.',
    disciplineAnalysis: 'Insufficient data for analysis.',
    riskExposureEvaluation: 'Insufficient data for analysis.',
    netPnL: 0,
    bestMarket: 'N/A',
    worstStrategy: 'N/A',
    riskVsRewardAnalysis: 'Insufficient data for analysis.',
    emotionalStability: 0,
    disciplineScore: 0,
    confidentLevel: 0,
    riskAwareness: 0,
    sessionPerformance: {},
    tradePatterns: 'No trading patterns detected.',
    riskManagementScore: 0,
    overRiskFrequency: 0,
    stopLossDiscipline: 'Insufficient data.',
    userGrowthTrend: 'Platform growth metrics unavailable.',
    revenueTrend: 'Revenue data unavailable.',
    platformPerformance: 'Performance metrics unavailable.',
    behaviorPatterns: {
      bestSession: 'N/A',
      preferredTradeType: 'N/A',
      emotionalControl: 0,
      consistencyScore: 0,
    },
    riskViolations: [],
    recommendations: [],
    psychologyAnalysis: [],
    insights: [],
  };
}
