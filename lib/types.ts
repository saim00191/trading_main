// --------------------
// Trade Related Types
// --------------------
export type TradeSide = 'BUY' | 'SELL';
export type TradeStatus = 'OPEN' | 'CLOSED' | 'PENDING';
export type TradeType = 'SCALP' | 'DAY' | 'SWING' | 'POSITION';
export type SessionType = 'ASIA' | 'EUROPE' | 'US' | 'OVERLAP';

export interface Trade {
  id: string;
  date: Date;
  pair: string;
  type: TradeSide;
  entry: number;
  exit: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  riskPercent: number;
  riskRewardRatio: number;
  pnl: number;
  pnlPercent: number;
  status: TradeStatus;
  tradeType: TradeType;
  strategy: string;
  session: SessionType;
  emotionBefore: number; // 1-10 scale
  emotionAfter: number;  // 1-10 scale
  notes: string;
  tags: string[];
}

// --------------------
// Dashboard / Metrics
// --------------------
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
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
  sessionPerformance: Record<SessionType, number>;
}

// --------------------
// Trading Rules
// --------------------
export type RuleCategory = 'PERSONAL' | 'RISK' | 'STRATEGY' | 'PSYCHOLOGY';

export interface TradingRule {
  id: string;
  category: RuleCategory;
  title: string;
  description: string;
  isActive: boolean;
  breaks: number;
}

// --------------------
// Goals
// --------------------
export type GoalType = 'PROFIT' | 'TRADES' | 'WIN_RATE' | 'RISK_LIMIT';
export type GoalPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED';

export interface Goal {
  id: string;
  name: string;
  targetValue: number;
  currentValue: number;
  type: GoalType;
  period: GoalPeriod;
  dateStart: Date;
  dateEnd: Date;
  status: GoalStatus;
}