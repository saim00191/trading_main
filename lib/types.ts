// Trade related types
export interface Trade {
  id: string;
  date: Date;
  pair: string;
  type: 'BUY' | 'SELL';
  entry: number;
  exit: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  riskPercent: number;
  riskRewardRatio: number;
  pnl: number;
  pnlPercent: number;
  status: 'OPEN' | 'CLOSED' | 'PENDING';
  tradeType: 'SCALP' | 'DAY' | 'SWING' | 'POSITION';
  strategy: string;
  session: 'ASIA' | 'EUROPE' | 'US' | 'OVERLAP';
  emotionBefore: number; // 1-10 scale
  emotionAfter: number; // 1-10 scale
  notes: string;
  tags: string[];
}

export interface MetricData {
  label: string;
  value: string | number;
  change?: number;
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

export interface DashboardMetrics {
  accountBalance: number;
  equity: number;
  totalPnL: number;
  winRate: number;
  riskRewardAverage: number;
  drawdown: number;
  trades: Trade[];
}

export interface AnalyticsData {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  wins: number;
  losses: number;
  avgWin: number;
  avgLoss: number;
  expectancy: number;
  profitFactor: number;
  equityCurve: ChartDataPoint[];
  strategyPerformance: Record<string, number>;
  pairPerformance: Record<string, number>;
  sessionPerformance: Record<string, number>;
}

export interface TradingRule {
  id: string;
  category: 'PERSONAL' | 'RISK' | 'STRATEGY' | 'PSYCHOLOGY';
  title: string;
  description: string;
  isActive: boolean;
  breaks: number;
}

export interface Goal {
  id: string;
  name: string;
  targetValue: number;
  currentValue: number;
  type: 'PROFIT' | 'TRADES' | 'WIN_RATE' | 'RISK_LIMIT';
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  dateStart: Date;
  dateEnd: Date;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
}
