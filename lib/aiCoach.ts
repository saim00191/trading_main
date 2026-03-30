// utils/aiCoach.ts
export interface Trade {
  id?: string;
  useremail?: string;
  username?: string;
  opened_at: string | Date;
  closed_at: string | Date;
  pair: string;
  side: 'BUY' | 'SELL';
  status: 'OPEN' | 'CLOSED';
  trade_type: 'SCALP' | 'DAY' | 'SWING';
  market: 'FOREX' | 'CRYPTO' | 'STOCKS' | 'FUTURES';
  exchange: string;
  entry: number;
  stop_loss: number;
  take_profit: number;
  exit_price: number;
  position_size: number;
  risk_percent: number;
  risk_reward: number;
  pnl: number;
  pnl_percent: number;
  strategy: string;
  session: 'ASIA' | 'EUROPE' | 'NEWYORK';
  tags: string[];
  emotion_before: number;
  emotion_after: number;
  notes: string;
  duration?: string;
  created_at?: string;
}

export const generateAICoachInsight = (trades: Trade[]): string => {
  if (!trades.length) return 'No trades yet to analyze. Start trading to get AI insights.';

  // Sort trades by closed_at
  const sorted = [...trades].sort(
    (a, b) => new Date(a.closed_at).getTime() - new Date(b.closed_at).getTime()
  );

  // Basic metrics
  const totalTrades = sorted.length;
  const winningTrades = sorted.filter(t => t.pnl > 0);
  const losingTrades = sorted.filter(t => t.pnl < 0);
  const winRate = (winningTrades.length / totalTrades) * 100;
  const lossRate = (losingTrades.length / totalTrades) * 100;
  const totalProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
  const totalLoss = losingTrades.reduce((sum, t) => sum + t.pnl, 0);
  const avgRR = sorted.reduce((sum, t) => sum + t.risk_reward, 0) / totalTrades;

  // Streaks
  let maxWinStreak = 0, maxLossStreak = 0, currentWin = 0, currentLoss = 0;
  sorted.forEach(t => {
    if (t.pnl > 0) {
      currentWin++;
      currentLoss = 0;
      maxWinStreak = Math.max(maxWinStreak, currentWin);
    } else if (t.pnl < 0) {
      currentLoss++;
      currentWin = 0;
      maxLossStreak = Math.max(maxLossStreak, currentLoss);
    }
  });

  // Strategy performance
  const strategyPerf: Record<string, number> = {};
  sorted.forEach(t => {
    strategyPerf[t.strategy] = (strategyPerf[t.strategy] || 0) + t.pnl;
  });
  const bestStrategy = Object.entries(strategyPerf).sort((a,b)=>b[1]-a[1])[0]?.[0];

  // Market performance
  const marketPerf: Record<string, number> = {};
  sorted.forEach(t => {
    marketPerf[t.market] = (marketPerf[t.market] || 0) + t.pnl;
  });
  const bestMarket = Object.entries(marketPerf).sort((a,b)=>b[1]-a[1])[0]?.[0];

  // Drawdown
  let peak = 0, maxDrawdown = 0, equity = 0;
  sorted.forEach(t => {
    equity += t.pnl;
    peak = Math.max(peak, equity);
    maxDrawdown = Math.max(maxDrawdown, peak - equity);
  });

  // Emotion-based advice
  const avgEmotionBefore = sorted.reduce((sum, t) => sum + (t.emotion_before ?? 5), 0) / totalTrades;
  const avgEmotionAfter = sorted.reduce((sum, t) => sum + (t.emotion_after ?? 5), 0) / totalTrades;

  // Build insights
  const insights: string[] = [];
  insights.push(`Total Trades: ${totalTrades}, Win Rate: ${winRate.toFixed(1)}%, Loss Rate: ${lossRate.toFixed(1)}%`);
  insights.push(`Total Profit: $${totalProfit.toFixed(2)}, Total Loss: $${Math.abs(totalLoss).toFixed(2)}`);
  insights.push(`Average Risk/Reward Ratio: ${avgRR.toFixed(2)}${avgRR < 1.5 ? ' ⚠️ Consider taking trades with higher reward.' : avgRR > 3 ? ' ⚠️ Ensure proper risk management.' : ''}`);
  insights.push(`Max Winning Streak: ${maxWinStreak}, Max Losing Streak: ${maxLossStreak}${maxLossStreak>3?' ⚠️ Watch out for consecutive losses.':''}`);
  if (bestStrategy) insights.push(`Best Performing Strategy: ${bestStrategy}`);
  if (bestMarket) insights.push(`Best Performing Market: ${bestMarket}`);
  insights.push(`Maximum Drawdown: $${maxDrawdown.toFixed(2)}${maxDrawdown > totalProfit*0.5 ? ' ⚠️ High drawdown! Consider risk control.' : ''}`);
  if (avgEmotionBefore < 4) insights.push('You might feel anxious before trades. Consider preparing a checklist.');
  if (avgEmotionAfter < 4) insights.push('Post-trade reflection is low. Consider journaling to improve performance.');

  return insights.join(' ');
};