// --------------------
// Trade Related Types
// --------------------
export type TradeSide = 'BUY' | 'SELL';
export type TradeStatus = 'OPEN' | 'CLOSED' | 'PENDING';
export type TradeType = 'SCALP' | 'DAY' | 'SWING' | 'POSITION';
export type SessionType = 'ASIA' | 'EUROPE' | 'US' | 'OVERLAP';

export interface Trade {
  id?: string;
  useremail?: string;
  username?: string;
  opened_at?: string | Date;
  closed_at?: string | Date;
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
  symbol: string;
  position_size: number;
  risk_percent: number;
  risk_reward: number;
  pnl: number;
  pnl_percent: number;
  strategy: string;
  session: 'ASIA' | 'EUROPE' | 'NEWYORK';
  tags: string[];
  emotion_before: number; // 1-10 scale
  emotion_after: number; // 1-10 scale
  notes: string;
  duration?: string;
  created_at?: string;
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


export type NotificationStatus = 'pending' | 'seen'
export type SendMode = 'single' | 'multiple' | 'all'

export interface Notification {
  id: string
  username: string
  email: string
  subject?: string
  message: string
  status: NotificationStatus
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  username: string
  email: string
}

export interface NotificationFormData {
  subject: string
  message: string
  sendMode: SendMode
  selectedUserIds?: string[]
}