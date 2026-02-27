import { Trade, DashboardMetrics, AnalyticsData, TradingRule, Goal } from './types';

// Generate mock trades
export const generateMockTrades = (): Trade[] => {
  const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD'];
  const strategies = ['MA Crossover', 'Support/Resistance', 'Breakout', 'Pullback', 'Trend Following'];
  const trades: Trade[] = [];

  for (let i = 0; i < 50; i++) {
    const entry = 1.0500 + Math.random() * 0.05;
    const exit = entry + (Math.random() - 0.5) * 0.01;
    const pnl = (exit - entry) * 10000;

    trades.push({
      id: `trade-${i}`,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      pair: pairs[Math.floor(Math.random() * pairs.length)],
      type: Math.random() > 0.5 ? 'BUY' : 'SELL',
      entry,
      exit,
      stopLoss: entry - 0.005,
      takeProfit: entry + 0.015,
      positionSize: Math.round(Math.random() * 100000) / 100,
      riskPercent: Math.round(Math.random() * 2 * 100) / 100,
      riskRewardRatio: Math.round((Math.abs(exit - entry) / 0.005) * 10) / 10,
      pnl,
      pnlPercent: Math.round((pnl / 10000) * 100) / 100,
      status: 'CLOSED',
      tradeType: ['SCALP', 'DAY', 'SWING'][Math.floor(Math.random() * 3)] as any,
      strategy: strategies[Math.floor(Math.random() * strategies.length)],
      session: ['ASIA', 'EUROPE', 'US', 'OVERLAP'][Math.floor(Math.random() * 4)] as any,
      emotionBefore: Math.floor(Math.random() * 10) + 1,
      emotionAfter: Math.floor(Math.random() * 10) + 1,
      notes: 'Trade executed according to plan',
      tags: ['profitable', 'scalp'],
    });
  }

  return trades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const mockTrades = generateMockTrades();

// Dashboard metrics
export const mockDashboardMetrics: DashboardMetrics = {
  accountBalance: 50000,
  equity: 52450,
  totalPnL: 2450,
  winRate: 58.5,
  riskRewardAverage: 1.45,
  drawdown: 3.2,
  trades: mockTrades.slice(0, 10),
};

// Analytics data
export const mockAnalyticsData: AnalyticsData = {
  totalTrades: 50,
  winningTrades: 29,
  losingTrades: 21,
  wins: 2150,
  losses: 1200,
  avgWin: 74.1,
  avgLoss: 57.1,
  expectancy: 28.4,
  profitFactor: 1.79,
  equityCurve: [
    { name: 'Jan 1', value: 50000 },
    { name: 'Jan 5', value: 50450 },
    { name: 'Jan 10', value: 51200 },
    { name: 'Jan 15', value: 50800 },
    { name: 'Jan 20', value: 51850 },
    { name: 'Jan 25', value: 52100 },
    { name: 'Jan 31', value: 52450 },
    { name: 'Feb 5', value: 52200 },
    { name: 'Feb 10', value: 53100 },
    { name: 'Feb 15', value: 52900 },
  ],
  strategyPerformance: {
    'MA Crossover': 850,
    'Support/Resistance': 650,
    'Breakout': 520,
    'Pullback': 380,
    'Trend Following': 50,
  },
  pairPerformance: {
    'EUR/USD': 720,
    'GBP/USD': 580,
    'USD/JPY': 620,
    'AUD/USD': 380,
    'USD/CAD': 150,
  },
  sessionPerformance: {
    'ASIA': 450,
    'EUROPE': 920,
    'US': 850,
    'OVERLAP': 230,
  },
};

// Trading rules
export const mockTradingRules: TradingRule[] = [
  {
    id: 'rule-1',
    category: 'RISK',
    title: 'Max 2% Risk Per Trade',
    description: 'Never risk more than 2% of account on a single trade',
    isActive: true,
    breaks: 2,
  },
  {
    id: 'rule-2',
    category: 'RISK',
    title: 'Daily Loss Limit',
    description: 'Stop trading after 3 consecutive losses',
    isActive: true,
    breaks: 1,
  },
  {
    id: 'rule-3',
    category: 'STRATEGY',
    title: 'Trade Only London/US Session',
    description: 'Trade EUR/USD only during London and US sessions',
    isActive: true,
    breaks: 0,
  },
  {
    id: 'rule-4',
    category: 'PSYCHOLOGY',
    title: 'No Revenge Trading',
    description: 'Take a break after 2 losses in a row',
    isActive: true,
    breaks: 3,
  },
  {
    id: 'rule-5',
    category: 'PERSONAL',
    title: 'No Trading Before 9 AM',
    description: 'Wait for market to settle before trading',
    isActive: false,
    breaks: 0,
  },
];

// Goals
export const mockGoals: Goal[] = [
  {
    id: 'goal-1',
    name: 'Monthly Profit Target',
    targetValue: 2000,
    currentValue: 2450,
    type: 'PROFIT',
    period: 'MONTHLY',
    dateStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    dateEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    status: 'COMPLETED',
  },
  {
    id: 'goal-2',
    name: 'Win Rate 55%',
    targetValue: 55,
    currentValue: 58.5,
    type: 'WIN_RATE',
    period: 'MONTHLY',
    dateStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    dateEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    status: 'ACTIVE',
  },
  {
    id: 'goal-3',
    name: 'Daily Trade Limit',
    targetValue: 5,
    currentValue: 3,
    type: 'TRADES',
    period: 'DAILY',
    dateStart: new Date(),
    dateEnd: new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: 'ACTIVE',
  },
  {
    id: 'goal-4',
    name: 'Risk Limit 2%',
    targetValue: 2,
    currentValue: 1.8,
    type: 'RISK_LIMIT',
    period: 'DAILY',
    dateStart: new Date(),
    dateEnd: new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: 'ACTIVE',
  },
];
