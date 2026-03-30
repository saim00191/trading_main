import { supabase } from "../supabaseClient";

export interface AdminTrade {
  id: string;
  username: string;
  useremail: string;
  pair: string;
  side: 'BUY' | 'SELL';
  status: 'OPEN' | 'CLOSED';
  trade_type: 'SCALP' | 'DAY' | 'SWING';
  market: 'FOREX' | 'CRYPTO' | 'STOCKS' | 'FUTURES';
  exchange: string;
  entry: number;
  exit_price: number;
  stop_loss: number;
  take_profit: number;
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
  opened_at: string;
  closed_at: string;
  duration?: string;
  created_at?: string;
}

export interface TradeFilters {
  pair?: string;
  market?: string;
  trade_type?: string;
  side?: string;
  session?: string;
  useremail?: string;
  search?: string;
  exchange?: string;  // <-- add this
}

export const getAllTrades = async (filters?: TradeFilters, page: number = 1, limit: number = 20): Promise<{ trades: AdminTrade[]; total: number }> => {
  try {
    let query = supabase.from('trades').select('*', { count: 'exact' });

    if (filters?.pair) query = query.eq('pair', filters.pair);
    if (filters?.market) query = query.eq('market', filters.market);
    if (filters?.trade_type) query = query.eq('trade_type', filters.trade_type);
    if (filters?.side) query = query.eq('side', filters.side);
    if (filters?.session) query = query.eq('session', filters.session);
    if (filters?.useremail) query = query.eq('useremail', filters.useremail);

    if (filters?.search) {
      query = query.or(`username.ilike.%${filters.search}%,useremail.ilike.%${filters.search}%,pair.ilike.%${filters.search}%`);
    }

    const offset = (page - 1) * limit;
    const { data, count, error } = await query
      .order('opened_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { trades: (data as AdminTrade[]) || [], total: count || 0 };
  } catch (error) {
    console.error('[adminTrades] Error getting all trades:', error);
    throw error;
  }
};

export const getTradesByUser = async (userEmail: string, page: number = 1, limit: number = 20): Promise<{ trades: AdminTrade[]; total: number }> => {
  try {
    const offset = (page - 1) * limit;
    const { data, count, error } = await supabase
      .from('trades')
      .select('*', { count: 'exact' })
      .eq('useremail', userEmail)
      .order('opened_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { trades: (data as AdminTrade[]) || [], total: count || 0 };
  } catch (error) {
    console.error('[adminTrades] Error getting user trades:', error);
    throw error;
  }
};

export const getUniquePairs = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('trades')
      .select('pair')
      .returns<{ pair: string }[]>();

    if (error) throw error;
    const pairs = [...new Set(data?.map((d) => d.pair) || [])];
    return pairs.sort();
  } catch (error) {
    console.error('[adminTrades] Error getting unique pairs:', error);
    return [];
  }
};

export const getUniqueMarkets = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('trades')
      .select('market')
      .returns<{ market: string }[]>();

    if (error) throw error;
    const markets = [...new Set(data?.map((d) => d.market) || [])];
    return markets.sort();
  } catch (error) {
    console.error('[adminTrades] Error getting unique markets:', error);
    return [];
  }
};

export const getUniqueExchanges = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('trades')
      .select('exchange')
      .returns<{ exchange: string }[]>();

    if (error) throw error;
    const exchanges = [...new Set(data?.map((d) => d.exchange) || [])];
    return exchanges.sort();
  } catch (error) {
    console.error('[adminTrades] Error getting unique exchanges:', error);
    return [];
  }
};

export const getTradeStats = async (): Promise<{ totalTrades: number; winnersCount: number; losersCount: number; totalPnL: number }> => {
  try {
    const { data, error } = await supabase.from('trades').select('pnl, status');

    if (error) throw error;

    const trades = data || [];
    const winnersCount = trades.filter((t) => t.pnl > 0).length;
    const losersCount = trades.filter((t) => t.pnl <= 0).length;
    const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);

    return {
      totalTrades: trades.length,
      winnersCount,
      losersCount,
      totalPnL,
    };
  } catch (error) {
    console.error('[adminTrades] Error getting trade stats:', error);
    return { totalTrades: 0, winnersCount: 0, losersCount: 0, totalPnL: 0 };
  }
};
